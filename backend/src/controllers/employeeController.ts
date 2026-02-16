import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { execute, getDbPool, query } from "../config/db";

interface EmployeeRow extends RowDataPacket {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  hire_date: string | null;
  employment_type: string;
  status: string;
  salary: number | null;
  bank_account_holder_name: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_ifsc_code: string | null;
  branch_id: number;
  branch_name: string;
  designation_id: number;
  designation_title: string;
  created_at: string;
  updated_at: string;
}

interface SkillRow extends RowDataPacket {
  skill_id: number;
  skill_name: string;
  skill_category: string | null;
}

const generateEmployeeCode = (): string =>
  `EMP-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_NUMBER_REGEX = /^[0-9]{6,20}$/;

const normalizeSkillIds = (skillIds?: unknown): number[] => {
  if (!Array.isArray(skillIds)) {
    return [];
  }

  const unique = new Set<number>();
  for (const id of skillIds) {
    const parsed = Number(id);
    if (Number.isInteger(parsed) && parsed > 0) {
      unique.add(parsed);
    }
  }
  return Array.from(unique);
};

const assignSkills = async (
  connection: PoolConnection,
  employeeId: number,
  skillIds: number[]
) => {
  await connection.execute("DELETE FROM employee_skills WHERE employee_id = ?", [
    employeeId,
  ]);

  if (skillIds.length === 0) {
    return;
  }

  const placeholders = skillIds.map(() => "(?, ?)").join(", ");
  const values = skillIds.flatMap((skillId) => [employeeId, skillId]);
  await connection.execute(
    `INSERT INTO employee_skills (employee_id, skill_id) VALUES ${placeholders}`,
    values
  );
};

const getEmployeeSkillsMap = async (employeeIds: number[]) => {
  if (employeeIds.length === 0) {
    return new Map<number, SkillRow[]>();
  }

  const placeholders = employeeIds.map(() => "?").join(", ");
  const rows = await query<(SkillRow & { employee_id: number })[]>(
    `SELECT es.employee_id, s.id AS skill_id, s.name AS skill_name, s.category AS skill_category
     FROM employee_skills es
     INNER JOIN skills s ON s.id = es.skill_id
     WHERE es.employee_id IN (${placeholders})
     ORDER BY s.name ASC`,
    employeeIds
  );

  const map = new Map<number, SkillRow[]>();
  for (const row of rows) {
    if (!map.has(row.employee_id)) {
      map.set(row.employee_id, []);
    }
    map.get(row.employee_id)?.push({
      skill_id: row.skill_id,
      skill_name: row.skill_name,
      skill_category: row.skill_category,
    } as SkillRow);
  }
  return map;
};

const ensureBranchAndDesignation = async (branchId: number, designationId: number) => {
  const branch = await query<RowDataPacket[]>(
    "SELECT id FROM branches WHERE id = ? LIMIT 1",
    [branchId]
  );
  if (branch.length === 0) {
    throw Object.assign(new Error("branch not found"), { statusCode: 404 });
  }

  const designation = await query<RowDataPacket[]>(
    "SELECT id FROM designations WHERE id = ? LIMIT 1",
    [designationId]
  );
  if (designation.length === 0) {
    throw Object.assign(new Error("designation not found"), { statusCode: 404 });
  }
};

const ensureSkillsExist = async (skillIds: number[]) => {
  if (skillIds.length === 0) {
    return;
  }

  const placeholders = skillIds.map(() => "?").join(", ");
  const rows = await query<RowDataPacket[]>(
    `SELECT id FROM skills WHERE id IN (${placeholders})`,
    skillIds
  );
  if (rows.length !== skillIds.length) {
    throw Object.assign(new Error("one or more skills not found"), {
      statusCode: 404,
    });
  }
};

export const createEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const connection = await getDbPool().getConnection();
  let txStarted = false;
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      dateOfBirth,
      hireDate,
      employmentType,
      status,
      salary,
      bankAccountHolderName,
      bankName,
      bankAccountNumber,
      bankIfscCode,
      branchId,
      designationId,
      skillIds,
      address,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      gender?: string;
      dateOfBirth?: string;
      hireDate?: string;
      employmentType?: string;
      status?: string;
      salary?: number;
      bankAccountHolderName?: string;
      bankName?: string;
      bankAccountNumber?: string;
      bankIfscCode?: string;
      branchId?: number;
      designationId?: number;
      skillIds?: number[];
      address?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
    };

    if (!firstName || !lastName || !email || !branchId || !designationId) {
      return res.status(400).json({
        ok: false,
        error: "firstName, lastName, email, branchId, designationId are required",
      });
    }

    const normalizedSkillIds = normalizeSkillIds(skillIds);
    await ensureBranchAndDesignation(Number(branchId), Number(designationId));
    await ensureSkillsExist(normalizedSkillIds);

    const normalizedIfsc = bankIfscCode?.trim().toUpperCase() || null;
    const normalizedAccountNumber = bankAccountNumber?.trim() || null;
    if (normalizedIfsc && !IFSC_REGEX.test(normalizedIfsc)) {
      return res.status(400).json({ ok: false, error: "invalid IFSC code format" });
    }
    if (
      normalizedAccountNumber &&
      !ACCOUNT_NUMBER_REGEX.test(normalizedAccountNumber)
    ) {
      return res.status(400).json({
        ok: false,
        error: "invalid bank account number format",
      });
    }

    const existingEmail = await query<RowDataPacket[]>(
      "SELECT id FROM employees WHERE email = ? LIMIT 1",
      [email.toLowerCase().trim()]
    );
    if (existingEmail.length > 0) {
      return res.status(409).json({ ok: false, error: "email already exists" });
    }

    await connection.beginTransaction();
    txStarted = true;

    let employeeCode = generateEmployeeCode();
    let codeExists = await query<RowDataPacket[]>(
      "SELECT id FROM employees WHERE employee_code = ? LIMIT 1",
      [employeeCode]
    );
    while (codeExists.length > 0) {
      employeeCode = generateEmployeeCode();
      codeExists = await query<RowDataPacket[]>(
        "SELECT id FROM employees WHERE employee_code = ? LIMIT 1",
        [employeeCode]
      );
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO employees (
        employee_code, first_name, last_name, email, phone, gender, date_of_birth,
        hire_date, employment_type, status, salary, bank_account_holder_name, bank_name,
        bank_account_number, bank_ifsc_code, branch_id, designation_id,
        address, emergency_contact_name, emergency_contact_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeCode,
        firstName.trim(),
        lastName.trim(),
        email.toLowerCase().trim(),
        phone?.trim() || null,
        gender?.trim() || null,
        dateOfBirth || null,
        hireDate || null,
        employmentType || "full_time",
        status || "active",
        salary ?? null,
        bankAccountHolderName?.trim() || null,
        bankName?.trim() || null,
        normalizedAccountNumber,
        normalizedIfsc,
        Number(branchId),
        Number(designationId),
        address?.trim() || null,
        emergencyContactName?.trim() || null,
        emergencyContactPhone?.trim() || null,
      ]
    );

    await assignSkills(connection, result.insertId, normalizedSkillIds);
    await connection.commit();

    return res.status(201).json({
      ok: true,
      data: { id: result.insertId },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (txStarted) {
      await connection.rollback();
    }
    next(error);
  } finally {
    connection.release();
  }
};

export const listEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const offset = (page - 1) * limit;

    const filters: string[] = [];
    const values: unknown[] = [];

    if (req.query.branchId) {
      filters.push("e.branch_id = ?");
      values.push(Number(req.query.branchId));
    }
    if (req.query.designationId) {
      filters.push("e.designation_id = ?");
      values.push(Number(req.query.designationId));
    }
    if (req.query.status) {
      filters.push("e.status = ?");
      values.push(String(req.query.status));
    }
    if (req.query.search) {
      filters.push("(e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ?)");
      const search = `%${String(req.query.search).trim()}%`;
      values.push(search, search, search);
    }
    if (req.query.skillId) {
      filters.push(
        "EXISTS (SELECT 1 FROM employee_skills es WHERE es.employee_id = e.id AND es.skill_id = ?)"
      );
      values.push(Number(req.query.skillId));
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    const totalRows = await query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM employees e
       ${whereClause}`,
      values
    );
    const total = Number(totalRows[0].total || 0);

    const rows = await query<EmployeeRow[]>(
      `SELECT
         e.id, e.employee_code, e.first_name, e.last_name, e.email, e.phone, e.gender,
         e.date_of_birth, e.hire_date, e.employment_type, e.status, e.salary,
         e.bank_account_holder_name, e.bank_name, e.bank_account_number, e.bank_ifsc_code,
         e.branch_id, b.name AS branch_name, e.designation_id, d.title AS designation_title,
         e.created_at, e.updated_at
       FROM employees e
       INNER JOIN branches b ON b.id = e.branch_id
       INNER JOIN designations d ON d.id = e.designation_id
       ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const employeeIds = rows.map((row) => row.id);
    const skillsMap = await getEmployeeSkillsMap(employeeIds);
    const items = rows.map((row) => ({
      ...row,
      skills: skillsMap.get(row.id) || [],
    }));

    return res.json({
      ok: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const rows = await query<EmployeeRow[]>(
      `SELECT
         e.id, e.employee_code, e.first_name, e.last_name, e.email, e.phone, e.gender,
         e.date_of_birth, e.hire_date, e.employment_type, e.status, e.salary,
         e.bank_account_holder_name, e.bank_name, e.bank_account_number, e.bank_ifsc_code,
         e.branch_id, b.name AS branch_name, e.designation_id, d.title AS designation_title,
         e.created_at, e.updated_at
       FROM employees e
       INNER JOIN branches b ON b.id = e.branch_id
       INNER JOIN designations d ON d.id = e.designation_id
       WHERE e.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "employee not found" });
    }

    const skillsMap = await getEmployeeSkillsMap([id]);
    return res.json({
      ok: true,
      data: {
        ...rows[0],
        skills: skillsMap.get(id) || [],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const connection = await getDbPool().getConnection();
  let txStarted = false;
  try {
    const id = Number(req.params.id);
    const existingRows = await query<RowDataPacket[]>(
      "SELECT * FROM employees WHERE id = ? LIMIT 1",
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ ok: false, error: "employee not found" });
    }
    const existing = existingRows[0];

    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      dateOfBirth,
      hireDate,
      employmentType,
      status,
      salary,
      bankAccountHolderName,
      bankName,
      bankAccountNumber,
      bankIfscCode,
      branchId,
      designationId,
      skillIds,
      address,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      gender?: string;
      dateOfBirth?: string;
      hireDate?: string;
      employmentType?: string;
      status?: string;
      salary?: number;
      bankAccountHolderName?: string;
      bankName?: string;
      bankAccountNumber?: string;
      bankIfscCode?: string;
      branchId?: number;
      designationId?: number;
      skillIds?: number[];
      address?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
    };

    const nextBranchId = branchId === undefined ? existing.branch_id : Number(branchId);
    const nextDesignationId =
      designationId === undefined ? existing.designation_id : Number(designationId);
    await ensureBranchAndDesignation(nextBranchId, nextDesignationId);

    const normalizedSkillIds = skillIds === undefined ? undefined : normalizeSkillIds(skillIds);
    if (normalizedSkillIds) {
      await ensureSkillsExist(normalizedSkillIds);
    }

    const nextEmail = email?.toLowerCase().trim() || existing.email;
    if (nextEmail !== existing.email) {
      const duplicateEmail = await query<RowDataPacket[]>(
        "SELECT id FROM employees WHERE email = ? AND id <> ? LIMIT 1",
        [nextEmail, id]
      );
      if (duplicateEmail.length > 0) {
        return res.status(409).json({ ok: false, error: "email already exists" });
      }
    }

    const nextIfsc =
      bankIfscCode === undefined
        ? existing.bank_ifsc_code
        : bankIfscCode.trim().toUpperCase() || null;
    const nextAccountNumber =
      bankAccountNumber === undefined
        ? existing.bank_account_number
        : bankAccountNumber.trim() || null;

    if (nextIfsc && !IFSC_REGEX.test(nextIfsc)) {
      return res.status(400).json({ ok: false, error: "invalid IFSC code format" });
    }
    if (nextAccountNumber && !ACCOUNT_NUMBER_REGEX.test(nextAccountNumber)) {
      return res.status(400).json({
        ok: false,
        error: "invalid bank account number format",
      });
    }

    await connection.beginTransaction();
    txStarted = true;

    await connection.execute(
      `UPDATE employees SET
         employee_code = ?, first_name = ?, last_name = ?, email = ?, phone = ?, gender = ?,
         date_of_birth = ?, hire_date = ?, employment_type = ?, status = ?, salary = ?,
         bank_account_holder_name = ?, bank_name = ?, bank_account_number = ?, bank_ifsc_code = ?,
         branch_id = ?, designation_id = ?, address = ?, emergency_contact_name = ?,
         emergency_contact_phone = ?
       WHERE id = ?`,
      [
        existing.employee_code,
        firstName?.trim() || existing.first_name,
        lastName?.trim() || existing.last_name,
        nextEmail,
        phone === undefined ? existing.phone : phone?.trim() || null,
        gender === undefined ? existing.gender : gender?.trim() || null,
        dateOfBirth === undefined ? existing.date_of_birth : dateOfBirth || null,
        hireDate === undefined ? existing.hire_date : hireDate || null,
        employmentType || existing.employment_type,
        status || existing.status,
        salary === undefined ? existing.salary : salary,
        bankAccountHolderName === undefined
          ? existing.bank_account_holder_name
          : bankAccountHolderName?.trim() || null,
        bankName === undefined ? existing.bank_name : bankName?.trim() || null,
        nextAccountNumber,
        nextIfsc,
        nextBranchId,
        nextDesignationId,
        address === undefined ? existing.address : address?.trim() || null,
        emergencyContactName === undefined
          ? existing.emergency_contact_name
          : emergencyContactName?.trim() || null,
        emergencyContactPhone === undefined
          ? existing.emergency_contact_phone
          : emergencyContactPhone?.trim() || null,
        id,
      ]
    );

    if (normalizedSkillIds !== undefined) {
      await assignSkills(connection, id, normalizedSkillIds);
    }

    await connection.commit();
    return res.json({
      ok: true,
      data: { message: "employee updated successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (txStarted) {
      await connection.rollback();
    }
    next(error);
  } finally {
    connection.release();
  }
};

export const deleteEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const connection = await getDbPool().getConnection();
  let txStarted = false;
  try {
    const id = Number(req.params.id);
    await connection.beginTransaction();
    txStarted = true;
    await connection.execute("DELETE FROM employee_skills WHERE employee_id = ?", [id]);
    const [result] = await connection.execute<ResultSetHeader>(
      "DELETE FROM employees WHERE id = ?",
      [id]
    );
    await connection.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "employee not found" });
    }

    return res.json({
      ok: true,
      data: { message: "employee deleted successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (txStarted) {
      await connection.rollback();
    }
    next(error);
  } finally {
    connection.release();
  }
};

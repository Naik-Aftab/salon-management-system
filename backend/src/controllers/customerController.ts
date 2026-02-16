import { NextFunction, Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise";
import { execute, query } from "../config/db";

interface CustomerRow extends RowDataPacket {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  notes: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export const createCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, phone, email, gender, dateOfBirth, address, notes } =
      req.body as {
        firstName?: string;
        lastName?: string;
        phone?: string;
        email?: string;
        gender?: "male" | "female" | "other";
        dateOfBirth?: string;
        address?: string;
        notes?: string;
      };

    if (!firstName || !lastName || !phone) {
      return res
        .status(400)
        .json({ ok: false, error: "firstName, lastName and phone are required" });
    }

    const phoneExists = await query<RowDataPacket[]>(
      "SELECT id FROM customers WHERE phone = ? LIMIT 1",
      [phone.trim()]
    );
    if (phoneExists.length > 0) {
      return res.status(409).json({ ok: false, error: "phone already exists" });
    }

    if (email?.trim()) {
      const emailExists = await query<RowDataPacket[]>(
        "SELECT id FROM customers WHERE email = ? LIMIT 1",
        [email.toLowerCase().trim()]
      );
      if (emailExists.length > 0) {
        return res.status(409).json({ ok: false, error: "email already exists" });
      }
    }

    const result = await execute(
      `INSERT INTO customers
       (first_name, last_name, phone, email, gender, date_of_birth, address, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName.trim(),
        lastName.trim(),
        phone.trim(),
        email?.toLowerCase().trim() || null,
        gender || null,
        dateOfBirth || null,
        address?.trim() || null,
        notes?.trim() || null,
      ]
    );

    return res.status(201).json({
      ok: true,
      data: { id: result.insertId },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const listCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (req.query.search) {
      const search = `%${String(req.query.search).trim()}%`;
      conditions.push(
        "(first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?)"
      );
      values.push(search, search, search, search);
    }

    if (req.query.isActive !== undefined) {
      conditions.push("is_active = ?");
      values.push(String(req.query.isActive) === "true" ? 1 : 0);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await query<CustomerRow[]>(
      `SELECT
         id, first_name, last_name, phone, email, gender, date_of_birth, address, notes,
         is_active, created_at, updated_at
       FROM customers
       ${whereClause}
       ORDER BY created_at DESC`,
      values
    );

    return res.json({ ok: true, data: rows, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const rows = await query<CustomerRow[]>(
      `SELECT
         id, first_name, last_name, phone, email, gender, date_of_birth, address, notes,
         is_active, created_at, updated_at
       FROM customers
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "customer not found" });
    }

    return res.json({ ok: true, data: rows[0], timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getCustomerByPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const phone = String(req.params.phone || "").trim();
    if (!phone) {
      return res.status(400).json({ ok: false, error: "phone is required" });
    }

    const rows = await query<CustomerRow[]>(
      `SELECT
         id, first_name, last_name, phone, email, gender, date_of_birth, address, notes,
         is_active, created_at, updated_at
       FROM customers
       WHERE phone = ?
       LIMIT 1`,
      [phone]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "customer not found" });
    }

    return res.json({ ok: true, data: rows[0], timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { firstName, lastName, phone, email, gender, dateOfBirth, address, notes, isActive } =
      req.body as {
        firstName?: string;
        lastName?: string;
        phone?: string;
        email?: string;
        gender?: "male" | "female" | "other";
        dateOfBirth?: string;
        address?: string;
        notes?: string;
        isActive?: boolean;
      };

    const existingRows = await query<CustomerRow[]>(
      "SELECT * FROM customers WHERE id = ? LIMIT 1",
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ ok: false, error: "customer not found" });
    }
    const existing = existingRows[0];

    const nextPhone = phone?.trim() || existing.phone;
    if (nextPhone !== existing.phone) {
      const phoneExists = await query<RowDataPacket[]>(
        "SELECT id FROM customers WHERE phone = ? AND id <> ? LIMIT 1",
        [nextPhone, id]
      );
      if (phoneExists.length > 0) {
        return res.status(409).json({ ok: false, error: "phone already exists" });
      }
    }

    const nextEmail =
      email === undefined ? existing.email : email.toLowerCase().trim() || null;
    if (nextEmail && nextEmail !== existing.email) {
      const emailExists = await query<RowDataPacket[]>(
        "SELECT id FROM customers WHERE email = ? AND id <> ? LIMIT 1",
        [nextEmail, id]
      );
      if (emailExists.length > 0) {
        return res.status(409).json({ ok: false, error: "email already exists" });
      }
    }

    await execute(
      `UPDATE customers SET
         first_name = ?, last_name = ?, phone = ?, email = ?, gender = ?,
         date_of_birth = ?, address = ?, notes = ?, is_active = ?
       WHERE id = ?`,
      [
        firstName?.trim() || existing.first_name,
        lastName?.trim() || existing.last_name,
        nextPhone,
        nextEmail,
        gender === undefined ? existing.gender : gender || null,
        dateOfBirth === undefined ? existing.date_of_birth : dateOfBirth || null,
        address === undefined ? existing.address : address?.trim() || null,
        notes === undefined ? existing.notes : notes?.trim() || null,
        isActive === undefined ? existing.is_active : isActive ? 1 : 0,
        id,
      ]
    );

    return res.json({
      ok: true,
      data: { message: "customer updated successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const linkedAppointments = await query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM appointments WHERE customer_id = ?",
      [id]
    );
    if (Number(linkedAppointments[0].total || 0) > 0) {
      return res.status(409).json({
        ok: false,
        error: "cannot delete customer with appointments",
      });
    }

    const result = await execute("DELETE FROM customers WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "customer not found" });
    }

    return res.json({
      ok: true,
      data: { message: "customer deleted successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

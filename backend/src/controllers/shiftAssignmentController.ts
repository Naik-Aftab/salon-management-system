import { NextFunction, Request, Response } from "express";
import { execute, query } from "../config/db";
import { RowDataPacket } from "mysql2/promise";

interface EmployeeShiftRow extends RowDataPacket {
  id: number;
  shift_date: string;
  status: string;
  notes: string | null;
  employee_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  branch_id: number;
  shift_id: number;
  shift_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  color_code: string;
  created_at: string;
  updated_at: string;
}

const ensureEmployeeExists = async (employeeId: number) => {
  const rows = await query<RowDataPacket[]>(
    "SELECT id, branch_id FROM employees WHERE id = ? LIMIT 1",
    [employeeId]
  );
  if (rows.length === 0) {
    throw Object.assign(new Error("employee not found"), { statusCode: 404 });
  }
  return rows[0];
};

const ensureShiftExists = async (shiftId: number) => {
  const rows = await query<RowDataPacket[]>(
    "SELECT id, branch_id FROM shifts WHERE id = ? LIMIT 1",
    [shiftId]
  );
  if (rows.length === 0) {
    throw Object.assign(new Error("shift not found"), { statusCode: 404 });
  }
  return rows[0];
};

const isValidDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const createShiftAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employeeId, shiftId, shiftDate, status, notes } = req.body as {
      employeeId?: number;
      shiftId?: number;
      shiftDate?: string;
      status?: "scheduled" | "off" | "leave";
      notes?: string;
    };

    if (!employeeId || !shiftId || !shiftDate) {
      return res
        .status(400)
        .json({ ok: false, error: "employeeId, shiftId and shiftDate are required" });
    }

    if (!isValidDate(shiftDate)) {
      return res
        .status(400)
        .json({ ok: false, error: "shiftDate must be in YYYY-MM-DD format" });
    }

    const safeStatus = status || "scheduled";
    if (!["scheduled", "off", "leave"].includes(safeStatus)) {
      return res
        .status(400)
        .json({ ok: false, error: "status must be scheduled, off, or leave" });
    }

    const employee = await ensureEmployeeExists(Number(employeeId));
    const shift = await ensureShiftExists(Number(shiftId));
    if (Number(employee.branch_id) !== Number(shift.branch_id)) {
      return res.status(400).json({
        ok: false,
        error: "employee and shift branch must match",
      });
    }

    const duplicate = await query<RowDataPacket[]>(
      "SELECT id FROM employee_shifts WHERE employee_id = ? AND shift_date = ? LIMIT 1",
      [Number(employeeId), shiftDate]
    );
    if (duplicate.length > 0) {
      return res.status(409).json({
        ok: false,
        error: "employee already has a shift assignment for this date",
      });
    }

    const result = await execute(
      "INSERT INTO employee_shifts (employee_id, shift_id, shift_date, status, notes) VALUES (?, ?, ?, ?, ?)",
      [Number(employeeId), Number(shiftId), shiftDate, safeStatus, notes?.trim() || null]
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

export const listShiftAssignments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (req.query.employeeId) {
      conditions.push("es.employee_id = ?");
      values.push(Number(req.query.employeeId));
    }
    if (req.query.shiftId) {
      conditions.push("es.shift_id = ?");
      values.push(Number(req.query.shiftId));
    }
    if (req.query.branchId) {
      conditions.push("e.branch_id = ?");
      values.push(Number(req.query.branchId));
    }
    if (req.query.status) {
      conditions.push("es.status = ?");
      values.push(String(req.query.status));
    }
    if (req.query.fromDate) {
      conditions.push("es.shift_date >= ?");
      values.push(String(req.query.fromDate));
    }
    if (req.query.toDate) {
      conditions.push("es.shift_date <= ?");
      values.push(String(req.query.toDate));
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await query<EmployeeShiftRow[]>(
      `SELECT
         es.id, es.shift_date, es.status, es.notes, es.created_at, es.updated_at,
         e.id AS employee_id, e.employee_code, e.first_name, e.last_name, e.branch_id,
         s.id AS shift_id, s.name AS shift_name, s.start_time, s.end_time, s.duration_minutes, s.color_code
       FROM employee_shifts es
       INNER JOIN employees e ON e.id = es.employee_id
       INNER JOIN shifts s ON s.id = es.shift_id
       ${whereClause}
       ORDER BY es.shift_date ASC, s.start_time ASC`,
      values
    );

    return res.json({ ok: true, data: rows, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const updateShiftAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { shiftId, shiftDate, status, notes } = req.body as {
      shiftId?: number;
      shiftDate?: string;
      status?: "scheduled" | "off" | "leave";
      notes?: string;
    };

    const existing = await query<RowDataPacket[]>(
      "SELECT id, employee_id, shift_id, shift_date, status, notes FROM employee_shifts WHERE id = ? LIMIT 1",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, error: "assignment not found" });
    }

    const current = existing[0];
    const nextShiftId = shiftId === undefined ? Number(current.shift_id) : Number(shiftId);
    const nextShiftDate = shiftDate || String(current.shift_date);
    const nextStatus = status || String(current.status);

    if (!isValidDate(nextShiftDate)) {
      return res
        .status(400)
        .json({ ok: false, error: "shiftDate must be in YYYY-MM-DD format" });
    }
    if (!["scheduled", "off", "leave"].includes(nextStatus)) {
      return res
        .status(400)
        .json({ ok: false, error: "status must be scheduled, off, or leave" });
    }

    const employee = await ensureEmployeeExists(Number(current.employee_id));
    const shift = await ensureShiftExists(nextShiftId);
    if (Number(employee.branch_id) !== Number(shift.branch_id)) {
      return res.status(400).json({
        ok: false,
        error: "employee and shift branch must match",
      });
    }

    const duplicate = await query<RowDataPacket[]>(
      "SELECT id FROM employee_shifts WHERE employee_id = ? AND shift_date = ? AND id <> ? LIMIT 1",
      [Number(current.employee_id), nextShiftDate, id]
    );
    if (duplicate.length > 0) {
      return res.status(409).json({
        ok: false,
        error: "employee already has a shift assignment for this date",
      });
    }

    await execute(
      "UPDATE employee_shifts SET shift_id = ?, shift_date = ?, status = ?, notes = ? WHERE id = ?",
      [nextShiftId, nextShiftDate, nextStatus, notes?.trim() || current.notes, id]
    );

    return res.json({
      ok: true,
      data: { message: "assignment updated successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteShiftAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const result = await execute("DELETE FROM employee_shifts WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "assignment not found" });
    }

    return res.json({
      ok: true,
      data: { message: "assignment deleted successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

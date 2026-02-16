import { NextFunction, Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise";
import { execute, query } from "../config/db";

interface LeaveRow extends RowDataPacket {
  id: number;
  employee_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approved_by: number | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_LEAVE_TYPES = new Set([
  "casual",
  "sick",
  "earned",
  "unpaid",
  "maternity",
  "paternity",
  "other",
]);

const isValidDate = (value: string): boolean => DATE_REGEX.test(value);

const computeTotalDays = (startDate: string, endDate: string): number => {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

const ensureEmployeeExists = async (employeeId: number) => {
  const rows = await query<RowDataPacket[]>(
    "SELECT id FROM employees WHERE id = ? LIMIT 1",
    [employeeId]
  );
  if (rows.length === 0) {
    throw Object.assign(new Error("employee not found"), { statusCode: 404 });
  }
};

const hasOverlapLeave = async (
  employeeId: number,
  startDate: string,
  endDate: string,
  excludeId?: number
) => {
  const params: unknown[] = [employeeId, endDate, startDate];
  let sql = `SELECT id FROM employee_leaves
             WHERE employee_id = ?
               AND status IN ('pending', 'approved')
               AND start_date <= ?
               AND end_date >= ?`;

  if (excludeId) {
    sql += " AND id <> ?";
    params.push(excludeId);
  }

  sql += " LIMIT 1";
  const rows = await query<RowDataPacket[]>(sql, params);
  return rows.length > 0;
};

export const createLeaveRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body as {
      employeeId?: number;
      leaveType?: string;
      startDate?: string;
      endDate?: string;
      reason?: string;
    };

    if (!employeeId || !leaveType || !startDate || !endDate) {
      return res.status(400).json({
        ok: false,
        error: "employeeId, leaveType, startDate and endDate are required",
      });
    }

    if (!ALLOWED_LEAVE_TYPES.has(leaveType)) {
      return res.status(400).json({ ok: false, error: "invalid leaveType" });
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res
        .status(400)
        .json({ ok: false, error: "startDate and endDate must be YYYY-MM-DD" });
    }

    const totalDays = computeTotalDays(startDate, endDate);
    if (totalDays < 1) {
      return res
        .status(400)
        .json({ ok: false, error: "endDate must be same or after startDate" });
    }

    await ensureEmployeeExists(Number(employeeId));
    const overlap = await hasOverlapLeave(Number(employeeId), startDate, endDate);
    if (overlap) {
      return res.status(409).json({
        ok: false,
        error: "overlapping leave already exists for this employee",
      });
    }

    const result = await execute(
      `INSERT INTO employee_leaves
       (employee_id, leave_type, start_date, end_date, total_days, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        Number(employeeId),
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason?.trim() || null,
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

export const listLeaves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (req.query.employeeId) {
      conditions.push("el.employee_id = ?");
      params.push(Number(req.query.employeeId));
    }
    if (req.query.status) {
      conditions.push("el.status = ?");
      params.push(String(req.query.status));
    }
    if (req.query.leaveType) {
      conditions.push("el.leave_type = ?");
      params.push(String(req.query.leaveType));
    }
    if (req.query.fromDate) {
      conditions.push("el.start_date >= ?");
      params.push(String(req.query.fromDate));
    }
    if (req.query.toDate) {
      conditions.push("el.end_date <= ?");
      params.push(String(req.query.toDate));
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await query<LeaveRow[]>(
      `SELECT
         el.id, el.employee_id, e.employee_code, e.first_name, e.last_name,
         el.leave_type, el.start_date, el.end_date, el.total_days,
         el.reason, el.status, el.approved_by, el.approved_at, el.rejection_reason,
         el.created_at, el.updated_at
       FROM employee_leaves el
       INNER JOIN employees e ON e.id = el.employee_id
       ${whereClause}
       ORDER BY el.start_date DESC, el.created_at DESC`,
      params
    );

    return res.json({ ok: true, data: rows, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getLeaveById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const rows = await query<LeaveRow[]>(
      `SELECT
         el.id, el.employee_id, e.employee_code, e.first_name, e.last_name,
         el.leave_type, el.start_date, el.end_date, el.total_days,
         el.reason, el.status, el.approved_by, el.approved_at, el.rejection_reason,
         el.created_at, el.updated_at
       FROM employee_leaves el
       INNER JOIN employees e ON e.id = el.employee_id
       WHERE el.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "leave request not found" });
    }

    return res.json({ ok: true, data: rows[0], timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { leaveType, startDate, endDate, reason } = req.body as {
      leaveType?: string;
      startDate?: string;
      endDate?: string;
      reason?: string;
    };

    const existingRows = await query<RowDataPacket[]>(
      "SELECT * FROM employee_leaves WHERE id = ? LIMIT 1",
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ ok: false, error: "leave request not found" });
    }

    const existing = existingRows[0];
    if (existing.status !== "pending") {
      return res.status(400).json({
        ok: false,
        error: "only pending leave requests can be updated",
      });
    }

    const nextLeaveType = leaveType || existing.leave_type;
    const nextStart = startDate || existing.start_date;
    const nextEnd = endDate || existing.end_date;

    if (!ALLOWED_LEAVE_TYPES.has(nextLeaveType)) {
      return res.status(400).json({ ok: false, error: "invalid leaveType" });
    }
    if (!isValidDate(nextStart) || !isValidDate(nextEnd)) {
      return res
        .status(400)
        .json({ ok: false, error: "startDate and endDate must be YYYY-MM-DD" });
    }

    const totalDays = computeTotalDays(nextStart, nextEnd);
    if (totalDays < 1) {
      return res
        .status(400)
        .json({ ok: false, error: "endDate must be same or after startDate" });
    }

    const overlap = await hasOverlapLeave(existing.employee_id, nextStart, nextEnd, id);
    if (overlap) {
      return res.status(409).json({
        ok: false,
        error: "overlapping leave already exists for this employee",
      });
    }

    await execute(
      `UPDATE employee_leaves
       SET leave_type = ?, start_date = ?, end_date = ?, total_days = ?, reason = ?
       WHERE id = ?`,
      [nextLeaveType, nextStart, nextEnd, totalDays, reason?.trim() || existing.reason, id]
    );

    return res.json({
      ok: true,
      data: { message: "leave request updated successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const reviewLeaveRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { status, approvedBy, rejectionReason } = req.body as {
      status?: "approved" | "rejected";
      approvedBy?: number;
      rejectionReason?: string;
    };

    if (!status || !["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ ok: false, error: "status must be approved or rejected" });
    }

    const existingRows = await query<RowDataPacket[]>(
      "SELECT id, status FROM employee_leaves WHERE id = ? LIMIT 1",
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ ok: false, error: "leave request not found" });
    }
    if (existingRows[0].status !== "pending") {
      return res.status(400).json({
        ok: false,
        error: "only pending leave requests can be reviewed",
      });
    }

    if (status === "rejected" && !rejectionReason?.trim()) {
      return res.status(400).json({
        ok: false,
        error: "rejectionReason is required when status is rejected",
      });
    }

    await execute(
      `UPDATE employee_leaves
       SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ?
       WHERE id = ?`,
      [
        status,
        approvedBy || null,
        status === "rejected" ? rejectionReason?.trim() : null,
        id,
      ]
    );

    return res.json({
      ok: true,
      data: { message: `leave request ${status}` },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const cancelLeaveRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const existingRows = await query<RowDataPacket[]>(
      "SELECT id, status FROM employee_leaves WHERE id = ? LIMIT 1",
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ ok: false, error: "leave request not found" });
    }
    if (existingRows[0].status === "cancelled") {
      return res.status(400).json({ ok: false, error: "leave request already cancelled" });
    }

    await execute(
      "UPDATE employee_leaves SET status = 'cancelled' WHERE id = ?",
      [id]
    );

    return res.json({
      ok: true,
      data: { message: "leave request cancelled successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

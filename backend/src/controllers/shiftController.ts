import { NextFunction, Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise";
import { execute, query } from "../config/db";

interface ShiftRow extends RowDataPacket {
  id: number;
  branch_id: number;
  branch_name: string;
  name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  break_minutes: number;
  color_code: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

const isValidTime = (value: string): boolean => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
const isValidHexColor = (value: string): boolean =>
  /^#([A-Fa-f0-9]{6})$/.test(value);

const ensureBranchExists = async (branchId: number) => {
  const rows = await query<RowDataPacket[]>(
    "SELECT id FROM branches WHERE id = ? LIMIT 1",
    [branchId]
  );
  if (rows.length === 0) {
    throw Object.assign(new Error("branch not found"), { statusCode: 404 });
  }
};

export const createShift = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      branchId,
      name,
      startTime,
      endTime,
      durationMinutes,
      breakMinutes,
      colorCode,
    } = req.body as {
      branchId?: number;
      name?: string;
      startTime?: string;
      endTime?: string;
      durationMinutes?: number;
      breakMinutes?: number;
      colorCode?: string;
    };

    if (!branchId || !name || !startTime || !endTime || !durationMinutes || !colorCode) {
      return res.status(400).json({
        ok: false,
        error:
          "branchId, name, startTime, endTime, durationMinutes and colorCode are required",
      });
    }

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      return res
        .status(400)
        .json({ ok: false, error: "startTime and endTime must be HH:mm format" });
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes < 1) {
      return res
        .status(400)
        .json({ ok: false, error: "durationMinutes must be a positive integer" });
    }

    if (breakMinutes !== undefined && (!Number.isInteger(breakMinutes) || breakMinutes < 0)) {
      return res
        .status(400)
        .json({ ok: false, error: "breakMinutes must be zero or a positive integer" });
    }

    if (!isValidHexColor(colorCode)) {
      return res
        .status(400)
        .json({ ok: false, error: "colorCode must be a valid hex code like #22C55E" });
    }

    await ensureBranchExists(Number(branchId));

    const exists = await query<RowDataPacket[]>(
      "SELECT id FROM shifts WHERE branch_id = ? AND name = ? LIMIT 1",
      [Number(branchId), name.trim()]
    );
    if (exists.length > 0) {
      return res.status(409).json({
        ok: false,
        error: "shift name already exists for this branch",
      });
    }

    const result = await execute(
      `INSERT INTO shifts (
         branch_id, name, start_time, end_time, duration_minutes, break_minutes, color_code
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(branchId),
        name.trim(),
        startTime,
        endTime,
        durationMinutes,
        breakMinutes ?? 0,
        colorCode.toUpperCase(),
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

export const listShifts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (req.query.branchId) {
      conditions.push("s.branch_id = ?");
      values.push(Number(req.query.branchId));
    }

    if (req.query.isActive !== undefined) {
      conditions.push("s.is_active = ?");
      values.push(String(req.query.isActive) === "true" ? 1 : 0);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await query<ShiftRow[]>(
      `SELECT
         s.id, s.branch_id, b.name AS branch_name, s.name, s.start_time, s.end_time,
         s.duration_minutes, s.break_minutes, s.color_code, s.is_active, s.created_at, s.updated_at
       FROM shifts s
       INNER JOIN branches b ON b.id = s.branch_id
       ${whereClause}
       ORDER BY b.name ASC, s.start_time ASC`,
      values
    );

    return res.json({ ok: true, data: rows, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getShiftById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const rows = await query<ShiftRow[]>(
      `SELECT
         s.id, s.branch_id, b.name AS branch_name, s.name, s.start_time, s.end_time,
         s.duration_minutes, s.break_minutes, s.color_code, s.is_active, s.created_at, s.updated_at
       FROM shifts s
       INNER JOIN branches b ON b.id = s.branch_id
       WHERE s.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "shift not found" });
    }

    return res.json({ ok: true, data: rows[0], timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const updateShift = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const {
      branchId,
      name,
      startTime,
      endTime,
      durationMinutes,
      breakMinutes,
      colorCode,
      isActive,
    } = req.body as {
      branchId?: number;
      name?: string;
      startTime?: string;
      endTime?: string;
      durationMinutes?: number;
      breakMinutes?: number;
      colorCode?: string;
      isActive?: boolean;
    };

    const existingRows = await query<ShiftRow[]>(
      `SELECT
         s.id, s.branch_id, b.name AS branch_name, s.name, s.start_time, s.end_time,
         s.duration_minutes, s.break_minutes, s.color_code, s.is_active, s.created_at, s.updated_at
       FROM shifts s
       INNER JOIN branches b ON b.id = s.branch_id
       WHERE s.id = ?
       LIMIT 1`,
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ ok: false, error: "shift not found" });
    }
    const existing = existingRows[0];

    const nextBranchId = branchId === undefined ? existing.branch_id : Number(branchId);
    const nextName = name?.trim() || existing.name;
    const nextStart = startTime || existing.start_time;
    const nextEnd = endTime || existing.end_time;
    const nextDuration =
      durationMinutes === undefined ? existing.duration_minutes : durationMinutes;
    const nextBreak = breakMinutes === undefined ? existing.break_minutes : breakMinutes;
    const nextColor = (colorCode || existing.color_code).toUpperCase();

    if (!isValidTime(nextStart) || !isValidTime(nextEnd)) {
      return res
        .status(400)
        .json({ ok: false, error: "startTime and endTime must be HH:mm format" });
    }
    if (!Number.isInteger(nextDuration) || nextDuration < 1) {
      return res
        .status(400)
        .json({ ok: false, error: "durationMinutes must be a positive integer" });
    }
    if (!Number.isInteger(nextBreak) || nextBreak < 0) {
      return res
        .status(400)
        .json({ ok: false, error: "breakMinutes must be zero or a positive integer" });
    }
    if (!isValidHexColor(nextColor)) {
      return res
        .status(400)
        .json({ ok: false, error: "colorCode must be a valid hex code like #22C55E" });
    }

    await ensureBranchExists(nextBranchId);

    if (nextBranchId !== existing.branch_id || nextName !== existing.name) {
      const duplicate = await query<RowDataPacket[]>(
        "SELECT id FROM shifts WHERE branch_id = ? AND name = ? AND id <> ? LIMIT 1",
        [nextBranchId, nextName, id]
      );
      if (duplicate.length > 0) {
        return res.status(409).json({
          ok: false,
          error: "shift name already exists for this branch",
        });
      }
    }

    await execute(
      `UPDATE shifts SET
         branch_id = ?, name = ?, start_time = ?, end_time = ?, duration_minutes = ?,
         break_minutes = ?, color_code = ?, is_active = ?
       WHERE id = ?`,
      [
        nextBranchId,
        nextName,
        nextStart,
        nextEnd,
        nextDuration,
        nextBreak,
        nextColor,
        isActive === undefined ? existing.is_active : isActive ? 1 : 0,
        id,
      ]
    );

    return res.json({
      ok: true,
      data: { message: "shift updated successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteShift = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const assignmentCount = await query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM employee_shifts WHERE shift_id = ?",
      [id]
    );
    const total = Number(assignmentCount[0].total || 0);
    if (total > 0) {
      return res.status(409).json({
        ok: false,
        error: "cannot delete shift with assignments",
      });
    }

    const result = await execute("DELETE FROM shifts WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "shift not found" });
    }

    return res.json({
      ok: true,
      data: { message: "shift deleted successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

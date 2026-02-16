import { NextFunction, Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise";
import { execute, query } from "../config/db";

interface DesignationRow extends RowDataPacket {
  id: number;
  title: string;
  level: string | null;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export const createDesignation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, level, description } = req.body as {
      title?: string;
      level?: string;
      description?: string;
    };

    if (!title) {
      return res.status(400).json({ ok: false, error: "title is required" });
    }

    const normalizedTitle = title.trim();
    const exists = await query<DesignationRow[]>(
      "SELECT id, title, level, description, is_active, created_at, updated_at FROM designations WHERE title = ? LIMIT 1",
      [normalizedTitle]
    );
    if (exists.length > 0) {
      return res.status(409).json({ ok: false, error: "designation already exists" });
    }

    const result = await execute(
      "INSERT INTO designations (title, level, description) VALUES (?, ?, ?)",
      [normalizedTitle, level?.trim() || null, description?.trim() || null]
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

export const listDesignations = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rows = await query<DesignationRow[]>(
      "SELECT id, title, level, description, is_active, created_at, updated_at FROM designations ORDER BY title ASC"
    );
    return res.json({ ok: true, data: rows, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const updateDesignation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { title, level, description, is_active } = req.body as {
      title?: string;
      level?: string;
      description?: string;
      is_active?: boolean;
    };

    const existing = await query<DesignationRow[]>(
      "SELECT id, title, level, description, is_active, created_at, updated_at FROM designations WHERE id = ? LIMIT 1",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, error: "designation not found" });
    }

    const nextTitle = title?.trim() || existing[0].title;
    if (nextTitle !== existing[0].title) {
      const duplicate = await query<DesignationRow[]>(
        "SELECT id, title, level, description, is_active, created_at, updated_at FROM designations WHERE title = ? AND id <> ? LIMIT 1",
        [nextTitle, id]
      );
      if (duplicate.length > 0) {
        return res.status(409).json({ ok: false, error: "designation already exists" });
      }
    }

    await execute(
      "UPDATE designations SET title = ?, level = ?, description = ?, is_active = ? WHERE id = ?",
      [
        nextTitle,
        level === undefined ? existing[0].level : level?.trim() || null,
        description === undefined
          ? existing[0].description
          : description?.trim() || null,
        is_active === undefined ? existing[0].is_active : is_active ? 1 : 0,
        id,
      ]
    );

    return res.json({
      ok: true,
      data: { message: "designation updated successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDesignation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const employeeCount = await query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM employees WHERE designation_id = ?",
      [id]
    );
    const total = Number(employeeCount[0].total || 0);
    if (total > 0) {
      return res.status(409).json({
        ok: false,
        error: "cannot delete designation assigned to employees",
      });
    }

    const result = await execute("DELETE FROM designations WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "designation not found" });
    }

    return res.json({
      ok: true,
      data: { message: "designation deleted successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

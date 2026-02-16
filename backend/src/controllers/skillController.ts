import { NextFunction, Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise";
import { execute, query } from "../config/db";

interface SkillRow extends RowDataPacket {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export const createSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, category, description } = req.body as {
      name?: string;
      category?: string;
      description?: string;
    };

    if (!name) {
      return res.status(400).json({ ok: false, error: "name is required" });
    }

    const normalizedName = name.trim();
    const exists = await query<SkillRow[]>(
      "SELECT id, name, category, description, is_active, created_at, updated_at FROM skills WHERE name = ? LIMIT 1",
      [normalizedName]
    );
    if (exists.length > 0) {
      return res.status(409).json({ ok: false, error: "skill already exists" });
    }

    const result = await execute(
      "INSERT INTO skills (name, category, description) VALUES (?, ?, ?)",
      [normalizedName, category?.trim() || null, description?.trim() || null]
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

export const listSkills = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rows = await query<SkillRow[]>(
      "SELECT id, name, category, description, is_active, created_at, updated_at FROM skills ORDER BY name ASC"
    );
    return res.json({ ok: true, data: rows, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const updateSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { name, category, description, is_active } = req.body as {
      name?: string;
      category?: string;
      description?: string;
      is_active?: boolean;
    };

    const existing = await query<SkillRow[]>(
      "SELECT id, name, category, description, is_active, created_at, updated_at FROM skills WHERE id = ? LIMIT 1",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, error: "skill not found" });
    }

    const nextName = name?.trim() || existing[0].name;
    if (nextName !== existing[0].name) {
      const duplicate = await query<SkillRow[]>(
        "SELECT id, name, category, description, is_active, created_at, updated_at FROM skills WHERE name = ? AND id <> ? LIMIT 1",
        [nextName, id]
      );
      if (duplicate.length > 0) {
        return res.status(409).json({ ok: false, error: "skill already exists" });
      }
    }

    await execute(
      "UPDATE skills SET name = ?, category = ?, description = ?, is_active = ? WHERE id = ?",
      [
        nextName,
        category === undefined ? existing[0].category : category?.trim() || null,
        description === undefined ? existing[0].description : description?.trim() || null,
        is_active === undefined ? existing[0].is_active : is_active ? 1 : 0,
        id,
      ]
    );

    return res.json({
      ok: true,
      data: { message: "skill updated successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const linked = await query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM employee_skills WHERE skill_id = ?",
      [id]
    );
    const total = Number(linked[0].total || 0);
    if (total > 0) {
      return res.status(409).json({
        ok: false,
        error: "cannot delete skill assigned to employees",
      });
    }

    const result = await execute("DELETE FROM skills WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "skill not found" });
    }

    return res.json({
      ok: true,
      data: { message: "skill deleted successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

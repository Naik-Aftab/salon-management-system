import { NextFunction, Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise";
import { execute, query } from "../config/db";

interface BranchRow extends RowDataPacket {
  id: number;
  name: string;
  code: string;
  city: string | null;
  state: string | null;
  address: string | null;
  phone: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export const createBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, code, city, state, address, phone } = req.body as {
      name?: string;
      code?: string;
      city?: string;
      state?: string;
      address?: string;
      phone?: string;
    };

    if (!name || !code) {
      return res
        .status(400)
        .json({ ok: false, error: "name and code are required" });
    }

    const normalizedCode = code.trim().toUpperCase();
    const exists = await query<BranchRow[]>(
      "SELECT id, name, code, city, state, address, phone, is_active, created_at, updated_at FROM branches WHERE code = ? LIMIT 1",
      [normalizedCode]
    );

    if (exists.length > 0) {
      return res.status(409).json({ ok: false, error: "branch code already exists" });
    }

    const result = await execute(
      "INSERT INTO branches (name, code, city, state, address, phone) VALUES (?, ?, ?, ?, ?, ?)",
      [
        name.trim(),
        normalizedCode,
        city?.trim() || null,
        state?.trim() || null,
        address?.trim() || null,
        phone?.trim() || null,
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

export const listBranches = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rows = await query<BranchRow[]>(
      "SELECT id, name, code, city, state, address, phone, is_active, created_at, updated_at FROM branches ORDER BY name ASC"
    );
    return res.json({ ok: true, data: rows, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getBranchById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const rows = await query<BranchRow[]>(
      "SELECT id, name, code, city, state, address, phone, is_active, created_at, updated_at FROM branches WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "branch not found" });
    }

    return res.json({ ok: true, data: rows[0], timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { name, code, city, state, address, phone, is_active } = req.body as {
      name?: string;
      code?: string;
      city?: string;
      state?: string;
      address?: string;
      phone?: string;
      is_active?: boolean;
    };

    const existing = await query<BranchRow[]>(
      "SELECT id, name, code, city, state, address, phone, is_active, created_at, updated_at FROM branches WHERE id = ? LIMIT 1",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, error: "branch not found" });
    }

    const nextName = name?.trim() || existing[0].name;
    const nextCode = (code?.trim().toUpperCase() || existing[0].code).toUpperCase();

    if (nextCode !== existing[0].code) {
      const codeExists = await query<BranchRow[]>(
        "SELECT id, name, code, city, state, address, phone, is_active, created_at, updated_at FROM branches WHERE code = ? AND id <> ? LIMIT 1",
        [nextCode, id]
      );
      if (codeExists.length > 0) {
        return res.status(409).json({ ok: false, error: "branch code already exists" });
      }
    }

    await execute(
      "UPDATE branches SET name = ?, code = ?, city = ?, state = ?, address = ?, phone = ?, is_active = ? WHERE id = ?",
      [
        nextName,
        nextCode,
        city === undefined ? existing[0].city : city?.trim() || null,
        state === undefined ? existing[0].state : state?.trim() || null,
        address === undefined ? existing[0].address : address?.trim() || null,
        phone === undefined ? existing[0].phone : phone?.trim() || null,
        is_active === undefined ? existing[0].is_active : is_active ? 1 : 0,
        id,
      ]
    );

    return res.json({
      ok: true,
      data: { message: "branch updated successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const employeeCount = await query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM employees WHERE branch_id = ?",
      [id]
    );
    const total = Number(employeeCount[0].total || 0);

    if (total > 0) {
      return res.status(409).json({
        ok: false,
        error: "cannot delete branch with employees. Re-assign employees first",
      });
    }

    const result = await execute("DELETE FROM branches WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "branch not found" });
    }

    return res.json({
      ok: true,
      data: { message: "branch deleted successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

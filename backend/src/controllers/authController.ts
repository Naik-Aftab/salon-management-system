import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2/promise";
import { query, execute } from "../config/db";
import {
  generateAuthToken,
  generateResetToken,
  verifyResetToken,
} from "../utils/jwt";

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
}

type PublicUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const sanitizeUser = (user: PublicUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const ALLOWED_ROLES = new Set(["owner", "manager", "employee"]);

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "name, email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ ok: false, error: "password must be at least 6 characters" });
    }

    const userExists = await query<UserRow[]>(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
      [email.toLowerCase()]
    );

    if (userExists.length > 0) {
      return res.status(409).json({ ok: false, error: "email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const safeRole = role ?? "employee";
    if (!ALLOWED_ROLES.has(safeRole)) {
      return res.status(400).json({ ok: false, error: "invalid role" });
    }

    const result = await execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name.trim(), email.toLowerCase().trim(), passwordHash, safeRole]
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: safeRole,
      password_hash: passwordHash,
    };

    const token = generateAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      ok: true,
      data: {
        token,
        user: sanitizeUser(user),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "email and password are required" });
    }

    const users = await query<UserRow[]>(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({ ok: false, error: "invalid credentials" });
    }

    const user = users[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ ok: false, error: "invalid credentials" });
    }

    const token = generateAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return res.json({
      ok: true,
      data: {
        token,
        user: sanitizeUser(user),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ ok: false, error: "email is required" });
    }

    const users = await query<UserRow[]>(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.json({
        ok: true,
        data: {
          message:
            "If the email exists, a reset token has been generated. In production send it via email.",
        },
        timestamp: new Date().toISOString(),
      });
    }

    const user = users[0];
    const resetToken = generateResetToken({
      sub: user.id,
      email: user.email,
      type: "password_reset",
    });

    return res.json({
      ok: true,
      data: {
        message:
          "Reset token generated. In production this token should be emailed.",
        resetToken,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = req.body as {
      token?: string;
      newPassword?: string;
    };

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ ok: false, error: "token and newPassword are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ ok: false, error: "newPassword must be at least 6 characters" });
    }

    let payload: Record<string, unknown>;
    try {
      payload = verifyResetToken(token);
    } catch {
      return res.status(400).json({
        ok: false,
        error: "invalid or expired reset token",
        timestamp: new Date().toISOString(),
      });
    }

    const userId = Number(payload.sub);

    if (!userId) {
      return res.status(400).json({ ok: false, error: "invalid reset token" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const result = await execute(
      "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [passwordHash, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "user not found" });
    }

    return res.json({
      ok: true,
      data: { message: "password reset successful" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

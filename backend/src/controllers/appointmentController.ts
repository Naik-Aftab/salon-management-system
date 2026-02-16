import { NextFunction, Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { execute, query } from "../config/db";

interface AppointmentRow extends RowDataPacket {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  branch_id: number;
  branch_name: string;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  service_name: string;
  service_notes: string | null;
  appointment_date: string;
  start_time: string;
  duration_minutes: number;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const BLOCKING_STATUSES = ["scheduled", "confirmed", "checked_in", "in_service"];
const ALL_STATUSES = [
  "scheduled",
  "confirmed",
  "checked_in",
  "in_service",
  "completed",
  "cancelled",
  "no_show",
  "rescheduled",
];

const isValidDate = (value: string): boolean => DATE_REGEX.test(value);
const isValidTime = (value: string): boolean => TIME_REGEX.test(value);

const ensureCustomerExists = async (customerId: number) => {
  const rows = await query<RowDataPacket[]>(
    "SELECT id FROM customers WHERE id = ? LIMIT 1",
    [customerId]
  );
  if (rows.length === 0) {
    throw Object.assign(new Error("customer not found"), { statusCode: 404 });
  }
};

const ensureBranchExists = async (branchId: number) => {
  const rows = await query<RowDataPacket[]>(
    "SELECT id FROM branches WHERE id = ? LIMIT 1",
    [branchId]
  );
  if (rows.length === 0) {
    throw Object.assign(new Error("branch not found"), { statusCode: 404 });
  }
};

const ensureEmployeeExistsInBranch = async (employeeId: number, branchId: number) => {
  const rows = await query<RowDataPacket[]>(
    "SELECT id, branch_id FROM employees WHERE id = ? LIMIT 1",
    [employeeId]
  );
  if (rows.length === 0) {
    throw Object.assign(new Error("employee not found"), { statusCode: 404 });
  }
  if (Number(rows[0].branch_id) !== branchId) {
    throw Object.assign(new Error("employee does not belong to selected branch"), {
      statusCode: 400,
    });
  }
};

const isEmployeeOnLeave = async (employeeId: number, appointmentDate: string) => {
  const rows = await query<RowDataPacket[]>(
    `SELECT id FROM employee_leaves
     WHERE employee_id = ?
       AND status = 'approved'
       AND start_date <= ?
       AND end_date >= ?
     LIMIT 1`,
    [employeeId, appointmentDate, appointmentDate]
  );
  return rows.length > 0;
};

const hasEmployeeAppointmentConflict = async (
  employeeId: number,
  appointmentDate: string,
  startTime: string,
  durationMinutes: number,
  excludeAppointmentId?: number
) => {
  const placeholders = BLOCKING_STATUSES.map(() => "?").join(", ");
  const params: unknown[] = [
    employeeId,
    appointmentDate,
    ...BLOCKING_STATUSES,
    startTime,
    durationMinutes,
    startTime,
  ];

  let sql = `SELECT id
             FROM appointments a
             WHERE a.employee_id = ?
               AND a.appointment_date = ?
               AND a.status IN (${placeholders})
               AND a.start_time < ADDTIME(?, SEC_TO_TIME(? * 60))
               AND ADDTIME(a.start_time, SEC_TO_TIME(a.duration_minutes * 60)) > ?`;
  if (excludeAppointmentId) {
    sql += " AND a.id <> ?";
    params.push(excludeAppointmentId);
  }
  sql += " LIMIT 1";

  const rows = await query<RowDataPacket[]>(sql, params);
  return rows.length > 0;
};

const findAvailableEmployee = async (
  branchId: number,
  appointmentDate: string,
  startTime: string,
  durationMinutes: number
): Promise<number | null> => {
  const placeholders = BLOCKING_STATUSES.map(() => "?").join(", ");
  const rows = await query<RowDataPacket[]>(
    `SELECT e.id
     FROM employees e
     LEFT JOIN (
       SELECT employee_id, COUNT(*) AS total
       FROM appointments
       WHERE appointment_date = ?
       GROUP BY employee_id
     ) ac ON ac.employee_id = e.id
     WHERE e.branch_id = ?
       AND e.status = 'active'
       AND NOT EXISTS (
         SELECT 1 FROM employee_leaves el
         WHERE el.employee_id = e.id
           AND el.status = 'approved'
           AND el.start_date <= ?
           AND el.end_date >= ?
       )
       AND NOT EXISTS (
         SELECT 1 FROM appointments a
         WHERE a.employee_id = e.id
           AND a.appointment_date = ?
           AND a.status IN (${placeholders})
           AND a.start_time < ADDTIME(?, SEC_TO_TIME(? * 60))
           AND ADDTIME(a.start_time, SEC_TO_TIME(a.duration_minutes * 60)) > ?
       )
     ORDER BY COALESCE(ac.total, 0) ASC, e.id ASC
     LIMIT 1`,
    [
      appointmentDate,
      branchId,
      appointmentDate,
      appointmentDate,
      appointmentDate,
      ...BLOCKING_STATUSES,
      startTime,
      durationMinutes,
      startTime,
    ]
  );

  return rows.length ? Number(rows[0].id) : null;
};

export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      customerId,
      branchId,
      employeeId,
      serviceName,
      serviceNotes,
      appointmentDate,
      startTime,
      durationMinutes,
      status,
      notes,
    } = req.body as {
      customerId?: number;
      branchId?: number;
      employeeId?: number;
      serviceName?: string;
      serviceNotes?: string;
      appointmentDate?: string;
      startTime?: string;
      durationMinutes?: number;
      status?: string;
      notes?: string;
    };

    if (
      !customerId ||
      !branchId ||
      !serviceName ||
      !appointmentDate ||
      !startTime ||
      !durationMinutes
    ) {
      return res.status(400).json({
        ok: false,
        error:
          "customerId, branchId, serviceName, appointmentDate, startTime and durationMinutes are required",
      });
    }

    if (!isValidDate(appointmentDate) || !isValidTime(startTime)) {
      return res.status(400).json({
        ok: false,
        error: "appointmentDate must be YYYY-MM-DD and startTime must be HH:mm",
      });
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes < 1) {
      return res
        .status(400)
        .json({ ok: false, error: "durationMinutes must be a positive integer" });
    }

    const safeStatus = status || "scheduled";
    if (!ALL_STATUSES.includes(safeStatus)) {
      return res.status(400).json({ ok: false, error: "invalid status" });
    }

    await ensureCustomerExists(Number(customerId));
    await ensureBranchExists(Number(branchId));

    let assignedEmployeeId = employeeId ? Number(employeeId) : null;

    if (assignedEmployeeId) {
      await ensureEmployeeExistsInBranch(assignedEmployeeId, Number(branchId));
      if (await isEmployeeOnLeave(assignedEmployeeId, appointmentDate)) {
        return res
          .status(409)
          .json({ ok: false, error: "employee is on approved leave on this date" });
      }
      if (
        await hasEmployeeAppointmentConflict(
          assignedEmployeeId,
          appointmentDate,
          startTime,
          durationMinutes
        )
      ) {
        return res.status(409).json({
          ok: false,
          error: "employee has a conflicting appointment",
        });
      }
    } else {
      assignedEmployeeId = await findAvailableEmployee(
        Number(branchId),
        appointmentDate,
        startTime,
        durationMinutes
      );
      if (!assignedEmployeeId) {
        return res.status(409).json({
          ok: false,
          error: "no available employee found for this slot",
        });
      }
    }

    const result = await execute(
      `INSERT INTO appointments
       (customer_id, branch_id, employee_id, service_name, service_notes,
        appointment_date, start_time, duration_minutes, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(customerId),
        Number(branchId),
        assignedEmployeeId,
        serviceName.trim(),
        serviceNotes?.trim() || null,
        appointmentDate,
        startTime,
        durationMinutes,
        safeStatus,
        notes?.trim() || null,
      ]
    );

    return res.status(201).json({
      ok: true,
      data: { id: result.insertId, employeeId: assignedEmployeeId },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const listAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (req.query.branchId) {
      conditions.push("a.branch_id = ?");
      values.push(Number(req.query.branchId));
    }
    if (req.query.employeeId) {
      conditions.push("a.employee_id = ?");
      values.push(Number(req.query.employeeId));
    }
    if (req.query.customerId) {
      conditions.push("a.customer_id = ?");
      values.push(Number(req.query.customerId));
    }
    if (req.query.status) {
      conditions.push("a.status = ?");
      values.push(String(req.query.status));
    }
    if (req.query.date) {
      conditions.push("a.appointment_date = ?");
      values.push(String(req.query.date));
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await query<AppointmentRow[]>(
      `SELECT
         a.id, a.customer_id,
         CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
         c.phone AS customer_phone,
         a.branch_id, b.name AS branch_name,
         a.employee_id,
         CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
         e.employee_code,
         a.service_name, a.service_notes, a.appointment_date, a.start_time,
         a.duration_minutes,
         TIME_FORMAT(ADDTIME(a.start_time, SEC_TO_TIME(a.duration_minutes * 60)), '%H:%i') AS end_time,
         a.status, a.notes, a.created_at, a.updated_at
       FROM appointments a
       INNER JOIN customers c ON c.id = a.customer_id
       INNER JOIN branches b ON b.id = a.branch_id
       INNER JOIN employees e ON e.id = a.employee_id
       ${whereClause}
       ORDER BY a.appointment_date DESC, a.start_time DESC`,
      values
    );

    return res.json({ ok: true, data: rows, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const rows = await query<AppointmentRow[]>(
      `SELECT
         a.id, a.customer_id,
         CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
         c.phone AS customer_phone,
         a.branch_id, b.name AS branch_name,
         a.employee_id,
         CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
         e.employee_code,
         a.service_name, a.service_notes, a.appointment_date, a.start_time,
         a.duration_minutes,
         TIME_FORMAT(ADDTIME(a.start_time, SEC_TO_TIME(a.duration_minutes * 60)), '%H:%i') AS end_time,
         a.status, a.notes, a.created_at, a.updated_at
       FROM appointments a
       INNER JOIN customers c ON c.id = a.customer_id
       INNER JOIN branches b ON b.id = a.branch_id
       INNER JOIN employees e ON e.id = a.employee_id
       WHERE a.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "appointment not found" });
    }

    return res.json({ ok: true, data: rows[0], timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const existingRows = await query<RowDataPacket[]>(
      "SELECT * FROM appointments WHERE id = ? LIMIT 1",
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ ok: false, error: "appointment not found" });
    }
    const existing = existingRows[0];

    const {
      customerId,
      branchId,
      employeeId,
      serviceName,
      serviceNotes,
      appointmentDate,
      startTime,
      durationMinutes,
      status,
      notes,
    } = req.body as {
      customerId?: number;
      branchId?: number;
      employeeId?: number;
      serviceName?: string;
      serviceNotes?: string;
      appointmentDate?: string;
      startTime?: string;
      durationMinutes?: number;
      status?: string;
      notes?: string;
    };

    const nextCustomerId = customerId === undefined ? existing.customer_id : Number(customerId);
    const nextBranchId = branchId === undefined ? existing.branch_id : Number(branchId);
    const nextAppointmentDate = appointmentDate || existing.appointment_date;
    const nextStartTime = startTime || existing.start_time;
    const nextDuration =
      durationMinutes === undefined ? existing.duration_minutes : durationMinutes;
    const nextStatus = status || existing.status;
    let nextEmployeeId = employeeId === undefined ? existing.employee_id : Number(employeeId);

    if (!isValidDate(nextAppointmentDate) || !isValidTime(nextStartTime)) {
      return res.status(400).json({
        ok: false,
        error: "appointmentDate must be YYYY-MM-DD and startTime must be HH:mm",
      });
    }
    if (!Number.isInteger(nextDuration) || nextDuration < 1) {
      return res
        .status(400)
        .json({ ok: false, error: "durationMinutes must be a positive integer" });
    }
    if (!ALL_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ ok: false, error: "invalid status" });
    }

    await ensureCustomerExists(nextCustomerId);
    await ensureBranchExists(nextBranchId);

    if (employeeId !== undefined || branchId !== undefined || appointmentDate !== undefined || startTime !== undefined || durationMinutes !== undefined) {
      if (employeeId === undefined && branchId !== undefined && Number(existing.branch_id) !== nextBranchId) {
        nextEmployeeId = await findAvailableEmployee(
          nextBranchId,
          nextAppointmentDate,
          nextStartTime,
          nextDuration
        );
        if (!nextEmployeeId) {
          return res.status(409).json({
            ok: false,
            error: "no available employee found for this slot",
          });
        }
      }

      await ensureEmployeeExistsInBranch(nextEmployeeId, nextBranchId);
      if (await isEmployeeOnLeave(nextEmployeeId, nextAppointmentDate)) {
        return res
          .status(409)
          .json({ ok: false, error: "employee is on approved leave on this date" });
      }
      if (
        await hasEmployeeAppointmentConflict(
          nextEmployeeId,
          nextAppointmentDate,
          nextStartTime,
          nextDuration,
          id
        )
      ) {
        return res.status(409).json({
          ok: false,
          error: "employee has a conflicting appointment",
        });
      }
    }

    await execute(
      `UPDATE appointments SET
         customer_id = ?, branch_id = ?, employee_id = ?, service_name = ?, service_notes = ?,
         appointment_date = ?, start_time = ?, duration_minutes = ?, status = ?, notes = ?
       WHERE id = ?`,
      [
        nextCustomerId,
        nextBranchId,
        nextEmployeeId,
        serviceName?.trim() || existing.service_name,
        serviceNotes === undefined ? existing.service_notes : serviceNotes?.trim() || null,
        nextAppointmentDate,
        nextStartTime,
        nextDuration,
        nextStatus,
        notes === undefined ? existing.notes : notes?.trim() || null,
        id,
      ]
    );

    return res.json({
      ok: true,
      data: { message: "appointment updated successfully", employeeId: nextEmployeeId },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body as { status?: string };
    if (!status || !ALL_STATUSES.includes(status)) {
      return res.status(400).json({ ok: false, error: "invalid status" });
    }

    const result = await execute("UPDATE appointments SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "appointment not found" });
    }

    return res.json({
      ok: true,
      data: { message: "appointment status updated successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const assignAppointmentEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { employeeId } = req.body as { employeeId?: number };
    if (!employeeId) {
      return res.status(400).json({ ok: false, error: "employeeId is required" });
    }

    const appointmentRows = await query<RowDataPacket[]>(
      "SELECT * FROM appointments WHERE id = ? LIMIT 1",
      [id]
    );
    if (appointmentRows.length === 0) {
      return res.status(404).json({ ok: false, error: "appointment not found" });
    }
    const appointment = appointmentRows[0];

    const nextEmployeeId = Number(employeeId);
    await ensureEmployeeExistsInBranch(nextEmployeeId, Number(appointment.branch_id));

    if (await isEmployeeOnLeave(nextEmployeeId, appointment.appointment_date)) {
      return res
        .status(409)
        .json({ ok: false, error: "employee is on approved leave on this date" });
    }
    if (
      await hasEmployeeAppointmentConflict(
        nextEmployeeId,
        appointment.appointment_date,
        appointment.start_time,
        Number(appointment.duration_minutes),
        id
      )
    ) {
      return res.status(409).json({
        ok: false,
        error: "employee has a conflicting appointment",
      });
    }

    await execute("UPDATE appointments SET employee_id = ? WHERE id = ?", [
      nextEmployeeId,
      id,
    ]);

    return res.json({
      ok: true,
      data: { message: "employee assigned successfully", employeeId: nextEmployeeId },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const result: ResultSetHeader = await execute(
      "DELETE FROM appointments WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "appointment not found" });
    }

    return res.json({
      ok: true,
      data: { message: "appointment deleted successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

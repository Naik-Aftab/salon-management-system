import { Router } from "express";
import {
  assignAppointmentEmployee,
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  listAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from "../controllers/appointmentController";

const router = Router();

router.post("/", createAppointment);
router.get("/", listAppointments);
router.get("/:id", getAppointmentById);
router.patch("/:id", updateAppointment);
router.patch("/:id/status", updateAppointmentStatus);
router.patch("/:id/assign", assignAppointmentEmployee);
router.delete("/:id", deleteAppointment);

export default router;

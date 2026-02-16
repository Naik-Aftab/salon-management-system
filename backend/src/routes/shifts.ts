import { Router } from "express";
import {
  createShift,
  deleteShift,
  getShiftById,
  listShifts,
  updateShift,
} from "../controllers/shiftController";

const router = Router();

router.post("/", createShift);
router.get("/", listShifts);
router.get("/:id", getShiftById);
router.patch("/:id", updateShift);
router.delete("/:id", deleteShift);

export default router;

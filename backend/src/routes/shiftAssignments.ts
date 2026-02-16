import { Router } from "express";
import {
  createShiftAssignment,
  deleteShiftAssignment,
  listShiftAssignments,
  updateShiftAssignment,
} from "../controllers/shiftAssignmentController";

const router = Router();

router.post("/", createShiftAssignment);
router.get("/", listShiftAssignments);
router.patch("/:id", updateShiftAssignment);
router.delete("/:id", deleteShiftAssignment);

export default router;

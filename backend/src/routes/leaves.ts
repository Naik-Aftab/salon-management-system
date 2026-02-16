import { Router } from "express";
import {
  cancelLeaveRequest,
  createLeaveRequest,
  getLeaveById,
  listLeaves,
  reviewLeaveRequest,
  updateLeaveRequest,
} from "../controllers/leaveController";

const router = Router();

router.post("/", createLeaveRequest);
router.get("/", listLeaves);
router.get("/:id", getLeaveById);
router.patch("/:id", updateLeaveRequest);
router.patch("/:id/review", reviewLeaveRequest);
router.patch("/:id/cancel", cancelLeaveRequest);

export default router;

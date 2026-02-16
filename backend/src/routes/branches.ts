import { Router } from "express";
import {
  createBranch,
  deleteBranch,
  getBranchById,
  listBranches,
  updateBranch,
} from "../controllers/branchController";

const router = Router();

router.post("/", createBranch);
router.get("/", listBranches);
router.get("/:id", getBranchById);
router.patch("/:id", updateBranch);
router.delete("/:id", deleteBranch);

export default router;

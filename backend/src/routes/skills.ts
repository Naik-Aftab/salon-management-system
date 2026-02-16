import { Router } from "express";
import {
  createSkill,
  deleteSkill,
  listSkills,
  updateSkill,
} from "../controllers/skillController";

const router = Router();

router.post("/", createSkill);
router.get("/", listSkills);
router.patch("/:id", updateSkill);
router.delete("/:id", deleteSkill);

export default router;

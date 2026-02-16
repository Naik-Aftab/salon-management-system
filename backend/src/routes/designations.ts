import { Router } from "express";
import {
  createDesignation,
  deleteDesignation,
  listDesignations,
  updateDesignation,
} from "../controllers/designationController";

const router = Router();

router.post("/", createDesignation);
router.get("/", listDesignations);
router.patch("/:id", updateDesignation);
router.delete("/:id", deleteDesignation);

export default router;

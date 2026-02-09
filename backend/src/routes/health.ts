import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    message: "Backend is running ✅",
    timestamp: new Date().toISOString(),
  });
});

export default router;

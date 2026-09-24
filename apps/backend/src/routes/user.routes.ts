import { Router } from "express";

import { createUser, getCurrentUser, getUser } from "../controllers/user.controller";
import { authMiddleware } from "../utils/middleware";

const router = Router();

router.get("/me", authMiddleware, getCurrentUser);
router.post("/signin", getUser);
router.post("/signup", createUser);

export default router;
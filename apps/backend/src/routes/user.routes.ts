import { Router } from "express";

import { createUser, getUser } from "../controllers/user.controller";

const router = Router();

router.post("/signin", getUser);
router.post("/signup", createUser);

export default router;
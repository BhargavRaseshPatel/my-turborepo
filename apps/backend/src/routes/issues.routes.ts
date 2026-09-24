
// routes/issue.routes.ts
import { Router } from "express";
import { createIssue, getIssues, updateIssue, } from "../controllers/issue.controller";
import { authMiddleware } from "./../utils/middleware";
const router = Router();
router.post("/", authMiddleware, createIssue);
router.get("/board/:boardId", authMiddleware, getIssues);
router.put(
    "/updateIssue/:issueID",
    authMiddleware,
    updateIssue
);
export default router;

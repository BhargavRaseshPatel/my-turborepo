// routes/board.routes.ts
import { Router } from "express";
import { createBoard, getBoards } from "../controllers/board.controller";
import { authMiddleware } from "./../utils/middleware";
const router = Router();
// Get all boards for the logged-in user
router.get("/", authMiddleware, getBoards);
// Create a board
router.post("/", authMiddleware, createBoard);
export default router;

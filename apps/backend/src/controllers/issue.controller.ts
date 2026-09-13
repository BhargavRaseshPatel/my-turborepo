// controllers/issue.controller.ts
import { Request, Response } from "express";
import { createIssueService, getIssuesService, updateIssueStatusService } from "../services/issue.service";
export const createIssue = async (req: Request, res: Response) => {
    try {
        const { name, description, boardId, status } = req.body;
        if (!name || !description || !boardId) {
            return res.status(400).json({
                message: "Name, description, and boardId are required",
            });
        }
        const issue = await createIssueService({
            name,
            description,
            boardId,
            status,
        });
        return res.status(201).json({
            message: "Issue created successfully",
            issue,
        });
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error &&
            error.message === "Board not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
export const getIssues = async (req: Request, res: Response) => {
    try {
        const { boardId } = req.params;
        if (!boardId) {
            return res.status(400).json({
                message: "boardId is required",
            });
        }
        // @ts-ignore
        const issues = await getIssuesService(boardId);
        return res.status(200).json({
            message: "Issues fetched successfully",
            issues,
        });
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error &&
            error.message === "Board not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const updateIssueStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        if (!["UPCOMING", "IN_PROGRESS", "DONE"].includes(status)) {
            return res.status(400).json({
                message: "status must be UPCOMING, IN_PROGRESS, or DONE",
            });
        }
        const issue = await updateIssueStatusService(req.params.id as string, status);
        return res.status(200).json({
            message: "Issue updated successfully",
            issue,
        });
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error &&
            error.message === "Issue not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

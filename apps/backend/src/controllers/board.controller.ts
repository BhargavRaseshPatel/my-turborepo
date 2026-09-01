import { Request, Response } from "express";
import { getBoardsService, createBoardService } from "../services/board.service";
export const getBoards = async (req: Request, res:Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const boards = await getBoardsService(userId);
        return res.status(200).json({
            message: "Boards fetched successfully",
            boards,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
export const createBoard = async (req: Request, res: Response) => {
    try {
        const { name, organizationId } = req.body;
        // @ts-ignore
        const userId = req.userId;
        if (!name || !organizationId) {
            return res.status(400).json({
                message: "Name and organizationId are required",
            });
        }
        const board = await createBoardService({
            name,
            organizationId,
            userId,
        });
        return res.status(201).json({
            message: "Board created successfully",
            board,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

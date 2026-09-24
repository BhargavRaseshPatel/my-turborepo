import { Request, Response } from "express";
import { loginUser, createUserService, getUserByIdService } from "../services";
import { generateToken } from "../utils/jwt";

export const getCurrentUser = async (req: Request, res: Response) => {
    const userId = (req as any).userId;

    if (!userId) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    const user = await getUserByIdService(userId);

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    return res.status(200).json({
        user,
    });
};

export const getUser = async (req: Request, res: Response) => {
    const { email, password } = req.body
    const user = await loginUser(email, password);

    if(!user) {
        return res.status(401).json({
            message : "Invalid email or password"
        })
    }

    const token = generateToken(user.id)
    

    return res.status(200).json({
        message : "Login Successful", token
    })
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        message: "Email, password, and username are required",
      });
    }

    const user = await createUserService({
      email,
      password,
      username,
    });

    const token = generateToken(user.id)

    return res.status(201).json({
      message: "User created successfully",
      token
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
import { Request, Response } from "express";
import { loginUser, createUserService } from "../services";

export const getUser = async (req: Request, res: Response) => {
    const { email, password } = req.body
    const user = await loginUser(email, password);

    if(!user) {
        return res.status(401).json({
            message : "Invalid email or password"
        })
    }

    return res.status(200).json({
        message : "Login Successful", user
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

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
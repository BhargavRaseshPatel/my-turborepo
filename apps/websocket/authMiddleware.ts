import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authMiddleware = (
  token : string,
) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader?.startsWith("Bearer ")) {
//     throw new Error("Authentication required");
//   }

//   const token = authHeader.split(" ")[1];
// console.log(JWT_SECRET, token)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
    };

    // @ts-ignore
    return decoded.userId;

  } catch {
   throw new Error("Authentication required");
  }
};
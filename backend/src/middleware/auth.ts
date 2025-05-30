import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "../models/user";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies["auth_token"];
  if (!token) {
    res.status(401).json({ message: "Unztorized" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    if (typeof decoded == "object" && decoded.userId) {
      const user = await User.findById(decoded.userId);
      if (!user) {
        res.status(401).json({ message: "Invalid token" });
        return;
      }
    } else {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    req.userId = (decoded as JwtPayload).userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unztorized" });
    return;
  }
};

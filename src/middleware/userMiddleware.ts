import type { Request, Response, NextFunction } from "express";
import { JWT_PASSWORD } from "../types/types.js";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: "admin" | "supervisor" | "agent" | "candidate";
  };
}

export function userAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ message: "Token required" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_PASSWORD) as {
      userId: string;
      role: "admin" | "supervisor" | "agent" | "candidate";
    };

    (req as AuthenticatedRequest).user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

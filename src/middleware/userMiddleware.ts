import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../types/types.js";

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
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Unauthorized, token missing or invalid",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

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
    res.status(401).json({
      success: false,
      error: "Unauthorized, token missing or invalid",
    });
  }
}

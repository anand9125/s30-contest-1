import type { Request, Response, NextFunction } from "express";
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: "admin" | "supervisor" | "agent" | "candidate";
    };
}
export declare function userAuthMiddleware(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=userMiddleware.d.ts.map
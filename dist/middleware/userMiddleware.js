import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../types/types.js";
export function userAuthMiddleware(req, res, next) {
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
        const payload = jwt.verify(token, JWT_PASSWORD);
        req.user = {
            userId: payload.userId,
            role: payload.role,
        };
        next();
    }
    catch {
        res.status(401).json({
            success: false,
            error: "Unauthorized, token missing or invalid",
        });
    }
}
//# sourceMappingURL=userMiddleware.js.map
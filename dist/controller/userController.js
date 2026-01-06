import { SigninSchema, SignupSchema } from "../types/zod.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../types/types.js";
import prisma from "../lib/index.js";
export const userSignUp = async (req, res) => {
    const parsed = SignupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            error: "Invalid request schema",
        });
    }
    const { name, email, password, role, supervisorId } = parsed.data;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: "Email already exists",
            });
        }
        if (role === "agent") {
            if (!supervisorId) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid request schema",
                });
            }
            const supervisor = await prisma.user.findUnique({
                where: { id: supervisorId },
            });
            if (!supervisor) {
                return res.status(404).json({
                    success: false,
                    error: "Supervisor not found",
                });
            }
            if (supervisor.role !== "supervisor") {
                return res.status(400).json({
                    success: false,
                    error: "Invalid supervisor role",
                });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                supervisorId: role === "agent" ? supervisorId : null,
            },
        });
        return res.status(201).json({
            success: true,
            data: {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};
export const userSignin = async (req, res) => {
    const parsed = SigninSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            error: "Invalid request schema",
        });
    }
    const { email, password } = parsed.data;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized, token missing or invalid",
            });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized, token missing or invalid",
            });
        }
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_PASSWORD);
        return res.status(200).json({
            success: true,
            data: { token },
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};
export const getMe = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized, token missing or invalid",
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: authReq.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized, token missing or invalid",
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};
//# sourceMappingURL=userController.js.map
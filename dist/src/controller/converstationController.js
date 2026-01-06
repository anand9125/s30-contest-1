import prisma from "../lib/index.js";
import { adminAnalyticsSchema, assignConversationSchema, closeConversationParamsSchema, createConversationSchema, getConversationParamsSchema, objectIdSchema } from "../types/zod.js";
export const createConversation = async (req, res) => {
    try {
        const parsed = createConversationSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: "Invalid request schema",
            });
        }
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized, token missing or invalid",
            });
        }
        if (authReq.user.role !== "candidate") {
            return res.status(403).json({
                success: false,
                error: "Forbidden, insufficient permissions",
            });
        }
        const supervisor = await prisma.user.findUnique({
            where: { id: parsed.data.supervisorId },
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
        const existing = await prisma.conversation.findFirst({
            where: {
                candidateId: authReq.user.userId,
                status: { in: ["open", "assigned"] },
            },
        });
        if (existing) {
            return res.status(409).json({
                success: false,
                error: "Candidate already has an active conversation",
            });
        }
        const conversation = await prisma.conversation.create({
            data: {
                candidateId: authReq.user.userId,
                supervisorId: parsed.data.supervisorId,
                status: "open",
            },
        });
        return res.status(201).json({
            success: true,
            data: {
                _id: conversation.id,
                status: conversation.status,
                supervisorId: conversation.supervisorId,
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
export const assignConversation = async (req, res) => {
    try {
        if (!objectIdSchema.safeParse(req.params.id).success) {
            return res.status(400).json({
                success: false,
                error: "Invalid request schema",
            });
        }
        const parsed = assignConversationSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: "Invalid request schema",
            });
        }
        const authReq = req;
        if (!authReq.user || authReq.user.role !== "supervisor") {
            return res.status(403).json({
                success: false,
                error: "Forbidden, insufficient permissions",
            });
        }
        const conversation = await prisma.conversation.findUnique({
            where: { id: req.params.id },
        });
        if (!conversation) {
            return res.status(404).json({
                success: false,
                error: "Conversation not found",
            });
        }
        if (conversation.status === "closed") {
            return res.status(400).json({
                success: false,
                error: "Conversation already closed",
            });
        }
        if (conversation.supervisorId !== authReq.user.userId) {
            return res.status(403).json({
                success: false,
                error: "Forbidden, insufficient permissions",
            });
        }
        const agent = await prisma.user.findUnique({
            where: { id: parsed.data.agentId },
        });
        if (!agent) {
            return res.status(404).json({
                success: false,
                error: "Agent not found",
            });
        }
        if (agent.role !== "agent") {
            return res.status(400).json({
                success: false,
                error: "Invalid agent role",
            });
        }
        if (agent.supervisorId !== authReq.user.userId) {
            return res.status(403).json({
                success: false,
                error: "Agent doesn't belong to you",
            });
        }
        const updated = await prisma.conversation.update({
            where: { id: conversation.id },
            data: { agentId: agent.id },
        });
        return res.status(200).json({
            success: true,
            data: {
                conversationId: updated.id,
                agentId: updated.agentId,
                supervisorId: updated.supervisorId,
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
export const getConversation = async (req, res) => {
    try {
        const parsed = getConversationParamsSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: "Invalid request schema",
            });
        }
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized, token missing or invalid",
            });
        }
        const conversation = await prisma.conversation.findUnique({
            where: { id: parsed.data.id },
            include: { messages: true },
        });
        if (!conversation) {
            return res.status(404).json({
                success: false,
                error: "Conversation not found",
            });
        }
        const { role, userId } = authReq.user;
        if (role === "candidate" &&
            conversation.candidateId !== userId) {
            return res.status(403).json({
                success: false,
                error: "Forbidden, insufficient permissions",
            });
        }
        if (role === "supervisor" &&
            conversation.supervisorId !== userId) {
            return res.status(403).json({
                success: false,
                error: "Forbidden, insufficient permissions",
            });
        }
        if (role === "agent" &&
            conversation.agentId !== userId) {
            return res.status(403).json({
                success: false,
                error: "Forbidden, insufficient permissions",
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                _id: conversation.id,
                status: conversation.status,
                agentId: conversation.agentId,
                supervisorId: conversation.supervisorId,
                candidateId: conversation.candidateId,
                messages: conversation.status === "closed"
                    ? conversation.messages
                    : [],
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
export const closeConversation = async (req, res) => {
    try {
        const parsed = closeConversationParamsSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: "Invalid request schema",
            });
        }
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized, token missing or invalid",
            });
        }
        const { role, userId } = authReq.user;
        if (role !== "admin" && role !== "supervisor") {
            return res.status(403).json({
                success: false,
                error: "Forbidden, insufficient permissions",
            });
        }
        const conversation = await prisma.conversation.findUnique({
            where: { id: parsed.data.id },
        });
        if (!conversation) {
            return res.status(404).json({
                success: false,
                error: "Conversation not found",
            });
        }
        if (role === "supervisor" &&
            conversation.supervisorId !== userId) {
            return res.status(403).json({
                success: false,
                error: "Forbidden, insufficient permissions",
            });
        }
        if (conversation.status === "closed") {
            return res.status(400).json({
                success: false,
                error: "Conversation already closed",
            });
        }
        if (conversation.status === "assigned") {
            return res.status(400).json({
                success: false,
                error: "Conversation already assigned",
            });
        }
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { status: "closed" },
        });
        return res.status(200).json({
            success: true,
            data: {
                conversationId: conversation.id,
                status: "closed",
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
export const getAdminAnalytics = async (req, res) => {
    try {
        if (!adminAnalyticsSchema.safeParse(req.query).success) {
            return res.status(400).json({
                success: false,
                error: "Invalid request schema",
            });
        }
        const authReq = req;
        if (!authReq.user || authReq.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                error: "Forbidden, insufficient permissions",
            });
        }
        const supervisors = await prisma.user.findMany({
            where: { role: "supervisor" },
            include: { agents: true },
        });
        const data = [];
        for (const s of supervisors) {
            const agentIds = s.agents.map(a => a.id);
            const conversationsHandled = await prisma.conversation.count({
                where: {
                    agentId: { in: agentIds },
                    status: "closed",
                },
            });
            data.push({
                supervisorId: s.id,
                supervisorName: s.name,
                agents: agentIds.length,
                conversationsHandled,
            });
        }
        return res.status(200).json({
            success: true,
            data,
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};
//# sourceMappingURL=converstationController.js.map
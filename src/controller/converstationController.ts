import { ca } from "zod/locales";
import prisma from "../lib/index.js";
import type { AuthenticatedRequest } from "../middleware/userMiddleware.js";
import { adminAnalyticsSchema, assignConversationSchema, closeConversationParamsSchema, createConversationSchema, getConversationParamsSchema } from "../types/zod.js";
import type { Request, Response } from "express";

export const createConversation = async (
  req: Request,
  res: Response
) => {
  try {
    const parseData = createConversationSchema.safeParse(req.body);

    if (!parseData.success) {
      return res.status(400).json({
        message: "Invalid data",
      });
    }

    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (authReq.user.role !== "candidate") {
      return res.status(403).json({
        success: false,
        error: "Forbidden, insufficient permissions",
      });
    }

    const supervisor = await prisma.user.findFirst({
      where: {
        id: parseData.data.supervisorId,
        role: "supervisor",
      },
    });

    if (!supervisor) {
      return res.status(404).json({
        message: "Supervisor not found",
      });
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        candidateId: authReq.user.userId,
        status: {
          in: ["open", "assigned"],
        },
      },
    });

    if (existingConversation) {
      return res.status(409).json({
        message: "Candidate already has an active conversation",
      });
    }

    const conversation = await prisma.conversation.create({
      data: {
        candidateId: authReq.user.userId,
        supervisorId: parseData.data.supervisorId,
        status: "open",
      },
    });

    return res.status(201).json({
      message: "Conversation created successfully",
      conversation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const assignConversation = async (
  req: Request,
  res: Response
) => {
  try {
    const parseData = assignConversationSchema.safeParse(req.body);

    if (!parseData.success) {
      return res.status(400).json({
        message: "Invalid data",
      });
    }

    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (authReq.user.role !== "supervisor") {
      return res.status(403).json({
        success: false,
        error: "Forbidden, insufficient permissions",
      });
    }

    const conversationId = req.params.conversationId as string;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    if (conversation.supervisorId !== authReq.user.userId) {
      return res.status(403).json({
        message: "Forbidden, insufficient permissions",
      });
    }

    const agent = await prisma.user.findUnique({
      where: { id: parseData.data.agentId },
    });

    if (!agent || agent.role !== "agent") {
      return res.status(404).json({
        message: "Agent not found",
      });
    }

    if (agent.supervisorId !== authReq.user.userId) {
      return res.status(403).json({
        message: "Agent doesn’t belong to you",
      });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        agentId: agent.id,
      },
    });

    return res.status(200).json({
      message: "Conversation assigned successfully",
      conversation: updatedConversation,
    });
  } catch {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const getConversation = async (
  req: Request,
  res: Response
) => {
  try {
    const parseData = getConversationParamsSchema.safeParse(req.params);

    if (!parseData.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request schema",
      });
    }

    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized, token missing or invalid",
      });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: parseData.data.id },
      include: {
        messages: true, 
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    const { role, userId } = authReq.user;

    if (
      role === "candidate" &&
      conversation.candidateId !== userId
    ) {
      return res.status(403).json({
        success: false,
        error: "insufficient permissions",
      });
    }

    if (
      role === "supervisor" &&
      conversation.supervisorId !== userId
    ) {
      return res.status(403).json({
        success: false,
        error: "insufficient permissions",
      });
    }

    if (
      role === "agent" &&
      conversation.agentId !== userId
    ) {
      return res.status(403).json({
        success: false,
        error: "Forbidden, insufficient permissions",
      });
    }

 
    const messages =
      conversation.status === "closed"
        ? conversation.messages
        : [];

    return res.status(200).json({
      success: true,
      data: {
        _id: conversation.id,
        status: conversation.status,
        agentId: conversation.agentId,
        supervisorId: conversation.supervisorId,
        candidateId: conversation.candidateId,
        messages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};


export const closeConversation = async (
  req: Request,
  res: Response
) => {
  try {
    const parseData = closeConversationParamsSchema.safeParse(req.params);

    if (!parseData.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request schema",
      });
    }

    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized, token missing or invalid",
      });
    }

    const { userId, role } = authReq.user;

    if (role !== "admin" && role !== "supervisor") {
      return res.status(403).json({
        success: false,
        error: "Forbidden, insufficient permissions",
      });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: parseData.data.id },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    if (
      role === "supervisor" &&
      conversation.supervisorId !== userId
    ) {
      return res.status(403).json({
        success: false,
        error: "Forbidden, insufficient permissions",
      });
    }

    if (conversation.status !== "open") {
      return res.status(400).json({
        success: false,
        error: "Conversation already closed or assigned",
      });
    }

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        status: "closed",
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        conversationId: conversation.id,
        status: "closed",
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};


export const getAdminAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const parseData = adminAnalyticsSchema.safeParse(req.query);

    if (!parseData.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request schema",
      });
    }

    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized, token missing or invalid",
      });
    }

    if (authReq.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Forbidden, insufficient permissions",
      });
    }

    const supervisors = await prisma.user.findMany({
      where: { role: "supervisor" },
      include: {
        agents: {
          select: { id: true },
        },
      },
    });

    const analytics = [];

    for (const supervisor of supervisors) {
      const agentIds = supervisor.agents.map((a) => a.id);

      const conversationsHandled = await prisma.conversation.count({
        where: {
          agentId: { in: agentIds },
          status: "closed",
        },
      });

      analytics.push({
        supervisorId: supervisor.id,
        supervisorName: supervisor.name,
        agents: agentIds.length,
        conversationsHandled,
      });
    }

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

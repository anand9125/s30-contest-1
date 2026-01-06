import { z } from "zod";

export const SignupSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["admin", "supervisor", "agent", "candidate"]),
    supervisorId: z.string().optional(),
  })



export const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

//The candidate provides supervisorId so the system knows which support team should own the conversation from the start.
export const createConversationSchema = z.object({
  supervisorId: z.string().min(1, "supervisorId is required"),
});

export const assignConversationSchema = z.object({
  agentId: z.string().min(1, "agentId is required"),
});

export const getConversationParamsSchema = z.object({
  id: z.string().min(1, "conversationId is required"),
});

export const closeConversationParamsSchema = z.object({
  id: z.string().min(1, "conversationId is required"),
});

export const adminAnalyticsSchema = z.object({});

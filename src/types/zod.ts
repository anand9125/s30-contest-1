import { z } from "zod";

export const objectIdSchema = z.string().uuid();

export const SignupSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["admin", "supervisor", "agent", "candidate"]),
    supervisorId: objectIdSchema.optional(),
  })



export const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});


export const createConversationSchema = z.object({
  supervisorId: objectIdSchema,
});

export const assignConversationSchema = z.object({
  agentId: objectIdSchema,
});

export const getConversationParamsSchema = z.object({
  id: objectIdSchema,
});

export const closeConversationParamsSchema = z.object({
  id: objectIdSchema,
});

export const adminAnalyticsSchema = z.object({});

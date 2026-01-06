import { z } from "zod";
export declare const objectIdSchema: z.ZodString;
export declare const SignupSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<{
        admin: "admin";
        supervisor: "supervisor";
        agent: "agent";
        candidate: "candidate";
    }>;
    supervisorId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const SigninSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const objectIdSchema: z.ZodString;
export declare const createConversationSchema: z.ZodObject<{
    supervisorId: z.ZodString;
}, z.core.$strip>;
export declare const assignConversationSchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strip>;
export declare const getConversationParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const closeConversationParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const adminAnalyticsSchema: z.ZodObject<{}, z.core.$strip>;
//# sourceMappingURL=zod.d.ts.map
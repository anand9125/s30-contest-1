import type { Request, Response } from "express";
export declare const createConversation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const assignConversation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getConversation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const closeConversation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAdminAnalytics: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=converstationController.d.ts.map
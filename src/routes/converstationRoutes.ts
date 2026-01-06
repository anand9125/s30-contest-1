import { Router } from "express";
import { userSignin, userSignUp } from "../controller/userController.js";
import { userAuthMiddleware } from "../middleware/userMiddleware.js";
import { assignConversation, closeConversation, createConversation, getAdminAnalytics, getConversation } from "../controller/converstationController.js";

const router = Router()

router.post("/",userAuthMiddleware,createConversation)

router.post("/:id/assign", userAuthMiddleware, assignConversation);

router.get("/:id", userAuthMiddleware, getConversation);

router.post("/:id/close",userAuthMiddleware,closeConversation);

router.get("/admin/analytics", userAuthMiddleware, getAdminAnalytics);

export const conversationRouter = router;
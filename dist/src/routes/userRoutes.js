import { Router } from "express";
import { getMe, userSignin, userSignUp } from "../controller/userController.js";
import { userAuthMiddleware } from "../middleware/userMiddleware.js";
const router = Router();
router.post("/signup", userSignUp);
router.post("/login", userSignin);
router.get("/me", userAuthMiddleware, getMe);
export const userRouter = router;
//# sourceMappingURL=userRoutes.js.map
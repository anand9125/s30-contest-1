import { Router } from "express";
import { userSignin, userSignUp } from "../controller/userController.js";

const router = Router()

router.post("/signup",userSignUp)

router.post("signin",userSignin)


export const userRouter = router;
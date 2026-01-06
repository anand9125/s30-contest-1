import express from "express"
import cors from "cors"
import type { Request,Response } from "express";
import { userRouter } from "./routes/userRoutes.js";
import { conversationRouter } from "./routes/converstationRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/user",userRouter);

app.use("/api/v1/conversation",conversationRouter);




app.listen(3000,()=>{
    console.log("server is running on 3000")
})
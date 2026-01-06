import express from "express";
import cors from "cors";
import http from "http";
import { userRouter } from "./routes/userRoutes.js";
import { conversationRouter } from "./routes/converstationRoutes.js";
const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
app.use("/auth", userRouter);
app.use("/conversations", conversationRouter);
app.listen(3000, () => {
    console.log("server is running on 3000");
});
//# sourceMappingURL=index.js.map
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

// admin route import
import AuthRoutes from "./Routes/AuthRoutes";
import ParentRoutes from "./Routes/ParentRoutes";

//error handler midddlewares
import { errorHandler, notFound } from "./Middleware/ErrorHandler";

//custom middlaware import
import {
  bodyParserMiddleware,
  loggerMiddleware,
} from "./ServerMiddleware/logger";

const server = express();
dotenv.config();
const PORT = process.env.PORT || 3007;

//middlewares
server.use(helmet());
server.use(cors());
server.use(express.json());

//logger middleware
server.use(loggerMiddleware);
server.use(bodyParserMiddleware);

//admin routes
server.use("/api/auth", AuthRoutes);
server.use("/api/parent", ParentRoutes);

//error handler middleware
server.use(notFound);
server.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is listening to http://localhost:${PORT}`);
});

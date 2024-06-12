import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

//route import
import AuthRoutes from "./Routes/AuthRoutes";
// import UserRoutes from "./Routes/UserRoutes";
import ProductRoutes from "./Routes/ProductRoutes";
import CategoryRoutes from "./Routes/CategoryRoutes";
import PrintRoutes from "./Routes/PrintRoutes";
// import CartRoutes from "./Routes/CartRoutes";
// import OrderRoutes from "./Routes/OrderRoutes";
// import DriverRoutes from "./Routes/DriverRoutes";

//error handler midddlewares
import { errorHandler, notFound } from "./Middleware/ErrorHandler";

const server = express();
dotenv.config();
const PORT = process.env.PORT || 3006;

//middlewares
server.use(helmet());
server.use(cors());
server.use(express.json());

server.use("/api/auth", AuthRoutes);
server.use("/api/product", ProductRoutes);
server.use("/api/category", CategoryRoutes);
server.use("/api/print", PrintRoutes);
// server.use("/api/user", UserRoutes);
// server.use("/api/cart", CartRoutes);
// server.use("/api/order", OrderRoutes);
// server.use("/api/driver", DriverRoutes);

//error handler middleware
server.use(notFound);
server.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is listening to http://localhost:${PORT}`);
});

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

// admin route import
import AuthRoutes from "./Admin/Routes/AuthRoutes";
import ProductRoutes from "./Admin/Routes/ProductRoutes";
import CategoryRoutes from "./Admin/Routes/CategoryRoutes";
import PrintRoutes from "./Admin/Routes/PrintRoutes";
import CartRoutes from "./Admin/Routes/CartRoutes";
import OrderRoutes from "./Admin/Routes/OrderRoutes";
import DeliveryRoutes from "./Admin/Routes/DeliveryRoutes";

//driver route import
import DriverAuth from "./Driver/Routes/DriverAuthRoutes";
import DriverDelivery from "./Driver/Routes/DriverDeliveryRoutes";

//error handler midddlewares
import { errorHandler, notFound } from "./Admin/Middleware/ErrorHandler";

const server = express();
dotenv.config();
const PORT = process.env.PORT || 3006;

//middlewares
server.use(helmet());
server.use(cors());
server.use(express.json());

//admin routes
server.use("/api/auth", AuthRoutes);
server.use("/api/product", ProductRoutes);
server.use("/api/category", CategoryRoutes);
server.use("/api/print", PrintRoutes);
server.use("/api/cart", CartRoutes);
server.use("/api/order", OrderRoutes);
server.use("/api/delivery", DeliveryRoutes);

//driver routes
server.use("/api/driver/auth", DriverAuth);
server.use("/api/driver/delivery", DriverDelivery);

//error handler middleware
server.use(notFound);
server.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is listening to http://localhost:${PORT}`);
});

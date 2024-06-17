// logger.js

import fs from "fs";
import path from "path";
import morgan from "morgan";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { AuthRequest } from "./Admin/Middleware/authMiddleware";

// Load environment variables
dotenv.config();

const logDirectory = path.join(__dirname, "logs");
const logFilePath = path.join(logDirectory, "access.log");

// Ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(logFilePath, { flags: "a" });

// Define a custom token for morgan to log the request body
morgan.token("body", function (req: AuthRequest, res) {
  return JSON.stringify(req.body);
});

// Define a custom token for morgan to log the admin's fullname
morgan.token("user", function (req: AuthRequest, res) {
  return req.admin?.fullname;
});

// Morgan middleware configuration to log to file
export const loggerMiddleware = morgan(
  ':user :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :body',
  { stream: accessLogStream }
);

// Middleware to parse the body before morgan logs the request
export const bodyParserMiddleware = bodyParser.json();

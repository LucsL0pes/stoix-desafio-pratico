import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import csrf from "csurf";

import taskRoutes from "./routes/taskRoutes.js";
import { csrfErrorHandler } from "./middlewares/csrfErrorHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const isProduction = process.env.NODE_ENV === "production";

app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: clientOrigin,
    credentials: true
  })
);
app.use(express.json());

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction
  }
});

app.use(csrfProtection);

app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/api/tasks", taskRoutes);

app.use(csrfErrorHandler);
app.use(errorHandler);

export default app;
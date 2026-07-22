import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import session from "express-session";
import authRouter from "./routes/Auth.js";
import faqsRouter from "./routes/faqs.js";
import sessionsRouter from "./routes/sessions.js";
import ticketsRouter from "./routes/tickets.js";
import notificationsRouter from "./routes/notifications.js";
import metricsRouter from "./routes/metrics.js";
import passport from "./config/passport.js";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.BACKEND_PORT || 8000;
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET is missing in .env");
}

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", express.static("./frontend/dist"));
app.use("/api/auth", authRouter);
app.use("/api/faqs", faqsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/metrics", metricsRouter);

app.use("/api/{*path}", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.get("/{*path}", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

app.use((error, req, res, next) => {
  console.error("Unhandled request error:", error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ message: "Server error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

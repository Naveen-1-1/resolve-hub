import express from "express";
import session from "express-session";
import testRouter from "./routes/test.js";
import listingsRouter from "./routes/listings.js";
import authRouter from "./routes/Auth.js";
import passport from "./config/passport.js";
import "dotenv/config";

console.log("Initializing the backend...");
const PORT = process.env.BACKEND_PORT || 8000;

const app = express();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", express.static("./frontend/dist"));

app.use("", testRouter);

app.use("/api/", listingsRouter);
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

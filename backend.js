import express from "express";
import testRouter from "./routes/test.js";
import listingsRouter from "./routes/listings.js";
import "dotenv/config";

console.log("Initializing the backend...");
const PORT = process.env.BACKEND_PORT || 8000;

const app = express();

app.use("/", express.static("./frontend/dist"));

app.use("", testRouter);

app.use("/api/", listingsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

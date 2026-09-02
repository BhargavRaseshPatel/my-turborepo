
import express from "express";
import cors from "cors";

import userRoute from "./routes/user.routes";
import organizationRoute from "./routes/organization.routes";
import issueRoute from "./routes/issues.routes";
import boardRoute from "./routes/boards.routes";

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());



// API routes

app.get("/", (_req, res) => {
  res.json({
    message: "Server is running",
  });
});
app.use("/api/auth", userRoute);
app.use("/api/organizations", organizationRoute);
app.use("/api/issues", issueRoute);
app.use("/api/boards", boardRoute);

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    message: "Backend is running",
  });
});

export default app;

import express from "express";
import cors from "cors";
import courseTrackingRoutes from "./routes/courseTracking.js";
import packetRoutes from "./routes/packetRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.options("*", cors());
app.use("/api", authRoutes);
app.use("/api", courseTrackingRoutes);
app.use("/api", packetRoutes);

app.get("/", (req, res) => {
  res.send({ status: "ok", message: "Backend is running" });
});

app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import courseTrackingRoutes from "./routes/courseTracking.js";
import packetRoutes from "./routes/packetRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { initializeDatabase } from "../database/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(cors({ origin: true, credentials: true }));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api", authRoutes);
app.use("/api", courseTrackingRoutes);
app.use("/api", packetRoutes);


app.get("/", (req, res) => {
  res.send({ status: "ok", message: "Backend is running" });
});


initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start:", err);
    process.exit(1);
  });

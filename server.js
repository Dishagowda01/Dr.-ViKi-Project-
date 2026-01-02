import dotenv from "dotenv"; 
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

/* ===================== ENV ===================== */
dotenv.config();

/* ===================== DIRNAME FIX ===================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===================== APP ===================== */
const app = express();
const PORT = process.env.PORT || 5000;

/* ===================== MongoDB ===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

/* ===================== Middleware ===================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../frontend")));

/* ===================== Models ===================== */
import Admin from "./models/admin.js";
import Patient from "./models/patient.js";
import User from "./models/user.js";
import Doctor from "./models/doctor.js";

/* ===================== Routes ===================== */
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiSummaryRoutes from "./routes/aiSummaryRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";


/* ===================== ROUTES ===================== */
app.use("/api/admin", adminRoutes);
app.use("/ai-summary", aiSummaryRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/otp", otpRoutes);

/* ===================== SERVER ===================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* ===================== USER SIGNUP ===================== */
app.post("/api/user/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("User register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================== USER LOGIN ===================== */
app.post("/api/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("User login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================== DOCTOR LOGIN ===================== */
app.post("/api/doctor/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const doctor = await Doctor.findOne({ email });
    if (!doctor)
      return res.status(401).json({ message: "Invalid email or password" });

    if (!doctor.isApproved)
      return res.status(403).json({ message: "Waiting for admin approval" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Doctor login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================== LOGIN TEST ===================== */
app.get("/login-test", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

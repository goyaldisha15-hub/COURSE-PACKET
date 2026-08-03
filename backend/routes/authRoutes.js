import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { 
  getUsers, 
  login, 
  register,
  getProfile,
  updateProfile,
  handleChangePassword,
  handleForgotPassword,
  handleResetPassword,
  getNotifications,
  handleMarkNotificationRead,
  adminUpdateUserById,
  adminDeleteUserById,
} from "../controllers/authController.js";
import { requireAdminRole } from "../middleware/requireAdminRole.js";
import { updateProfilePhoto } from "../models/userModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/profiles");
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "profile-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (jpg, png, gif) are allowed"), false);
    }
  },
});

const router = Router();


router.post("/auth/login", login);
router.post("/auth/register", register);
router.post("/auth/forgot-password", handleForgotPassword);
router.post("/auth/reset-password", handleResetPassword);
router.post("/auth/change-password", handleChangePassword);


router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile/photo", upload.single("photo"), async (req, res) => {
  const email = req.headers["x-user-email"];
  if (!email) return res.status(400).json({ message: "User email is required" });
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  
  try {
    const user = await updateProfilePhoto(email, req.file.path);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


router.get("/notifications", getNotifications);
router.put("/notifications/:notificationId/read", handleMarkNotificationRead);


router.get("/admin/users", requireAdminRole, getUsers);
router.put("/admin/users/:userId", requireAdminRole, adminUpdateUserById);
router.delete("/admin/users/:userId", requireAdminRole, adminDeleteUserById);

export default router;


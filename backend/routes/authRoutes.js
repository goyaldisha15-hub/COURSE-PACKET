import { Router } from "express";
import { getUsers, login, register } from "../controllers/authController.js";
import { requireAdminRole } from "../middleware/requireAdminRole.js";

const router = Router();

router.post("/auth/login", login);
router.post("/auth/register", register);
router.get("/admin/users", requireAdminRole, getUsers);

export default router;

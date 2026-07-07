import { Router } from "express";
import { requireAdminRole } from "../middleware/requireAdminRole.js";
import { requireFacultyRole } from "../middleware/requireFacultyRole.js";
import { requireStudentRole } from "../middleware/requireStudentRole.js";
import {
  submitPacketRequest,
  listPendingPackets,
  approvePacket,
  rejectPacket,
  listApprovedPackets,
  listFacultyPackets,
  listAllPackets,
} from "../controllers/packetController.js";

const router = Router();

router.post("/faculty/packets", requireFacultyRole, submitPacketRequest);
router.get("/faculty/packets", requireFacultyRole, listFacultyPackets);
router.get("/admin/packets", requireAdminRole, listAllPackets);
router.get("/admin/packets/pending", requireAdminRole, listPendingPackets);
router.post("/admin/packets/:packetId/approve", requireAdminRole, approvePacket);
router.post("/admin/packets/:packetId/reject", requireAdminRole, rejectPacket);
router.get("/student/packets", requireStudentRole, listApprovedPackets);

export default router;

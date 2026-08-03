import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { requireAdminRole } from "../middleware/requireAdminRole.js";
import { requireFacultyRole } from "../middleware/requireFacultyRole.js";
import { requireStudentRole } from "../middleware/requireStudentRole.js";
import {
  submitPacketRequest,
  listPendingPackets,
  approvePacket,
  rejectPacket,
  returnPacket,
  listApprovedPackets,
  listFacultyPackets,
  listAllPackets,
  deleteFacultyPacket,
  editFacultyPacket,
  downloadPacket,
  searchPacketsAPI,
  getReports,
} from "../controllers/packetController.js";
import {
  handleAddBookmark,
  handleRemoveBookmark,
  handleGetBookmarks,
} from "../controllers/bookmarkController.js";
import {
  handleGetDownloads,
  handleGetRecentDownloads,
  handleGetFacultyDownloads,
} from "../controllers/downloadController.js";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getSubjects,
  getSubjectsByDepartment,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/departmentController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {

  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = Router();




router.post("/faculty/packets", requireFacultyRole, upload.single("pdf"), submitPacketRequest);


router.get("/faculty/packets", requireFacultyRole, listFacultyPackets);


router.put("/faculty/packets/:packetId", requireFacultyRole, editFacultyPacket);


router.delete("/faculty/packets/:packetId", requireFacultyRole, deleteFacultyPacket);




router.get("/admin/packets", requireAdminRole, listAllPackets);


router.get("/admin/packets/pending", requireAdminRole, listPendingPackets);


router.post("/admin/packets/:packetId/approve", requireAdminRole, approvePacket);


router.post("/admin/packets/:packetId/reject", requireAdminRole, rejectPacket);


router.post("/admin/packets/:packetId/return", requireAdminRole, returnPacket);


router.get("/admin/reports", requireAdminRole, getReports);


router.get("/admin/departments", requireAdminRole, getDepartments);
router.post("/admin/departments", requireAdminRole, createDepartment);
router.put("/admin/departments/:id", requireAdminRole, updateDepartment);
router.delete("/admin/departments/:id", requireAdminRole, deleteDepartment);


router.get("/admin/subjects", requireAdminRole, getSubjects);
router.post("/admin/subjects", requireAdminRole, createSubject);
router.put("/admin/subjects/:id", requireAdminRole, updateSubject);
router.delete("/admin/subjects/:id", requireAdminRole, deleteSubject);




router.get("/student/packets", requireStudentRole, listApprovedPackets);


router.get("/student/packets/search", requireStudentRole, searchPacketsAPI);


router.get("/student/packets/:packetId/download", requireStudentRole, downloadPacket);


router.post("/student/bookmarks", requireStudentRole, handleAddBookmark);
router.get("/student/bookmarks", requireStudentRole, handleGetBookmarks);
router.delete("/student/bookmarks/:packetId", requireStudentRole, handleRemoveBookmark);


router.get("/student/downloads", requireStudentRole, handleGetDownloads);
router.get("/student/downloads/recent", requireStudentRole, handleGetRecentDownloads);




router.get("/departments", getDepartments);


router.get("/subjects", getSubjects);
router.get("/subjects/:department", getSubjectsByDepartment);


router.get("/faculty/downloads", requireFacultyRole, handleGetFacultyDownloads);


router.get("/packets/:packetId/download", downloadPacket);

export default router;

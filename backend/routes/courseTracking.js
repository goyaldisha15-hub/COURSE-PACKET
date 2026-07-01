import { Router } from "express";
import { requireStudentRole } from "../middleware/requireStudentRole.js";
import { requireAdminRole } from "../middleware/requireAdminRole.js";
import { requireSectionedFaculty } from "../middleware/requireSectionedFaculty.js";
import {
  publishCourse,
  getTeacherCourses,
  getStudentCourses,
  getStudentCourseDetail,
  requestCourseAccess,
  getStudentRequests,
  getAdminPendingRequests,
  getTeacherSectionRequests,
  adminUpdateRequest,
  teacherEscalateRequest,
  listSections,
  getTeachers,
  getStudents,
  assignTeacherSection,
  unassignTeacher,
} from "../controllers/courseController.js";

const router = Router();

router.get("/sections", listSections);
router.get("/admin/teachers", requireAdminRole, getTeachers);
router.get("/admin/students", requireAdminRole, getStudents);
router.post("/admin/teachers/assign", requireAdminRole, assignTeacherSection);
router.post("/admin/teachers/unassign", requireAdminRole, unassignTeacher);

router.get("/student/courses", requireStudentRole, getStudentCourses);
router.get("/student/courses/:courseId", requireStudentRole, getStudentCourseDetail);
router.post("/student/courses/access-request", requireStudentRole, requestCourseAccess);
router.get("/student/courses/requests", requireStudentRole, getStudentRequests);

router.get("/admin/requests/pending", requireAdminRole, getAdminPendingRequests);
router.post("/admin/requests/:requestId/action", requireAdminRole, adminUpdateRequest);

router.get("/faculty/courses", requireSectionedFaculty, getTeacherCourses);
router.post("/faculty/courses", requireSectionedFaculty, publishCourse);
router.get("/faculty/requests", requireSectionedFaculty, getTeacherSectionRequests);
router.post("/faculty/requests/:requestId/escalate", requireSectionedFaculty, teacherEscalateRequest);

export default router;

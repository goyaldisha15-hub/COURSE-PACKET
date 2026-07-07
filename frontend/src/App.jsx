import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import AdminDashboard from "./features/admin/AdminDashboard";
import AdminPackets from "./features/admin/AdminPackets";
import FacultyDashboard from "./features/faculty/FacultyDashboard";
import StudentDashboard from "./features/student/StudentDashboard";
import Reports from "./features/admin/Reports";
import Users from "./features/admin/Users";
import Remarks from "./features/faculty/Remarks";
import ReviewPackets from "./features/faculty/ReviewPackets";
import RequestPacket from "./features/student/RequestPacket";
import TrackStatus from "./features/student/TrackStatus";
import CourseTracking from "./features/student/course-tracking/CourseTracking";
import CourseDetail from "./features/student/course-tracking/CourseDetail";
import SubmitPacket from "./features/faculty/packet-submission/SubmitPacket";
import AdminApproval from "./features/admin/AdminApproval";
import ApprovedPackets from "./features/student/approved-data/ApprovedPackets";
import Notifications from "./features/notifications/Notifications";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/packets" element={<AdminPackets />} />
            <Route path="/admin/approval" element={<AdminApproval />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/users" element={<Users />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin", "faculty", "student"]} />}>
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["faculty"]} />}>
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/remarks" element={<Remarks />} />
            <Route path="/faculty/review" element={<ReviewPackets />} />
            <Route path="/faculty/submit" element={<SubmitPacket />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/request" element={<RequestPacket />} />
            <Route path="/student/track" element={<TrackStatus />} />
            <Route path="/student/courses" element={<CourseTracking />} />
            <Route path="/student/courses/:courseId" element={<CourseDetail />} />
            <Route path="/student/approved" element={<ApprovedPackets />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

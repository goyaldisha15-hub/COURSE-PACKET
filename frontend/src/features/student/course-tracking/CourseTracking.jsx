import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import { useAuth } from "../../../context/AuthContext";
import { getStudentCourses } from "../../../services/courseService";
import LiveMeta from "../../../components/common/LiveMeta";

export default function CourseTracking() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadCourses = () => {
      getStudentCourses(user.role, user.email)
        .then((data) => {
          setCourses(data);
          setLastUpdated(new Date());
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Unable to load courses");
          setLoading(false);
        });
    };

    loadCourses();
    const timer = setInterval(loadCourses, 10000);
    return () => clearInterval(timer);
  }, [user]);

  const totalCourses = courses.length;
  const averageProgress = useMemo(() => {
    if (!courses.length) return 0;
    return Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length);
  }, [courses]);

  const statusCounts = useMemo(() => {
    return courses.reduce(
      (counts, course) => {
        counts[course.status] = (counts[course.status] || 0) + 1;
        return counts;
      },
      { ongoing: 0, completed: 0, paused: 0 }
    );
  }, [courses]);

  return (
    <Layout
      title="Course Tracking"
      subtitle="View your enrolled courses and progress"
      onLogout={logout}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card">
            <h4 className="text-sm uppercase tracking-wide text-slate-500">Enrolled Courses</h4>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{totalCourses}</p>
          </div>
          <div className="card">
            <h4 className="text-sm uppercase tracking-wide text-slate-500">Avg Progress</h4>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{averageProgress}%</p>
          </div>
          <div className="card">
            <h4 className="text-sm uppercase tracking-wide text-slate-500">Current Status</h4>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{statusCounts.ongoing || 0} Ongoing</p>
            <p className="text-sm text-slate-500 mt-1">{statusCounts.completed || 0} completed</p>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Your Courses</h3>
              <LiveMeta lastUpdated={lastUpdated} />
            </div>
            <button onClick={() => navigate("/student/courses/1")} className="btn-secondary">
              Open first course
            </button>
          </div>

          {loading ? (
            <p>Loading courses...</p>
          ) : error ? (
            <p className="text-rose-600">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-3">Course</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Last Accessed</th>
                    <th className="p-3">Completed</th>
                    <th className="p-3">Pending</th>
                    <th className="p-3">Status</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">{course.title}</td>
                      <td className="p-3">
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full bg-indigo-600"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{course.progress}% complete</div>
                      </td>
                      <td className="p-3">{course.lastLesson}</td>
                      <td className="p-3">{course.completedLessons}</td>
                      <td className="p-3">{course.pendingLessons}</td>
                      <td className="p-3 capitalize">{course.status}</td>
                      <td className="p-3">
                        <button
                          onClick={() => navigate(`/student/courses/${course.id}`)}
                          className="btn-primary"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

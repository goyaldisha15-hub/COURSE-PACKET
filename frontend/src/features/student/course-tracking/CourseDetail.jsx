import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import { useAuth } from "../../../context/AuthContext";
import { getStudentCourseById } from "../../../services/courseService";

export default function CourseDetail() {
  const { courseId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    getStudentCourseById(courseId, user.role)
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unable to load course details");
        setLoading(false);
      });
  }, [courseId, user]);

  return (
    <Layout
      title="Course Details"
      subtitle="Review lessons, progress, and status"
      onLogout={logout}
    >
      <div className="space-y-6">
        <button onClick={() => navigate("/student/courses")} className="btn-secondary">
          Back to course list
        </button>

        {loading ? (
          <p>Loading course details...</p>
        ) : error ? (
          <p className="text-rose-600">{error}</p>
        ) : course ? (
          <div className="card space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900">{course.title}</h3>
                <p className="mt-2 text-slate-600">{course.description}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="text-lg font-semibold text-slate-900 capitalize">{course.status}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Last Accessed</p>
                  <p className="text-lg font-semibold text-slate-900">{course.lastLesson}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Lessons Completed</p>
                  <p className="text-lg font-semibold text-slate-900">{course.completedLessons}/{course.totalLessons}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm uppercase tracking-wide text-slate-500">Progress</div>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div className="h-4 rounded-full bg-indigo-600" style={{ width: `${course.progress}%` }} />
              </div>
              <div className="text-sm text-slate-500">{course.progress}% complete</div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-slate-900">Lesson Breakdown</h4>
              <div className="mt-4 space-y-3">
                {course.lessons.map((lesson) => (
                  <div key={lesson.id} className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900">{lesson.title}</p>
                        <p className="text-sm text-slate-500">{lesson.duration}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${lesson.completed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                        {lesson.completed ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p>No course was found for this id.</p>
        )}
      </div>
    </Layout>
  );
}


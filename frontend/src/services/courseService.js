const COURSES_STORAGE_KEY = "lms-courses";

const initialCourses = [
  {
    id: "c1",
    title: "AI Foundations",
    description: "Core AI/ML fundamentals, data pipelines and model evaluation.",
    status: "ongoing",
    progress: 56,
    lastLesson: "Model Evaluation",
    completedLessons: 8,
    totalLessons: 14,
    pendingLessons: 6,
    lessons: [
      { id: "l1", title: "Intro to AI", duration: "20 min", completed: true },
      { id: "l2", title: "Data Preparation", duration: "30 min", completed: true },
      { id: "l3", title: "Model Training", duration: "40 min", completed: true },
      { id: "l4", title: "Evaluation", duration: "25 min", completed: false },
      { id: "l5", title: "Deployment", duration: "35 min", completed: false },
    ],
  },
  {
    id: "c2",
    title: "Full Stack Web Development",
    description: "Modern web fundamentals with React, Node.js and database design.",
    status: "completed",
    progress: 100,
    lastLesson: "Project Deployment",
    completedLessons: 12,
    totalLessons: 12,
    pendingLessons: 0,
    lessons: [
      { id: "l1", title: "HTML & CSS", duration: "15 min", completed: true },
      { id: "l2", title: "React Basics", duration: "30 min", completed: true },
      { id: "l3", title: "Backend APIs", duration: "45 min", completed: true },
    ],
  },
  {
    id: "c3",
    title: "Cyber Security Essentials",
    description: "Network security, threat detection, and secure coding practices.",
    status: "paused",
    progress: 22,
    lastLesson: "OWASP Top 10",
    completedLessons: 2,
    totalLessons: 9,
    pendingLessons: 7,
    lessons: [
      { id: "l1", title: "Security Fundamentals", duration: "20 min", completed: true },
      { id: "l2", title: "Threat Modeling", duration: "25 min", completed: true },
      { id: "l3", title: "OWASP Top 10", duration: "30 min", completed: false },
    ],
  },
];

function getStoredCourses() {
  try {
    const raw = localStorage.getItem(COURSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(initialCourses));
      return [...initialCourses];
    }
    return JSON.parse(raw);
  } catch {
    return [...initialCourses];
  }
}

export async function getStudentCourses(role) {
  return getStoredCourses();
}

export async function getStudentCourseById(courseId, role) {
  const courses = getStoredCourses();
  return courses.find((course) => course.id === courseId) || null;
}

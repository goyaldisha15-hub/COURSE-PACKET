export const sections = ["AI/ML", "FSD", "DS", "Cyber"];

export const users = [
  {
    id: "u1",
    name: "Super Admin",
    email: "admin@lms.com",
    password: "admin123",
    role: "admin",
    section: null,
    accessSections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "u2",
    name: "Priya Sharma",
    email: "priya@lms.com",
    password: "faculty123",
    role: "faculty",
    section: "AI/ML",
    accessSections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "u3",
    name: "Aman Singh",
    email: "aman@lms.com",
    password: "student123",
    role: "student",
    section: "AI/ML",
    accessSections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "u4",
    name: "Riya Patel",
    email: "riya@lms.com",
    password: "student123",
    role: "student",
    section: "FSD",
    accessSections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "u5",
    name: "Karan Verma",
    email: "karan@lms.com",
    password: "faculty123",
    role: "faculty",
    section: "FSD",
    accessSections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const courses = [
  {
    id: "c1",
    title: "AI Foundations",
    description: "Core AI/ML fundamentals, data pipelines and model evaluation.",
    section: "AI/ML",
    teacherEmail: "priya@lms.com",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c2",
    title: "Full Stack Web Development",
    description: "Modern web fundamentals with React, Node.js and database design.",
    section: "FSD",
    teacherEmail: "karan@lms.com",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c3",
    title: "Data Structures & Algorithms",
    description: "Deep dive into data structures and algorithmic patterns.",
    section: "DS",
    teacherEmail: "karan@lms.com",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c4",
    title: "Cyber Security Essentials",
    description: "Network security, threat detection, and secure coding practices.",
    section: "Cyber",
    teacherEmail: "priya@lms.com",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const courseAccessRequests = [];

let nextUserId = 6;
let nextCourseId = 5;
let nextRequestId = 1;

export function getNextUserId() {
  return `u${nextUserId++}`;
}

export function getNextCourseId() {
  return `c${nextCourseId++}`;
}

export function getNextRequestId() {
  return `r${nextRequestId++}`;
}

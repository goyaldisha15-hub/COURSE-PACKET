const USER_STORAGE_KEY = "lms-users";

const initialUsers = [
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
];

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(initialUsers));
      return [...initialUsers];
    }
    return JSON.parse(raw);
  } catch {
    return [...initialUsers];
  }
}

function saveUsers(users) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

export async function loginUser({ email, password, role }) {
  const users = getStoredUsers();
  const matched = users.find(
    (user) => user.email === email && user.password === password && user.role === role
  );
  if (!matched) {
    throw new Error("Invalid email, password, or role.");
  }
  return sanitizeUser(matched);
}

export async function registerUser({ name, email, password, role, section }) {
  const users = getStoredUsers();
  if (!email || !password || !role) {
    throw new Error("Name, email, password, and role are required.");
  }
  if (role === "student" && !section) {
    throw new Error("Student section is required.");
  }

  const existing = users.find((user) => user.email === email);
  if (existing) {
    throw new Error("Email already exists. Please use another email.");
  }

  const id = `u${users.length + 1}`;
  const now = new Date().toISOString();
  const newUser = {
    id,
    name: name || email.split("@")[0],
    email,
    password,
    role,
    section: role === "student" || role === "faculty" ? section : null,
    accessSections: [],
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  saveUsers(users);
  return sanitizeUser(newUser);
}

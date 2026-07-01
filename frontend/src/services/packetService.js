const PACKETS_STORAGE_KEY = "lms-packets";

const initialPackets = [
  {
    id: "p1",
    title: "AI Foundations Packet",
    course: "AI Foundations",
    description: "Detailed AI module data.",
    facultyEmail: "priya@lms.com",
    submittedBy: "priya@lms.com",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p2",
    title: "Web Dev Packet",
    course: "Full Stack Web Development",
    description: "Web development course packet.",
    facultyEmail: "karan@lms.com",
    submittedBy: "karan@lms.com",
    status: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getStoredPackets() {
  try {
    const raw = localStorage.getItem(PACKETS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PACKETS_STORAGE_KEY, JSON.stringify(initialPackets));
      return [...initialPackets];
    }
    return JSON.parse(raw);
  } catch {
    return [...initialPackets];
  }
}

function savePackets(packets) {
  localStorage.setItem(PACKETS_STORAGE_KEY, JSON.stringify(packets));
}

function findPacket(packetId) {
  return getStoredPackets().find((packet) => packet.id === packetId);
}

export async function getPackets() {
  return getStoredPackets();
}

export async function submitPacketRequest(payload, role, email) {
  if (!payload.title || !payload.course || !payload.description) {
    throw new Error("Title, course, and description are required.");
  }
  const packets = getStoredPackets();
  const id = `p${packets.length + 1}`;
  const now = new Date().toISOString();
  const packet = {
    id,
    title: payload.title,
    course: payload.course,
    description: payload.description,
    facultyEmail: email,
    submittedBy: email,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  packets.push(packet);
  savePackets(packets);
  return packet;
}

export async function getFacultyPackets(role, email) {
  return getStoredPackets().filter((packet) => packet.facultyEmail === email);
}

export async function getPendingPackets(role, email) {
  return getStoredPackets().filter((packet) => packet.status === "pending");
}

export async function approvePacket(packetId, role, email) {
  const packets = getStoredPackets();
  const index = packets.findIndex((packet) => packet.id === packetId);
  if (index === -1) {
    throw new Error("Packet not found.");
  }
  packets[index] = {
    ...packets[index],
    status: "approved",
    updatedAt: new Date().toISOString(),
  };
  savePackets(packets);
  return packets[index];
}

export async function rejectPacket(packetId, role, email) {
  const packets = getStoredPackets();
  const index = packets.findIndex((packet) => packet.id === packetId);
  if (index === -1) {
    throw new Error("Packet not found.");
  }
  packets[index] = {
    ...packets[index],
    status: "rejected",
    updatedAt: new Date().toISOString(),
  };
  savePackets(packets);
  return packets[index];
}

export async function getApprovedPackets(role, email) {
  return getStoredPackets().filter((packet) => packet.status === "approved");
}

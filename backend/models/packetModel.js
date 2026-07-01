const packetRequests = [];
let nextPacketId = 1;

export function createPacketRequest({ title, course, description, submittedBy, facultyEmail }) {
  const newPacket = {
    id: nextPacketId.toString(),
    title,
    course,
    description,
    submittedBy,
    facultyEmail,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  packetRequests.push(newPacket);
  nextPacketId += 1;
  return newPacket;
}

export function getPendingPacketRequests() {
  return packetRequests.filter((packet) => packet.status === "pending");
}

export function getApprovedPacketRequests() {
  return packetRequests.filter((packet) => packet.status === "approved");
}

export function getRejectedPacketRequests() {
  return packetRequests.filter((packet) => packet.status === "rejected");
}

export function getPacketRequestById(id) {
  return packetRequests.find((packet) => packet.id === id);
}

export function updatePacketStatus(id, status) {
  const packet = getPacketRequestById(id);
  if (!packet) return null;
  packet.status = status;
  packet.updatedAt = new Date().toISOString();
  return packet;
}

export function getFacultyPacketRequests(facultyEmail) {
  return packetRequests.filter((packet) => packet.facultyEmail === facultyEmail);
}

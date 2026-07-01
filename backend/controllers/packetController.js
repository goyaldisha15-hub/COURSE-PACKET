import {
  createPacketRequest,
  getPendingPacketRequests,
  getApprovedPacketRequests,
  getPacketRequestById,
  updatePacketStatus,
  getFacultyPacketRequests,
} from "../models/packetModel.js";

export function submitPacketRequest(req, res) {
  const { title, course, description } = req.body;
  const facultyEmail = req.headers["x-user-email"] || "faculty@example.com";
  const submittedBy = req.headers["x-user-email"] || "faculty@example.com";

  if (!title || !course || !description) {
    return res.status(400).json({ message: "Title, course, and description are required." });
  }

  const packet = createPacketRequest({ title, course, description, submittedBy, facultyEmail });
  return res.status(201).json(packet);
}

export function listPendingPackets(req, res) {
  return res.json(getPendingPacketRequests());
}

export function approvePacket(req, res) {
  const { packetId } = req.params;
  const packet = updatePacketStatus(packetId, "approved");
  if (!packet) {
    return res.status(404).json({ message: "Packet request not found." });
  }
  return res.json(packet);
}

export function rejectPacket(req, res) {
  const { packetId } = req.params;
  const packet = updatePacketStatus(packetId, "rejected");
  if (!packet) {
    return res.status(404).json({ message: "Packet request not found." });
  }
  return res.json(packet);
}

export function listApprovedPackets(req, res) {
  return res.json(getApprovedPacketRequests());
}

export function listFacultyPackets(req, res) {
  const facultyEmail = req.headers["x-user-email"] || "faculty@example.com";
  return res.json(getFacultyPacketRequests(facultyEmail));
}

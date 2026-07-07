import {
  createPacketRequest,
  getPendingPacketRequests,
  getApprovedPacketRequests,
  getPacketRequestById,
  updatePacketStatus,
  getFacultyPacketRequests,
  getAllPackets,
} from "../models/packetModel.js";

export async function submitPacketRequest(req, res) {
  const { title, course, description } = req.body;
  const facultyEmail = req.headers["x-user-email"] || "faculty@example.com";
  const submittedBy = req.headers["x-user-email"] || "faculty@example.com";

  if (!title || !course || !description) {
    return res.status(400).json({ message: "Title, course, and description are required." });
  }

  try {
    const packet = await createPacketRequest({ title, course, description, submittedBy, facultyEmail });
    return res.status(201).json(packet);
  } catch (error) {
    console.error("Error submitting packet:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function listPendingPackets(req, res) {
  try {
    const packets = await getPendingPacketRequests();
    return res.json(packets);
  } catch (error) {
    console.error("Error fetching pending packets:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function approvePacket(req, res) {
  const { packetId } = req.params;
  const { remarks } = req.body;
  try {
    const packet = await updatePacketStatus(packetId, "approved", remarks);
    if (!packet) {
      return res.status(404).json({ message: "Packet request not found." });
    }
    return res.json(packet);
  } catch (error) {
    console.error("Error approving packet:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function rejectPacket(req, res) {
  const { packetId } = req.params;
  const { remarks } = req.body;
  try {
    const packet = await updatePacketStatus(packetId, "rejected", remarks);
    if (!packet) {
      return res.status(404).json({ message: "Packet request not found." });
    }
    return res.json(packet);
  } catch (error) {
    console.error("Error rejecting packet:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function listApprovedPackets(req, res) {
  try {
    const packets = await getApprovedPacketRequests();
    return res.json(packets);
  } catch (error) {
    console.error("Error fetching approved packets:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function listFacultyPackets(req, res) {
  const facultyEmail = req.headers["x-user-email"] || "faculty@example.com";
  try {
    const packets = await getFacultyPacketRequests(facultyEmail);
    return res.json(packets);
  } catch (error) {
    console.error("Error fetching faculty packets:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function listAllPackets(req, res) {
  try {
    const packets = await getAllPackets();
    return res.json(packets);
  } catch (error) {
    console.error("Error fetching all packets:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

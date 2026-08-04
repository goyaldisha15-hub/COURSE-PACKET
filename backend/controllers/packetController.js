import { createPacketRequest, getPendingPacketRequests, getApprovedPacketRequests, getPacketRequestById, updatePacketStatus, getFacultyPacketRequests, getAllPackets, updatePacketDetails, deletePacketById, incrementDownloadCount, searchPackets, getPacketsByDepartment, getPacketsBySection, getPacketsBySemester, getPacketsByType, getMonthlyStats, getMostDownloadedPackets, getLeastDownloadedPackets } from "../models/packetModel.js";
import { createNotification, findUserByEmail } from "../models/userModel.js";
import { recordDownload } from "../models/downloadModel.js";
import { allAsync } from "../database/database.js";


function getEmail(req) {
  return req.headers["x-user-email"] || "unknown";
}


export async function submitPacketRequest(req, res) {
  try {
    const { title, course, subjectCode, description, semester, department, section, academicYear, packetType } = req.body;
    const email = getEmail(req);
    
    if (!title || !course) return res.status(400).json({ message: "Title and course are required." });

    const file = req.file || {};
    const packet = await createPacketRequest({
      title, course, subjectCode, description, submittedBy: email, facultyEmail: email,
      semester, department, section, academicYear, packetType,
      fileName: file.filename || "", filePath: file.path || "", fileSize: file.size || 0
    });


    await createNotification("admin@lms.com", "New Packet Submitted", `Packet '${title}' submitted by ${email}`, "info");
    res.status(201).json(packet);
  } catch (error) {
    console.error("Error submitting packet:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function listPendingPackets(req, res) {
  try {
    res.json(await getPendingPacketRequests());
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function approvePacket(req, res) {
  try {
    const { packetId } = req.params;
    const { remarks } = req.body;
    const packet = await updatePacketStatus(packetId, "approved", remarks);
    if (!packet) return res.status(404).json({ message: "Packet not found." });

    await allAsync("INSERT INTO approval_history (packetId, action, remarks, performedBy) VALUES (?, 'approved', ?, ?)", [packetId, remarks, getEmail(req)]);
    await createNotification(packet.facultyEmail, "Packet Approved", `Your packet '${packet.title}' has been approved.`, "success");
    res.json(packet);
  } catch (error) {
    console.error("Error approving packet:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function rejectPacket(req, res) {
  try {
    const { packetId } = req.params;
    const { remarks } = req.body;
    const packet = await updatePacketStatus(packetId, "rejected", remarks);
    if (!packet) return res.status(404).json({ message: "Packet not found." });

    await allAsync("INSERT INTO approval_history (packetId, action, remarks, performedBy) VALUES (?, 'rejected', ?, ?)", [packetId, remarks, getEmail(req)]);
    await createNotification(packet.facultyEmail, "Packet Rejected", `Your packet '${packet.title}' was rejected.`, "error");
    res.json(packet);
  } catch (error) {
    console.error("Error rejecting packet:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function returnPacket(req, res) {
  try {
    const { packetId } = req.params;
    const { remarks } = req.body;
    const packet = await updatePacketStatus(packetId, "returned", remarks);
    if (!packet) return res.status(404).json({ message: "Packet not found." });

    await allAsync("INSERT INTO approval_history (packetId, action, remarks, performedBy) VALUES (?, 'returned', ?, ?)", [packetId, remarks, getEmail(req)]);
    await createNotification(packet.facultyEmail, "Packet Returned", `Your packet '${packet.title}' needs corrections.`, "warning");
    res.json(packet);
  } catch (error) {
    console.error("Error returning packet:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function listApprovedPackets(req, res) {
  try {
    const student = await findUserByEmail(getEmail(req));
    const packets = await getApprovedPacketRequests(student?.department || null, student?.section || null, student?.semester || null);
    res.json(packets);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function listFacultyPackets(req, res) {
  try {
    res.json(await getFacultyPacketRequests(getEmail(req)));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function listAllPackets(req, res) {
  try {
    res.json(await getAllPackets());
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function editFacultyPacket(req, res) {
  try {
    const { packetId } = req.params;
    const email = getEmail(req);
    const packet = await getPacketRequestById(packetId);
    
    if (!packet) return res.status(404).json({ message: "Packet not found." });
    if (packet.facultyEmail !== email) return res.status(403).json({ message: "You can only edit your own packets." });

    res.json(await updatePacketDetails(packetId, req.body));
  } catch (error) {
    console.error("Error editing packet:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function deleteFacultyPacket(req, res) {
  try {
    const { packetId } = req.params;
    const email = getEmail(req);
    const packet = await getPacketRequestById(packetId);
    
    if (!packet) return res.status(404).json({ message: "Packet not found." });
    if (packet.facultyEmail !== email) return res.status(403).json({ message: "You can only delete your own packets." });

    if (packet.filePath) {
      try { const fs = await import("fs"); fs.unlinkSync(packet.filePath); } catch (e) { }
    }
    await deletePacketById(packetId);
    res.json({ success: true, message: "Packet deleted" });
  } catch (error) {
    console.error("Error deleting packet:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function downloadPacket(req, res) {
  try {
    const { packetId } = req.params;
    const email = getEmail(req);
    const packet = await getPacketRequestById(packetId);

    if (!packet) return res.status(404).json({ message: "Packet not found." });
    if (!packet.filePath) return res.status(404).json({ message: "No file found." });

    if (email) {
      await recordDownload(email, packetId);
      await incrementDownloadCount(packetId);
      await createNotification(packet.facultyEmail, "Packet Downloaded", `A student downloaded '${packet.title}'`, "info");
    }

    const path = await import("path");
    res.download(path.default.resolve(packet.filePath), packet.fileName || "packet.pdf");
  } catch (error) {
    console.error("Error downloading:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function searchPacketsAPI(req, res) {
  try {
    const { q, department, section, semester } = req.query;
    res.json(await searchPackets(q, department, section, semester));
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function getReports(req, res) {
  try {
    const [byDepartment, bySection, bySemester, byType, monthly, mostDownloaded, leastDownloaded, totalPackets] = await Promise.all([
      getPacketsByDepartment(), getPacketsBySection(), getPacketsBySemester(), getPacketsByType(), getMonthlyStats(), getMostDownloadedPackets(), getLeastDownloadedPackets(), getAllPackets()
    ]);

    res.json({
      byDepartment, bySection, bySemester, byType, monthly, mostDownloaded, leastDownloaded,
      total: totalPackets.length,
      pending: totalPackets.filter(p => p.status === 'pending').length,
      approved: totalPackets.filter(p => p.status === 'approved').length,
      rejected: totalPackets.filter(p => p.status === 'rejected').length,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server error" });
  }
}

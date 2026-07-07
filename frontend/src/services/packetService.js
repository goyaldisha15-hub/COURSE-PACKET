import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getPackets(email, role = "student") {
  try {
    const response = await apiClient.get("/student/packets", {
      headers: {
        "x-user-email": email,
        "x-user-role": role,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching packets:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch packets", { cause: error });
  }
}

export async function submitPacketRequest(payload, role, email) {
  try {
    if (!payload.title || !payload.course || !payload.description) {
      throw new Error("Title, course, and description are required.");
    }
    
    const response = await apiClient.post("/faculty/packets", {
      title: payload.title,
      course: payload.course,
      description: payload.description,
    }, {
      headers: {
        "x-user-email": email,
        "x-user-role": role,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to submit packet", { cause: error });
  }
}

export async function getFacultyPackets(role, email) {
  try {
    const response = await apiClient.get("/faculty/packets", {
      headers: {
        "x-user-email": email,
        "x-user-role": role,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching faculty packets:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch faculty packets", { cause: error });
  }
}

export async function getPendingPackets(role, email) {
  try {
    const response = await apiClient.get("/admin/packets/pending", {
      headers: {
        "x-user-email": email,
        "x-user-role": role,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching pending packets:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch pending packets", { cause: error });
  }
}

export async function getAllPackets(role, email) {
  try {
    const response = await apiClient.get("/admin/packets", {
      headers: {
        "x-user-email": email,
        "x-user-role": role,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all packets:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch packets", { cause: error });
  }
}

export async function approvePacket(packetId, role, email, remarks = "") {
  try {
    const response = await apiClient.post(
      `/admin/packets/${packetId}/approve`,
      { remarks },
      {
        headers: {
          "x-user-role": role,
          "x-user-email": email,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to approve packet", { cause: error });
  }
}

export async function rejectPacket(packetId, role, email, remarks = "") {
  try {
    const response = await apiClient.post(
      `/admin/packets/${packetId}/reject`,
      { remarks },
      {
        headers: {
          "x-user-role": role,
          "x-user-email": email,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to reject packet", { cause: error });
  }
}

export async function getApprovedPackets(role, email) {
  try {
    const response = await apiClient.get("/student/packets", {
      headers: {
        "x-user-role": role,
        "x-user-email": email,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching approved packets:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch approved packets", { cause: error });
  }
}

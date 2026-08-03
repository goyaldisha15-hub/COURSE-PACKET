import { authHeaders, formRequest, jsonRequest } from "./apiClient";


export const getPackets = (email, role) => jsonRequest("get", "/student/packets", null, authHeaders(role, email));
export const searchPackets = (params, role, email) =>
  jsonRequest("get", `/student/packets/search?${new URLSearchParams(params)}`, null, authHeaders(role, email));
export const downloadPacket = (id, role, email) =>
  jsonRequest("get", `/student/packets/${id}/download`, null, {
    ...authHeaders(role, email),
    responseType: "blob",
  });
export const addBookmark = (packetId, role, email) =>
  jsonRequest("post", "/student/bookmarks", { packetId }, authHeaders(role, email));
export const removeBookmark = (packetId, role, email) =>
  jsonRequest("delete", `/student/bookmarks/${packetId}`, null, authHeaders(role, email));
export const getBookmarks = (role, email) => jsonRequest("get", "/student/bookmarks", null, authHeaders(role, email));
export const getDownloadHistory = (role, email) =>
  jsonRequest("get", "/student/downloads", null, authHeaders(role, email));
export const getRecentDownloads = (role, email) =>
  jsonRequest("get", "/student/downloads/recent", null, authHeaders(role, email));


export const submitPacketRequest = (formData, role, email) =>
  formRequest("/faculty/packets", formData, authHeaders(role, email));
export const getFacultyPackets = (role, email) =>
  jsonRequest("get", "/faculty/packets", null, authHeaders(role, email));
export const editFacultyPacket = (id, data, role, email) =>
  jsonRequest("put", `/faculty/packets/${id}`, data, authHeaders(role, email));
export const deleteFacultyPacket = (id, role, email) =>
  jsonRequest("delete", `/faculty/packets/${id}`, null, authHeaders(role, email));
export const getFacultyDownloads = async (role, email) => {
  try {
    return await jsonRequest("get", "/faculty/downloads", null, authHeaders(role, email));
  } catch {
    return { total: 0 };
  }
};


export const getPendingPackets = (role, email) =>
  jsonRequest("get", "/admin/packets/pending", null, authHeaders(role, email));
export const getAllPackets = (role, email) =>
  jsonRequest("get", "/admin/packets", null, authHeaders(role, email));
export const approvePacket = (id, role, email, remarks = "") =>
  jsonRequest("post", `/admin/packets/${id}/approve`, { remarks }, authHeaders(role, email));
export const rejectPacket = (id, role, email, remarks = "") =>
  jsonRequest("post", `/admin/packets/${id}/reject`, { remarks }, authHeaders(role, email));
export const returnPacket = (id, role, email, remarks = "") =>
  jsonRequest("post", `/admin/packets/${id}/return`, { remarks }, authHeaders(role, email));
export const getApprovedPackets = async (role, email) => {
  const data = await getAllPackets(role, email);
  return data.filter((p) => p.status === "approved");
};
export const getReports = (role, email) =>
  jsonRequest("get", "/admin/reports", null, authHeaders(role, email));


export const getDepartments = () => jsonRequest("get", "/departments");
export const createDepartment = (data, role, email) =>
  jsonRequest("post", "/admin/departments", data, authHeaders(role, email));
export const updateDepartment = (id, data, role, email) =>
  jsonRequest("put", `/admin/departments/${id}`, data, authHeaders(role, email));
export const deleteDepartment = (id, role, email) =>
  jsonRequest("delete", `/admin/departments/${id}`, null, authHeaders(role, email));


export const getSubjects = () => jsonRequest("get", "/subjects");
export const getSubjectsByDepartment = (dept) => jsonRequest("get", `/subjects/${dept}`);
export const createSubject = (data, role, email) =>
  jsonRequest("post", "/admin/subjects", data, authHeaders(role, email));
export const updateSubject = (id, data, role, email) =>
  jsonRequest("put", `/admin/subjects/${id}`, data, authHeaders(role, email));
export const deleteSubject = (id, role, email) =>
  jsonRequest("delete", `/admin/subjects/${id}`, null, authHeaders(role, email));

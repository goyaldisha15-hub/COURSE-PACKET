import { authHeaders, formRequest, jsonRequest } from "./apiClient";


export const loginUser = (data) => jsonRequest("post", "/auth/login", data);
export const registerUser = (data) => jsonRequest("post", "/auth/register", data);
export const forgotPassword = (email) => jsonRequest("post", "/auth/forgot-password", { email });
export const resetPassword = (token, newPassword) => jsonRequest("post", "/auth/reset-password", { token, newPassword });
export const changePassword = (role, email, oldPassword, newPassword) =>
  jsonRequest("post", "/auth/change-password", { oldPassword, newPassword }, authHeaders(role, email));


export const getProfile = (role, email) => jsonRequest("get", "/profile", null, authHeaders(role, email));
export const updateProfile = (role, email, data) =>
  jsonRequest("put", "/profile", data, authHeaders(role, email));
export const uploadProfilePhoto = (role, email, file) => {
  const fd = new FormData();
  fd.append("photo", file);
  return formRequest("/profile/photo", fd, authHeaders(role, email));
};


export const getUsers = (role, email) => jsonRequest("get", "/admin/users", null, authHeaders(role, email));
export const adminUpdateUser = (role, email, userId, data) =>
  jsonRequest("put", `/admin/users/${userId}`, data, authHeaders(role, email));
export const adminDeleteUser = (role, email, userId) =>
  jsonRequest("delete", `/admin/users/${userId}`, null, authHeaders(role, email));


export const getNotifications = (role, email) => jsonRequest("get", "/notifications", null, authHeaders(role, email));
export const markNotificationRead = (role, email, id) =>
  jsonRequest("put", `/notifications/${id}/read`, {}, authHeaders(role, email));

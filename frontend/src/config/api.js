const defaultLocalUrl = "http://localhost:5000/api";
const defaultProdUrl = "https://course-packet.onrender.com/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? defaultLocalUrl : defaultProdUrl);

export const API_TIMEOUT = 10000;


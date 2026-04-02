import { getToken } from "./session";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export const callApi = async (path, options = {}, withAuth = false) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (withAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const raw = await response.text();
  let data = raw;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch (error) {
    data = raw;
  }

  if (!response.ok) {
    throw new Error(typeof data === "string" ? data : "Request failed");
  }

  return data;
};

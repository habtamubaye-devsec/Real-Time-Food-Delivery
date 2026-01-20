import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "/api/delivery";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const getSocketBaseUrl = () => {
  if (SOCKET_URL) return SOCKET_URL;

  // If API_URL is relative (/api/delivery), connect to current origin.
  // In local dev, backend usually runs on :5000.
  if (API_URL.startsWith("/")) {
    if (import.meta.env.DEV) {
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    return window.location.origin;
  }

  // If API_URL is absolute and contains /api/delivery, strip path to origin.
  try {
    const url = new URL(API_URL);
    return url.origin;
  } catch {
    return window.location.origin;
  }
};

let socket;

export const getSocket = () => {
  if (socket) return socket;

  socket = io(getSocketBaseUrl(), {
    withCredentials: true,
    transports: ["websocket"],
  });

  return socket;
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = undefined;
};

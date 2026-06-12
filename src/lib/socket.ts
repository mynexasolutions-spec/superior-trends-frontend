import { io, type Socket } from 'socket.io-client';
import { getAuthToken } from './authToken';

function getSocketUrl(): string {
  const fromEnv = import.meta.env.VITE_SOCKET_URL as string | undefined;
  if (fromEnv) return fromEnv;

  const api = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
  try {
    const u = new URL(api);
    return `${u.protocol}//${u.host}`;
  } catch {
    return 'http://localhost:5001';
  }
}

let socket: Socket | null = null;

export function connectOrderSocket(): Socket | null {
  const token = getAuthToken();
  if (!token) return null;

  if (socket) return socket;

  socket = io(getSocketUrl(), {
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function getOrderSocket(): Socket | null {
  return socket;
}

export function disconnectOrderSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

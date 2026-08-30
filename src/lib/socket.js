import { io } from 'socket.io-client';

// The Socket.io server is attached to the same HTTP server as the API, at
// the site root (not under /api/v1) — see makedown-api/src/server.js.
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const socketBase = apiBase.replace(/\/api\/v1\/?$/, '');

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(socketBase, { autoConnect: false, transports: ['websocket', 'polling'] });
  }
  return socket;
}

// Connects (if needed) and authenticates this socket as the given user so
// the server joins it to the "user:<id>" room for live chat delivery.
export function connectSocket(token) {
  const s = getSocket();
  if (!token) return s;
  if (s.connected) {
    s.emit('auth', token);
  } else {
    s.once('connect', () => s.emit('auth', token));
    s.connect();
  }
  return s;
}

import { io } from 'socket.io-client';

// The Socket.io server is attached to the same HTTP server as the API, at
// the site root (not under /api/v1) — see makedown-api/src/server.js.
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const socketBase = apiBase.replace(/\/api\/v1\/?$/, '');

let socket = null;
let authToken = null;

export function getSocket() {
  if (!socket) {
    socket = io(socketBase, { autoConnect: false, transports: ['websocket', 'polling'] });
    // Re-send 'auth' on every 'connect' — including reconnects, not just the
    // very first one. Socket.io reconnects the transport on its own after a
    // network blip, a backgrounded mobile/tab tab waking back up, or the API
    // process restarting — but the server has no idea which user a
    // reconnected socket belongs to until 'auth' is re-emitted. This used to
    // be wired with `.once('connect', ...)`, so every reconnect after the
    // very first left the socket silently unauthenticated: no error, it just
    // stopped receiving anything from that point on. That's exactly what
    // showed up as a live game going "stuck" / getting "disconnected" mid
    // question — especially in the pass-the-device flow, where handing the
    // phone/laptop to the other team is a common way to trigger exactly this
    // kind of brief connection drop.
    socket.on('connect', () => {
      if (authToken) socket.emit('auth', authToken);
    });
  }
  return socket;
}

// Connects (if needed) and authenticates this socket as the given user so
// the server joins it to the "user:<id>" room for live chat delivery.
export function connectSocket(token) {
  const s = getSocket();
  if (!token) return s;
  authToken = token;
  if (s.connected) s.emit('auth', token);
  else s.connect();
  return s;
}

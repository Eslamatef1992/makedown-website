import { getSocket, connectSocket } from './socket';

// Joins the Socket.io room for a single game session so play API events
// (game:state, game:turn_changed, game:tile_picked, game:answer_result,
// game:ended, game:score_adjusted, game:player_left, game:started) reach
// this tab. Call the returned cleanup function on unmount.
export function joinGameRoom(sessionId, token) {
  const socket = connectSocket(token);
  const join = () => socket.emit('game:join', sessionId);
  if (socket.connected) join();
  else socket.once('connect', join);

  return () => {
    socket.emit('game:leave', sessionId);
  };
}

export function onGameEvent(event, handler) {
  const socket = getSocket();
  socket.on(event, handler);
  return () => socket.off(event, handler);
}

import { getSocket, connectSocket } from './socket';

// Joins the Socket.io room for a single game session so play API events
// (game:state, game:turn_changed, game:tile_picked, game:answer_result,
// game:ended, game:score_adjusted, game:player_left, game:started) reach
// this tab. Call the returned cleanup function on unmount.
export function joinGameRoom(sessionId, token) {
  const socket = connectSocket(token);
  const join = () => socket.emit('game:join', sessionId);
  if (socket.connected) join();
  // Re-join on every future connect, not just the first — the server's
  // "which sessions is this socket in" state lives on the connection and is
  // lost whenever the transport drops and reconnects (network blip, a
  // backgrounded tab/phone waking back up, an API restart). Socket.io
  // reconnects the transport automatically, but without re-emitting
  // 'game:join' here, the tab silently stops receiving every game event
  // (game:next_team_turn, game:answer_result, game:state, ...) from that
  // point on — no error, the game just looks frozen on whatever question was
  // showing when the drop happened.
  socket.on('connect', join);

  return () => {
    socket.off('connect', join);
    socket.emit('game:leave', sessionId);
  };
}

export function onGameEvent(event, handler) {
  const socket = getSocket();
  socket.on(event, handler);
  return () => socket.off(event, handler);
}

import client from './client';

// ---- Board / category picker ----
export const listPlayableQuizzes = (categoryId) =>
  client.get('/play/quizzes', { params: categoryId ? { category_id: categoryId } : {} }).then((r) => r.data.data);

// ---- Session lifecycle ----
export const createGame = (payload) => client.post('/play/sessions', payload).then((r) => r.data.data);
export const joinGameByCode = (joinCode) => client.post('/play/sessions/join', { joinCode }).then((r) => r.data.data);
export const getGame = (id) => client.get(`/play/sessions/${id}`).then((r) => r.data.data);
export const startGame = (id) => client.post(`/play/sessions/${id}/start`).then((r) => r.data.data);
export const leaveGame = (id) => client.post(`/play/sessions/${id}/leave`).then((r) => r.data.data);
export const listPublicGames = (mode) => client.get('/play/sessions/public', { params: mode ? { mode } : {} }).then((r) => r.data.data);
export const matchRandomOpponent = (id) => client.post(`/play/sessions/${id}/match-random`).then((r) => r.data.data);

// ---- Live play ----
export const pickTile = (id, questionId) => client.post(`/play/sessions/${id}/pick-tile`, { questionId }).then((r) => r.data.data);
export const scanQuestion = (id, token) => client.post(`/play/sessions/${id}/scan`, { token }).then((r) => r.data.data);
export const submitAnswer = (id, questionId, selectedOptionIndex, timeTakenMs) =>
  client.post(`/play/sessions/${id}/answer`, { questionId, selectedOptionIndex, timeTakenMs }).then((r) => r.data.data);

// ---- Lifelines ----
export const applyFiftyFifty = (id, questionId) =>
  client.post(`/play/sessions/${id}/lifelines/fifty-fifty`, { questionId }).then((r) => r.data.data);
export const applySkip = (id, questionId) =>
  client.post(`/play/sessions/${id}/lifelines/skip`, { questionId }).then((r) => r.data.data);
export const callPhoneAFriend = (id, questionId, targetParticipantId) =>
  client.post(`/play/sessions/${id}/lifelines/phone-a-friend`, { questionId, targetParticipantId }).then((r) => r.data.data);
export const respondPhoneAFriend = (requestId, suggestedOptionIndex) =>
  client.post(`/play/lifeline-requests/${requestId}/respond`, { suggestedOptionIndex }).then((r) => r.data.data);

// ---- Invites ----
export const searchInvitees = (id, q) => client.get(`/play/sessions/${id}/invite-search`, { params: { q } }).then((r) => r.data.data);
export const sendInvite = (id, userId) => client.post(`/play/sessions/${id}/invite`, { userId }).then((r) => r.data.data);
export const respondToInvite = (inviteId, accept) => client.post(`/play/invites/${inviteId}/respond`, { accept }).then((r) => r.data.data);

// ---- Host controls ----
export const adjustScore = (id, participantId, delta, reason) =>
  client.post(`/play/sessions/${id}/score-adjustment`, { participantId, delta, reason }).then((r) => r.data.data);

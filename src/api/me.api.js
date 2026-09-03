import client from './client';

// ---- my profile ----
export const updateMyProfile = (payload) => client.patch('/me', payload).then((r) => r.data.data);
export const uploadMyAvatar = (file) => {
  const form = new FormData();
  form.append('file', file);
  return client.post('/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data);
};
export const changeMyPassword = (payload) => client.post('/me/change-password', payload).then((r) => r.data.data);

// ---- addresses ----
export const listMyAddresses = () => client.get('/me/addresses').then((r) => r.data.data);
export const createMyAddress = (payload) => client.post('/me/addresses', payload).then((r) => r.data.data);
export const updateMyAddress = (id, payload) => client.patch(`/me/addresses/${id}`, payload).then((r) => r.data.data);
export const deleteMyAddress = (id) => client.delete(`/me/addresses/${id}`).then((r) => r.data.data);

// ---- my orders (product purchases) ----
export const listMyOrders = (params) => client.get('/me/orders', { params }).then((r) => r.data.data);
export const getMyOrder = (id) => client.get(`/me/orders/${id}`).then((r) => r.data.data);

// ---- my packages ----
export const listMyPackages = () => client.get('/me/packages').then((r) => r.data.data);
export const purchasePackage = (id, payload) => client.post(`/packages/${id}/purchase`, payload).then((r) => r.data.data);

// ---- game history ----
export const listMyGameHistory = (params) => client.get('/me/game-history', { params }).then((r) => r.data.data);

// ---- social (public profiles, follow/unfollow, followers/following) ----
export const getUserProfile = (id) => client.get(`/users/${id}`).then((r) => r.data.data);
export const followUser = (id) => client.post(`/users/${id}/follow`).then((r) => r.data.data);
export const unfollowUser = (id) => client.delete(`/users/${id}/follow`).then((r) => r.data.data);
export const listUserFollowers = (id, params) => client.get(`/users/${id}/followers`, { params }).then((r) => r.data.data);
export const listUserFollowing = (id, params) => client.get(`/users/${id}/following`, { params }).then((r) => r.data.data);
export const removeFollower = (followerId) => client.delete(`/users/me/followers/${followerId}`).then((r) => r.data.data);
// "Discover Players" — search/browse every user (not just mine), for the follow-suggestions page.
export const searchUsers = (params) => client.get('/users', { params }).then((r) => r.data.data);

// ---- my chat ----
export const listMyChatThreads = () => client.get('/me/chat/threads').then((r) => r.data.data);
export const startChatThread = (userId) => client.post('/me/chat/threads', { userId }).then((r) => r.data.data);
export const listThreadMessages = (threadId) => client.get(`/me/chat/threads/${threadId}/messages`).then((r) => r.data.data);
export const sendThreadMessage = (threadId, message) =>
  client.post(`/me/chat/threads/${threadId}/messages`, { message }).then((r) => r.data.data);

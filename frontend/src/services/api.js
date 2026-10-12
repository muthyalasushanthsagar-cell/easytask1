import axios from 'axios';

// VITE_API_BASE_URL may be given with or without the trailing /api - both work.
function resolveBaseUrl() {
  let url = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/api').trim();
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
}

export const API_BASE_URL = resolveBaseUrl();

// Generous timeout: a sleeping free Render instance needs up to ~60s to wake up.
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
});

const unwrap = (promise) => promise.then((res) => res.data);

export const taskApi = {
  list: (params) => unwrap(client.get('/tasks', { params })),
  get: (id) => unwrap(client.get(`/tasks/${id}`)),
  create: (body) => unwrap(client.post('/tasks', body)),
  update: (id, body) => unwrap(client.put(`/tasks/${id}`, body)),
  remove: (id) => unwrap(client.delete(`/tasks/${id}`)),
  complete: (id) => unwrap(client.patch(`/tasks/${id}/complete`)),
  reopen: (id) => unwrap(client.patch(`/tasks/${id}/reopen`)),
  today: () => unwrap(client.get('/tasks/today')),
  upcoming: () => unwrap(client.get('/tasks/upcoming')),
  completed: () => unwrap(client.get('/tasks/completed')),
  overdue: () => unwrap(client.get('/tasks/overdue'))
};

export const dashboardApi = {
  summary: () => unwrap(client.get('/dashboard/summary'))
};

export const groceryApi = {
  list: () => unwrap(client.get('/grocery-lists')),
  createList: (body) => unwrap(client.post('/grocery-lists', body)),
  updateList: (id, body) => unwrap(client.put(`/grocery-lists/${id}`, body)),
  removeList: (id) => unwrap(client.delete(`/grocery-lists/${id}`)),
  addItem: (listId, body) => unwrap(client.post(`/grocery-lists/${listId}/items`, body)),
  toggleItem: (itemId) => unwrap(client.patch(`/grocery-lists/items/${itemId}/toggle`)),
  removeItem: (itemId) => unwrap(client.delete(`/grocery-lists/items/${itemId}`))
};

export const notificationApi = {
  list: () => unwrap(client.get('/notifications')),
  unreadCount: () => unwrap(client.get('/notifications/unread-count')),
  markRead: (id) => unwrap(client.patch(`/notifications/${id}/read`)),
  markAllRead: () => unwrap(client.patch('/notifications/read-all'))
};

export const healthApi = {
  check: () => unwrap(client.get('/health'))
};

export function getErrorMessage(error) {
  const data = error && error.response && error.response.data;
  if (data) {
    if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
      return Object.values(data.fieldErrors).join(', ');
    }
    if (data.message) {
      return data.message;
    }
  }
  if (error && error.code === 'ECONNABORTED') {
    return 'The server took too long to respond. It may be waking up - please try again in a moment.';
  }
  if (!error || !error.response) {
    return 'Cannot reach the server. If it was idle it may be waking up - please try again in a minute.';
  }
  return error.message || 'Something went wrong';
}

import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
  }

  return socket;
};

export const subscribeToExecution = (executionId, onEvent, onStatus) => {
  const s = getSocket();
  if (!s || !executionId) return () => {};

  s.emit('join-execution', executionId);

  if (onEvent) s.on('agent-event', onEvent);
  if (onStatus) s.on('execution-status', onStatus);

  return () => {
    s.emit('leave-execution', executionId);
    if (onEvent) s.off('agent-event', onEvent);
    if (onStatus) s.off('execution-status', onStatus);
  };
};

export const subscribeToUserNotifications = (userId, onNotification) => {
  const s = getSocket();
  if (!s || !userId) return () => {};

  s.emit('join-user', userId);
  if (onNotification) s.on('notification', onNotification);

  return () => {
    if (onNotification) s.off('notification', onNotification);
  };
};

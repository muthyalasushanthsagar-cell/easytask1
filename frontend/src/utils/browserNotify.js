export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getPermission() {
  return notificationsSupported() ? Notification.permission : 'unsupported';
}

export async function requestPermission() {
  if (!notificationsSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch (e) {
    return Notification.permission;
  }
}

export function showBrowserNotification(title, body) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return false;
  try {
    new Notification(title, { body });
    return true;
  } catch (e) {
    return false;
  }
}

const KEY_NAME = 'easytask.profileName';
const KEY_REMINDER = 'easytask.defaultReminder';

function read(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (e) {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    /* storage can be unavailable (private mode) - ignore */
  }
}

export const getProfileName = () => read(KEY_NAME, '');
export const setProfileName = (value) => write(KEY_NAME, value);
export const getDefaultReminder = () => read(KEY_REMINDER, 'none');
export const setDefaultReminder = (value) => write(KEY_REMINDER, value);

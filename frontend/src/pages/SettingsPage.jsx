import { useCallback, useEffect, useState } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { useToast } from '../components/Toast.jsx';
import { API_BASE_URL, getErrorMessage, healthApi } from '../services/api.js';
import { REMINDER_OPTIONS } from '../utils/format.js';
import { getPermission, requestPermission, showBrowserNotification } from '../utils/browserNotify.js';
import { getDefaultReminder, getProfileName, setDefaultReminder, setProfileName } from '../utils/preferences.js';

export default function SettingsPage() {
  const toast = useToast();
  const [name, setName] = useState(getProfileName());
  const [reminder, setReminder] = useState(getDefaultReminder());
  const [permission, setPermission] = useState(getPermission());
  const [health, setHealth] = useState({ state: 'checking' });

  const checkHealth = useCallback(async () => {
    setHealth({ state: 'checking' });
    try {
      const res = await healthApi.check();
      setHealth({ state: res.database === 'UP' ? 'up' : 'db-down', data: res });
    } catch (e) {
      setHealth({ state: 'down', message: getErrorMessage(e) });
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const saveProfile = (e) => {
    e.preventDefault();
    setProfileName(name.trim());
    setDefaultReminder(reminder);
    toast.success('Preferences saved');
  };

  const enable = async () => {
    const result = await requestPermission();
    setPermission(result);
    if (result === 'granted') toast.success('Browser notifications enabled');
    else toast.info('Notifications were not allowed in the browser');
  };

  const sendTest = () => {
    const ok = showBrowserNotification('Easy Task', 'This is a test notification. Reminders will look like this.');
    if (!ok) toast.error('Could not show a notification. Check the browser permission.');
  };

  const healthLabel = {
    checking: 'Checking...',
    up: 'Backend and database are online',
    'db-down': 'Backend is online but the database is not reachable',
    down: 'Backend is not reachable'
  }[health.state];

  return (
    <div className="page narrow-page">
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="muted">Profile, notifications and connection status</p>
        </div>
      </div>

      <section className="card">
        <h3>Profile & preferences</h3>
        <form className="form" onSubmit={saveProfile}>
          <label className="field">
            <span>Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Optional" />
          </label>
          <label className="field">
            <span>Default reminder for new tasks</span>
            <select value={reminder} onChange={(e) => setReminder(e.target.value)}>
              {REMINDER_OPTIONS.filter((o) => o.value !== 'custom').map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div>
            <button type="submit" className="btn btn-primary">
              Save preferences
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h3>Browser notifications</h3>
        <p className="muted">
          Status: <strong>{permission}</strong>
        </p>
        <div className="row-gap">
          <button type="button" className="btn btn-primary" onClick={enable} disabled={permission === 'granted' || permission === 'unsupported'}>
            <Bell size={16} /> Enable
          </button>
          <button type="button" className="btn btn-ghost" onClick={sendTest}>
            Send test notification
          </button>
        </div>
      </section>

      <section className="card">
        <h3>Connection</h3>
        <p className={`health health-${health.state}`}>{healthLabel}</p>
        {health.message && <p className="muted">{health.message}</p>}
        <p className="muted">
          API: <code>{API_BASE_URL}</code>
        </p>
        <button type="button" className="btn btn-ghost" onClick={checkHealth}>
          <RefreshCw size={16} /> Check again
        </button>
      </section>
    </div>
  );
}

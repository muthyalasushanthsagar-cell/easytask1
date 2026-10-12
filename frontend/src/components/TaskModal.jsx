import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getErrorMessage } from '../services/api.js';
import {
  CATEGORIES,
  PRIORITIES,
  REMINDER_OPTIONS,
  STATUSES,
  fromInputValue,
  statusLabel,
  toInputValue
} from '../utils/format.js';
import { getDefaultReminder } from '../utils/preferences.js';

function blankForm() {
  return {
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    category: 'Personal',
    dueDate: '',
    reminder: getDefaultReminder(),
    customReminder: ''
  };
}

function formFromTask(task) {
  let reminder = 'none';
  let customReminder = '';
  if (task.reminderAt && !task.reminderMinutes) {
    reminder = 'custom';
    customReminder = toInputValue(task.reminderAt);
  } else if (task.reminderMinutes && [5, 15, 30, 60].includes(task.reminderMinutes)) {
    reminder = String(task.reminderMinutes);
  }
  return {
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'MEDIUM',
    status: task.status || 'PENDING',
    category: task.category || 'General',
    dueDate: toInputValue(task.dueDate),
    reminder,
    customReminder
  };
}

export default function TaskModal({ open, task, onClose, onSave }) {
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setSaving(false);
    setForm(task ? formFromTask(task) : blankForm());
  }, [open, task]);

  if (!open) return null;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please enter a task title');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      category: form.category.trim() || 'General',
      dueDate: fromInputValue(form.dueDate),
      reminderMinutes: null,
      reminderAt: null
    };
    if (task) {
      payload.status = form.status;
    }

    if (form.reminder === 'custom') {
      if (!form.customReminder) {
        setError('Pick a date and time for the custom reminder');
        return;
      }
      payload.reminderAt = fromInputValue(form.customReminder);
    } else if (form.reminder !== 'none') {
      if (!form.dueDate) {
        setError('Set a due date to use an advance reminder');
        return;
      }
      payload.reminderMinutes = Number(form.reminder);
    }

    setSaving(true);
    setError('');
    try {
      await onSave(payload);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? 'Edit task' : 'New task'}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="form">
          {error && <div className="form-error">{error}</div>}

          <label className="field">
            <span>Title *</span>
            <input value={form.title} onChange={set('title')} maxLength={200} autoFocus placeholder="What needs to be done?" />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea value={form.description} onChange={set('description')} maxLength={2000} rows={3} placeholder="Optional details" />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Priority</span>
              <select value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Category</span>
              <select value={form.category} onChange={set('category')}>
                {!CATEGORIES.includes(form.category) && <option value={form.category}>{form.category}</option>}
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Due date & time</span>
              <input type="datetime-local" value={form.dueDate} onChange={set('dueDate')} />
            </label>
            {task && (
              <label className="field">
                <span>Status</span>
                <select value={form.status} onChange={set('status')}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="field-row">
            <label className="field">
              <span>Reminder</span>
              <select value={form.reminder} onChange={set('reminder')}>
                {REMINDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            {form.reminder === 'custom' && (
              <label className="field">
                <span>Remind me at</span>
                <input type="datetime-local" value={form.customReminder} onChange={set('customReminder')} />
              </label>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : task ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

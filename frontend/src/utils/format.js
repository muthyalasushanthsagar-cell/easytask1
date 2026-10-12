export const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
export const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];
export const CATEGORIES = ['Work', 'Study', 'Personal', 'Health', 'Finance', 'Shopping', 'General'];
export const REMINDER_OPTIONS = [
  { value: 'none', label: 'No reminder' },
  { value: '5', label: '5 minutes before' },
  { value: '15', label: '15 minutes before' },
  { value: '30', label: '30 minutes before' },
  { value: '60', label: '1 hour before' },
  { value: 'custom', label: 'Custom date & time' }
];

const STATUS_LABELS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue'
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function formatDateTime(iso) {
  if (!iso) return 'No due date';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

// "2026-10-12T15:30:00" -> "2026-10-12T15:30" (value for <input type="datetime-local">)
export function toInputValue(iso) {
  return iso ? String(iso).slice(0, 16) : '';
}

// "2026-10-12T15:30" -> "2026-10-12T15:30:00"
export function fromInputValue(value) {
  if (!value) return null;
  return value.length === 16 ? `${value}:00` : value;
}

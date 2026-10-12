import { Bell, Check, Clock, Pencil, RotateCcw, Tag, Trash2 } from 'lucide-react';
import { formatDateTime, statusLabel } from '../utils/format.js';

export default function TaskCard({ task, onComplete, onReopen, onEdit, onDelete }) {
  const done = task.status === 'COMPLETED';
  const priority = String(task.priority || 'MEDIUM').toLowerCase();
  const status = String(task.status || 'PENDING').toLowerCase();

  return (
    <div className={`task-card priority-${priority} ${done ? 'is-done' : ''}`}>
      <button
        type="button"
        className={`check-btn ${done ? 'checked' : ''}`}
        onClick={() => (done ? onReopen(task) : onComplete(task))}
        title={done ? 'Reopen task' : 'Mark as completed'}
        aria-label={done ? 'Reopen task' : 'Mark as completed'}
      >
        {done && <Check size={14} />}
      </button>

      <div className="task-main">
        <div className="task-title">{task.title}</div>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="task-meta">
          <span className={`badge badge-${priority}`}>{task.priority}</span>
          <span className={`badge status-${status}`}>{statusLabel(task.status)}</span>
          {task.category && (
            <span className="meta-item">
              <Tag size={12} /> {task.category}
            </span>
          )}
          <span className="meta-item">
            <Clock size={12} /> {formatDateTime(task.dueDate)}
          </span>
          {task.reminderAt && !done && (
            <span className="meta-item">
              <Bell size={12} /> {formatDateTime(task.reminderAt)}
            </span>
          )}
          {done && task.completedAt && (
            <span className="meta-item">
              <Check size={12} /> Done {formatDateTime(task.completedAt)}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        {done && (
          <button type="button" className="icon-btn" onClick={() => onReopen(task)} title="Reopen">
            <RotateCcw size={16} />
          </button>
        )}
        <button type="button" className="icon-btn" onClick={() => onEdit(task)} title="Edit">
          <Pencil size={16} />
        </button>
        <button type="button" className="icon-btn danger" onClick={() => onDelete(task)} title="Delete">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

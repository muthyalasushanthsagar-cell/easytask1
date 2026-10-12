import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ open, title, itemLabel = 'task', onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
          <AlertTriangle size={26} />
        </div>
        <h3>Delete this {itemLabel}?</h3>
        <p className="muted">
          <strong>{title}</strong> will be permanently removed. This cannot be undone.
        </p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

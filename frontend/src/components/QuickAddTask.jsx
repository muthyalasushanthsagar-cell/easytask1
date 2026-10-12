import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PRIORITIES, fromInputValue } from '../utils/format.js';

export default function QuickAddTask({ onAdd }) {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await onAdd({
        title: title.trim(),
        priority,
        category: 'General',
        dueDate: fromInputValue(due)
      });
      setTitle('');
      setDue('');
    } catch (err) {
      /* the parent already showed an error toast */
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="quick-add" onSubmit={submit}>
      <input
        className="quick-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Quick add a task and press Enter..."
        maxLength={200}
      />
      <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <button type="submit" className="btn btn-primary" disabled={busy || !title.trim()}>
        <Plus size={16} /> Add
      </button>
    </form>
  );
}

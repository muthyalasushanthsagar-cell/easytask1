import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard.jsx';
import useTaskCrud from '../hooks/useTaskCrud.jsx';
import { getErrorMessage } from '../services/api.js';

/**
 * Generic task list page: loads tasks with `load`, shows them as cards and wires up
 * add / edit / complete / reopen / delete. `load` must be a stable function (useCallback).
 */
export default function TaskListView({ title, subtitle, load, emptyText, headerExtra, toolbar }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const data = await load();
      if (id === requestId.current) {
        setTasks(data);
        setError('');
      }
    } catch (e) {
      if (id === requestId.current) setError(getErrorMessage(e));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  const crud = useTaskCrud(refresh);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
        <button type="button" className="btn btn-primary" onClick={crud.openCreate}>
          <Plus size={16} /> New task
        </button>
      </div>

      {headerExtra && headerExtra(tasks)}
      {toolbar}

      {error && (
        <div className="state-box error">
          <p>{error}</p>
          <button type="button" className="btn btn-ghost" onClick={refresh}>
            Try again
          </button>
        </div>
      )}

      {loading && !error && <div className="state-box">Loading tasks...</div>}

      {!loading && !error && tasks.length === 0 && <div className="state-box">{emptyText}</div>}

      <div className="task-list">
        {!error &&
          tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onComplete={crud.complete}
              onReopen={crud.reopen}
              onEdit={crud.openEdit}
              onDelete={crud.askDelete}
            />
          ))}
      </div>

      {crud.modals}
    </div>
  );
}

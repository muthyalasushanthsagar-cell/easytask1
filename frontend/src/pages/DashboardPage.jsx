import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import QuickAddTask from '../components/QuickAddTask.jsx';
import TaskCard from '../components/TaskCard.jsx';
import useTaskCrud from '../hooks/useTaskCrud.jsx';
import { dashboardApi, getErrorMessage } from '../services/api.js';

function Metric({ label, value, tone }) {
  return (
    <div className={`metric ${tone || ''}`}>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const summary = await dashboardApi.summary();
      setData(summary);
      setError('');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const crud = useTaskCrud(refresh);

  const renderList = (tasks, emptyText) =>
    tasks.length === 0 ? (
      <div className="state-box small">{emptyText}</div>
    ) : (
      <div className="task-list">
        {tasks.map((t) => (
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
    );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">Your productivity at a glance</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={crud.openCreate}>
          <Plus size={16} /> New task
        </button>
      </div>

      <QuickAddTask onAdd={crud.quickAdd} />

      {loading && <div className="state-box">Loading dashboard...</div>}

      {error && (
        <div className="state-box error">
          <p>{error}</p>
          <button type="button" className="btn btn-ghost" onClick={refresh}>
            Try again
          </button>
        </div>
      )}

      {data && !error && (
        <>
          {data.overdueTasks > 0 && (
            <div className="alert-banner">
              <AlertTriangle size={20} />
              <div>
                <strong>
                  {data.overdueTasks} overdue {data.overdueTasks === 1 ? 'task needs' : 'tasks need'} attention
                </strong>
                <div className="alert-list">{data.overdueTaskList.map((t) => t.title).join(' • ')}</div>
              </div>
            </div>
          )}

          <div className="metrics">
            <Metric label="Total" value={data.totalTasks} />
            <Metric label="Pending" value={data.pendingTasks} tone="blue" />
            <Metric label="Completed" value={data.completedTasks} tone="green" />
            <Metric label="Overdue" value={data.overdueTasks} tone="red" />
            <Metric label="Due today" value={data.todayTasks} tone="amber" />
            <Metric label="Upcoming" value={data.upcomingTasks} tone="purple" />
            <Metric label="High priority" value={data.highPriorityTasks} tone="red" />
          </div>

          <div className="progress-card">
            <div className="progress-head">
              <strong>Completion rate</strong>
              <span>{data.completionRate}%</span>
            </div>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${data.completionRate}%` }} />
            </div>
          </div>

          <div className="two-col">
            <section>
              <h3>Due today</h3>
              {renderList(data.todayTaskList, 'Nothing due today.')}
            </section>
            <section>
              <h3>Upcoming</h3>
              {renderList(data.upcomingTaskList, 'No upcoming deadlines.')}
            </section>
          </div>
        </>
      )}

      {crud.modals}
    </div>
  );
}

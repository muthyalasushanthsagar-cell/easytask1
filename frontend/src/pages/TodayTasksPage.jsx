import TaskListView from '../components/TaskListView.jsx';
import { taskApi } from '../services/api.js';
import { STATUSES, statusLabel } from '../utils/format.js';

function breakdown(tasks) {
  return (
    <div className="chips">
      {STATUSES.map((s) => (
        <span key={s} className={`badge status-${s.toLowerCase()}`}>
          {statusLabel(s)}: {tasks.filter((t) => t.status === s).length}
        </span>
      ))}
    </div>
  );
}

export default function TodayTasksPage() {
  return (
    <TaskListView
      title="Today"
      subtitle="Everything due today"
      load={taskApi.today}
      headerExtra={breakdown}
      emptyText="Nothing is due today. Enjoy the free time!"
    />
  );
}

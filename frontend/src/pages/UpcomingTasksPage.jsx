import TaskListView from '../components/TaskListView.jsx';
import { taskApi } from '../services/api.js';

export default function UpcomingTasksPage() {
  return (
    <TaskListView
      title="Upcoming"
      subtitle="Future deadlines in chronological order"
      load={taskApi.upcoming}
      emptyText="No upcoming tasks. Add one with the New task button."
    />
  );
}

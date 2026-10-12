import TaskListView from '../components/TaskListView.jsx';
import { taskApi } from '../services/api.js';

export default function CompletedTasksPage() {
  return (
    <TaskListView
      title="Completed"
      subtitle="Your history of accomplishments"
      load={taskApi.completed}
      emptyText="No completed tasks yet."
    />
  );
}

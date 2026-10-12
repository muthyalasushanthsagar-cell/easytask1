import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';
import TaskListView from '../components/TaskListView.jsx';
import useDebounced from '../hooks/useDebounced.js';
import { taskApi } from '../services/api.js';
import { CATEGORIES, PRIORITIES, STATUSES, statusLabel } from '../utils/format.js';

export default function AllTasksPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [sort, setSort] = useState('dueDate:asc');

  const debouncedSearch = useDebounced(search, 300);

  const load = useCallback(() => {
    const [sortBy, sortDir] = sort.split(':');
    return taskApi.list({
      status: status === 'ALL' ? undefined : status,
      priority: priority === 'ALL' ? undefined : priority,
      category: category === 'ALL' ? undefined : category,
      search: debouncedSearch.trim() || undefined,
      sortBy,
      sortDir
    });
  }, [status, priority, category, debouncedSearch, sort]);

  const toolbar = (
    <div className="toolbar">
      <div className="search-box">
        <Search size={16} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." />
      </div>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="ALL">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabel(s)}
          </option>
        ))}
      </select>
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="ALL">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="ALL">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="dueDate:asc">Due date (earliest)</option>
        <option value="dueDate:desc">Due date (latest)</option>
        <option value="createdAt:desc">Newest first</option>
        <option value="createdAt:asc">Oldest first</option>
        <option value="priority:asc">Priority (high to low)</option>
        <option value="priority:desc">Priority (low to high)</option>
      </select>
    </div>
  );

  return (
    <TaskListView
      title="All tasks"
      subtitle="Search, filter and sort everything in one place"
      load={load}
      toolbar={toolbar}
      emptyText="No tasks match your filters."
    />
  );
}

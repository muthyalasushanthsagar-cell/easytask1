import { NavLink } from 'react-router-dom';
import { CalendarClock, CalendarDays, CheckCircle2, LayoutDashboard, ListTodo, Settings, ShoppingCart } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'All Tasks', icon: ListTodo },
  { to: '/today', label: 'Today', icon: CalendarDays },
  { to: '/upcoming', label: 'Upcoming', icon: CalendarClock },
  { to: '/completed', label: 'Completed', icon: CheckCircle2 },
  { to: '/grocery', label: 'Checklists', icon: ShoppingCart },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-logo">
          <CheckCircle2 size={20} />
        </span>
        <span className="brand-name">Easy Task</span>
      </div>
      <nav className="nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

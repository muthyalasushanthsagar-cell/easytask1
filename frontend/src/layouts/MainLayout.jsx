import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import useNotifications from '../hooks/useNotifications.js';

const TITLES = {
  '/': 'Dashboard',
  '/tasks': 'All Tasks',
  '/today': "Today's Tasks",
  '/upcoming': 'Upcoming Tasks',
  '/completed': 'Completed Tasks',
  '/grocery': 'Everyday Checklists',
  '/settings': 'Settings'
};

export default function MainLayout() {
  const location = useLocation();
  const notif = useNotifications();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Navbar title={TITLES[location.pathname] || 'Easy Task'} notif={notif} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

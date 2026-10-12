import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/Toast.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AllTasksPage from './pages/AllTasksPage.jsx';
import TodayTasksPage from './pages/TodayTasksPage.jsx';
import UpcomingTasksPage from './pages/UpcomingTasksPage.jsx';
import CompletedTasksPage from './pages/CompletedTasksPage.jsx';
import GroceryPage from './pages/GroceryPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tasks" element={<AllTasksPage />} />
          <Route path="/today" element={<TodayTasksPage />} />
          <Route path="/upcoming" element={<UpcomingTasksPage />} />
          <Route path="/completed" element={<CompletedTasksPage />} />
          <Route path="/grocery" element={<GroceryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

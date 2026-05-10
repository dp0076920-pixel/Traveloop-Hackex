import { Outlet } from 'react-router-dom';
import { Sidebar, TopBar } from './Sidebar';

export const AppLayout = () => (
  <div className="min-h-screen flex">
    <Sidebar />
    <TopBar />
    <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <Outlet />
      </div>
    </main>
  </div>
);

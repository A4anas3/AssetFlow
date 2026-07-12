import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 shrink-0 bg-white border-r border-gray-200">
      </aside>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 border-b border-gray-200 bg-white">
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

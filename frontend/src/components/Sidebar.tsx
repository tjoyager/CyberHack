import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Intake Staff', path: '/dashboard/intake', icon: '📥' },
    { name: 'QC Inspector', path: '/dashboard/qc', icon: '🧪' },
    { name: 'PPIC Manager', path: '/dashboard/ppic', icon: '🏭' },
    { name: 'Inventory', path: '/dashboard/inventory', icon: '📦' },
    { name: 'Audit Logs', path: '/dashboard/audit', icon: '📜' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-10 px-2">
        <h1 className="text-xl font-bold tracking-tight">Sima Arome ERP</h1>
        <p className="text-xs text-slate-400">Enterprise Readiness Suite</p>
      </div>
      
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <span>{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-800">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold">U</div>
          <div>
            <p className="text-sm font-medium">User Profile</p>
            <p className="text-xs text-slate-400">Logout</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

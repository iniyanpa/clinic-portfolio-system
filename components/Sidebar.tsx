
import React from 'react';
import { ICONS } from '../constants';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.Dashboard, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] },
    { id: 'patients', label: 'Patients', icon: ICONS.Patients, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] },
    { id: 'appointments', label: 'Appointments', icon: ICONS.Appointments, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] },
    { id: 'records', label: 'Medical Records', icon: ICONS.Records, roles: [UserRole.DOCTOR, UserRole.ADMIN] },
    { id: 'billing', label: 'Billing', icon: ICONS.Billing, roles: [UserRole.ADMIN, UserRole.RECEPTIONIST] },
    { id: 'staff', label: 'Staff Management', icon: ICONS.Staff, roles: [UserRole.ADMIN] },
    { id: 'settings', label: 'Settings', icon: ICONS.Settings, roles: [UserRole.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="w-64 bg-primary h-screen text-white flex flex-col fixed left-0 top-0 z-20 transition-all duration-300">
      <div className="p-6">
        <h1 className="text-3xl font-heading tracking-wider flex items-center gap-2">
          HEAL<span className="text-secondary">FLOW</span>
        </h1>
        <p className="subheading text-[10px] tracking-[0.2em] opacity-80 mt-1">Outpatient Management</p>
      </div>

      <nav className="flex-1 px-4 mt-6">
        {filteredMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-secondary text-white shadow-lg' 
                : 'hover:bg-white/10 text-white/70'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10">
        <button className="flex items-center gap-4 px-4 py-3 w-full hover:bg-red-500/20 rounded-lg text-white/70 hover:text-red-400 transition-colors">
          {ICONS.Logout}
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

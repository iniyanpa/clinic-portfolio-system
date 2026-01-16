
import React from 'react';
import { ICONS } from '../constants';
import { UserRole, User } from '../types';

interface SidebarProps {
  user: User;
  tenantName: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, tenantName, activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'super-admin', label: 'Global Oversight', icon: ICONS.Settings, roles: [UserRole.SUPER_ADMIN] },
    { id: 'dashboard', label: 'Matrix', icon: ICONS.Dashboard, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.PHARMACIST] },
    { id: 'patients', label: 'Registry', icon: ICONS.Patients, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] },
    { id: 'appointments', label: 'Scheduler', icon: ICONS.Appointments, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] },
    { id: 'records', label: 'Consultation Room', icon: ICONS.Records, roles: [UserRole.DOCTOR, UserRole.ADMIN] },
    { id: 'pharmacy', label: 'Pharmacy Depot', icon: ICONS.Staff, roles: [UserRole.PHARMACIST, UserRole.ADMIN] },
    { id: 'billing', label: 'Financials', icon: ICONS.Billing, roles: [UserRole.ADMIN, UserRole.RECEPTIONIST] },
    { id: 'staff', label: 'Employees', icon: ICONS.Staff, roles: [UserRole.ADMIN] },
    { id: 'settings', label: 'Facility Systems', icon: ICONS.Settings, roles: [UserRole.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role as UserRole));

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)}/>}
      <div className={`fixed left-0 top-0 h-screen bg-primary text-white flex flex-col z-50 transition-transform duration-300 w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-black opacity-90"></div>
        <div className="p-8 relative z-10 flex flex-col gap-1">
          <h1 className="text-xl font-heading tracking-widest leading-none italic uppercase">{tenantName}</h1>
          <span className="text-[8px] font-bold text-white/30 tracking-[0.4em] uppercase">Auth: {user.role}</span>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto relative z-10">
          {filteredMenu.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-secondary text-white shadow-xl' : 'hover:bg-white/5 text-white/40 hover:text-white'}`}>
              {item.icon} <span className="font-heading text-xs uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5 relative z-10">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-white/30 hover:bg-white/5 hover:text-red-400 transition-all font-heading text-xs uppercase tracking-widest">
            {ICONS.Logout} <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

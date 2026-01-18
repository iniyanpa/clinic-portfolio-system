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
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.Dashboard, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.PHARMACIST] },
    { id: 'patients', label: 'Patient Records', icon: ICONS.Patients, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] },
    { id: 'appointments', label: 'OPD Schedule', icon: ICONS.Appointments, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] },
    { id: 'records', label: "Doctor's Desk", icon: ICONS.Records, roles: [UserRole.DOCTOR, UserRole.ADMIN] },
    { id: 'pharmacy', label: 'Pharmacy Management', icon: ICONS.Staff, roles: [UserRole.PHARMACIST, UserRole.ADMIN] },
    { id: 'billing', label: 'Billing & Payments', icon: ICONS.Billing, roles: [UserRole.ADMIN, UserRole.RECEPTIONIST] },
    { id: 'staff', label: 'Staff Directory', icon: ICONS.Staff, roles: [UserRole.ADMIN] },
    { id: 'settings', label: 'Clinic Settings', icon: ICONS.Settings, roles: [UserRole.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role as UserRole));

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)}/>}
      <div className={`fixed left-0 top-0 h-screen bg-primary text-white flex flex-col z-50 transition-transform duration-300 w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-white/10">
          <h1 className="text-2xl font-heading font-bold tracking-tight text-white uppercase truncate">{tenantName}</h1>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1 block">Role: {user.role}</span>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => (
            <button 
              key={item.id} 
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }} 
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${activeTab === item.id ? 'bg-secondary text-white shadow-lg' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
            >
              {item.icon} <span className="font-bold text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-white/40 hover:bg-red-500 hover:text-white transition-all font-bold text-sm tracking-wide">
            {ICONS.Logout} <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
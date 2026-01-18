import React from 'react';
import { ICONS } from '../constants';
import { UserRole, User } from '../types';

interface SidebarProps {
  user: User;
  tenantName: string;
  tenantLogo?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, tenantName, tenantLogo, activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
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
        <div 
          className="p-8 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-all"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="flex items-center gap-3">
            {tenantLogo ? (
              <img src={tenantLogo} alt="Logo" className="w-10 h-10 rounded-lg object-cover bg-white p-1" />
            ) : (
              <div className="bg-white/10 p-2 rounded-lg text-secondary">{ICONS.Home}</div>
            )}
            <div className="overflow-hidden">
              <h1 className="text-lg font-heading font-bold tracking-tight text-white uppercase truncate">{tenantName}</h1>
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-1 block">Role: {user.role}</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredMenu.map((item) => (
            <button 
              key={item.id} 
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-secondary text-white shadow-lg' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              <span className="font-bold text-[11px] tracking-wide text-left flex-1 truncate">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:bg-red-500 hover:text-white transition-all font-bold text-[11px] tracking-wide">
            {ICONS.Logout} <span>Logout Terminal</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
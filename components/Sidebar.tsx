
import React from 'react';
import { ICONS } from '../constants';
import { UserRole, User } from '../types';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Matrix', icon: ICONS.Dashboard, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.PHARMACIST] },
    { id: 'patients', label: 'Registry', icon: ICONS.Patients, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] },
    { id: 'appointments', label: 'Scheduler', icon: ICONS.Appointments, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] },
    { id: 'records', label: 'Consultations', icon: ICONS.Records, roles: [UserRole.DOCTOR, UserRole.ADMIN] },
    { id: 'pharmacy', label: 'Pharmacy', icon: ICONS.Staff, roles: [UserRole.PHARMACIST, UserRole.ADMIN] },
    { id: 'billing', label: 'Financials', icon: ICONS.Billing, roles: [UserRole.ADMIN, UserRole.RECEPTIONIST] },
    { id: 'settings', label: 'Systems', icon: ICONS.Settings, roles: [UserRole.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role as UserRole));

  return (
    <div className="w-64 bg-primary h-screen text-white flex flex-col fixed left-0 top-0 z-40 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-black opacity-90"></div>
      
      <div className="p-10 relative z-10">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="text-left group transition-all duration-300 hover:scale-105 active:scale-95 block w-full"
        >
          <h1 className="text-3xl font-heading tracking-widest flex items-center gap-1 leading-none italic">
            HEAL<span className="text-secondary">FLOW</span>
          </h1>
          <p className="subheading text-[8px] tracking-[0.5em] opacity-50 mt-2 uppercase font-bold border-l-2 border-secondary pl-3 ml-1">Outpatient Core OS</p>
        </button>
      </div>

      <nav className="flex-1 px-4 mt-10 space-y-2 overflow-y-auto relative z-10 custom-scrollbar">
        {filteredMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 group relative ${
              activeTab === item.id 
                ? 'bg-secondary text-white shadow-2xl shadow-secondary/30 translate-x-2' 
                : 'hover:bg-white/5 text-white/40 hover:text-white'
            }`}
          >
            {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full"></div>}
            <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
              {item.icon}
            </span>
            <span className="font-heading text-sm uppercase tracking-[0.2em]">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-white/5 relative z-10">
        <div className="bg-white/5 p-5 rounded-3xl mb-8 border border-white/5 backdrop-blur-md">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">Node: West-India-1</p>
           </div>
        </div>
        <button 
           onClick={onLogout}
           className="flex items-center gap-5 px-6 py-4 w-full hover:bg-red-500/10 rounded-2xl text-white/30 hover:text-red-400 transition-all duration-300 font-heading text-sm uppercase tracking-[0.2em]"
        >
          {ICONS.Logout}
          <span>Terminate</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

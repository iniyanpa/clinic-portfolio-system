
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
    { id: 'dashboard', label: 'Matrix', icon: ICONS.Dashboard, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.PHARMACIST] },
    { id: 'patients', label: 'Registry', icon: ICONS.Patients, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] },
    { id: 'appointments', label: 'Scheduler', icon: ICONS.Appointments, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST] },
    { id: 'records', label: 'Consultations', icon: ICONS.Records, roles: [UserRole.DOCTOR, UserRole.ADMIN] },
    { id: 'pharmacy', label: 'Pharmacy', icon: ICONS.Staff, roles: [UserRole.PHARMACIST, UserRole.ADMIN] },
    { id: 'billing', label: 'Financials', icon: ICONS.Billing, roles: [UserRole.ADMIN, UserRole.RECEPTIONIST] },
    { id: 'staff', label: 'Employees', icon: ICONS.Staff, roles: [UserRole.ADMIN] },
    { id: 'settings', label: 'Facility Systems', icon: ICONS.Settings, roles: [UserRole.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role as UserRole));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`fixed left-0 top-0 h-screen bg-primary text-white flex flex-col z-50 shadow-2xl transition-transform duration-300 w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-black opacity-90"></div>
        
        <div className="p-8 relative z-10 flex flex-col gap-1">
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsOpen(false); }}
            className="text-left group transition-all duration-300 block mb-1"
          >
            <h1 className="text-xl font-heading tracking-widest flex items-center gap-1 leading-none italic uppercase">
              {tenantName}
            </h1>
          </button>
          <span className="text-[8px] font-bold text-white/30 tracking-[0.4em] uppercase">Clinical Terminal</span>
          <button onClick={() => setIsOpen(false)} className="lg:hidden absolute top-8 right-4 text-white/50 hover:text-white transition-colors">
            {ICONS.Close}
          </button>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto relative z-10 custom-scrollbar">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative ${
                activeTab === item.id 
                  ? 'bg-secondary text-white shadow-xl translate-x-1' 
                  : 'hover:bg-white/5 text-white/40 hover:text-white'
              }`}
            >
              <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="font-heading text-xs uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
          
          <div className="pt-8 pb-4">
            <div className="h-px bg-white/10 mx-4 mb-4"></div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-white/30 hover:bg-white/5 hover:text-secondary group"
            >
              <span className="group-hover:scale-110 transition-transform">
                {ICONS.Home}
              </span>
              <span className="font-heading text-xs uppercase tracking-[0.2em]">Return to Portal</span>
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5 relative z-10">
          <div className="bg-white/5 rounded-2xl p-4 mb-4 hidden lg:block">
             <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Identity Node</p>
             <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest truncate">{user.name}</p>
          </div>
          <button 
             onClick={onLogout}
             className="flex items-center gap-4 px-5 py-4 w-full hover:bg-red-500/10 rounded-2xl text-white/30 hover:text-red-400 transition-all duration-300 font-heading text-xs uppercase tracking-[0.2em]"
          >
            {ICONS.Logout}
            <span>Terminate Session</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

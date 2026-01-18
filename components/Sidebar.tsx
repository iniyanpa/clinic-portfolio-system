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
    { id: 'pharmacy', label: 'Pharmacy', icon: ICONS.Plus, roles: [UserRole.PHARMACIST, UserRole.ADMIN] },
    { id: 'billing', label: 'Billing & Payments', icon: ICONS.Billing, roles: [UserRole.ADMIN, UserRole.RECEPTIONIST] },
    { id: 'staff', label: 'Staff Matrix', icon: ICONS.Staff, roles: [UserRole.ADMIN] },
    { id: 'settings', label: 'Clinic Settings', icon: ICONS.Settings, roles: [UserRole.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role as UserRole));

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)}/>}
      <div className={`fixed left-0 top-0 h-screen h-[100dvh] bg-primary text-white flex flex-col z-50 transition-transform duration-300 w-64 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Main Scrollable Content Wrapper */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar">
          
          {/* Header/Logo Section */}
          <div 
            className="p-6 sm:p-8 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-all sticky top-0 bg-primary z-10"
            onClick={() => { setActiveTab('dashboard'); setIsOpen(false); }}
          >
            <div className="flex items-center gap-3">
              {tenantLogo ? (
                <img src={tenantLogo} alt="Logo" className="w-10 h-10 rounded-lg object-cover bg-white p-1 shadow-inner" />
              ) : (
                <div className="bg-white/10 p-2 rounded-lg text-secondary shadow-inner">{ICONS.Home}</div>
              )}
              <div className="overflow-hidden">
                <h1 className="text-sm sm:text-lg font-heading font-bold tracking-tight text-white uppercase truncate leading-tight">{tenantName}</h1>
                <span className="text-[8px] font-bold text-white/50 uppercase tracking-[0.2em] mt-0.5 block">{user.role} TERMINAL</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            {filteredMenu.map((item) => (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group ${activeTab === item.id ? 'bg-secondary text-white shadow-lg' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
              >
                <div className={`flex-shrink-0 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'opacity-80 group-hover:scale-110 group-hover:opacity-100'}`}>{item.icon}</div>
                <span className="font-bold text-[10px] tracking-widest uppercase truncate">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout Section - Moved inside scrollable area for small screens but appears fixed if space permits */}
          <div className="p-6 border-t border-white/10 mt-auto bg-primary/50 backdrop-blur-md pb-12 sm:pb-8">
            <button 
              onClick={onLogout} 
              className="w-full flex items-center gap-3 px-4 py-4 sm:py-3 rounded-xl text-white/40 hover:bg-red-500 hover:text-white transition-all font-bold text-[10px] tracking-widest uppercase active:scale-95"
            >
              <div className="opacity-80">{ICONS.Logout}</div>
              <span>Logout Terminal</span>
            </button>
            
            {/* Mobile-only close instruction or subtle branding */}
            <div className="mt-4 text-center lg:hidden">
               <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em]">Clinical OS v2.5</p>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default Sidebar;
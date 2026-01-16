
import React from 'react';
import { 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  Settings, 
  LayoutDashboard, 
  Stethoscope,
  LogOut,
  Bell,
  Search,
  Plus,
  Download,
  Mail,
  MessageSquare,
  Menu,
  X,
  Home
} from 'lucide-react';

export const COLORS = {
  primary: '#29378c',
  secondary: '#29baed',
  background: '#f8fafc',
  white: '#ffffff',
  text: '#1e293b'
};

export const ICONS = {
  Dashboard: <LayoutDashboard size={20} />,
  Patients: <Users size={20} />,
  Appointments: <Calendar size={20} />,
  Records: <FileText size={20} />,
  Billing: <CreditCard size={20} />,
  Settings: <Settings size={20} />,
  Staff: <Stethoscope size={20} />,
  Logout: <LogOut size={20} />,
  Notification: <Bell size={20} />,
  Search: <Search size={20} />,
  Plus: <Plus size={20} />,
  Download: <Download size={20} />,
  Mail: <Mail size={16} />,
  SMS: <MessageSquare size={16} />,
  Menu: <Menu size={24} />,
  Close: <X size={24} />,
  Home: <Home size={20} />
};

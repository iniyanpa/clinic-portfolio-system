
import React, { useState } from 'react';
import { UserRole, User, Patient, Appointment, MedicalRecord, Bill, ApptStatus, CommunicationLog, Prescription } from './types';
import { ICONS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import AppointmentsPage from './pages/AppointmentsPage';
import ConsultationRoom from './pages/ConsultationRoom';
import BillingPage from './pages/BillingPage';
import StaffManagement from './pages/StaffManagement';
import SettingsPage from './pages/SettingsPage';
import PharmacyPage from './pages/PharmacyPage';
import { MOCK_USERS, MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_BILLS } from './services/mockData';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Global Clinical State
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [staff, setStaff] = useState<User[]>(MOCK_USERS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [bills, setBills] = useState<Bill[]>(MOCK_BILLS);
  const [commLogs, setCommLogs] = useState<CommunicationLog[]>([]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    setIsSidebarOpen(false);
  };

  const addPatient = (p: Patient) => {
    setPatients(prev => [...prev, p]);
    triggerCommunication(p.id, 'Email', `Welcome to SLS Hospital! Your Patient ID is ${p.id}.`);
  };

  const updatePatient = (updated: Patient) => {
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const addStaff = (u: User) => {
    setStaff(prev => [...prev, u]);
  };

  const updateStaff = (updated: User) => {
    setStaff(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const addAppointment = (a: Appointment) => {
    setAppointments(prev => [...prev, a]);
    triggerCommunication(a.patientId, 'WhatsApp', `SLS Hospital: Visit confirmed for ${a.date} at ${a.time}.`);
  };

  const updateApptStatus = (id: string, status: ApptStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const finalizeConsultation = (record: MedicalRecord, prescription: Prescription) => {
    setRecords(prev => [...prev, record]);
    setPrescriptions(prev => [...prev, prescription]);
    updateApptStatus(record.appointmentId, 'Completed');
    triggerCommunication(record.patientId, 'WhatsApp', `Consultation complete at SLS Hospital. Medication order Rx-${prescription.id.slice(-4)} is now at the pharmacy.`);
  };

  const addBill = (bill: Bill) => {
    setBills(prev => [...prev, bill]);
    triggerCommunication(bill.patientId, 'WhatsApp', `SLS Hospital: Payment of ${formatCurrency(bill.total)} received. Transaction #${bill.id.slice(-6)}.`);
  };

  const handleDispense = (pxId: string) => {
    setPrescriptions(prev => prev.map(p => p.id === pxId ? { ...p, status: 'Dispensed' } : p));
    const px = prescriptions.find(p => p.id === pxId);
    if (px) {
       triggerCommunication(px.patientId, 'WhatsApp', `SLS Hospital: Your medications for order #${px.id.slice(-4)} have been dispensed.`);
    }
  };

  const triggerCommunication = (patientId: string, type: 'WhatsApp' | 'Email', content: string) => {
    const log: CommunicationLog = {
      id: `LOG-${Date.now()}`,
      patientId,
      type,
      content,
      sentAt: new Date().toISOString()
    };
    setCommLogs(prev => [log, ...prev]);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4 font-body overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl w-full max-w-md border-t-[12px] border-secondary relative z-10">
          <div className="text-center mb-12">
             <div className="w-20 h-20 bg-primary/5 rounded-3xl mx-auto mb-6 flex items-center justify-center text-primary shadow-inner">
                {ICONS.Staff}
             </div>
            <h1 className="text-4xl md:text-5xl font-heading text-primary tracking-tighter leading-none mb-2 uppercase">SLS <span className="text-secondary">HOSPITAL</span></h1>
            <p className="subheading text-gray-400 tracking-[0.3em] text-[9px] uppercase font-bold">Clinical Enterprise OS • Tirupati AP</p>
          </div>
          
          <div className="space-y-4">
             <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-4">Identity Verification Hub</p>
             <div className="grid grid-cols-1 gap-3">
               {[
                 { role: UserRole.ADMIN, label: 'Administrator', desc: 'System & Governance', icon: ICONS.Settings, bg: 'primary' },
                 { role: UserRole.DOCTOR, label: 'Doctor Terminal', desc: 'Clinical Operations', icon: ICONS.Records, bg: 'secondary' },
                 { role: UserRole.RECEPTIONIST, label: 'Reception Desk', desc: 'Registry & Billing', icon: ICONS.Patients, bg: 'slate-500' },
                 { role: UserRole.PHARMACIST, label: 'Pharmacy Unit', desc: 'Medication Control', icon: ICONS.Staff, bg: 'amber-500' }
               ].map((btn) => (
                <button 
                  key={btn.role}
                  onClick={() => { setIsLoggingIn(true); setTimeout(() => { setCurrentUser(staff.find(u => u.role === btn.role)!); setIsLoggingIn(false); }, 600); }}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-secondary hover:bg-white p-4 rounded-2xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-10 h-10 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all`}>{btn.icon}</div>
                    <div>
                      <p className="font-heading text-xs uppercase tracking-widest text-slate-800">{btn.label}</p>
                      <p className="text-[9px] font-bold text-slate-400">{btn.desc}</p>
                    </div>
                  </div>
                  <span className="text-slate-300 group-hover:text-secondary group-hover:translate-x-1 transition-all">→</span>
                </button>
               ))}
             </div>
          </div>
          
          <div className="mt-12 text-center">
             {isLoggingIn && <div className="text-[10px] font-bold text-secondary animate-pulse uppercase tracking-[0.4em]">Initializing Core Systems...</div>}
             {!isLoggingIn && <p className="text-[9px] text-slate-300 font-medium">Verified by SLS Hospital IT Services</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-body text-slate-800">
      <Sidebar 
        user={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-300">
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 px-6 md:px-10 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-primary hover:bg-slate-100 rounded-lg transition-colors">
              {ICONS.Menu}
            </button>
            <div className="flex flex-col">
              <span className="subheading text-[8px] text-secondary font-bold tracking-[0.4em] uppercase">Matrix Alpha</span>
              <h2 className="text-lg md:text-2xl font-heading text-primary uppercase tracking-wide leading-none">{activeTab.replace('-', ' ')}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                <p className="text-[8px] font-bold text-primary uppercase tracking-widest opacity-60">
                   {currentUser.role} {currentUser.specialization ? `• ${currentUser.specialization}` : ''}
                </p>
             </div>
             <div className="relative group">
               <img src={currentUser.avatar} className="w-10 h-10 rounded-xl object-cover border-2 border-secondary shadow-sm group-hover:scale-105 transition-transform" alt="Avatar" />
               <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
             </div>
          </div>
        </header>

        <div className="p-4 md:p-10 w-full max-w-7xl mx-auto flex-1 pb-20">
          {activeTab === 'dashboard' && <Dashboard patients={patients} appointments={appointments} bills={bills} logs={commLogs} setActiveTab={setActiveTab} />}
          {activeTab === 'patients' && <Patients patients={patients} addPatient={addPatient} updatePatient={updatePatient} />}
          {activeTab === 'appointments' && <AppointmentsPage patients={patients} appointments={appointments} addAppointment={addAppointment} updateAppointmentStatus={updateApptStatus} />}
          {activeTab === 'records' && <ConsultationRoom patients={patients} appointments={appointments} finalizeConsultation={finalizeConsultation} />}
          {activeTab === 'pharmacy' && <PharmacyPage prescriptions={prescriptions} patients={patients} onDispense={handleDispense} />}
          {activeTab === 'billing' && <BillingPage patients={patients} appointments={appointments} records={records} prescriptions={prescriptions} bills={bills} addBill={addBill} />}
          {activeTab === 'staff' && <StaffManagement staff={staff} addStaff={addStaff} updateStaff={updateStaff} />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import { UserRole, User, Patient, Appointment, MedicalRecord, Bill, ApptStatus, CommunicationLog, Prescription } from './types';
import { ICONS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import AppointmentsPage from './pages/AppointmentsPage';
import ConsultationRoom from './pages/ConsultationRoom';
import BillingPage from './pages/BillingPage';
import { MOCK_USERS, MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_BILLS } from './services/mockData';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Global Clinical State
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
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
  };

  const addPatient = (p: Patient) => {
    setPatients(prev => [...prev, p]);
    triggerCommunication(p.id, 'Email', `Welcome to HealFlow! Your ID is ${p.id}.`);
  };

  const updatePatient = (updated: Patient) => {
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const addAppointment = (a: Appointment) => {
    setAppointments(prev => [...prev, a]);
    triggerCommunication(a.patientId, 'WhatsApp', `Appointment confirmed for ${a.date} at ${a.time}.`);
  };

  const updateApptStatus = (id: string, status: ApptStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const finalizeConsultation = (record: MedicalRecord, prescription: Prescription) => {
    setRecords(prev => [...prev, record]);
    setPrescriptions(prev => [...prev, prescription]);
    updateApptStatus(record.appointmentId, 'Completed');
    triggerCommunication(record.patientId, 'WhatsApp', `Consultation complete. Prescription Rx-${prescription.id} is available.`);
  };

  const addBill = (bill: Bill) => {
    setBills(prev => [...prev, bill]);
    triggerCommunication(bill.patientId, 'WhatsApp', `Payment of ${formatCurrency(bill.total)} received. Receipt ${bill.id}.`);
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
        <div className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-md border-t-[8px] md:border-t-[12px] border-secondary relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-heading text-primary tracking-tighter italic leading-none">HEAL<span className="text-secondary">FLOW</span></h1>
            <p className="subheading text-gray-400 mt-2 tracking-[0.3em] text-[10px] uppercase font-bold">Clinical Enterprise OS • India</p>
          </div>
          <div className="space-y-6">
            <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-secondary/10 outline-none transition-all font-bold" placeholder="Staff ID" />
            <input type="password" name="password" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-secondary/10 outline-none transition-all" placeholder="Security Pin" />
            <button 
              onClick={() => { setIsLoggingIn(true); setTimeout(() => { setCurrentUser(MOCK_USERS[0]); setIsLoggingIn(false); }, 800); }}
              className="w-full bg-primary text-white py-5 rounded-2xl font-heading text-xl uppercase tracking-[0.2em] hover:bg-secondary transition-all shadow-xl disabled:opacity-50"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Verifying...' : 'Authorize Login'}
            </button>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
            <button onClick={() => setCurrentUser(MOCK_USERS[1])} className="text-[9px] py-3 bg-slate-50 text-primary hover:bg-primary hover:text-white rounded-xl font-bold uppercase tracking-widest transition-all">Admin</button>
            <button onClick={() => setCurrentUser(MOCK_USERS[2])} className="text-[9px] py-3 bg-slate-50 text-primary hover:bg-primary hover:text-white rounded-xl font-bold uppercase tracking-widest transition-all">Reception</button>
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
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 px-4 md:px-10 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-primary hover:bg-slate-100 rounded-lg">
              {ICONS.Menu}
            </button>
            <div className="flex flex-col">
              <span className="subheading text-[8px] text-secondary font-bold tracking-[0.4em] uppercase">Control Matrix</span>
              <h2 className="text-lg md:text-2xl font-heading text-primary uppercase tracking-wide leading-none">{activeTab.replace('-', ' ')}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                <span className="text-[8px] px-1.5 py-0.5 bg-primary/10 text-primary font-bold uppercase tracking-widest rounded-md">{currentUser.role}</span>
             </div>
             <img src={currentUser.avatar} className="w-10 h-10 rounded-xl object-cover border-2 border-secondary shadow-sm" alt="Avatar" />
          </div>
        </header>

        <div className="p-4 md:p-10 w-full max-w-7xl mx-auto flex-1">
          {activeTab === 'dashboard' && <Dashboard patients={patients} appointments={appointments} bills={bills} logs={commLogs} setActiveTab={setActiveTab} />}
          {activeTab === 'patients' && <Patients patients={patients} addPatient={addPatient} updatePatient={updatePatient} />}
          {activeTab === 'appointments' && <AppointmentsPage patients={patients} appointments={appointments} addAppointment={addAppointment} updateAppointmentStatus={updateApptStatus} />}
          {activeTab === 'records' && <ConsultationRoom patients={patients} appointments={appointments} finalizeConsultation={finalizeConsultation} />}
          {activeTab === 'billing' && <BillingPage patients={patients} appointments={appointments} records={records} prescriptions={prescriptions} bills={bills} addBill={addBill} />}
          
          {activeTab === 'pharmacy' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-3xl font-heading text-primary uppercase">Pharmacy Hub</h2>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Rx ID</th>
                        <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Patient</th>
                        <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Medicines</th>
                        <th className="px-6 py-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {prescriptions.map(px => {
                        const p = patients.find(pat => pat.id === px.patientId);
                        return (
                          <tr key={px.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs font-bold text-primary">#{px.id.slice(-6)}</td>
                            <td className="px-6 py-4 text-sm font-bold">{p?.firstName} {p?.lastName}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                 {px.medicines.map((m, i) => (
                                   <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-100 rounded-md text-slate-600 font-medium">{m.name}</span>
                                 ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="bg-secondary text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase hover:opacity-90">Issue</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

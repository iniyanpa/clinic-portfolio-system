
import React, { useState, useEffect, useMemo } from 'react';
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
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Global Clinical State
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [bills, setBills] = useState<Bill[]>(MOCK_BILLS);
  const [commLogs, setCommLogs] = useState<CommunicationLog[]>([]);

  // Realistic Formatting for India (₹)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  // Logout Engine
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // State Mutators (Engines)
  const addPatient = (p: Patient) => {
    setPatients(prev => [...prev, p]);
    triggerCommunication(p.id, 'Email', `Welcome to HealFlow! Your ID is ${p.id}.`);
  };

  // Added updatePatient to satisfy PatientsProps
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

  // Role Protection Middleware
  useEffect(() => {
    if (!currentUser) return;
    const restrictedTabs = {
      [UserRole.DOCTOR]: ['billing', 'staff', 'settings'],
      [UserRole.RECEPTIONIST]: ['records', 'staff', 'settings'],
      [UserRole.PHARMACIST]: ['patients', 'appointments', 'records', 'billing', 'settings']
    };
    const roleRestrictions = restrictedTabs[currentUser.role as keyof typeof restrictedTabs] || [];
    if (roleRestrictions.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-6 font-body overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md border-t-[12px] border-secondary animate-in fade-in zoom-in duration-500 relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-6xl font-heading text-primary tracking-tighter italic">HEAL<span className="text-secondary">FLOW</span></h1>
            <p className="subheading text-gray-400 mt-2 tracking-[0.3em] text-[10px] uppercase font-bold">Clinical Enterprise OS • India</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest subheading">Staff ID</label>
              <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-secondary/10 outline-none transition-all font-bold" placeholder="CLINIC-01" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest subheading">Security Pin</label>
              <input type="password" name="password" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-secondary/10 outline-none transition-all" placeholder="••••" />
            </div>
            
            <button 
              onClick={() => {
                setIsLoggingIn(true);
                setTimeout(() => { setCurrentUser(MOCK_USERS[0]); setIsLoggingIn(false); }, 1000);
              }}
              className="w-full bg-primary text-white py-5 rounded-2xl font-heading text-2xl uppercase tracking-[0.2em] hover:bg-secondary transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Verifying...' : 'Authorize Login'}
            </button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
            <button onClick={() => setCurrentUser(MOCK_USERS[1])} className="text-[9px] py-3 bg-slate-50 text-primary hover:bg-primary hover:text-white rounded-xl font-bold uppercase tracking-widest transition-all">Admin Access</button>
            <button onClick={() => setCurrentUser(MOCK_USERS[2])} className="text-[9px] py-3 bg-slate-50 text-primary hover:bg-primary hover:text-white rounded-xl font-bold uppercase tracking-widest transition-all">Reception Desk</button>
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
      />

      <main className="flex-1 ml-64 min-h-screen flex flex-col relative transition-all duration-300">
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 px-10 py-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="subheading text-[10px] text-secondary font-bold tracking-[0.4em] uppercase">Control Matrix</span>
            <h2 className="text-2xl font-heading text-primary uppercase tracking-wide leading-none">{activeTab.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-8">
             <div className="flex items-center gap-3">
               <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                  <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary font-bold uppercase tracking-widest rounded-md">{currentUser.role}</span>
               </div>
               <img src={currentUser.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-secondary p-0.5 shadow-md" alt="Avatar" />
             </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard 
              patients={patients} 
              appointments={appointments} 
              bills={bills} 
              logs={commLogs}
              setActiveTab={setActiveTab} 
            />
          )}
          {activeTab === 'patients' && <Patients patients={patients} addPatient={addPatient} updatePatient={updatePatient} />}
          {activeTab === 'appointments' && <AppointmentsPage patients={patients} appointments={appointments} addAppointment={addAppointment} updateAppointmentStatus={updateApptStatus} />}
          {activeTab === 'records' && <ConsultationRoom patients={patients} appointments={appointments} finalizeConsultation={finalizeConsultation} />}
          {activeTab === 'billing' && (
            <BillingPage 
              patients={patients} 
              appointments={appointments} 
              records={records}
              prescriptions={prescriptions}
              bills={bills} 
              addBill={addBill} 
            />
          )}
          
          {activeTab === 'pharmacy' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-heading text-primary uppercase">Pharmacy Hub</h2>
                  <p className="subheading text-secondary font-bold text-xs tracking-widest">Prescription Fulfillment Queue</p>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr className="border-b border-slate-100">
                       <th className="px-8 py-5 subheading text-[10px] text-slate-400 uppercase tracking-widest">Rx ID</th>
                       <th className="px-8 py-5 subheading text-[10px] text-slate-400 uppercase tracking-widest">Patient</th>
                       <th className="px-8 py-5 subheading text-[10px] text-slate-400 uppercase tracking-widest">Medicines</th>
                       <th className="px-8 py-5 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map(px => {
                      const p = patients.find(pat => pat.id === px.patientId);
                      return (
                        <tr key={px.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-8 py-6 font-mono text-xs font-bold text-primary">#{px.id.slice(-6)}</td>
                          <td className="px-8 py-6">
                            <p className="font-bold text-slate-800 text-sm">{p?.firstName} {p?.lastName}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{px.date}</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-wrap gap-2">
                               {px.medicines.map((m, i) => (
                                 <span key={i} className="text-[10px] px-2 py-1 bg-slate-100 rounded-lg text-slate-600 font-medium">{m.name}</span>
                               ))}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="bg-secondary text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 shadow-lg">Issue Medicine</button>
                          </td>
                        </tr>
                      )
                    })}
                    {prescriptions.length === 0 && (
                      <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-medium italic">Pharmacy queue is empty.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-heading text-primary uppercase">Clinic Config</h2>
                  <p className="subheading text-secondary font-bold text-xs tracking-widest">Regional Parameters & Compliance</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                   <h3 className="text-2xl font-heading text-slate-700 uppercase tracking-widest mb-8">Localization (India)</h3>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                        <span className="text-sm text-slate-500 font-medium">Currency Symbol</span>
                        <span className="font-bold text-primary text-xl">₹</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                        <span className="text-sm text-slate-500 font-medium">Taxation Module</span>
                        <span className="font-bold text-secondary uppercase text-[10px] tracking-widest">GST Enabled</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                        <span className="text-sm text-slate-500 font-medium">SMS Provider</span>
                        <span className="font-bold text-green-500 uppercase text-[10px] tracking-widest">Connected</span>
                      </div>
                   </div>
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

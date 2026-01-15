
import React, { useState, useMemo } from 'react';
import { UserRole, User, Patient, Appointment, MedicalRecord, Bill } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import AppointmentsPage from './pages/AppointmentsPage';
import ConsultationRoom from './pages/ConsultationRoom';
import BillingPage from './pages/BillingPage';
import { MOCK_USERS, MOCK_PATIENTS, MOCK_APPOINTMENTS } from './services/mockData';
import { ICONS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Unified Global Clinic State
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);

  // Helpers to update state
  const addPatient = (newPatient: Patient) => setPatients(prev => [...prev, newPatient]);
  const addAppointment = (appt: Appointment) => setAppointments(prev => [...prev, appt]);
  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };
  const addRecord = (record: MedicalRecord) => setRecords(prev => [...prev, record]);
  const addBill = (bill: Bill) => setBills(prev => [...prev, bill]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-body">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border-t-8 border-primary">
          <h1 className="text-5xl font-heading text-primary text-center mb-2 tracking-tighter italic">HEAL<span className="text-secondary">FLOW</span></h1>
          <p className="subheading text-center text-gray-400 mb-8 tracking-[0.2em] text-xs uppercase">Clinic Management Suite</p>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest subheading">System ID</label>
              <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary outline-none transition-all" placeholder="Enter Staff ID" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest subheading">Passkey</label>
              <input type="password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary outline-none transition-all" placeholder="••••••••" />
            </div>
            <button 
              onClick={() => setCurrentUser(MOCK_USERS[0])}
              className="w-full bg-primary text-white py-4 rounded-xl font-heading text-xl uppercase tracking-widest hover:bg-secondary transition-all shadow-lg active:scale-[0.98]"
            >
              Authorize Access
            </button>
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-3 gap-2">
            <button onClick={() => setCurrentUser(MOCK_USERS[1])} className="text-[9px] py-2 bg-gray-50 hover:bg-primary hover:text-white rounded font-bold uppercase tracking-widest transition-colors">Admin</button>
            <button onClick={() => setCurrentUser(MOCK_USERS[0])} className="text-[9px] py-2 bg-gray-50 hover:bg-primary hover:text-white rounded font-bold uppercase tracking-widest transition-colors">Doctor</button>
            <button onClick={() => setCurrentUser(MOCK_USERS[2])} className="text-[9px] py-2 bg-gray-50 hover:bg-primary hover:text-white rounded font-bold uppercase tracking-widest transition-colors">Staff</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-body text-slate-800">
      <Sidebar 
        role={currentUser.role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main className="flex-1 ml-64 min-h-screen flex flex-col relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="subheading text-[10px] text-secondary font-bold tracking-[0.3em] uppercase">Current Workspace</span>
            <h2 className="text-xl font-heading text-primary uppercase tracking-wide">{activeTab.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">{currentUser.role}</p>
              </div>
              <img src={currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-secondary p-0.5" alt="User" />
            </div>
            <button className="text-slate-400 hover:text-red-500 transition-colors" title="Log Out" onClick={() => setCurrentUser(null)}>
              {ICONS.Logout}
            </button>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'dashboard' && <Dashboard patients={patients} appointments={appointments} bills={bills} />}
          {activeTab === 'patients' && <Patients patients={patients} addPatient={addPatient} />}
          {activeTab === 'appointments' && (
            <AppointmentsPage 
              patients={patients} 
              appointments={appointments} 
              addAppointment={addAppointment} 
              updateAppointmentStatus={updateAppointmentStatus} 
            />
          )}
          {activeTab === 'records' && (
            <ConsultationRoom 
              patients={patients}
              appointments={appointments}
              addRecord={addRecord}
              updateAppointmentStatus={updateAppointmentStatus}
            />
          )}
          {activeTab === 'billing' && (
            <BillingPage 
              patients={patients}
              appointments={appointments}
              bills={bills}
              addBill={addBill}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import { onSnapshot, query, doc, setDoc, addDoc, updateDoc, collection } from "firebase/firestore";
import { db, clinicalCollections } from './firebase';
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

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Firestore Synced States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [commLogs, setCommLogs] = useState<CommunicationLog[]>([]);

  // Real-time Listeners
  useEffect(() => {
    const unsubPatients = onSnapshot(clinicalCollections.patients, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient)));
    });
    const unsubStaff = onSnapshot(clinicalCollections.staff, (snapshot) => {
      setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    });
    const unsubAppts = onSnapshot(clinicalCollections.appointments, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    });
    const unsubPrescriptions = onSnapshot(clinicalCollections.prescriptions, (snapshot) => {
      setPrescriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription)));
    });
    const unsubBills = onSnapshot(clinicalCollections.bills, (snapshot) => {
      setBills(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bill)));
    });
    const unsubLogs = onSnapshot(clinicalCollections.logs, (snapshot) => {
      setCommLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunicationLog)));
    });

    return () => {
      unsubPatients(); unsubStaff(); unsubAppts();
      unsubPrescriptions(); unsubBills(); unsubLogs();
    };
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    setIsSidebarOpen(false);
  };

  const handleAddPatient = async (p: Patient) => {
    await setDoc(doc(db, "patients", p.id), p);
    triggerCommunication(p.id, 'Email', `Welcome to SLS Hospital! Your Patient ID is ${p.id}.`);
  };

  const handleUpdatePatient = async (updated: Patient) => {
    await updateDoc(doc(db, "patients", updated.id), { ...updated });
  };

  const handleAddStaff = async (u: User) => {
    await addDoc(clinicalCollections.staff, u);
  };

  const handleUpdateStaff = async (updated: User) => {
    // Note: This assumes staff documents have their 'id' as the firestore document ID
    // In a real app, you'd find the doc by staff ID first.
    const staffDoc = staff.find(s => s.id === updated.id);
    if (staffDoc) {
       // Logic to update firestore
    }
  };

  const handleAddAppointment = async (a: Appointment) => {
    await addDoc(clinicalCollections.appointments, a);
    triggerCommunication(a.patientId, 'WhatsApp', `SLS Hospital: Visit confirmed for ${a.date} at ${a.time}.`);
  };

  // Fixed signature to match AppointmentsPageProps and added basic doc update logic
  const handleUpdateApptStatus = async (id: string, status: ApptStatus, reason?: string) => {
    const appt = appointments.find(a => a.id === id);
    if (appt) {
      // Use docId if available, otherwise fallback to id
      const docRefId = appt.docId || appt.id;
      const apptRef = doc(db, "appointments", docRefId);
      await updateDoc(apptRef, { 
        status, 
        ...(reason && { cancellationReason: reason }) 
      });
    }
  };

  const handleFinalizeConsultation = async (record: MedicalRecord, prescription: Prescription) => {
    await addDoc(clinicalCollections.records, record);
    await addDoc(clinicalCollections.prescriptions, prescription);
    
    // Update appointment status to completed in Firestore
    // Note: Requires finding the specific Firestore Doc ID for that appointment
    triggerCommunication(record.patientId, 'WhatsApp', `Consultation complete. Order Rx-${prescription.id.slice(-4)} is ready.`);
  };

  const handleAddBill = async (bill: Bill) => {
    await addDoc(clinicalCollections.bills, bill);
    triggerCommunication(bill.patientId, 'WhatsApp', `Payment of ${formatCurrency(bill.total)} received by SLS Hospital.`);
  };

  const handleDispense = async (pxId: string) => {
    // Update firestore prescription status
  };

  const triggerCommunication = async (patientId: string, type: 'WhatsApp' | 'Email', content: string) => {
    const log: CommunicationLog = {
      id: `LOG-${Date.now()}`,
      patientId,
      type,
      content,
      sentAt: new Date().toISOString()
    };
    await addDoc(clinicalCollections.logs, log);
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
             <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-4">Cloud Identity Hub</p>
             <div className="grid grid-cols-1 gap-3">
               {[
                 { role: UserRole.ADMIN, label: 'Administrator', desc: 'System & Governance', icon: ICONS.Settings },
                 { role: UserRole.DOCTOR, label: 'Doctor Terminal', desc: 'Clinical Operations', icon: ICONS.Records },
                 { role: UserRole.RECEPTIONIST, label: 'Reception Desk', desc: 'Registry & Billing', icon: ICONS.Patients },
                 { role: UserRole.PHARMACIST, label: 'Pharmacy Unit', desc: 'Medication Control', icon: ICONS.Staff }
               ].map((btn) => (
                <button 
                  key={btn.role}
                  onClick={() => { 
                    setIsLoggingIn(true); 
                    const foundUser = staff.find(u => u.role === btn.role);
                    setTimeout(() => { 
                      if (foundUser) setCurrentUser(foundUser);
                      else alert("No staff profile found for this role in database.");
                      setIsLoggingIn(false); 
                    }, 800); 
                  }}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-secondary hover:bg-white p-4 rounded-2xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">{btn.icon}</div>
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
             {isLoggingIn ? (
               <div className="text-[10px] font-bold text-secondary animate-pulse uppercase tracking-[0.4em]">Connecting to Firestore...</div>
             ) : (
               <p className="text-[9px] text-slate-300 font-medium italic">Data hosted on Google Cloud Platform</p>
             )}
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
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-primary hover:bg-slate-100 rounded-lg">
              {ICONS.Menu}
            </button>
            <div className="flex flex-col">
              <span className="subheading text-[8px] text-secondary font-bold tracking-[0.4em] uppercase">SLS Cloud Matrix</span>
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
             <img src={currentUser.avatar} className="w-10 h-10 rounded-xl object-cover border-2 border-secondary shadow-sm" alt="Avatar" />
          </div>
        </header>

        <div className="p-4 md:p-10 w-full max-w-7xl mx-auto flex-1 pb-20">
          {activeTab === 'dashboard' && <Dashboard patients={patients} appointments={appointments} bills={bills} logs={commLogs} setActiveTab={setActiveTab} />}
          {activeTab === 'patients' && <Patients patients={patients} addPatient={handleAddPatient} updatePatient={handleUpdatePatient} />}
          {/* Fix: Added missing staff prop and ensured handler matches signature */}
          {activeTab === 'appointments' && <AppointmentsPage patients={patients} staff={staff} appointments={appointments} addAppointment={handleAddAppointment} updateAppointmentStatus={handleUpdateApptStatus} />}
          {activeTab === 'records' && <ConsultationRoom patients={patients} appointments={appointments} finalizeConsultation={handleFinalizeConsultation} />}
          {activeTab === 'pharmacy' && <PharmacyPage prescriptions={prescriptions} patients={patients} onDispense={handleDispense} />}
          {activeTab === 'billing' && <BillingPage patients={patients} appointments={appointments} records={records} prescriptions={prescriptions} bills={bills} addBill={handleAddBill} />}
          {activeTab === 'staff' && <StaffManagement staff={staff} addStaff={handleAddStaff} updateStaff={handleUpdateStaff} />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
};

export default App;

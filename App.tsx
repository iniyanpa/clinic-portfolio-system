
import React, { useState, useEffect } from 'react';
import { onSnapshot, doc, setDoc, updateDoc } from "firebase/firestore";
import { db, clinicalCollections, isFirebaseConfigured } from './firebase';
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
  const [dbStatus, setDbStatus] = useState<'connected' | 'placeholder'>('placeholder');

  // Firestore Synced States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [commLogs, setCommLogs] = useState<CommunicationLog[]>([]);

  useEffect(() => {
    if (isFirebaseConfigured()) {
      setDbStatus('connected');
    } else {
      setDbStatus('placeholder');
    }
  }, []);

  useEffect(() => {
    if (dbStatus === 'placeholder') return;

    const unsubPatients = onSnapshot(clinicalCollections.patients, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as Patient)));
    });
    const unsubStaff = onSnapshot(clinicalCollections.staff, (snapshot) => {
      setStaff(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as User)));
    });
    const unsubAppts = onSnapshot(clinicalCollections.appointments, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as Appointment)));
    });
    const unsubPrescriptions = onSnapshot(clinicalCollections.prescriptions, (snapshot) => {
      setPrescriptions(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as Prescription)));
    });
    const unsubBills = onSnapshot(clinicalCollections.bills, (snapshot) => {
      setBills(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as Bill)));
    });
    const unsubLogs = onSnapshot(clinicalCollections.logs, (snapshot) => {
      setCommLogs(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as CommunicationLog)));
    });
    const unsubRecords = onSnapshot(clinicalCollections.records, (snapshot) => {
      setRecords(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as MedicalRecord)));
    });

    return () => {
      unsubPatients(); unsubStaff(); unsubAppts();
      unsubPrescriptions(); unsubBills(); unsubLogs(); unsubRecords();
    };
  }, [dbStatus]);

  const handleProvisionSystem = async () => {
    setIsLoggingIn(true);
    const initialAdmin: User = {
      id: 'A001',
      name: 'System Admin',
      email: 'admin@slshospital.com',
      role: UserRole.ADMIN,
      avatar: 'https://picsum.photos/seed/admin/200/200',
      phone: '+91 0000000000'
    };
    try {
      await setDoc(doc(db, "staff", "A001"), initialAdmin);
      alert("System Provisioned! You can now log in as Administrator.");
    } catch (e) {
      alert("Failed to provision system. Check your Firestore Security Rules.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAddPatient = async (p: Patient) => {
    await setDoc(doc(db, "patients", p.id), p);
    triggerCommunication(p.id, 'Email', `Welcome to SLS Hospital! Your Patient ID is ${p.id}. Registry complete.`);
  };

  const handleUpdatePatient = async (updated: Patient) => {
    await updateDoc(doc(db, "patients", updated.id), { ...updated });
  };

  const handleAddStaff = async (u: User) => {
    await setDoc(doc(db, "staff", u.id), u);
  };

  const handleUpdateStaff = async (updated: User) => {
    await updateDoc(doc(db, "staff", updated.id), { ...updated });
  };

  const handleAddAppointment = async (a: Appointment) => {
    await setDoc(doc(db, "appointments", a.id), a);
    triggerCommunication(a.patientId, 'WhatsApp', `SLS Hospital: Visit confirmed for ${a.date} at ${a.time}.`);
  };

  const handleUpdateApptStatus = async (id: string, status: ApptStatus, extraData?: Partial<Appointment>) => {
    const apptRef = doc(db, "appointments", id);
    try {
      await updateDoc(apptRef, { 
        status, 
        ...extraData 
      });
    } catch (err) {
      console.error("Failed to update appointment status:", err);
      const appt = appointments.find(a => a.id === id);
      if (appt && appt.docId) {
        await updateDoc(doc(db, "appointments", appt.docId), { status, ...extraData });
      }
    }
  };

  const handleFinalizeConsultation = async (record: MedicalRecord, prescription: Prescription) => {
    try {
      await setDoc(doc(db, "records", record.id), record);
      await setDoc(doc(db, "prescriptions", prescription.id), prescription);
      await handleUpdateApptStatus(record.appointmentId, 'Completed');
      triggerCommunication(record.patientId, 'WhatsApp', `Consultation complete. Order Rx-${prescription.id.slice(-4)} is ready.`);
    } catch (err) {
      console.error("Workflow Finalization Error:", err);
      alert("Failed to finalize consultation. Check connection.");
    }
  };

  const handleAddBill = async (bill: Bill) => {
    await setDoc(doc(db, "bills", bill.id), bill);
    triggerCommunication(bill.patientId, 'WhatsApp', `Payment of ₹${bill.total} received by SLS Hospital. Reference: ${bill.id}`);
  };

  const handleDispense = async (pxId: string) => {
    await updateDoc(doc(db, "prescriptions", pxId), { status: 'Dispensed' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    setIsSidebarOpen(false);
  };

  const triggerCommunication = async (patientId: string, type: 'WhatsApp' | 'Email', content: string) => {
    const logId = `LOG-${Date.now()}`;
    const log: CommunicationLog = {
      id: logId,
      patientId,
      type,
      content,
      sentAt: new Date().toISOString()
    };
    await setDoc(doc(db, "communication_logs", logId), log);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4 font-body overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl w-full max-w-md border-t-[12px] border-secondary relative z-10">
          <div className="text-center mb-8">
             <div className="w-20 h-20 bg-primary/5 rounded-3xl mx-auto mb-6 flex items-center justify-center text-primary shadow-inner">
                {ICONS.Staff}
             </div>
            <h1 className="text-4xl md:text-5xl font-heading text-primary tracking-tighter leading-none mb-2 uppercase">SLS <span className="text-secondary">HOSPITAL</span></h1>
            <p className="subheading text-gray-400 tracking-[0.3em] text-[9px] uppercase font-bold">Clinical Enterprise OS • Tirupati AP</p>
          </div>

          <div className="mb-8 flex justify-center">
            {dbStatus === 'connected' ? (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 rounded-full border border-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">GCP Cloud Live</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-full border border-amber-100">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Database Check Required</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
             <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-4">Select Terminal</p>
             <div className="grid grid-cols-1 gap-3">
               {[
                 { role: UserRole.ADMIN, label: 'Administrator', desc: 'System & Governance' },
                 { role: UserRole.DOCTOR, label: 'Doctor Terminal', desc: 'Clinical Ops' },
                 { role: UserRole.RECEPTIONIST, label: 'Reception Desk', desc: 'Registry & Billing' },
                 { role: UserRole.PHARMACIST, label: 'Pharmacy Unit', desc: 'Medication' }
               ].map((btn) => (
                <button 
                  key={btn.role}
                  disabled={dbStatus === 'placeholder' || isLoggingIn}
                  onClick={() => { 
                    setIsLoggingIn(true); 
                    const foundUser = staff.find(u => u.role === btn.role);
                    setTimeout(() => { 
                      if (foundUser) setCurrentUser(foundUser);
                      else alert(`Account not found. Provisioning required.`);
                      setIsLoggingIn(false); 
                    }, 600); 
                  }}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-secondary hover:bg-white p-4 rounded-2xl flex items-center justify-between group transition-all"
                >
                  <div className="text-left">
                    <p className="font-heading text-xs uppercase tracking-widest text-slate-800">{btn.label}</p>
                    <p className="text-[9px] font-bold text-slate-400">{btn.desc}</p>
                  </div>
                  <span className="text-slate-300 group-hover:text-secondary group-hover:translate-x-1 transition-all">→</span>
                </button>
               ))}
             </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            {staff.length === 0 && dbStatus === 'connected' ? (
              <button 
                onClick={handleProvisionSystem}
                className="text-[9px] font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-6 py-2 rounded-lg hover:bg-secondary hover:text-white transition-all"
              >
                Provision System (First Run)
              </button>
            ) : (
              <p className="text-[9px] text-slate-300 font-medium uppercase tracking-widest">Authorized Access Only</p>
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
              <span className="subheading text-[8px] text-secondary font-bold tracking-[0.4em] uppercase">SLS Hospital Tirupati</span>
              <h2 className="text-lg md:text-2xl font-heading text-primary uppercase tracking-wide leading-none">{activeTab.replace('-', ' ')}</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 mr-4 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-green-100/50">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                GCP Live
             </div>
             <img src={currentUser.avatar} className="w-10 h-10 rounded-xl object-cover border-2 border-secondary shadow-sm" alt="Avatar" />
          </div>
        </header>

        <div className="p-4 md:p-10 w-full max-w-7xl mx-auto flex-1 pb-20">
          {activeTab === 'dashboard' && <Dashboard patients={patients} appointments={appointments} bills={bills} logs={commLogs} setActiveTab={setActiveTab} />}
          {activeTab === 'patients' && <Patients patients={patients} addPatient={handleAddPatient} updatePatient={handleUpdatePatient} />}
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

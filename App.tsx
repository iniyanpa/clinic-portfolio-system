
import React, { useState, useEffect } from 'react';
import { onSnapshot, doc, setDoc, updateDoc, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, clinicalCollections } from './firebase';
import { UserRole, User, Patient, Appointment, MedicalRecord, Bill, ApptStatus, Prescription, Tenant, SubscriptionPlan } from './types';
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
import { MOCK_USERS } from './services/mockData';

// --- LANDING PAGE ---
const LandingPage: React.FC<{ onGetStarted: (mode: 'signin' | 'signup', plan?: SubscriptionPlan) => void }> = ({ onGetStarted }) => {
  const scrollToPricing = () => {
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-body overflow-x-hidden animate-in fade-in duration-700">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-heading tracking-[0.2em] leading-none italic text-primary cursor-pointer">HEAL<span className="text-secondary">FLOW</span></h1>
          <div className="flex items-center gap-6">
            <button onClick={() => onGetStarted('signin')} className="px-6 py-2 text-primary font-bold text-xs uppercase tracking-widest hover:text-secondary transition-colors border-r border-slate-200">Sign In</button>
            <button 
              onClick={() => onGetStarted('signup', 'Pro-Annual')}
              className="px-10 py-3 bg-primary text-white rounded-2xl font-heading text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-secondary transition-all hover:translate-y-[-2px] active:translate-y-0"
            >
              Get Licensed
            </button>
          </div>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-8 pt-56 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-12">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/5 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/10">
            <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_#29baed]"></span>
            v3.5 Clinical Stack • Active Node
          </div>
          <h2 className="text-8xl lg:text-[10rem] font-heading text-primary leading-[0.8] uppercase tracking-tighter">THE OS <br/>FOR <span className="text-secondary">ELITE</span> <br/>CLINICS.</h2>
          <p className="text-slate-500 max-w-lg text-xl leading-relaxed font-light border-l-4 border-secondary pl-8">The definitive outpatient registry system. Unified electronic medical records, automated billing cycles, and AI diagnostic insights.</p>
          <div className="flex flex-wrap gap-6 pt-6">
            <button 
              onClick={() => onGetStarted('signup', 'Pro-Annual')}
              className="px-16 py-7 bg-primary text-white rounded-[3rem] font-heading text-2xl uppercase tracking-widest shadow-2xl hover:bg-secondary transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Deploy Pro Terminal
            </button>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-10 bg-gradient-to-tr from-primary/10 to-secondary/20 blur-[150px] rounded-full group-hover:opacity-100 opacity-70 transition-opacity"></div>
          <div className="relative z-10 rounded-[5rem] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-slate-100">
            <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 scale-[1.01] group-hover:scale-105" alt="Clinic Interface" />
          </div>
        </div>
      </header>
    </div>
  );
};

// --- AUTH PAGE ---
const AuthPage: React.FC<{ mode: 'signin' | 'signup', plan?: SubscriptionPlan, onAuth: (u: User) => void, onBack: () => void, onToggle: () => void }> = ({ mode, plan, onAuth, onBack, onToggle }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', clinicName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulation: Use mock data or create new
    setTimeout(() => {
      const mockUser = MOCK_USERS.find(u => u.email === formData.email) || MOCK_USERS[0];
      onAuth({ ...mockUser, name: formData.name || mockUser.name });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative font-body animate-in zoom-in duration-300">
      <button onClick={onBack} className="absolute top-10 left-10 text-primary hover:text-secondary flex items-center gap-2 font-heading uppercase text-sm tracking-widest transition-all">
        {ICONS.Home} Exit to Web
      </button>
      
      <div className="w-full max-w-2xl flex flex-col items-center">
        <div className="flex flex-col items-center mb-16 space-y-2">
          <h1 className="text-5xl font-heading tracking-[0.3em] italic text-primary uppercase">HEAL<span className="text-secondary">FLOW</span></h1>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">Clinical Infrastructure Unit</span>
        </div>
        
        <div className="bg-white w-full rounded-[4rem] p-16 shadow-[0_40px_80px_-20px_rgba(41,55,140,0.15)] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
          
          <div className="mb-12">
            <h2 className="text-5xl font-heading text-primary text-center uppercase tracking-widest mb-2">
              {mode === 'signup' ? `Initialize Node` : 'System Access'}
            </h2>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              {mode === 'signup' ? `Deploying ${plan || 'Pro-Annual'} Terminal` : 'Enter Administrative Security Key'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {mode === 'signup' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Facility Identity</label>
                  <input required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none text-sm text-slate-900 focus:ring-4 ring-primary/5 transition-all" placeholder="Clinic Name" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Lead Admin Name</label>
                  <input required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none text-sm text-slate-900 focus:ring-4 ring-primary/5 transition-all" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
            )}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Registry Key (Email)</label>
                <input required type="email" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none text-sm text-slate-900 focus:ring-4 ring-primary/5 transition-all" placeholder="admin@facility.io" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Security Password</label>
                <input required type="password" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none text-sm text-slate-900 focus:ring-4 ring-primary/5 transition-all" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
            
            <button type="submit" disabled={loading} className="w-full py-7 bg-primary text-white rounded-3xl font-heading text-2xl uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl active:scale-95 mt-6 flex items-center justify-center gap-4">
              {loading ? 'Initializing...' : (mode === 'signup' ? 'Deploy Terminal' : 'Authenticate')}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-slate-50 text-center">
            <button onClick={onToggle} className="text-[10px] font-bold text-primary hover:text-secondary transition-colors uppercase tracking-[0.2em] decoration-secondary decoration-2 underline-offset-8 hover:underline">
              {mode === 'signup' ? 'Already Licensed? Sign In' : 'New Clinical User? Initialize Registration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signupPlan, setSignupPlan] = useState<SubscriptionPlan | undefined>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Clinical Data State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    if (currentUser && currentUser.tenantId) {
      const qP = query(clinicalCollections.patients, where("tenantId", "==", currentUser.tenantId));
      const qA = query(clinicalCollections.appointments, where("tenantId", "==", currentUser.tenantId));
      const qB = query(clinicalCollections.bills, where("tenantId", "==", currentUser.tenantId));
      const qS = query(clinicalCollections.staff, where("tenantId", "==", currentUser.tenantId));
      const qRx = query(clinicalCollections.prescriptions, where("tenantId", "==", currentUser.tenantId));
      const qRec = query(clinicalCollections.records, where("tenantId", "==", currentUser.tenantId));

      const unsubs = [
        onSnapshot(qP, s => setPatients(s.docs.map(d => ({ ...d.data(), id: d.id } as Patient)))),
        onSnapshot(qA, s => setAppointments(s.docs.map(d => ({ ...d.data(), id: d.id } as Appointment)))),
        onSnapshot(qB, s => setBills(s.docs.map(d => ({ ...d.data(), id: d.id } as Bill)))),
        onSnapshot(qS, s => setStaff(s.docs.map(d => ({ ...d.data(), id: d.id } as User)))),
        onSnapshot(qRx, s => setPrescriptions(s.docs.map(d => ({ ...d.data(), id: d.id } as Prescription)))),
        onSnapshot(qRec, s => setRecords(s.docs.map(d => ({ ...d.data(), id: d.id } as MedicalRecord))))
      ];

      return () => unsubs.forEach(u => u());
    }
  }, [currentUser]);

  const addPatient = async (p: Patient) => await setDoc(doc(clinicalCollections.patients, p.id), p);
  const updatePatient = async (p: Patient) => await updateDoc(doc(clinicalCollections.patients, p.id), p as any);
  const addAppointment = async (a: Appointment) => await setDoc(doc(clinicalCollections.appointments, a.id), { ...a, tenantId: currentUser?.tenantId });
  const updateAppointmentStatus = async (id: string, s: ApptStatus, extra?: any) => await updateDoc(doc(clinicalCollections.appointments, id), { status: s, ...extra });
  const finalizeConsultation = async (rec: MedicalRecord, px: Prescription) => {
    await addDoc(clinicalCollections.records, { ...rec, tenantId: currentUser?.tenantId });
    await addDoc(clinicalCollections.prescriptions, { ...px, tenantId: currentUser?.tenantId });
    await updateAppointmentStatus(rec.appointmentId, 'Completed');
  };
  const addBill = async (b: Bill) => await addDoc(clinicalCollections.bills, { ...b, tenantId: currentUser?.tenantId });
  const addStaff = async (u: User) => await addDoc(clinicalCollections.staff, { ...u, tenantId: currentUser?.tenantId });
  const updateStaff = async (u: User) => {
    const q = query(clinicalCollections.staff, where("id", "==", u.id));
    const snap = await getDocs(q);
    if (!snap.empty) await updateDoc(doc(db, "staff", snap.docs[0].id), u as any);
  };

  const handleAuth = (user: User) => {
    setCurrentUser(user);
    setView('app');
    setActiveTab('dashboard');
  };

  if (view === 'landing') return <LandingPage onGetStarted={(m, p) => { setAuthMode(m); setSignupPlan(p); setView('auth'); }} />;
  if (view === 'auth') return <AuthPage mode={authMode} plan={signupPlan} onAuth={handleAuth} onBack={() => setView('landing')} onToggle={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} />;

  return (
    <div className="flex min-h-screen bg-slate-50 font-body text-slate-800">
      <Sidebar 
        user={currentUser!} 
        tenantName="HEALFLOW CENTER" 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => { setCurrentUser(null); setView('landing'); }} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="bg-white/95 backdrop-blur-3xl border-b border-slate-100 sticky top-0 z-30 px-8 py-6 flex items-center justify-between shadow-sm lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 text-primary bg-slate-50 rounded-2xl">{ICONS.Menu}</button>
          <h1 className="text-xl font-heading italic text-primary">HEAL<span className="text-secondary">FLOW</span></h1>
        </header>

        <div className="p-6 md:p-12 flex-1 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard patients={patients} appointments={appointments} bills={bills} logs={[]} setActiveTab={setActiveTab} />}
          {activeTab === 'patients' && <Patients patients={patients} tenantId={currentUser!.tenantId} clinicName="HEALFLOW CENTER" addPatient={addPatient} updatePatient={updatePatient} />}
          {activeTab === 'appointments' && <AppointmentsPage patients={patients} staff={staff} appointments={appointments} addAppointment={addAppointment} updateAppointmentStatus={updateAppointmentStatus} />}
          {activeTab === 'records' && <ConsultationRoom patients={patients} appointments={appointments} clinicName="HEALFLOW CENTER" finalizeConsultation={finalizeConsultation} />}
          {activeTab === 'billing' && <BillingPage patients={patients} appointments={appointments} records={records} prescriptions={prescriptions} bills={bills} clinicName="HEALFLOW CENTER" addBill={addBill} />}
          {activeTab === 'staff' && <StaffManagement staff={staff} addStaff={addStaff} updateStaff={updateStaff} />}
          {activeTab === 'pharmacy' && <PharmacyPage prescriptions={prescriptions} patients={patients} clinicName="HEALFLOW CENTER" onDispense={() => {}} />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
};

export default App;

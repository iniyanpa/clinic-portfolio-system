
import React, { useState, useEffect } from 'react';
import { onSnapshot, doc, setDoc, updateDoc, query, where, getDocs, addDoc, limit } from "firebase/firestore";
import { db, clinicalCollections } from './firebase';
import { UserRole, User, Patient, Appointment, MedicalRecord, Bill, ApptStatus, Prescription, SubscriptionPlan } from './types';
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

// --- LANDING PAGE ---
const LandingPage: React.FC<{ onGetStarted: (mode: 'signin' | 'signup', plan?: SubscriptionPlan) => void }> = ({ onGetStarted }) => {
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
const AuthPage: React.FC<{ mode: 'signin' | 'signup', plan?: SubscriptionPlan, onAuth: (u: User, clinicName?: string) => void, onBack: () => void, onToggle: () => void }> = ({ mode, plan, onAuth, onBack, onToggle }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', clinicName: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    setError(null);
    e.preventDefault();
    
    try {
      if (mode === 'signup') {
        const newTenantId = `HF-T${Math.floor(1000 + Math.random() * 9000)}`;
        const userId = `USR-${Date.now()}`;
        
        const newUser: User = {
          id: userId,
          tenantId: newTenantId,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: UserRole.ADMIN,
          avatar: `https://picsum.photos/seed/${formData.name}/100/100`,
        };

        await setDoc(doc(clinicalCollections.tenants, newTenantId), {
          id: newTenantId,
          name: formData.clinicName,
          createdAt: new Date().toISOString()
        });
        
        await setDoc(doc(clinicalCollections.users, userId), newUser);
        await setDoc(doc(clinicalCollections.staff, userId), { ...newUser, specialization: 'Clinic Director' });

        onAuth(newUser, formData.clinicName);
      } else {
        const q = query(clinicalCollections.users, where("email", "==", formData.email), where("password", "==", formData.password), limit(1));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          setError("Invalid security credentials. Check your registry key and password.");
        } else {
          // Fix: Explicitly cast data() result to any to allow spreading and property access
          const userData = { ...(snap.docs[0].data() as any), id: snap.docs[0].id } as User;
          const tenantSnap = await getDocs(query(clinicalCollections.tenants, where("id", "==", userData.tenantId), limit(1)));
          const cName = !tenantSnap.empty ? (tenantSnap.docs[0].data() as any).name : "HEALFLOW CENTER";
          onAuth(userData, cName);
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError("System handshake failure. Please retry or contact support.");
    } finally {
      setLoading(false);
    }
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
          <div className="mb-12 text-center">
            <h2 className="text-5xl font-heading text-primary uppercase tracking-widest mb-2">
              {mode === 'signup' ? `Initialize Node` : 'System Access'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              {mode === 'signup' ? `Deploying ${plan || 'Pro-Annual'} Terminal` : 'Enter Administrative Security Key'}
            </p>
          </div>
          {error && <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-bold uppercase tracking-widest">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-8">
            {mode === 'signup' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <input required type="email" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none text-sm text-slate-900" placeholder="admin@facility.io" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Security Password</label>
                <input required type="password" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none text-sm text-slate-900" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-7 bg-primary text-white rounded-3xl font-heading text-2xl uppercase tracking-widest shadow-2xl active:scale-95">
              {loading ? 'Processing Protocol...' : (mode === 'signup' ? 'Deploy Terminal' : 'Authenticate')}
            </button>
          </form>
          <div className="mt-12 pt-10 border-t border-slate-50 text-center">
            <button onClick={onToggle} className="text-[10px] font-bold text-primary hover:text-secondary uppercase tracking-[0.2em] underline-offset-8 hover:underline">
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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hf_u');
    return saved ? JSON.parse(saved) : null;
  });
  const [clinicName, setClinicName] = useState(localStorage.getItem('hf_cn') || "HEALFLOW CENTER");
  const [view, setView] = useState<'landing' | 'auth' | 'app'>(currentUser ? 'app' : 'landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signupPlan, setSignupPlan] = useState<SubscriptionPlan | undefined>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    if (currentUser && currentUser.tenantId) {
      const tid = currentUser.tenantId;
      const sanitize = (docs: any[]) => docs.map(d => ({ ...d.data(), id: d.id }));

      // Fix: Explicitly type the snapshot parameters (s) as any to handle QuerySnapshot/DocumentSnapshot ambiguity in TS
      const unsubs = [
        onSnapshot(query(clinicalCollections.patients, where("tenantId", "==", tid)), (s: any) => setPatients(sanitize(s.docs) as Patient[])),
        onSnapshot(query(clinicalCollections.appointments, where("tenantId", "==", tid)), (s: any) => setAppointments(sanitize(s.docs) as Appointment[])),
        onSnapshot(query(clinicalCollections.bills, where("tenantId", "==", tid)), (s: any) => setBills(sanitize(s.docs) as Bill[])),
        onSnapshot(query(clinicalCollections.staff, where("tenantId", "==", tid)), (s: any) => setStaff(sanitize(s.docs) as User[])),
        onSnapshot(query(clinicalCollections.prescriptions, where("tenantId", "==", tid)), (s: any) => setPrescriptions(sanitize(s.docs) as Prescription[])),
        onSnapshot(query(clinicalCollections.records, where("tenantId", "==", tid)), (s: any) => setRecords(sanitize(s.docs) as MedicalRecord[]))
      ];
      return () => unsubs.forEach(u => u());
    }
  }, [currentUser]);

  const addPatient = async (p: Patient) => setDoc(doc(clinicalCollections.patients, p.id), { ...p, tenantId: currentUser?.tenantId });
  const updatePatient = async (p: Patient) => updateDoc(doc(clinicalCollections.patients, p.id), { ...p });
  const addAppointment = async (a: Appointment) => setDoc(doc(clinicalCollections.appointments, a.id), { ...a, tenantId: currentUser?.tenantId });
  const updateAppointmentStatus = async (id: string, s: ApptStatus, extra?: any) => updateDoc(doc(clinicalCollections.appointments, id), { status: s, ...extra });
  
  const finalizeConsultation = async (rec: MedicalRecord, px: Prescription) => {
    await addDoc(clinicalCollections.records, { ...rec, tenantId: currentUser?.tenantId });
    await addDoc(clinicalCollections.prescriptions, { ...px, tenantId: currentUser?.tenantId });
    await updateAppointmentStatus(rec.appointmentId, 'Completed');
  };

  const addBill = async (b: Bill) => addDoc(clinicalCollections.bills, { ...b, tenantId: currentUser?.tenantId });
  const onDispense = async (pxId: string) => updateDoc(doc(db, "prescriptions", pxId), { status: 'Dispensed' });

  const handleAuth = (user: User, facilityName?: string) => {
    setCurrentUser(user);
    const cn = facilityName ? facilityName.toUpperCase() : "HEALFLOW CENTER";
    setClinicName(cn);
    localStorage.setItem('hf_u', JSON.stringify(user));
    localStorage.setItem('hf_cn', cn);
    setView('app');
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    setView('landing');
  };

  if (view === 'landing') return <LandingPage onGetStarted={(m, p) => { setAuthMode(m); setSignupPlan(p); setView('auth'); }} />;
  if (view === 'auth') return <AuthPage mode={authMode} plan={signupPlan} onAuth={handleAuth} onBack={() => setView('landing')} onToggle={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} />;

  return (
    <div className="flex min-h-screen bg-slate-50 font-body text-slate-800">
      <Sidebar user={currentUser!} tenantName={clinicName} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="bg-white/95 backdrop-blur-3xl border-b border-slate-100 sticky top-0 z-30 px-8 py-6 flex items-center justify-between shadow-sm lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 text-primary bg-slate-50 rounded-2xl">{ICONS.Menu}</button>
          <h1 className="text-xl font-heading italic text-primary">HEAL<span className="text-secondary">FLOW</span></h1>
        </header>
        <div className="p-6 md:p-12 flex-1 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard patients={patients} appointments={appointments} bills={bills} logs={[]} setActiveTab={setActiveTab} />}
          {activeTab === 'patients' && <Patients patients={patients} tenantId={currentUser!.tenantId} clinicName={clinicName} addPatient={addPatient} updatePatient={updatePatient} />}
          {activeTab === 'appointments' && <AppointmentsPage patients={patients} staff={staff} appointments={appointments} addAppointment={addAppointment} updateAppointmentStatus={updateAppointmentStatus} />}
          {activeTab === 'records' && <ConsultationRoom patients={patients} appointments={appointments} clinicName={clinicName} finalizeConsultation={finalizeConsultation} />}
          {activeTab === 'billing' && <BillingPage patients={patients} appointments={appointments} records={records} prescriptions={prescriptions} bills={bills} clinicName={clinicName} addBill={addBill} />}
          {activeTab === 'staff' && <StaffManagement staff={staff} addStaff={()=>{}} updateStaff={()=>{}} />}
          {activeTab === 'pharmacy' && <PharmacyPage prescriptions={prescriptions} patients={patients} clinicName={clinicName} onDispense={onDispense} />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
};

export default App;

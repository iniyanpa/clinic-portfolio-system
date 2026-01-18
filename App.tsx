import React, { useState, useEffect } from 'react';
import { onSnapshot, doc, setDoc, updateDoc, query, where, getDocs, addDoc, limit } from "firebase/firestore";
import { db, clinicalCollections } from './firebase';
import { UserRole, User, Patient, Appointment, MedicalRecord, Bill, ApptStatus, Prescription, SubscriptionPlan, Tenant } from './types';
import { ICONS } from '../constants';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import AppointmentsPage from './pages/AppointmentsPage';
import ConsultationRoom from './pages/ConsultationRoom';
import BillingPage from './pages/BillingPage';
import StaffManagement from './pages/StaffManagement';
import SettingsPage from './pages/SettingsPage';
import PharmacyPage from './pages/PharmacyPage';

// --- ENHANCED LANDING PAGE ---
const LandingPage: React.FC<{ onGetStarted: (mode: 'signin' | 'signup', plan?: SubscriptionPlan) => void }> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-body overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-xl shadow-lg">
              <span className="font-heading font-black text-xl italic">HF</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-primary tracking-tight">HealFlow</h1>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => onGetStarted('signin')} className="text-slate-600 font-bold hover:text-primary transition-colors">Doctor Login</button>
            <button 
              onClick={() => onGetStarted('signup', 'Pro-Annual')}
              className="px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-xl hover:bg-secondary transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100">
            Trusted by 5,000+ Doctors Across India
          </div>
          <h2 className="text-5xl lg:text-7xl font-heading font-bold text-primary leading-[1.1]">
            The Smart Way to <br/><span className="text-secondary text-5xl lg:text-6xl">Manage Your OPD.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
            Join the digital healthcare revolution. Manage patient records, generate digital prescriptions (Rx), and automate your clinic's billing & pharmacy with HealFlow.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onGetStarted('signup', 'Pro-Annual')}
              className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all"
            >
              Start Free Trial
            </button>
          </div>
        </div>
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200" 
            className="rounded-[3rem] shadow-2xl border-8 border-white" 
            alt="Doctor App" 
          />
        </div>
      </header>

      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-4xl font-heading font-bold text-primary">Everything your clinic needs.</h3>
            <p className="text-slate-500 text-lg">Detailed features built for Indian healthcare professionals.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-slate-50 rounded-[3rem] space-y-6 hover:shadow-xl transition-all border border-slate-100">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">{ICONS.Records}</div>
              <h4 className="text-2xl font-bold text-primary">Paperless EMR</h4>
              <p className="text-slate-600 leading-relaxed">Capture full patient history, vitals, and chronic issues. Access any file from anywhere instantly.</p>
            </div>
            <div className="p-10 bg-slate-50 rounded-[3rem] space-y-6 hover:shadow-xl transition-all border border-slate-100">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">{ICONS.Billing}</div>
              <h4 className="text-2xl font-bold text-primary">Billing & GST</h4>
              <p className="text-slate-600 leading-relaxed">Fast billing with UPI QR integration. Generate tax-compliant PDF invoices for every visit.</p>
            </div>
            <div className="p-10 bg-slate-50 rounded-[3rem] space-y-6 hover:shadow-xl transition-all border border-slate-100">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">{ICONS.Staff}</div>
              <h4 className="text-2xl font-bold text-primary">Direct Pharmacy</h4>
              <p className="text-slate-600 leading-relaxed">Prescriptions go straight to your in-clinic pharmacy, ensuring accurate medicine dispensing.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">© 2024 HealFlow. Built for Indian Doctors.</p>
          <div className="flex gap-8 text-sm font-bold text-slate-400">
            <a href="#" className="hover:text-primary">Support</a>
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- AUTH PAGE ---
const AuthPage: React.FC<{ mode: 'signin' | 'signup', plan?: SubscriptionPlan, onAuth: (u: User, clinicName?: string) => void, onBack: () => void, onToggle: () => void }> = ({ mode, plan, onAuth, onBack, onToggle }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', clinicName: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
          createdAt: new Date().toISOString(),
          status: 'Active',
          plan: plan || 'Trial',
          consultationFee: 500,
          platformFee: 200
        });
        await setDoc(doc(clinicalCollections.users, userId), newUser);
        await setDoc(doc(clinicalCollections.staff, userId), { ...newUser, specialization: 'Clinic Owner' });
        onAuth(newUser, formData.clinicName);
      } else {
        const q = query(clinicalCollections.users, where("email", "==", formData.email), where("password", "==", formData.password), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) {
          setError("Invalid email or password.");
        } else {
          const userData = { ...(snap.docs[0].data() as any), id: snap.docs[0].id } as User;
          const tenantSnap = await getDocs(query(clinicalCollections.tenants, where("id", "==", userData.tenantId), limit(1)));
          const cName = !tenantSnap.empty ? (tenantSnap.docs[0].data() as any).name : "HEALFLOW CLINIC";
          onAuth(userData, cName);
        }
      }
    } catch (err: any) {
      setError("Handshake failure. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-body">
      <div className="w-full max-w-lg space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-black text-primary">HealFlow</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Clinical Access Unit</p>
        </div>
        <div className="bg-slate-50 p-12 rounded-[3rem] border border-slate-100 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">{mode === 'signup' ? 'Activate Node' : 'Clinic Login'}</h2>
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <>
                <input required className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none" placeholder="Clinic Name" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} />
                <input required className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </>
            )}
            <input required type="email" className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input required type="password" className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <button type="submit" disabled={loading} className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-2xl transition-all">
              {loading ? 'Processing...' : (mode === 'signup' ? 'Activate System' : 'Sign In')}
            </button>
          </form>
          <div className="mt-8 text-center">
            <button onClick={onToggle} className="text-primary font-bold hover:underline">
              {mode === 'signup' ? 'Already have an account? Sign In' : 'New Clinic? Register Now'}
            </button>
          </div>
        </div>
        <button onClick={onBack} className="w-full text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-primary transition-all">← Back to Homepage</button>
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
  const [clinicName, setClinicName] = useState(localStorage.getItem('hf_cn') || "HEALFLOW CLINIC");
  const [view, setView] = useState<'landing' | 'auth' | 'app'>(currentUser ? 'app' : 'landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signupPlan, setSignupPlan] = useState<SubscriptionPlan | undefined>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tenantSettings, setTenantSettings] = useState<Tenant | null>(null);

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
      const unsubs = [
        onSnapshot(doc(clinicalCollections.tenants, tid), (s) => {
          const data = s.data() as Tenant;
          setTenantSettings(data);
          if (data?.name) setClinicName(data.name);
        }),
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
    const cn = facilityName ? facilityName : "HEALFLOW CLINIC";
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

  const tenantLogo = tenantSettings?.logoBase64 || tenantSettings?.logoUrl;

  return (
    <div className="flex min-h-screen bg-slate-50 font-body text-slate-800">
      <Sidebar 
        user={currentUser!} 
        tenantName={clinicName} 
        tenantLogo={tenantLogo}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm lg:hidden">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <button onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(true); }} className="p-2 btn-primary rounded-lg mr-2">{ICONS.Menu}</button>
            {tenantLogo ? (
              <img src={tenantLogo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="text-primary">{ICONS.Home}</div>
            )}
            <h1 className="text-lg font-heading font-black text-primary truncate">{clinicName}</h1>
          </div>
        </header>
        <div className="p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard patients={patients} appointments={appointments} bills={bills} logs={[]} setActiveTab={setActiveTab} />}
          {activeTab === 'patients' && <Patients patients={patients} tenantId={currentUser!.tenantId} clinicName={clinicName} addPatient={addPatient} updatePatient={updatePatient} />}
          {activeTab === 'appointments' && <AppointmentsPage patients={patients} staff={staff} appointments={appointments} addAppointment={addAppointment} updateAppointmentStatus={updateAppointmentStatus} />}
          {activeTab === 'records' && <ConsultationRoom patients={patients} appointments={appointments} records={records} clinicName={clinicName} currentUser={currentUser} finalizeConsultation={finalizeConsultation} />}
          {activeTab === 'billing' && <BillingPage patients={patients} appointments={appointments} records={records} prescriptions={prescriptions} bills={bills} clinicName={clinicName} addBill={addBill} tenantSettings={tenantSettings} />}
          {activeTab === 'staff' && <StaffManagement staff={staff} addStaff={()=>{}} updateStaff={()=>{}} />}
          {activeTab === 'pharmacy' && <PharmacyPage prescriptions={prescriptions} patients={patients} appointments={appointments} clinicName={clinicName} onDispense={onDispense} />}
          {activeTab === 'settings' && <SettingsPage tenantId={currentUser?.tenantId} currentSettings={tenantSettings} />}
        </div>
      </main>
    </div>
  );
};

export default App;
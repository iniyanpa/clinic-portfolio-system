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
    <div className="min-h-screen bg-slate-50 font-body">
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-lg">{ICONS.Home}</div>
            <h1 className="text-2xl font-heading font-bold text-primary">HealFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onGetStarted('signin')} className="px-5 py-2 text-slate-600 font-bold hover:text-primary transition-colors">Sign In</button>
            <button onClick={() => onGetStarted('signup', 'Pro-Annual')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-secondary transition-all">Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl lg:text-6xl font-heading font-bold text-primary leading-tight">Simplified Clinic Operations for Busy Doctors.</h2>
            <p className="text-xl text-slate-600 leading-relaxed">Join 50,000+ doctors across India using HealFlow for Electronic Medical Records (EMR), Online Appointments, and GST Billing.</p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onGetStarted('signup', 'Pro-Annual')} className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-all">Deploy Your Clinic Now</button>
              <div className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="text-green-500 text-2xl font-bold">4.8/5</span>
                <span className="text-slate-400 text-sm font-medium">Doctor Satisfaction Score</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium italic">No credit card required • 14-day free trial • Made for Indian Clinics</p>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200" className="rounded-[3rem] shadow-2xl border-8 border-white" alt="Doctor App" />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce">
              <div className="bg-green-100 text-green-600 p-3 rounded-full">{ICONS.Plus}</div>
              <div>
                <p className="font-bold text-slate-800">New Patient Registered</p>
                <p className="text-xs text-slate-400">2 seconds ago</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section Inspired by Practo */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-4xl font-heading font-bold text-primary">Everything you need to run your OPD.</h3>
            <p className="text-slate-500 text-lg">One unified platform for your clinic, pharmacy, and front-desk.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-slate-50 rounded-[3rem] space-y-4 hover:shadow-xl transition-all">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">{ICONS.Patients}</div>
              <h4 className="text-2xl font-bold text-slate-800">Smart EMR & Registry</h4>
              <p className="text-slate-600 leading-relaxed">Capture patient history, symptoms, and vitals in seconds. Our AI-powered prescription tool saves you 30 minutes every day.</p>
            </div>
            <div className="p-10 bg-slate-50 rounded-[3rem] space-y-4 hover:shadow-xl transition-all">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">{ICONS.Billing}</div>
              <h4 className="text-2xl font-bold text-slate-800">Billing & GST Invoices</h4>
              <p className="text-slate-600 leading-relaxed">Instant billing with UPI, Cash, or Card options. Generate professional tax-compliant invoices for your patients automatically.</p>
            </div>
            <div className="p-10 bg-slate-50 rounded-[3rem] space-y-4 hover:shadow-xl transition-all">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">{ICONS.Staff}</div>
              <h4 className="text-2xl font-bold text-slate-800">Pharmacy & Inventory</h4>
              <p className="text-slate-600 leading-relaxed">Direct connection between doctor's desk and pharmacy. Track medicine stock and dispense prescriptions with a single click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-6 bg-primary text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-4xl font-heading font-bold mb-8">Increase your clinic's efficiency by 40%.</h3>
            <ul className="space-y-6">
              {[
                "Digital Prescriptions (Print or WhatsApp)",
                "Automated Follow-up Reminders",
                "Patient History at your fingertips",
                "Detailed Daily Revenue Reports",
                "Role-based access for Staff & Pharmacists"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-4 text-lg">
                  <div className="bg-secondary p-1 rounded-full text-white">{ICONS.Plus}</div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[4rem] border border-white/20">
            <h4 className="text-2xl font-heading mb-6">"HealFlow has completely transformed how I manage my morning OPD. The AI diagnosis and digital RX are life-savers."</h4>
            <div className="flex items-center gap-4">
              <img src="https://picsum.photos/seed/dr1/100/100" className="w-14 h-14 rounded-full" alt="Doctor" />
              <div>
                <p className="font-bold">Dr. Rajesh Khanna</p>
                <p className="text-white/60 text-sm">Consultant Pediatrician, Mumbai</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-slate-900 text-slate-400 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p>© 2024 HealFlow Technologies. All rights reserved.</p>
          <div className="flex gap-8 font-bold">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Support Helpdesk</a>
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
        await setDoc(doc(clinicalCollections.staff, userId), { ...newUser, specialization: 'Clinic Owner' });

        onAuth(newUser, formData.clinicName);
      } else {
        const q = query(clinicalCollections.users, where("email", "==", formData.email), where("password", "==", formData.password), limit(1));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          setError("Incorrect Email or Password. Please try again.");
        } else {
          const userData = { ...(snap.docs[0].data() as any), id: snap.docs[0].id } as User;
          const tenantSnap = await getDocs(query(clinicalCollections.tenants, where("id", "==", userData.tenantId), limit(1)));
          const cName = !tenantSnap.empty ? (tenantSnap.docs[0].data() as any).name : "HEALFLOW CLINIC";
          onAuth(userData, cName);
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError("Connectivity issue. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-body">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-heading font-bold text-primary">HealFlow</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Clinical Access Terminal</p>
        </div>
        <div className="bg-slate-50 p-12 rounded-[3rem] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">{mode === 'signup' ? 'Create Your Clinic' : 'Doctor Login'}</h2>
          {error && <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-2xl font-bold text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <>
                <input required className="w-full bg-white p-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 ring-primary/5" placeholder="Clinic / Hospital Name" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} />
                <input required className="w-full bg-white p-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 ring-primary/5" placeholder="Your Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </>
            )}
            <input required type="email" className="w-full bg-white p-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 ring-primary/5" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input required type="password" className="w-full bg-white p-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 ring-primary/5" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <button type="submit" disabled={loading} className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-xl shadow-xl hover:bg-secondary transition-all">
              {loading ? 'Authenticating...' : (mode === 'signup' ? 'Deploy System' : 'Login Now')}
            </button>
          </form>
          <div className="mt-8 text-center">
            <button onClick={onToggle} className="text-primary font-bold hover:underline">
              {mode === 'signup' ? 'Already have an account? Sign In' : "Don't have a clinic account? Sign Up"}
            </button>
          </div>
        </div>
        <button onClick={onBack} className="w-full text-slate-400 font-bold hover:text-primary transition-all uppercase tracking-widest text-xs">← Back to Homepage</button>
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

  return (
    <div className="flex min-h-screen bg-slate-50 font-body text-slate-800">
      <Sidebar user={currentUser!} tenantName={clinicName} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-primary bg-slate-100 rounded-lg">{ICONS.Menu}</button>
          <h1 className="text-xl font-heading font-bold text-primary">HealFlow</h1>
        </header>
        <div className="p-6 md:p-10 flex-1 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard patients={patients} appointments={appointments} bills={bills} logs={[]} setActiveTab={setActiveTab} />}
          {activeTab === 'patients' && <Patients patients={patients} tenantId={currentUser!.tenantId} clinicName={clinicName} addPatient={addPatient} updatePatient={updatePatient} />}
          {activeTab === 'appointments' && <AppointmentsPage patients={patients} staff={staff} appointments={appointments} addAppointment={addAppointment} updateAppointmentStatus={updateAppointmentStatus} />}
          {/* Fixed: Passing currentUser down to ConsultationRoom so handleFinalize can use it */}
          {activeTab === 'records' && <ConsultationRoom patients={patients} appointments={appointments} clinicName={clinicName} currentUser={currentUser} finalizeConsultation={finalizeConsultation} />}
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
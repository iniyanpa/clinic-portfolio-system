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
              Register Clinic
            </button>
          </div>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100">
            Trusted by 5000+ Indian Doctors
          </div>
          <h2 className="text-5xl lg:text-7xl font-heading font-bold text-primary leading-[1.1]">
            Digital Clinic <br/><span className="text-secondary">Simplified.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
            India's most intuitive OPD management software. Go paperless with digital prescriptions, manage patient records (EMR), and generate GST-compliant bills in seconds.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onGetStarted('signup', 'Pro-Annual')}
              className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all"
            >
              Start 14-Day Free Trial
            </button>
            <div className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-green-500 font-bold">4.9/5</span>
              <span className="text-slate-400 text-sm">Rating on G2 India</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/5 to-secondary/10 blur-3xl rounded-full"></div>
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200" 
            className="relative z-10 rounded-[3rem] shadow-2xl border-8 border-white" 
            alt="Doctor using HealFlow" 
          />
        </div>
      </header>

      {/* Practo-style Feature Grid */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-4xl font-heading font-bold text-primary">Powerful Features for your OPD</h3>
            <p className="text-slate-500 text-lg">One unified platform for everything your clinic needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-slate-50 rounded-[3rem] space-y-6 hover:shadow-xl transition-all border border-slate-100">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">{ICONS.Records}</div>
              <h4 className="text-2xl font-bold text-primary">Smart EMR (Patient Records)</h4>
              <p className="text-slate-600 leading-relaxed">Access full patient history, previous prescriptions, and lab reports in one click. Never lose a patient file again.</p>
              <ul className="space-y-2 text-sm font-bold text-slate-400">
                <li>• Chronic History Tracking</li>
                <li>• Digital Document Vault</li>
                <li>• Automated Vitals Logging</li>
              </ul>
            </div>
            <div className="p-10 bg-slate-50 rounded-[3rem] space-y-6 hover:shadow-xl transition-all border border-slate-100">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">{ICONS.Billing}</div>
              <h4 className="text-2xl font-bold text-primary">GST Billing & Accounts</h4>
              <p className="text-slate-600 leading-relaxed">Generate tax-compliant invoices. Accept UPI, Cash, and Cards. Track daily revenue and pending payments effortlessly.</p>
              <ul className="space-y-2 text-sm font-bold text-slate-400">
                <li>• UPI QR Integration</li>
                <li>• Instant WhatsApp Bills</li>
                <li>• Expense Tracking</li>
              </ul>
            </div>
            <div className="p-10 bg-slate-50 rounded-[3rem] space-y-6 hover:shadow-xl transition-all border border-slate-100">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">{ICONS.Staff}</div>
              <h4 className="text-2xl font-bold text-primary">Integrated Pharmacy</h4>
              <p className="text-slate-600 leading-relaxed">Link your clinic directly to your pharmacy. Medicines mentioned in prescriptions appear instantly at the pharmacist's desk.</p>
              <ul className="space-y-2 text-sm font-bold text-slate-400">
                <li>• Inventory Alerts</li>
                <li>• Batch Tracking</li>
                <li>• Digital Rx Fulfillment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="py-20 bg-primary text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h3 className="text-4xl lg:text-5xl font-heading font-bold mb-8">Increase OPD Efficiency <br/>by up to 45%.</h3>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-secondary">01</div>
                <div>
                  <h5 className="text-xl font-bold mb-2">WhatsApp Notifications</h5>
                  <p className="text-white/60">Automated appointment reminders and follow-up alerts sent directly to patient's phone.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-secondary">02</div>
                <div>
                  <h5 className="text-xl font-bold mb-2">AI-Powered Prescriptions</h5>
                  <p className="text-white/60">HealFlow learns your prescribing patterns and suggests common medications, saving you hours every week.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-secondary">03</div>
                <div>
                  <h5 className="text-xl font-bold mb-2">Role-Based Access</h5>
                  <p className="text-white/60">Separate logins for Doctors, Front-desk, and Pharmacists with restricted data access for security.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[4rem] border border-white/10">
            <h4 className="text-3xl font-heading font-bold mb-8">Success Stories</h4>
            <div className="space-y-8">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-lg italic text-white/80 mb-4">"The best decision for my clinic. Earlier, managing patient history was a nightmare. Now everything is digital and secure."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary rounded-full"></div>
                  <div>
                    <p className="font-bold">Dr. Rajesh Kumar</p>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Consultant Pediatrician</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-lg italic text-white/80 mb-4">"The billing module is so easy that my receptionist learned it in 5 minutes. No more manual calculations."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-400 rounded-full"></div>
                  <div>
                    <p className="font-bold">Dr. Anita Sharma</p>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">General Physician</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h5 className="text-xl font-heading font-bold text-primary mb-2">HealFlow Technologies</h5>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Built for the Indian Healthcare Ecosystem</p>
          </div>
          <div className="flex gap-8 text-sm font-bold text-slate-400">
            <a href="#" className="hover:text-primary">Support</a>
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- UPDATED AUTH PAGE ---
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
          plan: plan || 'Trial'
        });
        
        await setDoc(doc(clinicalCollections.users, userId), newUser);
        await setDoc(doc(clinicalCollections.staff, userId), { ...newUser, specialization: 'Clinic Owner' });

        onAuth(newUser, formData.clinicName);
      } else {
        const q = query(clinicalCollections.users, where("email", "==", formData.email), where("password", "==", formData.password), limit(1));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          setError("Invalid login credentials. Please check your email/password.");
        } else {
          const userData = { ...(snap.docs[0].data() as any), id: snap.docs[0].id } as User;
          const tenantSnap = await getDocs(query(clinicalCollections.tenants, where("id", "==", userData.tenantId), limit(1)));
          const cName = !tenantSnap.empty ? (tenantSnap.docs[0].data() as any).name : "HEALFLOW CLINIC";
          onAuth(userData, cName);
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError("System failed to connect. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-body">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-heading font-black text-primary tracking-tighter">HealFlow</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">Clinical Access Unit</p>
        </div>
        <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-100 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">{mode === 'signup' ? 'Create Clinic Account' : 'Doctor Login'}</h2>
          {error && <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-4">Clinic Name</label>
                  <input required className="w-full p-5 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 ring-primary/5 font-bold" placeholder="e.g. Apollo Clinic, Tirupati" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-4">Full Name</label>
                  <input required className="w-full p-5 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 ring-primary/5 font-bold" placeholder="e.g. Dr. Rajesh Khanna" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-4">Login Email</label>
              <input required type="email" className="w-full p-5 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 ring-primary/5 font-bold" placeholder="doctor@clinic.io" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-4">Password</label>
              <input required type="password" className="w-full p-5 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 ring-primary/5 font-bold" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-6 bg-primary text-white rounded-[2rem] font-bold text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-4">
              {loading ? 'Processing...' : (mode === 'signup' ? 'Activate System' : 'Sign In Now')}
            </button>
          </form>
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <button onClick={onToggle} className="text-primary font-bold hover:underline">
              {mode === 'signup' ? 'Already have an account? Log In' : "New to HealFlow? Register Now"}
            </button>
          </div>
        </div>
        <button onClick={onBack} className="w-full mt-10 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-primary transition-all">← Back to Homepage</button>
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
          <h1 className="text-xl font-heading font-black text-primary">HF</h1>
        </header>
        <div className="p-6 md:p-10 flex-1 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard patients={patients} appointments={appointments} bills={bills} logs={[]} setActiveTab={setActiveTab} />}
          {activeTab === 'patients' && <Patients patients={patients} tenantId={currentUser!.tenantId} clinicName={clinicName} addPatient={addPatient} updatePatient={updatePatient} />}
          {activeTab === 'appointments' && <AppointmentsPage patients={patients} staff={staff} appointments={appointments} addAppointment={addAppointment} updateAppointmentStatus={updateAppointmentStatus} />}
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

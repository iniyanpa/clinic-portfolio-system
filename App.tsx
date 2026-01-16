
import React, { useState, useEffect } from 'react';
// Fix: Standardize named imports from firebase/firestore to resolve module resolution errors
import { onSnapshot, doc, setDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
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

// --- PRICING MODULE ---
const PricingModule: React.FC<{ onSelect: (plan: SubscriptionPlan) => void }> = ({ onSelect }) => (
  <section id="pricing" className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-8">
      <div className="text-center mb-16 space-y-4">
        <h3 className="text-4xl md:text-5xl font-heading text-primary uppercase">Clinical Lifecycle Licensing</h3>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Scalable Infrastructure for Modern Outpatient Centers</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col justify-between group hover:border-secondary transition-all">
          <div className="space-y-6">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em]">Evaluation Node</span>
            <h4 className="text-3xl font-heading text-primary uppercase">30-Day Pilot</h4>
            <div className="text-5xl font-bold text-primary">FREE</div>
            <ul className="space-y-4 pt-6">
              {['Full Clinical Suite', 'Single Location Registry', 'Standard Support', '30-Day Auto-Expiry'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={() => onSelect('Trial')} className="mt-10 w-full py-5 bg-primary text-white font-heading uppercase tracking-widest rounded-2xl group-hover:bg-secondary transition-all shadow-xl">Initialize Pilot</button>
        </div>
        <div className="bg-primary p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">{ICONS.Billing}</div>
          <div className="space-y-6 relative z-10">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em]">Full Deployment</span>
            <h4 className="text-3xl font-heading uppercase">Pro Annual</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">₹18,000</span>
              <span className="opacity-60 text-[9px] font-bold uppercase tracking-widest">/ Facility / Year</span>
            </div>
            <ul className="space-y-4 pt-6">
              {['Unlimited Records', 'Multi-staff RBAC Sync', 'AI Diagnostic Analysis', '365-Day Secured Registry'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold text-white/70 uppercase tracking-widest">
                  <span className="text-secondary">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={() => onSelect('Pro-Annual')} className="mt-10 w-full py-5 bg-secondary text-white font-heading uppercase tracking-widest rounded-2xl hover:bg-white hover:text-primary transition-all relative z-10 shadow-xl">Activate License</button>
        </div>
      </div>
    </div>
  </section>
);

// --- LANDING PAGE ---
const LandingPage: React.FC<{ onGetStarted: (mode: 'signin' | 'signup', plan?: SubscriptionPlan) => void }> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white font-body overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <h1 className="text-3xl font-heading tracking-widest leading-none italic text-primary">HEAL<span className="text-secondary">FLOW</span></h1>
          <div className="flex gap-4">
            <button onClick={() => onGetStarted('signin')} className="px-6 py-2 text-primary font-bold text-xs uppercase tracking-widest hover:text-secondary transition-colors">Login</button>
            <a href="#pricing" className="px-8 py-3 bg-primary text-white rounded-2xl font-heading text-xs uppercase tracking-widest shadow-xl hover:bg-secondary transition-all">Get Registry</a>
          </div>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-8 pt-48 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-[10px] font-bold uppercase tracking-[0.3em]">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
            v3.5 Clinical Stack
          </div>
          <h2 className="text-7xl lg:text-9xl font-heading text-primary leading-[0.85] uppercase tracking-tighter">THE OS FOR <br/><span className="text-secondary">ELITE</span> <br/>CLINICS.</h2>
          <p className="text-slate-500 max-w-lg text-xl leading-relaxed font-light">The definitive outpatient registry system. Unified electronic medical records, automated billing cycles, and AI diagnostic insights.</p>
          <div className="flex flex-wrap gap-6 pt-4">
            <a href="#pricing" className="px-14 py-6 bg-primary text-white rounded-[2.5rem] font-heading text-2xl uppercase tracking-widest shadow-2xl hover:bg-secondary transition-all">Deploy Now</a>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-10 bg-gradient-to-tr from-primary/10 to-secondary/10 blur-[120px] rounded-full"></div>
          <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200" className="relative z-10 rounded-[4.5rem] shadow-2xl border border-white grayscale-[0.3] hover:grayscale-0 transition-all duration-700" alt="Clinic Management" />
        </div>
      </header>

      <PricingModule onSelect={(plan) => onGetStarted('signup', plan)} />
    </div>
  );
};

// --- SUPER ADMIN DASHBOARD ---
const SuperAdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubT = onSnapshot(clinicalCollections.tenants, (snap) => setTenants(snap.docs.map(d => d.data() as Tenant)));
    const unsubU = onSnapshot(clinicalCollections.users, (snap) => setUsers(snap.docs.map(d => d.data() as User)));
    setLoading(false);
    return () => { unsubT(); unsubU(); };
  }, []);

  const toggleStatus = async (tenantId: string, current: string) => {
    const next = current === 'Active' ? 'Suspended' : 'Active';
    await updateDoc(doc(db, "tenants", tenantId), { status: next });
  };

  return (
    <div className="space-y-10 animate-in fade-in p-2 md:p-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase">Global Oversight</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Master Node Administration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">{ICONS.Patients}</div>
          <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Active Clinics</p>
          <h3 className="text-4xl font-bold mt-1">{tenants.length}</h3>
        </div>
        <div className="bg-secondary text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">{ICONS.Staff}</div>
          <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Authorized Staff</p>
          <h3 className="text-4xl font-bold mt-1">{users.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-6 text-[9px] font-bold uppercase tracking-widest text-slate-400">Clinic Registry</th>
                <th className="px-8 py-6 text-[9px] font-bold uppercase tracking-widest text-slate-400">License</th>
                <th className="px-8 py-6 text-[9px] font-bold uppercase tracking-widest text-slate-400">Owner Terminal</th>
                <th className="px-8 py-6 text-[9px] font-bold uppercase tracking-widest text-slate-400">Expiry</th>
                <th className="px-8 py-6 text-right text-[9px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map(t => {
                const owner = users.find(u => u.id === t.ownerId);
                const isExpired = new Date(t.expiryDate) < new Date();
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-primary text-sm uppercase">{t.name}</p>
                      <p className="text-[8px] text-slate-400 font-mono uppercase mt-0.5">ID: {t.id}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1 rounded-xl text-[8px] font-bold uppercase tracking-widest ${t.plan === 'Pro-Annual' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>{t.plan}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-800">{owner?.name || '---'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{owner?.email}</p>
                      <p className="text-[9px] text-secondary font-mono mt-0.5">PW: {owner?.password}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className={`text-xs font-bold ${isExpired ? 'text-red-500' : 'text-slate-700'}`}>{t.expiryDate}</p>
                      <p className={`text-[8px] font-bold uppercase mt-1 ${t.status === 'Active' ? 'text-green-500' : 'text-red-400'}`}>{t.status}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => toggleStatus(t.id, t.status)} className={`px-5 py-2 rounded-xl text-[8px] font-bold uppercase tracking-widest transition-all ${t.status === 'Active' ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'}`}>
                        {t.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [view, setView] = useState<'landing' | 'signin' | 'signup' | 'app' | 'expired' | 'super-admin'>('landing');
  const [signupPlan, setSignupPlan] = useState<SubscriptionPlan | undefined>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [staff, setStaff] = useState<User[]>([]);

  useEffect(() => {
    if (!currentUser || !currentTenant) return;
    const tId = currentTenant.id;
    // Fix: Using query and where correctly from standardized imports
    const unsubPatients = onSnapshot(query(clinicalCollections.patients, where("tenantId", "==", tId)), snap => setPatients(snap.docs.map(d => ({ ...d.data() } as Patient))));
    const unsubAppts = onSnapshot(query(clinicalCollections.appointments, where("tenantId", "==", tId)), snap => setAppointments(snap.docs.map(d => ({ ...d.data() } as Appointment))));
    const unsubRecords = onSnapshot(query(clinicalCollections.records, where("tenantId", "==", tId)), snap => setRecords(snap.docs.map(d => ({ ...d.data() } as MedicalRecord))));
    const unsubPrescriptions = onSnapshot(query(clinicalCollections.prescriptions, where("tenantId", "==", tId)), snap => setPrescriptions(snap.docs.map(d => ({ ...d.data() } as Prescription))));
    const unsubBills = onSnapshot(query(clinicalCollections.bills, where("tenantId", "==", tId)), snap => setBills(snap.docs.map(d => ({ ...d.data() } as Bill))));
    const unsubStaff = onSnapshot(query(clinicalCollections.users, where("tenantId", "==", tId)), snap => setStaff(snap.docs.map(d => ({ ...d.data() } as User))));
    return () => { unsubPatients(); unsubAppts(); unsubRecords(); unsubPrescriptions(); unsubBills(); unsubStaff(); };
  }, [currentUser, currentTenant]);

  const handleAuth = (user: User, tenant?: Tenant) => {
    if (user.role === UserRole.SUPER_ADMIN) {
      setCurrentUser(user);
      setView('super-admin');
      setActiveTab('super-admin');
      return;
    }
    if (!tenant) return;
    const now = new Date();
    const expiry = new Date(tenant.expiryDate);
    if (now > expiry || tenant.status === 'Suspended' || tenant.status === 'Expired') {
      setView('expired');
      return;
    }
    setCurrentUser(user);
    setCurrentTenant(tenant);
    setView('app');
    setActiveTab('dashboard');
  };

  const handleLogout = () => { setCurrentUser(null); setCurrentTenant(null); setView('landing'); };

  const handleAddPatient = async (p: Patient) => await setDoc(doc(db, "patients", p.id), { ...p, tenantId: currentTenant!.id });
  const handleUpdatePatient = async (p: Patient) => await updateDoc(doc(db, "patients", p.id), { ...p });
  const handleAddAppt = async (a: Appointment) => await setDoc(doc(db, "appointments", a.id), { ...a, tenantId: currentTenant!.id });
  const handleUpdateApptStatus = async (id: string, status: ApptStatus, extra?: any) => await updateDoc(doc(db, "appointments", id), { status, ...extra });
  const handleFinalizeConsultation = async (rec: MedicalRecord, px: Prescription) => {
    await setDoc(doc(db, "records", rec.id), { ...rec, tenantId: currentTenant!.id });
    await setDoc(doc(db, "prescriptions", px.id), { ...px, tenantId: currentTenant!.id });
    await handleUpdateApptStatus(rec.appointmentId, 'Completed');
  };
  const handleAddBill = async (b: Bill) => await setDoc(doc(db, "bills", b.id), { ...b, tenantId: currentTenant!.id });
  const handleDispense = async (id: string) => await updateDoc(doc(db, "prescriptions", id), { status: 'Dispensed' });
  const handleAddStaff = async (u: User) => await setDoc(doc(db, "users", u.id), { ...u, tenantId: currentTenant!.id });
  const handleUpdateStaff = async (u: User) => await updateDoc(doc(db, "users", u.id), { ...u });

  if (view === 'landing') return <LandingPage onGetStarted={(m, p) => { setView(m); setSignupPlan(p); }} />;
  
  if (view === 'expired') return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-8 text-center text-white font-heading">
      <div className="max-w-md space-y-8">
        <div className="text-secondary scale-150 mb-8 flex justify-center">{ICONS.Billing}</div>
        <h2 className="text-5xl uppercase tracking-widest leading-none">Terminal <br/> Locked</h2>
        <p className="font-body text-white/60 tracking-wider text-sm">Clinical licensing has reached its cycle end. Registry access restricted until renewal.</p>
        <button onClick={handleLogout} className="w-full py-5 bg-secondary text-white rounded-2xl text-lg uppercase tracking-widest shadow-2xl">Exit Terminal</button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white font-body text-slate-800">
      <Sidebar user={currentUser!} tenantName={currentTenant?.name || "HEALFLOW"} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-primary">{ICONS.Menu}</button>
            <h2 className="text-xl md:text-2xl font-heading text-primary uppercase">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-3">
             {currentTenant && <div className={`hidden md:block px-3 py-1 rounded-lg border text-[8px] font-bold uppercase tracking-widest ${currentTenant.plan === 'Pro-Annual' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>{currentTenant.plan} NODE • EXPIRES: {currentTenant.expiryDate}</div>}
             <img src={currentUser?.avatar} className="w-10 h-10 rounded-xl object-cover border-2 border-secondary shadow-sm" alt="Avatar" />
          </div>
        </header>
        <div className="p-4 md:p-10 flex-1 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard patients={patients} appointments={appointments} bills={bills} logs={[]} setActiveTab={setActiveTab} />}
          {activeTab === 'patients' && <Patients patients={patients} tenantId={currentTenant!.id} clinicName={currentTenant!.name} addPatient={handleAddPatient} updatePatient={handleUpdatePatient} />}
          {activeTab === 'appointments' && <AppointmentsPage patients={patients} staff={staff} appointments={appointments} addAppointment={handleAddAppt} updateAppointmentStatus={handleUpdateApptStatus} />}
          {activeTab === 'records' && <ConsultationRoom patients={patients} appointments={appointments} clinicName={currentTenant!.name} finalizeConsultation={handleFinalizeConsultation} />}
          {activeTab === 'pharmacy' && <PharmacyPage prescriptions={prescriptions} patients={patients} clinicName={currentTenant!.name} onDispense={handleDispense} />}
          {activeTab === 'billing' && <BillingPage patients={patients} appointments={appointments} records={records} prescriptions={prescriptions} bills={bills} clinicName={currentTenant!.name} addBill={handleAddBill} />}
          {activeTab === 'staff' && <StaffManagement staff={staff} addStaff={handleAddStaff} updateStaff={handleUpdateStaff} />}
          {activeTab === 'settings' && <SettingsPage />}
          {activeTab === 'super-admin' && <SuperAdminDashboard />}
        </div>
      </main>
    </div>
  );
};

export default App;

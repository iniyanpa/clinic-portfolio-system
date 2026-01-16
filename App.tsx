
import React, { useState, useEffect } from 'react';
// Fix: Correct named imports for Firestore modular SDK
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
  <section id="pricing" className="py-32 bg-slate-50 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
    <div className="max-w-7xl mx-auto px-8 relative z-10">
      <div className="text-center mb-20 space-y-4">
        <span className="text-secondary font-bold uppercase tracking-[0.4em] text-[10px]">Registry Deployment Options</span>
        <h3 className="text-5xl md:text-7xl font-heading text-primary uppercase tracking-tight">System Licensing</h3>
        <p className="text-slate-400 font-medium max-w-2xl mx-auto">Select the operational capacity for your clinical terminal. All nodes include high-speed cloud sync and AI integration.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {/* Trial Plan */}
        <div className="bg-white p-12 rounded-[4rem] border border-slate-200 flex flex-col justify-between group hover:border-secondary transition-all shadow-xl hover:shadow-2xl">
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Entry Node</span>
                <h4 className="text-4xl font-heading text-primary uppercase">30-Day Pilot</h4>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">{ICONS.Home}</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-bold text-primary">FREE</span>
              <span className="text-slate-300 font-bold text-xs uppercase">/ 30 Days</span>
            </div>
            <ul className="space-y-4 pt-8 border-t border-slate-50">
              {['Standard Clinical Suite', 'Single Registry Access', 'Automated Daily Backups', 'Trial Period Support'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span className="w-5 h-5 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-[10px]">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <button 
            onClick={() => onSelect('Trial')} 
            className="mt-12 w-full py-6 bg-slate-900 text-white font-heading uppercase tracking-widest rounded-3xl group-hover:bg-primary transition-all shadow-lg active:scale-[0.98]"
          >
            Initialize Pilot Terminal
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-primary p-12 rounded-[4rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-[2] pointer-events-none">{ICONS.Billing}</div>
          <div className="space-y-8 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] block mb-1">Production Node</span>
                <h4 className="text-4xl font-heading uppercase">Pro Annual</h4>
              </div>
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-secondary shadow-inner">{ICONS.Staff}</div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold">₹18,000</span>
              <span className="opacity-40 text-[10px] font-bold uppercase tracking-widest">/ Year</span>
            </div>
            <ul className="space-y-4 pt-8 border-t border-white/10">
              {['Unlimited Case Records', 'Multi-staff RBAC Matrix', 'AI Diagnostic Analysis', '365-Day Secured Node', 'Priority Technical Support'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold text-white/70 uppercase tracking-widest">
                  <span className="w-5 h-5 bg-secondary text-white rounded-full flex items-center justify-center text-[10px]">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <button 
            onClick={() => onSelect('Pro-Annual')} 
            className="mt-12 w-full py-6 bg-secondary text-white font-heading uppercase tracking-widest rounded-3xl hover:bg-white hover:text-primary transition-all relative z-10 shadow-xl active:scale-[0.98]"
          >
            Deploy Pro Terminal
          </button>
        </div>
      </div>
    </div>
  </section>
);

// --- LANDING PAGE ---
const LandingPage: React.FC<{ onGetStarted: (mode: 'signin' | 'signup', plan?: SubscriptionPlan) => void }> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white font-body overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-heading tracking-[0.2em] leading-none italic text-primary">HEAL<span className="text-secondary">FLOW</span></h1>
          <div className="flex items-center gap-6">
            <button onClick={() => onGetStarted('signin')} className="px-6 py-2 text-primary font-bold text-xs uppercase tracking-widest hover:text-secondary transition-colors border-r border-slate-200">Sign In</button>
            <a href="#pricing" className="px-10 py-3 bg-primary text-white rounded-2xl font-heading text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-secondary transition-all hover:translate-y-[-2px] active:translate-y-0">Get Licensed</a>
          </div>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-8 pt-56 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-12">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/5 text-primary rounded-full text-[10px] font-bold uppercase tracking-[0.4em] border border-primary/10">
            <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_#29baed]"></span>
            v3.5 Clinical Stack • Active Node
          </div>
          <h2 className="text-8xl lg:text-[10rem] font-heading text-primary leading-[0.8] uppercase tracking-tighter">THE OS <br/>FOR <span className="text-secondary">ELITE</span> <br/>CLINICS.</h2>
          <p className="text-slate-500 max-w-lg text-xl leading-relaxed font-light border-l-4 border-secondary pl-8">The definitive outpatient registry system. Unified electronic medical records, automated billing cycles, and AI diagnostic insights.</p>
          <div className="flex flex-wrap gap-6 pt-6">
            <a href="#pricing" className="px-16 py-7 bg-primary text-white rounded-[3rem] font-heading text-2xl uppercase tracking-widest shadow-2xl hover:bg-secondary transition-all hover:scale-[1.02] active:scale-[0.98]">Deploy Registry Now</a>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-10 bg-gradient-to-tr from-primary/10 to-secondary/20 blur-[150px] rounded-full group-hover:opacity-100 opacity-70 transition-opacity"></div>
          <div className="relative z-10 rounded-[5rem] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-slate-100">
            <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 scale-[1.01] group-hover:scale-105" alt="Clinic Interface" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="absolute bottom-10 -left-10 z-20 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-50 animate-bounce duration-[3000ms] hidden lg:block">
            <div className="text-secondary mb-2">{ICONS.Staff}</div>
            <p className="text-primary font-heading uppercase text-sm">AI Ready</p>
          </div>
        </div>
      </header>

      <PricingModule onSelect={(plan) => onGetStarted('signup', plan)} />
    </div>
  );
};

// --- AUTH PAGE ---
const AuthPage: React.FC<{ mode: 'signin' | 'signup', plan?: SubscriptionPlan, onAuth: (user: User, tenant?: Tenant) => void, onToggle: () => void, onGoBack: () => void }> = ({ mode, plan, onAuth, onToggle, onGoBack }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', clinicName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const tenantId = `TEN-${Date.now().toString().slice(-6)}`;
        const userId = `USR-${Date.now().toString().slice(-6)}`;
        const days = plan === 'Pro-Annual' ? 365 : 30;
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);

        const newTenant: Tenant = {
          id: tenantId,
          name: formData.clinicName,
          createdAt: new Date().toISOString(),
          ownerId: userId,
          plan: plan || 'Trial',
          status: 'Active',
          expiryDate: expiry.toISOString().split('T')[0]
        };

        const newUser: User = {
          id: userId,
          tenantId,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: UserRole.ADMIN,
          avatar: `https://picsum.photos/seed/${userId}/100/100`
        };

        await setDoc(doc(db, "tenants", tenantId), newTenant);
        await setDoc(doc(db, "users", userId), newUser);
        onAuth(newUser, newTenant);
      } else {
        const q = query(clinicalCollections.users, where("email", "==", formData.email), where("password", "==", formData.password));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const user = snap.docs[0].data() as User;
          if (user.role === UserRole.SUPER_ADMIN) {
             onAuth(user);
             return;
          }
          const tenantSnap = await getDocs(query(clinicalCollections.tenants, where("id", "==", user.tenantId)));
          const tenant = tenantSnap.docs[0].data() as Tenant;
          onAuth(user, tenant);
        } else {
          alert("Access Denied: Invalid Terminal Credentials.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terminal Sync Failure. Please verify network status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative font-body">
      <button onClick={onGoBack} className="absolute top-10 left-10 text-primary hover:text-secondary flex items-center gap-2 font-heading uppercase text-sm tracking-widest transition-all">
        {ICONS.Home} Exit to Web
      </button>
      
      <div className="w-full max-w-2xl flex flex-col items-center">
        <div className="flex flex-col items-center mb-16 space-y-2">
          <h1 className="text-5xl font-heading tracking-[0.3em] italic text-primary">HEAL<span className="text-secondary">FLOW</span></h1>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">Clinical Infrastructure Unit</span>
        </div>
        
        <div className="bg-white w-full rounded-[4rem] p-16 shadow-[0_40px_80px_-20px_rgba(41,55,140,0.15)] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
          
          <div className="mb-12">
            <h2 className="text-5xl font-heading text-primary text-center uppercase tracking-widest mb-2">
              {mode === 'signup' ? `Setup Terminal` : 'System Access'}
            </h2>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              {mode === 'signup' ? `Initializing ${plan} Clinical Node` : 'Enter Administrative Security Key'}
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
              {loading ? (
                <>
                  <span className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Syncing...
                </>
              ) : (mode === 'signup' ? 'Deploy Terminal' : 'Authenticate')}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-slate-50 text-center">
            <button onClick={onToggle} className="text-[10px] font-bold text-primary hover:text-secondary transition-colors uppercase tracking-[0.2em] decoration-secondary decoration-2 underline-offset-8 hover:underline">
              {mode === 'signup' ? 'Already Licensed? Sign In' : 'New Clinical User? Select a Plan First'}
            </button>
          </div>
        </div>

        {mode === 'signin' && (
          <div className="mt-12 p-8 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-slate-200 text-center shadow-sm">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Sandbox Credentials</p>
            <p className="text-xs text-slate-500 flex gap-4 justify-center">
              <span>User: <span className="font-bold text-slate-700">admin@healflow.io</span></span>
              <span className="w-px h-3 bg-slate-200 my-auto"></span>
              <span>Pass: <span className="font-bold text-slate-700">admin123</span></span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUPER ADMIN DASHBOARD ---
const SuperAdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const unsubT = onSnapshot(clinicalCollections.tenants, (snap) => setTenants(snap.docs.map(d => d.data() as Tenant)));
    const unsubU = onSnapshot(clinicalCollections.users, (snap) => setUsers(snap.docs.map(d => d.data() as User)));
    return () => { unsubT(); unsubU(); };
  }, []);

  const toggleStatus = async (tenantId: string, current: string) => {
    const next = current === 'Active' ? 'Suspended' : 'Active';
    await updateDoc(doc(db, "tenants", tenantId), { status: next });
  };

  return (
    <div className="space-y-12 animate-in fade-in p-4 md:p-10">
      <div>
        <h2 className="text-5xl font-heading text-primary uppercase tracking-tight">Global Oversight</h2>
        <p className="subheading text-secondary font-bold text-[10px] tracking-[0.4em] uppercase">Master Node Control Center</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-primary text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">{ICONS.Patients}</div>
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em]">Operational Nodes</p>
          <h3 className="text-6xl font-bold mt-4 font-heading">{tenants.length}</h3>
        </div>
        <div className="bg-secondary text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">{ICONS.Staff}</div>
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em]">Managed Identities</p>
          <h3 className="text-6xl font-bold mt-4 font-heading">{users.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-12 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Node/Facility</th>
                <th className="px-12 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Licensing</th>
                <th className="px-12 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Cycle End</th>
                <th className="px-12 py-8 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Terminal Owner</th>
                <th className="px-12 py-8 text-right text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map(t => {
                const owner = users.find(u => u.id === t.ownerId);
                const isExpired = new Date(t.expiryDate) < new Date();
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-12 py-10">
                      <p className="font-bold text-primary text-base uppercase tracking-wider">{t.name}</p>
                      <p className="text-[9px] text-slate-400 font-mono uppercase mt-1">ID: {t.id}</p>
                    </td>
                    <td className="px-12 py-10">
                      <span className={`px-5 py-1.5 rounded-2xl text-[9px] font-bold uppercase tracking-widest ${t.plan === 'Pro-Annual' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-500'}`}>{t.plan}</span>
                    </td>
                    <td className="px-12 py-10">
                      <p className={`text-sm font-bold ${isExpired ? 'text-red-500' : 'text-slate-700'}`}>{t.expiryDate}</p>
                      <p className={`text-[8px] font-bold uppercase mt-1 ${t.status === 'Active' ? 'text-green-500' : 'text-red-400'}`}>{t.status}</p>
                    </td>
                    <td className="px-12 py-10">
                      <p className="text-sm font-bold text-slate-800">{owner?.name || '---'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{owner?.email}</p>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <button 
                        onClick={() => toggleStatus(t.id, t.status)} 
                        className={`px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${t.status === 'Active' ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'}`}
                      >
                        {t.status === 'Active' ? 'Suspend Node' : 'Initialize Node'}
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

// --- MAIN APP ---
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [view, setView] = useState<'landing' | 'signin' | 'signup' | 'app' | 'expired' | 'super-admin'>('landing');
  const [signupPlan, setSignupPlan] = useState<SubscriptionPlan | undefined>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core Clinical State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [staff, setStaff] = useState<User[]>([]);

  useEffect(() => {
    if (!currentUser || !currentTenant) return;
    const tId = currentTenant.id;
    
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

  const handleLogout = () => { 
    setCurrentUser(null); 
    setCurrentTenant(null); 
    setView('landing'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Data Actions
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

  if (view === 'landing') return <LandingPage onGetStarted={(m, p) => { setView(m); setSignupPlan(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />;
  if (view === 'signin' || view === 'signup') return <AuthPage mode={view} plan={signupPlan} onAuth={handleAuth} onToggle={() => setView(view === 'signin' ? 'signup' : 'signin')} onGoBack={() => setView('landing')} />;
  
  if (view === 'expired') return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-8 text-center text-white font-heading">
      <div className="max-w-md space-y-12 animate-in zoom-in">
        <div className="text-secondary scale-[2.5] mb-12 flex justify-center">{ICONS.Billing}</div>
        <h2 className="text-7xl uppercase tracking-widest leading-none">Node Cycle <br/> Terminated</h2>
        <p className="font-body text-white/50 tracking-widest text-sm uppercase leading-relaxed">Your clinical licensing has reached its lifecycle end. Registry access restricted until node renewal.</p>
        <button onClick={handleLogout} className="w-full py-7 bg-secondary text-white rounded-[2.5rem] text-xl font-heading uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Return to Entry</button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white font-body text-slate-800">
      <Sidebar user={currentUser!} tenantName={currentTenant?.name || "HEALFLOW"} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="bg-white/95 backdrop-blur-3xl border-b border-slate-100 sticky top-0 z-30 px-8 py-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 text-primary bg-slate-50 rounded-2xl">{ICONS.Menu}</button>
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-secondary uppercase tracking-[0.5em]">{currentTenant?.name || "Registry Core"}</span>
              <h2 className="text-2xl md:text-3xl font-heading text-primary uppercase tracking-tight leading-none">{activeTab.replace('-', ' ')}</h2>
            </div>
          </div>
          <div className="flex items-center gap-5">
             {currentTenant && (
               <div className={`hidden md:flex flex-col items-end gap-1 px-5 py-2 rounded-2xl border ${currentTenant.plan === 'Pro-Annual' ? 'bg-primary/5 border-primary/10' : 'bg-slate-50 border-slate-100'}`}>
                 <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${currentTenant.plan === 'Pro-Annual' ? 'text-primary' : 'text-slate-400'}`}>{currentTenant.plan} NODE ACTIVE</span>
                 <span className="text-[10px] font-mono text-slate-500">EXPIRES: {currentTenant.expiryDate}</span>
               </div>
             )}
             <div className="relative group">
               <img src={currentUser?.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-secondary shadow-lg group-hover:scale-110 transition-transform cursor-pointer" alt="Avatar" />
               <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
             </div>
          </div>
        </header>

        <div className="p-6 md:p-12 flex-1 max-w-7xl mx-auto w-full pb-32">
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

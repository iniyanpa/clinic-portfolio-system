
import React, { useState, useEffect } from 'react';
import { onSnapshot, doc, setDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { db, clinicalCollections } from './firebase';
import { UserRole, User, Patient, Appointment, MedicalRecord, Bill, ApptStatus, CommunicationLog, Prescription, Tenant } from './types';
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

// --- ENHANCED LANDING PAGE COMPONENTS ---

const LandingPage: React.FC<{ onGetStarted: (mode: 'signin' | 'signup') => void }> = ({ onGetStarted }) => {
  const [inquiry, setInquiry] = useState({ name: '', email: '', clinic: '', role: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setInquiry({ name: '', email: '', clinic: '', role: '', message: '' });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-body overflow-x-hidden selection:bg-secondary selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <h1 className="text-3xl font-heading tracking-widest leading-none italic text-primary">
            SLS<span className="text-secondary">HEALFLOW</span>
          </h1>
          <div className="flex gap-4">
            <button onClick={() => onGetStarted('signin')} className="px-6 py-2 text-primary font-bold text-xs uppercase tracking-widest hover:text-secondary transition-colors">Login</button>
            <button onClick={() => onGetStarted('signup')} className="px-8 py-3 bg-primary text-white rounded-2xl font-heading text-xs uppercase tracking-widest shadow-xl hover:bg-secondary transition-all active:scale-95">Open Terminal</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-8 pt-48 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10 animate-in slide-in-from-left-12 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-[10px] font-bold uppercase tracking-[0.3em] border border-secondary/20">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
            Version 2026.4 Now Active
          </div>
          <h2 className="text-7xl lg:text-9xl font-heading text-primary leading-[0.85] uppercase tracking-tighter">
            THE OS FOR <br/>
            <span className="text-secondary">MODERN</span> <br/>
            CLINICS.
          </h2>
          <p className="text-slate-500 max-w-lg text-xl leading-relaxed font-light">
            Empowering outpatient excellence with unified patient registries, AI-driven diagnostics, and seamless multi-tenant financial infrastructure.
          </p>
          <div className="flex flex-wrap gap-6 pt-4">
            <button onClick={() => onGetStarted('signup')} className="px-14 py-6 bg-primary text-white rounded-[2.5rem] font-heading text-2xl uppercase tracking-widest shadow-2xl hover:bg-secondary hover:scale-105 transition-all">Start 30-Day Pilot</button>
            <a href="#demo" className="px-14 py-6 border-2 border-slate-100 text-slate-400 rounded-[2.5rem] font-heading text-2xl uppercase tracking-widest hover:border-primary hover:text-primary transition-all">See the Stack</a>
          </div>
        </div>
        <div className="relative animate-in zoom-in duration-1000 delay-200">
          <div className="absolute -inset-10 bg-gradient-to-tr from-primary to-secondary opacity-10 blur-[120px] rounded-full"></div>
          <div className="relative z-10 p-4 bg-white rounded-[5rem] shadow-2xl border-t border-slate-50">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200" 
              className="rounded-[4.5rem] grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
              alt="Clinical Interface Preview" 
            />
          </div>
        </div>
      </header>

      {/* Clinical Pillars */}
      <section className="bg-white py-32 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                { title: 'Intelligence', value: 'Gemini-3 Pro', desc: 'Real-time differential diagnosis and clinical insight generation embedded in every consultation.' },
                { title: 'Security', value: 'HIPAA 2026', desc: 'Next-gen data isolation and encryption protocols ensuring patient confidentiality across all nodes.' },
                { title: 'Velocity', value: 'Instant Triage', desc: 'Optimize patient flow with automated waiting area management and digital Rx dispatch.' }
              ].map((p, i) => (
                <div key={i} className="space-y-4">
                  <span className="text-xs font-bold text-secondary uppercase tracking-[0.3em]">{p.title}</span>
                  <h4 className="text-3xl font-heading text-primary uppercase">{p.value}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Case Study: The Tirupati Project */}
      <section className="py-40 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-8">
              <div className="p-10 bg-slate-50 rounded-[3rem] space-y-2">
                <h5 className="text-5xl font-heading text-primary">42%</h5>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wait Time Reduction</p>
              </div>
              <div className="p-10 bg-primary text-white rounded-[3rem] space-y-2">
                <h5 className="text-5xl font-heading text-secondary">100%</h5>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Digital Compliance</p>
              </div>
              <div className="p-10 bg-secondary text-white rounded-[3rem] space-y-2 col-span-2">
                <h5 className="text-5xl font-heading text-white">15k+</h5>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Monthly Patient Registry Nodes</p>
              </div>
            </div>
          </div>
          <div className="space-y-8 order-1 lg:order-2">
            <span className="subheading text-secondary font-bold text-xs tracking-[0.5em] uppercase">Impact Analysis</span>
            <h3 className="text-5xl font-heading text-primary uppercase leading-none tracking-tight">The Tirupati <br/>Expansion Success.</h3>
            <p className="text-slate-500 text-lg leading-relaxed">
              In early 2025, the Sri Venkateswara Medical Center deployed SLS HealFlow to unify their 12 satellite clinics. Within 6 months, administrative overhead dropped by 30%, and patient satisfaction scores reached an all-time high of 4.9/5.
            </p>
            <p className="text-slate-500 italic border-l-4 border-secondary pl-6">
              "HealFlow didn't just digitize our records; it transformed our clinical workflow. The transition from checked-in to consult is now frictionless."
              <br/>
              <span className="font-bold text-primary block mt-4 NOT-italic text-sm uppercase tracking-widest">— Dr. Krishna Rao, Chief of Operations</span>
            </p>
          </div>
        </div>
      </section>

      {/* About Us: The Vision */}
      <section className="bg-primary py-40 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center space-y-12">
          <h3 className="text-5xl md:text-7xl font-heading uppercase tracking-widest leading-none">Built by Doctors, <br/>For Doctors.</h3>
          <p className="text-xl text-white/70 leading-relaxed font-light">
            Founded in Tirupati by a consortium of physicians and systems engineers, SLS HealFlow was born from the realization that outpatient care requires its own unique operating logic. We don't build generic software; we build clinical terminals that respect the physician's time and the patient's journey.
          </p>
          <div className="flex justify-center gap-12 pt-8">
             <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">{ICONS.Staff}</div>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-secondary">Founded 2024</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">{ICONS.Records}</div>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-secondary">Tirupati Headquartered</span>
             </div>
          </div>
        </div>
      </section>

      {/* Call to Action with Detailed Form */}
      <section className="py-40 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
            <div className="space-y-10">
               <h3 className="text-5xl font-heading text-primary uppercase leading-none">Inquiry Hub</h3>
               <p className="text-slate-400 text-lg leading-relaxed">
                 Whether you are a solo practitioner or a multi-location hospital trust, our clinical consultants are ready to tailor a terminal environment for your specific needs.
               </p>
               <div className="space-y-6">
                 {[
                   { icon: ICONS.Mail, text: 'deploy@slshealflow.com' },
                   { icon: ICONS.Appointments, text: 'Visit our Tirupati SV Hub' },
                   { icon: ICONS.Billing, text: 'Custom Enterprise Quoting Available' }
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-xs">
                     <span className="text-secondary">{item.icon}</span>
                     {item.text}
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100">
              {formSubmitted ? (
                <div className="py-20 text-center animate-in zoom-in">
                  <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">✓</div>
                  <h4 className="text-2xl font-heading text-primary uppercase tracking-widest mb-2">Transmission Received</h4>
                  <p className="text-slate-400 text-sm">A clinical engineer will contact you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Lead Name</label>
                      <input required className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm" value={inquiry.name} onChange={e => setInquiry({...inquiry, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Professional Email</label>
                      <input required type="email" className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm" value={inquiry.email} onChange={e => setInquiry({...inquiry, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinic / Hospital Name</label>
                    <input required className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm" value={inquiry.clinic} onChange={e => setInquiry({...inquiry, clinic: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Message / Requirement</label>
                    <textarea rows={4} className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm" value={inquiry.message} onChange={e => setInquiry({...inquiry, message: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full py-6 bg-secondary text-white font-heading uppercase text-xl tracking-[0.2em] rounded-3xl shadow-xl hover:bg-primary transition-all active:scale-95">
                    Request Full Walkthrough
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left space-y-4">
             <h1 className="text-4xl font-heading tracking-widest leading-none italic text-primary">
                SLS<span className="text-secondary">HEALFLOW</span>
             </h1>
             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">Tirupati SV Area Hub Hub • Established 2024</p>
          </div>
          <div className="flex gap-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <a href="#" className="hover:text-primary transition-colors">Privacy Protocol 2026</a>
             <a href="#" className="hover:text-primary transition-colors">Terms of Terminal 2026</a>
             <a href="#" className="hover:text-primary transition-colors">HIPAA Governance</a>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">© 2026 SLS ENTERPRISE</p>
        </div>
      </footer>
    </div>
  );
};

const AuthPage: React.FC<{ mode: 'signin' | 'signup', onAuth: (user: User, tenant: Tenant) => void, onToggle: () => void, onGoBack: () => void }> = ({ mode, onAuth, onToggle, onGoBack }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', clinicName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const tenantId = `TEN-${Date.now().toString().slice(-6)}`;
        const userId = `USR-${Date.now().toString().slice(-6)}`;
        
        const newTenant: Tenant = {
          id: tenantId,
          name: formData.clinicName,
          createdAt: new Date().toISOString(),
          ownerId: userId
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
          const tenantSnap = await getDocs(query(clinicalCollections.tenants, where("id", "==", user.tenantId)));
          const tenant = tenantSnap.docs[0].data() as Tenant;
          onAuth(user, tenant);
        } else {
          alert("Invalid credentials.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative">
      <button 
        onClick={onGoBack} 
        className="absolute top-10 left-10 text-white/50 hover:text-white flex items-center gap-2 font-heading uppercase text-xs tracking-widest transition-all"
      >
        {ICONS.Home} Back to Home
      </button>

      <div className="bg-white w-full max-w-md rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in duration-300">
        <h2 className="text-4xl font-heading text-primary text-center uppercase tracking-widest mb-2">
          {mode === 'signup' ? 'New Clinic' : 'Sign In'}
        </h2>
        <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-10">Access the Clinical Stack</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div className="space-y-4">
              <input required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="Clinic / Hospital Name" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} />
              <input required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="Administrator Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <input required type="email" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="Work Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input required type="password" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <button type="submit" disabled={loading} className="w-full py-5 bg-primary text-white rounded-2xl font-heading text-xl uppercase tracking-widest shadow-xl hover:bg-secondary transition-all">
            {loading ? 'Processing...' : (mode === 'signup' ? 'Create Account' : 'Authenticate')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={onToggle} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary">
            {mode === 'signup' ? 'Already have a terminal? Sign In' : 'New facility? Create your account'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [view, setView] = useState<'landing' | 'signin' | 'signup' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Scoped Data States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [commLogs, setCommLogs] = useState<CommunicationLog[]>([]);

  useEffect(() => {
    if (!currentUser || !currentTenant) return;

    const tId = currentTenant.id;
    const qPatients = query(clinicalCollections.patients, where("tenantId", "==", tId));
    const qAppts = query(clinicalCollections.appointments, where("tenantId", "==", tId));
    const qRecords = query(clinicalCollections.records, where("tenantId", "==", tId));
    const qPrescriptions = query(clinicalCollections.prescriptions, where("tenantId", "==", tId));
    const qBills = query(clinicalCollections.bills, where("tenantId", "==", tId));
    const qStaff = query(clinicalCollections.users, where("tenantId", "==", tId));
    const qLogs = query(clinicalCollections.logs, where("tenantId", "==", tId));

    const unsubPatients = onSnapshot(qPatients, snap => setPatients(snap.docs.map(d => ({ ...d.data() } as Patient))));
    const unsubAppts = onSnapshot(qAppts, snap => setAppointments(snap.docs.map(d => ({ ...d.data() } as Appointment))));
    const unsubRecords = onSnapshot(qRecords, snap => setRecords(snap.docs.map(d => ({ ...d.data() } as MedicalRecord))));
    const unsubPrescriptions = onSnapshot(qPrescriptions, snap => setPrescriptions(snap.docs.map(d => ({ ...d.data() } as Prescription))));
    const unsubBills = onSnapshot(qBills, snap => setBills(snap.docs.map(d => ({ ...d.data() } as Bill))));
    const unsubStaff = onSnapshot(qStaff, snap => setStaff(snap.docs.map(d => ({ ...d.data() } as User))));
    const unsubLogs = onSnapshot(qLogs, snap => setCommLogs(snap.docs.map(d => ({ ...d.data() } as CommunicationLog))));

    return () => {
      unsubPatients(); unsubAppts(); unsubRecords(); unsubPrescriptions(); unsubBills(); unsubStaff(); unsubLogs();
    };
  }, [currentUser, currentTenant]);

  const handleAuth = (user: User, tenant: Tenant) => {
    setCurrentUser(user);
    setCurrentTenant(tenant);
    setView('app');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTenant(null);
    setView('landing');
  };

  // Scoped DB Handlers
  const handleAddPatient = async (p: Patient) => {
    await setDoc(doc(db, "patients", p.id), { ...p, tenantId: currentTenant!.id });
  };

  const handleUpdatePatient = async (p: Patient) => {
    await updateDoc(doc(db, "patients", p.id), { ...p });
  };

  const handleAddAppt = async (a: Appointment) => {
    await setDoc(doc(db, "appointments", a.id), { ...a, tenantId: currentTenant!.id });
  };

  const handleUpdateApptStatus = async (id: string, status: ApptStatus, extra?: any) => {
    await updateDoc(doc(db, "appointments", id), { status, ...extra });
  };

  const handleFinalizeConsultation = async (rec: MedicalRecord, px: Prescription) => {
    await setDoc(doc(db, "records", rec.id), { ...rec, tenantId: currentTenant!.id });
    await setDoc(doc(db, "prescriptions", px.id), { ...px, tenantId: currentTenant!.id });
    await handleUpdateApptStatus(rec.appointmentId, 'Completed');
  };

  const handleAddBill = async (b: Bill) => {
    await setDoc(doc(db, "bills", b.id), { ...b, tenantId: currentTenant!.id });
  };

  const handleDispense = async (id: string) => {
    await updateDoc(doc(db, "prescriptions", id), { status: 'Dispensed' });
  };

  const handleAddStaff = async (u: User) => {
    await setDoc(doc(db, "users", u.id), { ...u, tenantId: currentTenant!.id });
  };

  const handleUpdateStaff = async (u: User) => {
    await updateDoc(doc(db, "users", u.id), { ...u });
  };

  if (view === 'landing') return <LandingPage onGetStarted={setView} />;
  if (view === 'signin' || view === 'signup') return <AuthPage mode={view} onAuth={handleAuth} onToggle={() => setView(view === 'signin' ? 'signup' : 'signin')} onGoBack={() => setView('landing')} />;

  return (
    <div className="flex min-h-screen bg-slate-50 font-body text-slate-800">
      <Sidebar 
        user={currentUser!} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-300">
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30 px-6 md:px-10 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-primary hover:bg-slate-100 rounded-lg">
              {ICONS.Menu}
            </button>
            <div className="flex flex-col">
              <span className="subheading text-[8px] text-secondary font-bold tracking-[0.4em] uppercase">{currentTenant?.name}</span>
              <h2 className="text-lg md:text-2xl font-heading text-primary uppercase tracking-wide leading-none">{activeTab.replace('-', ' ')}</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 mr-4 px-3 py-1 bg-primary text-white rounded-lg text-[8px] font-bold uppercase tracking-widest shadow-lg">
                Terminal Scoped
             </div>
             <img src={currentUser?.avatar} className="w-10 h-10 rounded-xl object-cover border-2 border-secondary shadow-sm" alt="Avatar" />
          </div>
        </header>

        <div className="p-4 md:p-10 w-full max-w-7xl mx-auto flex-1 pb-20">
          {activeTab === 'dashboard' && <Dashboard patients={patients} appointments={appointments} bills={bills} logs={commLogs} setActiveTab={setActiveTab} />}
          {activeTab === 'patients' && <Patients patients={patients} addPatient={handleAddPatient} updatePatient={handleUpdatePatient} />}
          {activeTab === 'appointments' && <AppointmentsPage patients={patients} staff={staff} appointments={appointments} addAppointment={handleAddAppt} updateAppointmentStatus={handleUpdateApptStatus} />}
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

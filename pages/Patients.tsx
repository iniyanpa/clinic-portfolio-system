
import React, { useState, useEffect, useMemo } from 'react';
// Fix: Import modular functions from firebase/firestore
import { onSnapshot, query, where } from "firebase/firestore";
import { ICONS } from '../constants';
import { Patient, MedicalRecord } from '../types';
import { clinicalCollections } from '../firebase';

interface PatientsProps {
  patients: Patient[];
  tenantId: string;
  clinicName: string;
  addPatient: (p: Patient) => Promise<void>;
  updatePatient: (p: Patient) => Promise<void>;
}

const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 
  'A1+', 'A1-', 'A2+', 'A2-', 'A1B+', 'A1B-', 'A2B+', 'A2B-',
  'Bombay Blood Group', 'Rare', 'Unknown'
];

const Patients: React.FC<PatientsProps> = ({ patients, tenantId, clinicName, addPatient, updatePatient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegDate, setFilterRegDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '', 
    dob: '', 
    gender: 'Male' as any,
    phone: '', 
    email: '', 
    bloodGroup: '', 
    address: '',
    guardianName: '', 
    fatherSpouseName: '',
    motherName: ''
  });

  useEffect(() => {
    if (viewingPatientId) {
      setIsLoadingRecords(true);
      const q = query(clinicalCollections.records, where("patientId", "==", viewingPatientId));
      
      // Fix: Explicitly type the snapshot parameter to avoid DocumentSnapshot/QuerySnapshot confusion
      const unsub = onSnapshot(q, (snapshot: any) => {
        const fetched = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as MedicalRecord));
        const sorted = fetched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPatientRecords(sorted);
        setIsLoadingRecords(false);
      }, (err) => {
        console.error("Firestore History Error:", err);
        setPatientRecords([]);
        setIsLoadingRecords(false);
      });
      return () => unsub();
    } else {
      setPatientRecords([]);
    }
  }, [viewingPatientId]);

  useEffect(() => {
    if (editingPatient) {
      setFormData({
        firstName: editingPatient.firstName,
        lastName: editingPatient.lastName,
        dob: editingPatient.dateOfBirth,
        gender: editingPatient.gender,
        phone: editingPatient.phone,
        email: editingPatient.email,
        bloodGroup: editingPatient.bloodGroup,
        address: editingPatient.address,
        guardianName: editingPatient.guardianName || '',
        fatherSpouseName: editingPatient.fatherSpouseName || '',
        motherName: editingPatient.motherName || ''
      });
      setIsModalOpen(true);
    }
  }, [editingPatient]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.dob || !formData.bloodGroup || !formData.fatherSpouseName || !formData.phone) {
      alert("Please fill all mandatory fields.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingPatient) {
        await updatePatient({ ...editingPatient, ...formData, dateOfBirth: formData.dob } as Patient);
      } else {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const nextId = `HF-${timestamp}${random}`;
        
        await addPatient({
          id: nextId,
          tenantId: tenantId,
          ...formData,
          dateOfBirth: formData.dob,
          history: [],
          registeredDate: new Date().toISOString().split('T')[0]
        } as Patient);
      }
      closeModal();
    } catch (err) {
      alert("Database error.");
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
    setFormData({ 
      firstName: '', lastName: '', dob: '', gender: 'Male', 
      phone: '', email: '', bloodGroup: '', address: '',
      guardianName: '', fatherSpouseName: '', motherName: ''
    });
  };

  const filtered = useMemo(() => {
    return patients.filter(p => {
      const term = searchTerm.toLowerCase();
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const phone = p.phone || '';
      const email = p.email?.toLowerCase() || '';
      const id = p.id.toLowerCase();
      
      const matchesSearch = fullName.includes(term) || id.includes(term) || phone.includes(searchTerm) || email.includes(term);
      const matchesDate = filterRegDate ? p.registeredDate === filterRegDate : true;
      return matchesSearch && matchesDate;
    });
  }, [patients, searchTerm, filterRegDate]);

  return (
    <div className="space-y-6 flex flex-col xl:flex-row gap-8">
      <div className="flex-1 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading text-primary uppercase leading-tight">Patient Registry</h2>
            <p className="subheading text-secondary font-bold text-[10px] tracking-widest uppercase">Master Database Node • Active Terminal</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-8 py-3 rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-secondary transition-all font-heading uppercase tracking-widest text-xs"
          >
            {ICONS.Plus} Register New Case
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                {ICONS.Search}
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-4 focus:ring-secondary/10 transition-all font-medium text-slate-800 placeholder:text-slate-300 placeholder:font-normal"
                placeholder="Search ID, Name, Phone or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Registered Date</span>
              <input 
                type="date" 
                className="p-3 border border-slate-200 rounded-xl text-[10px] font-bold text-primary bg-white outline-none focus:ring-2 ring-primary/5 uppercase" 
                value={filterRegDate}
                onChange={(e) => setFilterRegDate(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Case ID</th>
                  <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Profile</th>
                  <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Matrix</th>
                  <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry Status</th>
                  <th className="px-6 py-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-6 py-4">
                       <span className="font-heading text-sm text-primary font-bold tracking-widest bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">#{p.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{p.firstName} {p.lastName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{p.gender} • {p.dateOfBirth} • {p.bloodGroup}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[10px] font-bold text-slate-600 font-mono tracking-tighter">{p.phone}</p>
                        <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">{p.email || 'NO_ENCRYPTED_EMAIL'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[8px] font-bold uppercase tracking-widest border border-green-100 shadow-sm">
                        <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                        Active Node
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => setViewingPatientId(p.id)} 
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-primary border border-slate-100 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white hover:shadow-lg transition-all active:scale-95"
                          title="View History"
                        >
                          {ICONS.Records} <span className="hidden md:inline">Logs</span>
                        </button>
                        <button 
                          onClick={() => setEditingPatient(p)} 
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-secondary hover:text-white hover:shadow-lg transition-all active:scale-95"
                          title="Edit Registry"
                        >
                          {ICONS.Settings} <span className="hidden md:inline">Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-20 text-center space-y-4">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">{ICONS.Search}</div>
               <div>
                  <p className="text-slate-400 font-heading uppercase tracking-widest text-lg">No Matching Records</p>
                  <p className="text-slate-300 text-xs italic">Registry query returned zero nodes for "{searchTerm}"</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/20 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-primary p-10 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                {ICONS.Patients}
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-heading uppercase tracking-widest">{editingPatient ? 'Update Case File' : 'Initialize Patient Node'}</h3>
                <p className="text-[9px] font-bold opacity-60 uppercase mt-2 tracking-[0.4em]">Core Registry Deployment Unit</p>
              </div>
              <button onClick={closeModal} className="relative z-10 text-4xl leading-none hover:text-secondary transition-colors">×</button>
            </div>
            
            <form onSubmit={handleRegister} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">First Name *</label>
                  <input required className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100 focus:ring-4 ring-primary/5 transition-all" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Last Name *</label>
                  <input required className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100 focus:ring-4 ring-primary/5 transition-all" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Date of Birth *</label>
                  <input required type="date" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100 focus:ring-4 ring-primary/5 transition-all" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Gender</label>
                  <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold uppercase text-slate-900 border border-slate-100 focus:ring-4 ring-primary/5" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Blood Group *</label>
                  <select required className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold uppercase text-slate-900 border border-slate-100 focus:ring-4 ring-primary/5" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                    <option value="">Select Group...</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Phone Number *</label>
                  <input required className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm font-mono text-slate-900 border border-slate-100 focus:ring-4 ring-primary/5 transition-all" placeholder="+91" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Registry Email (Optional)</label>
                  <input type="email" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100 focus:ring-4 ring-primary/5 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Father / Spouse Name *</label>
                  <input required className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100 focus:ring-4 ring-primary/5 transition-all" value={formData.fatherSpouseName} onChange={e => setFormData({...formData, fatherSpouseName: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">Full Residential Address</label>
                <textarea rows={2} className="w-full p-6 bg-slate-50 rounded-[2rem] outline-none text-sm text-slate-900 border border-slate-100 focus:ring-4 ring-primary/5 transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-5 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-red-400 transition-colors">Discard Deployment</button>
                <button type="submit" disabled={isSaving} className="flex-2 py-5 bg-primary text-white rounded-[2rem] font-heading uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-secondary transition-all active:scale-95">
                  {isSaving ? 'Processing Protocol...' : (editingPatient ? 'Sync Registry Profile' : 'Initialize Primary Registry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingPatientId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-primary/40 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in duration-300 flex flex-col max-h-[85vh]">
            <div className="bg-secondary p-8 text-white flex justify-between items-center relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-20 scale-150 rotate-12">
                {ICONS.Records}
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-heading uppercase tracking-widest">Clinical History Archive</h3>
                <p className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-60 mt-1">Registry Ref: {viewingPatientId}</p>
              </div>
              <button onClick={() => setViewingPatientId(null)} className="relative z-10 text-3xl leading-none hover:text-primary transition-colors">×</button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {isLoadingRecords ? (
                <div className="py-20 flex flex-col items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Decrypting Records...</p>
                </div>
              ) : patientRecords.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <p className="text-slate-300 italic text-sm">No clinical history nodes found for this patient.</p>
                  <p className="text-[9px] font-bold text-slate-200 uppercase tracking-widest">Fresh Registry Entry</p>
                </div>
              ) : (
                patientRecords.map(rec => (
                  <div key={rec.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-secondary transition-all shadow-sm group">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">{rec.date.split('T')[0]}</p>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Archive Ref: {rec.id.slice(-6)}</span>
                    </div>
                    <p className="text-lg font-heading text-slate-800 uppercase tracking-wide leading-tight group-hover:text-primary transition-colors">{rec.diagnosis}</p>
                    <div className="mt-4 pt-4 border-t border-slate-200/50 flex flex-col gap-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Physician Remarks</p>
                      <p className="text-xs text-slate-500 italic leading-relaxed">"{rec.notes || 'End of clinical summary.'}"</p>
                    </div>
                  </div>
                ))
              )
              }
            </div>
            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end">
              <button onClick={() => setViewingPatientId(null)} className="px-10 py-3 bg-white text-slate-400 border border-slate-200 rounded-xl font-heading text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">Exit Archive</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;

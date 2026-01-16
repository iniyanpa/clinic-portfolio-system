
import React, { useState, useEffect, useMemo } from 'react';
import { ICONS } from '../constants';
import { Patient, MedicalRecord } from '../types';
import { clinicalCollections } from '../firebase';
// Fix: Use standard named imports from firebase/firestore to resolve module resolution errors
import { query, where, onSnapshot } from 'firebase/firestore';

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
      // Fix: Correct usage of named query and where functions
      const q = query(
        clinicalCollections.records, 
        where("patientId", "==", viewingPatientId)
      );
      
      // Fix: Correct usage of named onSnapshot function
      const unsub = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as MedicalRecord));
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
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm);
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
            <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Master Database Node</p>
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
                className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-4 focus:ring-secondary/10 transition-all"
                placeholder="Search Database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <input 
              type="date" 
              className="p-3 border border-slate-200 rounded-xl text-xs text-slate-500 bg-white" 
              value={filterRegDate}
              onChange={(e) => setFilterRegDate(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Info</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-primary font-bold">{p.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{p.firstName} {p.lastName}</p>
                      <p className="text-[10px] text-slate-400">{p.gender} • {p.dateOfBirth}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600">{p.phone}</p>
                      <p className="text-[10px] text-slate-400">{p.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-bold uppercase tracking-widest">Registered</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => setViewingPatientId(p.id)} className="text-primary hover:text-secondary p-2 transition-colors">
                        {ICONS.Records}
                      </button>
                      <button onClick={() => setEditingPatient(p)} className="text-slate-400 hover:text-primary p-2 transition-colors">
                        {ICONS.Settings}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-primary p-10 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-heading uppercase tracking-widest">{editingPatient ? 'Update Case File' : 'Initialize Patient Node'}</h3>
                <p className="text-[9px] font-bold opacity-60 uppercase mt-2">Core Registry Deployment</p>
              </div>
              <button onClick={closeModal} className="text-4xl leading-none hover:text-secondary transition-colors">×</button>
            </div>
            
            <form onSubmit={handleRegister} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">First Name *</label>
                  <input required className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Name *</label>
                  <input required className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth *</label>
                  <input required type="date" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                  <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Blood Group *</label>
                  <select required className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                    <option value="">Select Group...</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone Number *</label>
                  <input required className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100" placeholder="+91" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Guardian / Next of Kin</label>
                  <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100" value={formData.guardianName} onChange={e => setFormData({...formData, guardianName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Father / Spouse Name *</label>
                  <input required className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100" value={formData.fatherSpouseName} onChange={e => setFormData({...formData, fatherSpouseName: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Full Residential Address</label>
                <textarea rows={2} className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 border border-slate-100" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-2 py-4 bg-primary text-white rounded-2xl font-heading uppercase tracking-widest text-xs shadow-xl hover:bg-secondary transition-all">
                  {isSaving ? 'Processing...' : (editingPatient ? 'Commit Changes' : 'Initialize Registry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingPatientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in duration-300">
            <div className="bg-secondary p-8 text-white flex justify-between items-center">
              <h3 className="text-xl font-heading uppercase tracking-widest">Clinical History Archive</h3>
              <button onClick={() => setViewingPatientId(null)} className="text-3xl">×</button>
            </div>
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              {isLoadingRecords ? <p className="text-center py-10 text-slate-400 italic">Syncing records...</p> : 
               patientRecords.length === 0 ? <p className="text-center py-10 text-slate-300 italic">No previous clinical records found.</p> :
               patientRecords.map(rec => (
                 <div key={rec.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-bold text-primary mb-1">{rec.date.split('T')[0]}</p>
                   <p className="text-sm font-bold text-slate-800">{rec.diagnosis}</p>
                   <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rec.notes}</p>
                 </div>
               ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;

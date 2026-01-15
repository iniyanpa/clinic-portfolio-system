
import React, { useState, useEffect, useMemo } from 'react';
import { ICONS } from '../constants';
import { Patient, MedicalRecord } from '../types';
import { clinicalCollections } from '../firebase';
import { onSnapshot, query, where } from 'firebase/firestore';

interface PatientsProps {
  patients: Patient[];
  addPatient: (p: Patient) => Promise<void>;
  updatePatient: (p: Patient) => Promise<void>;
}

const Patients: React.FC<PatientsProps> = ({ patients, addPatient, updatePatient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegDate, setFilterRegDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dob: '', gender: 'Male' as any,
    phone: '', email: '', bloodGroup: 'O+', address: '',
    guardianName: '', motherName: ''
  });

  // Fetch clinical history when a patient is selected
  useEffect(() => {
    if (viewingPatientId) {
      setIsLoadingRecords(true);
      // We remove orderBy("date", "desc") to avoid requiring a composite index in Firestore
      // We will sort the data client-side instead
      const q = query(
        clinicalCollections.records, 
        where("patientId", "==", viewingPatientId)
      );
      
      const unsub = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as MedicalRecord));
        // Client-side sort: Descending by date
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
        motherName: editingPatient.motherName || ''
      });
      setIsModalOpen(true);
    }
  }, [editingPatient]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingPatient) {
        await updatePatient({ ...editingPatient, ...formData, dateOfBirth: formData.dob } as Patient);
      } else {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const nextId = `SLS-${timestamp}${random}`;
        
        await addPatient({
          id: nextId,
          ...formData,
          dateOfBirth: formData.dob,
          history: [],
          registeredDate: new Date().toISOString().split('T')[0]
        } as Patient);
      }
      closeModal();
    } catch (err) {
      alert("Database error: Could not save patient profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
    setFormData({ 
      firstName: '', lastName: '', dob: '', gender: 'Male', 
      phone: '', email: '', bloodGroup: 'O+', address: '',
      guardianName: '', motherName: ''
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
                placeholder="Search Database (UID, Name, Phone)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
               <input 
                  type="date" 
                  className="p-3 border border-slate-200 rounded-xl text-xs text-slate-500 bg-white" 
                  value={filterRegDate} 
                  onChange={e => setFilterRegDate(e.target.value)} 
               />
               {filterRegDate && <button onClick={() => setFilterRegDate('')} className="text-red-400 font-bold text-[8px] uppercase tracking-widest">Clear</button>}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Reference UID</th>
                  <th className="px-8 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Identity</th>
                  <th className="px-8 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Clinical Data</th>
                  <th className="px-8 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Registry Date</th>
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${viewingPatientId === p.id ? 'bg-secondary/5 border-l-4 border-l-secondary' : ''}`} onClick={() => setViewingPatientId(p.id)}>
                    <td className="px-8 py-6 font-mono text-xs text-secondary font-bold tracking-tighter">{p.id}</td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{p.firstName} {p.lastName}</div>
                      <div className="text-[9px] text-slate-400 font-bold">{p.phone}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-bold px-2 py-0.5 bg-red-50 text-red-600 rounded-lg border border-red-100">{p.bloodGroup}</span>
                         <span className="text-[9px] text-slate-400 font-bold uppercase">{p.gender} • {p.dateOfBirth}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase">{p.registeredDate}</td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setEditingPatient(p); }} className="text-slate-300 hover:text-primary p-2 transition-colors">{ICONS.Settings}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-20 text-center text-slate-300 italic text-sm">No synchronized records found matching the query.</div>
            )}
          </div>
        </div>
      </div>

      {/* Clinical History Side Panel */}
      {viewingPatientId && (
        <div className="w-full xl:w-[400px] bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden h-fit xl:sticky xl:top-24 animate-in slide-in-from-right-8">
           <div className="bg-primary p-6 text-white flex justify-between items-center shadow-lg">
              <div>
                 <h3 className="font-heading text-lg uppercase tracking-widest leading-none">Clinical History</h3>
                 <p className="text-[9px] font-bold opacity-60 uppercase mt-1">Patient: {patients.find(p => p.id === viewingPatientId)?.firstName} {patients.find(p => p.id === viewingPatientId)?.lastName}</p>
              </div>
              <button onClick={() => setViewingPatientId(null)} className="text-white/50 hover:text-white transition-colors text-2xl leading-none">×</button>
           </div>
           <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50/30">
              {isLoadingRecords ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Querying Firestore...</p>
                </div>
              ) : patientRecords.length === 0 ? (
                <div className="text-center py-20 opacity-30 italic text-sm border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center gap-4">
                   <div className="text-4xl opacity-50">📂</div>
                   No consultation logs available.
                </div>
              ) : (
                patientRecords.map((rec) => (
                  <div key={rec.id} className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm relative group hover:border-secondary transition-all">
                    <span className="absolute top-4 right-5 text-[8px] font-bold text-slate-300 uppercase">{rec.date.split('T')[0]}</span>
                    <div className="flex items-center gap-2 mb-3">
                       <div className="w-2 h-2 bg-secondary rounded-full"></div>
                       <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Clinical Session</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Final Diagnosis</p>
                        <p className="text-xs font-bold text-slate-800">{rec.diagnosis || 'Observation Only'}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                           <p className="text-[8px] font-bold text-slate-300 uppercase">Symptoms</p>
                           <p className="text-[10px] text-slate-600 truncate">{rec.symptoms || 'Minor'}</p>
                        </div>
                        <div>
                           <p className="text-[8px] font-bold text-slate-300 uppercase">Weight/BP</p>
                           <p className="text-[10px] text-slate-600">{rec.vitals.weight || '--'}kg / {rec.vitals.bp || '--'}</p>
                        </div>
                      </div>
                      
                      {rec.notes && (
                        <div>
                           <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Doctor's Notes</p>
                           <p className="text-[10px] text-slate-500 italic line-clamp-2">{rec.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden my-auto animate-in zoom-in duration-300">
            <div className="bg-primary p-10 text-white flex justify-between items-center">
               <h3 className="text-2xl font-heading uppercase tracking-widest">{editingPatient ? 'Sync Patient File' : 'Registry Entry'}</h3>
               <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all text-xl">×</button>
            </div>
            <form onSubmit={handleRegister} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Legal First Name</label>
                 <input required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm" placeholder="e.g. Rahul" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Surname</label>
                 <input required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm" placeholder="e.g. Sharma" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth</label>
                 <input required type="date" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gender Orientation</label>
                 <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold uppercase" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                   <option>Male</option><option>Female</option><option>Other</option>
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Direct Contact</label>
                 <input required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm" placeholder="+91 ..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Identity</label>
                 <input required type="email" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm" placeholder="email@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Clinical Blood Group</label>
                 <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                   <option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Guardian/Emergency Point</label>
                 <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm" placeholder="Guardian Name" value={formData.guardianName} onChange={e => setFormData({...formData, guardianName: e.target.value})} />
              </div>
              <div className="md:col-span-2 space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registry Address</label>
                 <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm" rows={2} placeholder="Full address details..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="md:col-span-2 flex gap-4 mt-4">
                <button type="button" disabled={isSaving} onClick={closeModal} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Abandon</button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-4 bg-primary text-white font-heading tracking-widest uppercase rounded-2xl hover:bg-secondary text-xs shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                  {editingPatient ? 'Push Updates' : 'Commit to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;

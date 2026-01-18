import React, { useState, useEffect, useMemo } from 'react';
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

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Rare', 'Unknown'];

const Patients: React.FC<PatientsProps> = ({ patients, tenantId, clinicName, addPatient, updatePatient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dob: '', gender: 'Male' as any,
    phone: '', email: '', bloodGroup: '', address: '',
    guardianName: '', fatherSpouseName: '', motherName: ''
  });

  useEffect(() => {
    if (viewingPatientId) {
      setIsLoadingRecords(true);
      const q = query(clinicalCollections.records, where("patientId", "==", viewingPatientId));
      const unsub = onSnapshot(q, (snapshot: any) => {
        const fetched = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as MedicalRecord));
        setPatientRecords(fetched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsLoadingRecords(false);
      }, () => setIsLoadingRecords(false));
      return () => unsub();
    }
  }, [viewingPatientId]);

  useEffect(() => {
    if (editingPatient) {
      setFormData({
        firstName: editingPatient.firstName, lastName: editingPatient.lastName,
        dob: editingPatient.dateOfBirth, gender: editingPatient.gender,
        phone: editingPatient.phone, email: editingPatient.email,
        bloodGroup: editingPatient.bloodGroup, address: editingPatient.address,
        guardianName: editingPatient.guardianName || '',
        fatherSpouseName: editingPatient.fatherSpouseName || '',
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
        const nextId = `HF-${timestamp}`;
        await addPatient({
          id: nextId, tenantId, ...formData, dateOfBirth: formData.dob,
          history: [], registeredDate: new Date().toISOString().split('T')[0]
        } as Patient);
      }
      closeModal();
    } catch (err) {
      alert("Error saving record.");
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
    setFormData({ 
      firstName: '', lastName: '', dob: '', gender: 'Male', phone: '', email: '', 
      bloodGroup: '', address: '', guardianName: '', fatherSpouseName: '', motherName: ''
    });
  };

  const filtered = useMemo(() => {
    const sortedPatients = [...patients].sort((a, b) => b.id.localeCompare(a.id));
    return sortedPatients.filter(p => {
      const term = searchTerm.toLowerCase();
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      return fullName.includes(term) || p.id.toLowerCase().includes(term) || p.phone.includes(searchTerm);
    });
  }, [patients, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-primary">Patient Repository</h2>
          <p className="subheading text-secondary font-bold text-[9px] tracking-widest uppercase">Master Clinical Database</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 font-bold hover:bg-secondary transition-all text-[10px] uppercase">
          {ICONS.Plus} Register Patient
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              className="block w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 ring-primary/5 font-bold text-sm shadow-inner"
              placeholder="Search Name or Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-300">
              {ICONS.Search}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Profile</th>
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-primary text-[10px]">#{p.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm leading-tight">{p.firstName} {p.lastName}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">{p.gender} • {p.bloodGroup} • {p.dateOfBirth}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600 font-mono text-xs">{p.phone}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setViewingPatientId(p.id)} title="View Records" className="p-2 text-primary bg-slate-100 rounded-lg hover:bg-primary hover:text-white transition-all">{ICONS.Records}</button>
                      <button onClick={() => setEditingPatient(p)} title="Edit Profile" className="p-2 text-slate-400 bg-slate-100 rounded-lg hover:bg-secondary hover:text-white transition-all">{ICONS.Settings}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="p-10 sm:p-20 text-center text-slate-300 font-bold italic text-sm">No results matched.</p>}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/20 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in my-auto">
            <div className="bg-primary p-6 text-white flex justify-between items-center shadow-lg sticky top-0 z-10">
              <h3 className="text-lg font-heading font-bold uppercase tracking-widest">{editingPatient ? 'Update Profile' : 'New Intake'}</h3>
              <button onClick={closeModal} className="text-2xl leading-none hover:rotate-90 transition-transform">×</button>
            </div>
            <form onSubmit={handleRegister} className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div className="space-y-1">
                   <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">First Name</label>
                   <input required className="w-full bg-slate-50 border border-slate-100 p-2 text-sm rounded-xl outline-none shadow-inner" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Last Name</label>
                   <input required className="w-full bg-slate-50 border border-slate-100 p-2 text-sm rounded-xl outline-none shadow-inner" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">DOB</label>
                   <input required type="date" className="w-full bg-slate-50 border border-slate-100 p-2 text-sm rounded-xl outline-none shadow-inner font-mono" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Gender</label>
                   <select className="w-full bg-slate-50 border border-slate-100 p-2 text-sm rounded-xl outline-none font-bold shadow-inner" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Blood Group</label>
                   <select required className="w-full bg-slate-50 border border-slate-100 p-2 text-sm rounded-xl outline-none font-bold shadow-inner" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                    <option value="">Select Group *</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Mobile</label>
                   <input required className="w-full bg-slate-50 border border-slate-100 p-2 text-sm rounded-xl outline-none font-mono shadow-inner" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Guardian</label>
                   <input required className="w-full bg-slate-50 border border-slate-100 p-2 text-sm rounded-xl outline-none shadow-inner" value={formData.fatherSpouseName} onChange={e => setFormData({...formData, fatherSpouseName: e.target.value})} />
                </div>
                <div className="sm:col-span-2 space-y-1">
                   <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Address</label>
                   <input className="w-full bg-slate-50 border border-slate-100 p-2 text-sm rounded-xl outline-none shadow-inner" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-white">
                <button type="button" onClick={closeModal} className="flex-1 py-3 text-slate-400 font-bold uppercase tracking-widest text-[9px]">Discard</button>
                <button type="submit" disabled={isSaving} className="flex-2 py-3 bg-primary text-white rounded-xl font-bold shadow-xl hover:bg-secondary transition-all uppercase text-[10px] tracking-widest">
                  {isSaving ? 'Saving...' : (editingPatient ? 'Sync' : 'Initialize')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingPatientId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-primary/40 backdrop-blur-md p-2 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-secondary p-6 sm:p-8 text-white flex justify-between items-center shadow-lg">
              <h3 className="text-lg font-heading font-bold uppercase tracking-widest">History Log</h3>
              <button onClick={() => setViewingPatientId(null)} className="text-2xl leading-none">×</button>
            </div>
            <div className="p-6 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {isLoadingRecords ? <p className="text-center py-10 animate-pulse font-bold text-secondary text-xs">Syncing...</p> : 
                patientRecords.length === 0 ? <p className="text-center py-10 text-slate-400 italic font-bold text-sm">No historical data.</p> :
                patientRecords.map(rec => (
                  <div key={rec.id} className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-secondary transition-all group">
                    <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mb-2">{rec.date.split('T')[0]}</p>
                    <h4 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">{rec.diagnosis}</h4>
                    <div className="mt-3 p-3 sm:p-4 bg-white rounded-xl border border-slate-100 shadow-inner">
                      <p className="text-[11px] sm:text-xs text-slate-500 italic leading-relaxed">"{rec.notes || 'No specific notes.'}"</p>
                    </div>
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

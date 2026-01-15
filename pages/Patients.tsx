
import React, { useState, useEffect, useMemo } from 'react';
import { ICONS } from '../constants';
import { Patient, MedicalRecord } from '../types';
import { clinicalCollections } from '../firebase';
import { onSnapshot, query, where, orderBy } from 'firebase/firestore';

interface PatientsProps {
  patients: Patient[];
  addPatient: (p: Patient) => void;
  updatePatient: (p: Patient) => void;
}

const Patients: React.FC<PatientsProps> = ({ patients, addPatient, updatePatient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegDate, setFilterRegDate] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dob: '', gender: 'Male' as any,
    phone: '', email: '', bloodGroup: 'O+', address: '',
    guardianName: '', motherName: ''
  });

  // Fetch chronological history for selected patient
  useEffect(() => {
    if (viewingPatientId) {
      const q = query(
        clinicalCollections.records, 
        where("patientId", "==", viewingPatientId),
        orderBy("date", "desc")
      );
      const unsub = onSnapshot(q, (snapshot) => {
        setPatientRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalRecord)));
      }, (err) => {
        console.error("Firestore history fetch error:", err);
        // Fallback if index is not ready
        setPatientRecords([]);
      });
      return () => unsub();
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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatient) {
      updatePatient({ ...editingPatient, ...formData, dateOfBirth: formData.dob } as Patient);
    } else {
      const nextId = 1000 + patients.length + 1;
      addPatient({
        id: `SLS#${nextId}`,
        ...formData,
        dateOfBirth: formData.dob,
        history: [],
        registeredDate: new Date().toISOString().split('T')[0]
      } as Patient);
    }
    closeModal();
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
      const matchesSearch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = filterRegDate ? p.registeredDate === filterRegDate : true;
      return matchesSearch && matchesDate;
    });
  }, [patients, searchTerm, filterRegDate]);

  return (
    <div className="space-y-6 flex flex-col xl:flex-row gap-8">
      <div className="flex-1 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading text-primary uppercase leading-tight">Patient Database</h2>
            <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Medical Registry Hub</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-8 py-3 rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-secondary transition-all font-heading uppercase tracking-widest text-xs"
          >
            {ICONS.Plus} New Patient
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
                placeholder="Search by ID, Name or Contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Date:</label>
               <input 
                  type="date" 
                  className="p-3 border border-slate-200 rounded-xl text-xs text-slate-500 bg-white" 
                  value={filterRegDate} 
                  onChange={e => setFilterRegDate(e.target.value)} 
               />
               {filterRegDate && <button onClick={() => setFilterRegDate('')} className="text-red-400 font-bold text-xs">Clear</button>}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">UID</th>
                  <th className="px-8 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Patient Name</th>
                  <th className="px-8 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Medical Info</th>
                  <th className="px-8 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Registered</th>
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${viewingPatientId === p.id ? 'bg-secondary/5 border-l-4 border-l-secondary' : ''}`} onClick={() => setViewingPatientId(p.id)}>
                    <td className="px-8 py-6 font-mono text-xs text-secondary font-bold tracking-tighter">{p.id}</td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{p.firstName} {p.lastName}</div>
                      <div className="text-[9px] text-slate-400 font-medium">{p.phone}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-bold px-2 py-0.5 bg-red-50 text-red-600 rounded-lg">{p.bloodGroup}</span>
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
              <div className="p-20 text-center text-slate-300 italic">No patients match the current search filters.</div>
            )}
          </div>
        </div>
      </div>

      {/* Medical History Side Panel */}
      {viewingPatientId && (
        <div className="w-full xl:w-[400px] bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden h-fit xl:sticky xl:top-24 animate-in slide-in-from-right-8">
           <div className="bg-primary p-6 text-white flex justify-between items-center">
              <div>
                 <h3 className="font-heading text-lg uppercase tracking-widest leading-none">Clinical Case File</h3>
                 <p className="text-[9px] font-bold opacity-60 uppercase mt-1">Patient: {patients.find(p => p.id === viewingPatientId)?.firstName}</p>
              </div>
              <button onClick={() => setViewingPatientId(null)} className="text-white/50 hover:text-white transition-colors text-2xl leading-none">×</button>
           </div>
           <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50/30">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Chronological Records</p>
              {patientRecords.length === 0 ? (
                <div className="text-center py-20 opacity-30 italic text-sm border-2 border-dashed border-slate-200 rounded-3xl">No prior consultations recorded for this profile.</div>
              ) : (
                patientRecords.map((rec, idx) => (
                  <div key={rec.id} className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm relative group hover:border-secondary transition-all">
                    <span className="absolute top-4 right-5 text-[8px] font-bold text-slate-300 uppercase">{rec.date.split('T')[0]}</span>
                    <div className="flex items-center gap-2 mb-3">
                       <div className="w-2 h-2 bg-secondary rounded-full"></div>
                       <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Clinical Visit #{patientRecords.length - idx}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Diagnosis</p>
                        <p className="text-xs font-bold text-slate-800">{rec.diagnosis || 'General Observation'}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                        <div>
                           <p className="text-[8px] font-bold text-slate-300 uppercase">Symptoms</p>
                           <p className="text-[10px] text-slate-600 truncate">{rec.symptoms || 'None'}</p>
                        </div>
                        <div>
                           <p className="text-[8px] font-bold text-slate-300 uppercase">Vitals (BP/Wt)</p>
                           <p className="text-[10px] text-slate-600">{rec.vitals.bp || '--'}/{rec.vitals.weight || '--'}kg</p>
                        </div>
                      </div>

                      {rec.followUpDate && (
                        <div className="pt-2 border-t border-slate-50 text-[9px] text-amber-600 font-bold flex items-center gap-2 animate-pulse">
                           {ICONS.Notification} Follow-up scheduled: {rec.followUpDate}
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
               <h3 className="text-2xl font-heading uppercase tracking-widest">{editingPatient ? 'Update Patient File' : 'New Admission'}</h3>
               <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all text-xl">×</button>
            </div>
            <form onSubmit={handleRegister} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                 <input required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="e.g. Rahul" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                 <input required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="e.g. Sharma" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth</label>
                 <input required type="date" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                 <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                   <option>Male</option><option>Female</option><option>Other</option>
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contact Number</label>
                 <input required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="+91 ..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                 <input required type="email" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="email@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Blood Group</label>
                 <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                   <option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Emergency Contact Name</label>
                 <input className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="Guardian Name" value={formData.guardianName} onChange={e => setFormData({...formData, guardianName: e.target.value})} />
              </div>
              <div className="md:col-span-2 space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Permanent Address</label>
                 <textarea className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" rows={2} placeholder="Full address..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="md:col-span-2 flex gap-4 mt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Abandon</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-heading tracking-widest uppercase rounded-2xl hover:bg-secondary text-xs shadow-lg">{editingPatient ? 'Update' : 'Confirm Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;

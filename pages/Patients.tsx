
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { Patient } from '../types';

interface PatientsProps {
  patients: Patient[];
  addPatient: (p: Patient) => void;
  updatePatient: (p: Patient) => void;
}

const Patients: React.FC<PatientsProps> = ({ patients, addPatient, updatePatient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dob: '', gender: 'Male' as any,
    phone: '', email: '', bloodGroup: 'O+', address: '',
    guardianName: '', motherName: ''
  });

  // Effect to load data into form when editing
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
      const updated: Patient = {
        ...editingPatient,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dob,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        guardianName: formData.guardianName,
        motherName: formData.motherName
      };
      updatePatient(updated);
    } else {
      const newPatient: Patient = {
        id: `P-${Math.floor(Math.random() * 9000) + 1000}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dob,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        guardianName: formData.guardianName,
        motherName: formData.motherName,
        history: [],
        registeredDate: new Date().toISOString().split('T')[0]
      };
      addPatient(newPatient);
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

  const openNewRegistration = () => {
    setEditingPatient(null);
    setFormData({ 
      firstName: '', lastName: '', dob: '', gender: 'Male', 
      phone: '', email: '', bloodGroup: 'O+', address: '',
      guardianName: '', motherName: ''
    });
    setIsModalOpen(true);
  };

  const filtered = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase">Unified Registry</h2>
          <p className="subheading text-secondary font-bold text-xs tracking-widest">Master Patient Database</p>
        </div>
        <button 
          onClick={openNewRegistration}
          className="bg-primary text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 hover:bg-secondary transition-all transform hover:-translate-y-1 font-heading uppercase tracking-widest text-sm"
        >
          {ICONS.Plus} Register New Record
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50/30 border-b border-slate-100">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
              {ICONS.Search}
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-secondary/20 transition-all outline-none text-sm placeholder:text-slate-300"
              placeholder="Search by name, ID or guardian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">ID Code</th>
                <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Patient Details</th>
                <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Guardian Info</th>
                <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Medical Summary</th>
                <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-sm text-secondary font-bold">{p.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{p.firstName} {p.lastName}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-0.5">D.O.B: {p.dateOfBirth}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-600 font-bold">G: {p.guardianName || 'N/A'}</div>
                    <div className="text-[10px] text-slate-400 italic">M: {p.motherName || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/5 text-primary rounded">{p.bloodGroup}</span>
                       <span className="text-[10px] font-medium text-slate-500">{p.gender}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest truncate max-w-[120px]">History: {p.history.length > 0 ? p.history.join(', ') : 'None'}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingPatient(p)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                 <tr>
                    <td colSpan={5} className="py-20 text-center">
                       <p className="text-slate-300 font-heading text-2xl uppercase tracking-[0.2em] opacity-40">Empty Registry</p>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-primary p-8 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">{ICONS.Patients}</div>
              <div className="relative z-10">
                <h3 className="text-3xl font-heading uppercase tracking-widest">{editingPatient ? 'Modify Record' : 'Admission Intake'}</h3>
                <p className="subheading text-[10px] text-secondary font-bold tracking-[0.3em] mt-1">SLS HEALFLOW CORE REGISTRY</p>
              </div>
              <button onClick={closeModal} className="relative z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all text-xl">×</button>
            </div>
            
            <form onSubmit={handleRegister} className="p-10 grid grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Legal First Name</label>
                <input required type="text" className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Legal Last Name</label>
                <input required type="text" className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Birth Date</label>
                <input required type="date" className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Assigned Gender</label>
                <select className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all appearance-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Father / Spouse Name</label>
                <input required type="text" className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="Legal guardian name" value={formData.guardianName} onChange={e => setFormData({...formData, guardianName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Mother Name</label>
                <input required type="text" className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="Maternal name" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Mobile Number</label>
                <input required type="tel" className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="+1 000 0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Mail ID</label>
                <input required type="email" className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="patient@provider.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Hematology Group</label>
                <select className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all appearance-none" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                  <option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Primary Residence</label>
                <textarea rows={2} className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="Enter full address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              
              <div className="col-span-2 flex gap-4 pt-6">
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-heading tracking-[0.2em] uppercase rounded-2xl hover:bg-secondary transition-all shadow-xl shadow-primary/10">
                  {editingPatient ? 'Save Record Updates' : 'Authorize Admission'}
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


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
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dob: '', gender: 'Male' as any,
    phone: '', email: '', bloodGroup: 'O+', address: '',
    guardianName: '', motherName: ''
  });

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
    const { dob, ...rest } = formData;
    if (editingPatient) {
      updatePatient({ ...editingPatient, ...rest, dateOfBirth: dob } as Patient);
    } else {
      // Logic for unique sequential SLS ID
      const nextId = 1000 + patients.length + 1;
      addPatient({
        id: `SLS#${nextId}`,
        ...rest,
        dateOfBirth: dob,
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

  const filtered = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-heading text-primary uppercase leading-tight">Patient Registry</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Master Admission Database</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-8 py-3 rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-secondary transition-all font-heading uppercase tracking-widest text-xs"
        >
          {ICONS.Plus} New Admission
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50/30 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
              {ICONS.Search}
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none text-sm focus:ring-4 focus:ring-secondary/10 transition-all"
              placeholder="Search by SLS# ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filtered.length} Patients Recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">UID Code</th>
                <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Full Name</th>
                <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Clinical Info</th>
                <th className="px-10 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6 font-mono text-xs text-secondary font-bold tracking-tighter">{p.id}</td>
                  <td className="px-10 py-6">
                    <div className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{p.firstName} {p.lastName}</div>
                    <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Reg: {p.registeredDate}</div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="text-xs font-medium text-slate-600">{p.phone}</div>
                    <div className="text-[10px] text-slate-300">{p.email}</div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-bold px-2 py-0.5 bg-red-50 text-red-600 rounded-lg">{p.bloodGroup}</span>
                       <span className="text-[9px] text-slate-400 font-bold uppercase">{p.gender}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => setEditingPatient(p)}
                      className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      Edit File
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden my-auto animate-in zoom-in duration-300">
            <div className="bg-primary p-10 text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-10 scale-[2] pointer-events-none">{ICONS.Patients}</div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-heading uppercase tracking-widest">{editingPatient ? 'Modify Record' : 'Admission Protocol'}</h3>
                  <p className="text-[9px] uppercase font-bold tracking-[0.3em] text-white/50">Tirupati SV Area Medical Hub</p>
               </div>
               <button onClick={closeModal} className="relative z-10 w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all text-xl">×</button>
            </div>
            
            <form onSubmit={handleRegister} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">First Name</label>
                 <input required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm focus:ring-4 focus:ring-secondary/10 transition-all" placeholder="Enter patient first name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Last Name</label>
                 <input required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm focus:ring-4 focus:ring-secondary/10 transition-all" placeholder="Enter patient surname" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Date of Birth</label>
                 <input required type="date" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Gender</label>
                 <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                   <option>Male</option><option>Female</option><option>Other</option>
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Phone Number</label>
                 <input required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="+91" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Email Address</label>
                 <input required type="email" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="patient@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Blood Group</label>
                 <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                   <option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                 </select>
              </div>
              <div className="md:col-span-2 space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Permanent Address</label>
                 <textarea className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" rows={2} placeholder="Full address details..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              
              <div className="md:col-span-2 flex gap-4 mt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl uppercase tracking-widest text-[10px]">Abandon</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-heading tracking-widest uppercase rounded-2xl hover:bg-secondary text-xs shadow-lg">Confirm Protocol</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;

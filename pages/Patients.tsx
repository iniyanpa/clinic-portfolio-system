
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

  // Fix: Correctly map 'dob' from formData to 'dateOfBirth' required by the Patient type
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const { dob, ...rest } = formData;
    if (editingPatient) {
      updatePatient({ ...editingPatient, ...rest, dateOfBirth: dob } as Patient);
    } else {
      addPatient({
        id: `P-${Math.floor(Math.random() * 9000) + 1000}`,
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
          <h2 className="text-3xl md:text-4xl font-heading text-primary uppercase leading-tight">Registry</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Master Database</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-3 hover:bg-secondary transition-all font-heading uppercase tracking-widest text-xs md:text-sm"
        >
          {ICONS.Plus} Register New
        </button>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50/30 border-b border-slate-100">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
              {ICONS.Search}
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl outline-none text-sm"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Code</th>
                <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Patient</th>
                <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Blood/Gen</th>
                <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-secondary font-bold">{p.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-sm">{p.firstName} {p.lastName}</div>
                    <div className="text-[10px] text-slate-400">{p.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/5 text-primary rounded mr-2">{p.bloodGroup}</span>
                    <span className="text-[10px] text-slate-500">{p.gender}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setEditingPatient(p)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white"
                    >
                      Edit
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
          <div className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden my-auto animate-in zoom-in duration-300">
            <div className="bg-primary p-6 md:p-8 text-white flex justify-between items-center">
              <h3 className="text-xl md:text-2xl font-heading uppercase tracking-widest">{editingPatient ? 'Update' : 'Admission'}</h3>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all">×</button>
            </div>
            
            <form onSubmit={handleRegister} className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <input required className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              <input required className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              <input required type="date" className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
              <select className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
              <input required className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input required className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <select className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                <option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
              </select>
              <textarea className="md:col-span-2 p-3 bg-slate-50 border rounded-xl outline-none text-sm" placeholder="Full Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              
              <div className="md:col-span-2 flex gap-4 mt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-50 rounded-xl uppercase tracking-widest text-[10px]">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white font-heading tracking-widest uppercase rounded-xl hover:bg-secondary text-xs">Authorize</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;

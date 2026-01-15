
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Patient } from '../types';

interface PatientsProps {
  patients: Patient[];
  addPatient: (p: Patient) => void;
}

const Patients: React.FC<PatientsProps> = ({ patients, addPatient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dob: '', gender: 'Male' as any,
    phone: '', email: '', bloodGroup: 'O+', address: ''
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
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
      history: [],
      registeredDate: new Date().toISOString().split('T')[0]
    };
    addPatient(newPatient);
    setIsModalOpen(false);
    setFormData({ firstName: '', lastName: '', dob: '', gender: 'Male', phone: '', email: '', bloodGroup: 'O+', address: '' });
  };

  const filtered = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase">Registry</h2>
          <p className="subheading text-secondary font-bold text-xs tracking-widest">Active Patient Database</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 hover:bg-secondary transition-all transform hover:-translate-y-1 font-heading uppercase tracking-widest text-sm"
        >
          {ICONS.Plus} Register New Patient
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              {ICONS.Search}
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary transition-all outline-none text-sm"
              placeholder="Filter by name, ID or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Identifier</th>
                <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Full Name</th>
                <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Medical Info</th>
                <th className="px-6 py-4 subheading text-[10px] text-slate-400 uppercase tracking-widest">Contacts</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-sm text-secondary font-bold">{p.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{p.firstName} {p.lastName}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Registered {p.registeredDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{p.gender}, {new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()}Y</div>
                    <div className="text-xs font-bold text-primary">BLOOD: {p.bloodGroup}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">{ICONS.Mail} {p.email}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">{ICONS.SMS} {p.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all">
                      Open Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-heading uppercase tracking-widest">New Patient Admission</h3>
                <p className="subheading text-[10px] text-secondary font-bold tracking-[0.2em] mt-1">Fill all mandatory fields</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white text-2xl">×</button>
            </div>
            
            <form onSubmit={handleRegister} className="p-8 grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">First Name</label>
                <input required type="text" className="w-full p-3 border rounded-xl outline-none focus:border-secondary transition-all" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Last Name</label>
                <input required type="text" className="w-full p-3 border rounded-xl outline-none focus:border-secondary transition-all" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Date of Birth</label>
                <input required type="date" className="w-full p-3 border rounded-xl outline-none focus:border-secondary transition-all" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Gender</label>
                <select className="w-full p-3 border rounded-xl outline-none focus:border-secondary transition-all" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Mobile Phone</label>
                <input required type="tel" className="w-full p-3 border rounded-xl outline-none focus:border-secondary transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Blood Group</label>
                <select className="w-full p-3 border rounded-xl outline-none focus:border-secondary transition-all" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                  <option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase subheading tracking-widest">Residential Address</label>
                <textarea rows={2} className="w-full p-3 border rounded-xl outline-none focus:border-secondary transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              
              <div className="col-span-2 flex gap-4 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-heading tracking-widest uppercase rounded-xl hover:bg-secondary transition-all shadow-lg">Finalize Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;

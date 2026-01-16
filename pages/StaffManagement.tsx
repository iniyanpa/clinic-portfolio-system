
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { User, UserRole } from '../types';

interface StaffManagementProps {
  staff: User[];
  addStaff: (u: User) => void;
  updateStaff: (u: User) => void;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ staff, addStaff, updateStaff }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '', email: '', password: '', role: UserRole.DOCTOR, specialization: '', phone: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      updateStaff({ ...editingStaff, ...formData } as User);
    } else {
      const newId = (formData.role === UserRole.DOCTOR ? 'D' : formData.role === UserRole.RECEPTIONIST ? 'R' : formData.role === UserRole.PHARMACIST ? 'P' : 'S') + (Math.floor(Math.random() * 900) + 100);
      addStaff({
        ...formData,
        id: newId,
        avatar: `https://picsum.photos/seed/${newId}/100/100`
      } as User);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setFormData({ name: '', email: '', password: '', role: UserRole.DOCTOR, specialization: '', phone: '' });
  };

  const handleEdit = (u: User) => {
    setEditingStaff(u);
    setFormData({ ...u });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase">Staff Matrix</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Administrative Node • Access Control</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-heading uppercase text-xs tracking-widest hover:bg-secondary transition-all">
          {ICONS.Plus} Create New Credential
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Employee Profile</th>
                <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Authority Level</th>
                <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Secure Access</th>
                <th className="px-10 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <img src={u.avatar} className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm" alt="Avatar" />
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                        <p className="font-mono text-[9px] text-secondary font-bold uppercase tracking-widest">Node ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1 bg-primary text-white rounded-lg text-[9px] font-bold uppercase tracking-widest mb-1 inline-block">
                      {u.role}
                    </span>
                    {u.specialization && <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{u.specialization}</p>}
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-xs text-slate-600 font-medium">{u.email}</p>
                    <p className="text-[10px] text-slate-300 font-bold mt-1">Status: Active Registry</p>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button onClick={() => handleEdit(u)} className="px-6 py-2 bg-slate-50 text-slate-400 hover:bg-primary hover:text-white rounded-xl transition-all font-bold text-[9px] uppercase tracking-widest">Update Key</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-auto">
            <div className="bg-primary p-10 text-white flex justify-between items-center shadow-lg">
              <div>
                <h3 className="text-2xl font-heading uppercase tracking-widest">{editingStaff ? 'Update User Matrix' : 'Provision Staff Access'}</h3>
                <p className="text-[9px] font-bold opacity-60 uppercase mt-2">Credential Issuance Center</p>
              </div>
              <button onClick={closeModal} className="text-3xl text-white/50 hover:text-white leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Employee Name</label>
                   <input required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm text-slate-900" placeholder="Full Legal Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Authority Role</label>
                   <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold uppercase text-slate-900" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                      {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Login Email</label>
                   <input required type="email" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm text-slate-900" placeholder="work@clinic.io" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-primary uppercase tracking-widest font-heading">Access Password</label>
                   <input required={!editingStaff} type="text" className="w-full p-4 bg-white border-2 border-primary/20 rounded-2xl outline-none text-sm text-slate-900 font-mono" placeholder="Set Secure Key" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                {formData.role === UserRole.DOCTOR && (
                  <div className="md:col-span-2 space-y-1">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Medical Specialization</label>
                     <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm text-slate-900" placeholder="e.g. Senior Pediatrician" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                  </div>
                )}
                <div className="md:col-span-2 space-y-1">
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secure Phone</label>
                   <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm text-slate-900" placeholder="+91 XXXX XXX XXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-slate-50">
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Abandon Request</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-heading uppercase tracking-widest rounded-2xl hover:bg-secondary shadow-xl transition-all">
                  {editingStaff ? 'Commit Node Updates' : 'Initialize Staff Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;

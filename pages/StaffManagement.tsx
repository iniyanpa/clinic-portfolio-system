
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
    name: '', email: '', role: UserRole.DOCTOR, specialization: '', phone: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      updateStaff({ ...editingStaff, ...formData } as User);
    } else {
      const newId = (formData.role === UserRole.DOCTOR ? 'D' : formData.role === UserRole.RECEPTIONIST ? 'R' : 'S') + (Math.floor(Math.random() * 900) + 100);
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
    setFormData({ name: '', email: '', role: UserRole.DOCTOR, specialization: '', phone: '' });
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
          <h2 className="text-4xl font-heading text-primary uppercase">Hospital Staff</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest">HR & Governance</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-heading uppercase text-xs tracking-widest hover:bg-secondary transition-all">
          {ICONS.Plus} Authorize Staff
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Role/Specialization</th>
                <th className="px-10 py-6 subheading text-[10px] text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-10 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                        <p className="font-mono text-[9px] text-secondary">#{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-widest mb-1 inline-block">
                      {u.role}
                    </span>
                    {u.specialization && <p className="text-[10px] text-primary font-bold">{u.specialization}</p>}
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-xs text-slate-600">{u.email}</p>
                    <p className="text-[10px] text-slate-400">{u.phone}</p>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button onClick={() => handleEdit(u)} className="text-primary hover:text-secondary font-bold text-[10px] uppercase tracking-widest">Configure</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-primary p-8 text-white flex justify-between items-center">
              <h3 className="text-xl font-heading uppercase tracking-widest">{editingStaff ? 'Update Profile' : 'Staff Onboarding'}</h3>
              <button onClick={closeModal} className="text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-4">
                <input required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="Full Employee Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="email" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="Work Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none text-sm font-bold uppercase" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                  {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
                {(formData.role === UserRole.DOCTOR) && (
                  <input className="w-full p-4 bg-slate-50 border border-secondary/20 rounded-2xl outline-none text-sm" placeholder="Clinical Specialization (e.g. Cardiologist)" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                )}
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px]">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-heading uppercase tracking-widest rounded-2xl hover:bg-secondary transition-all">Save File</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;

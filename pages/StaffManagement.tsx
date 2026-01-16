
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
        avatar: `https://picsum.photos/seed/${newId}/100/100`,
        tenantId: '' 
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
    <div className="space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase leading-none">Staff Matrix</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest uppercase">Employee Access Control • RBAC Deployment</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-heading uppercase text-xs tracking-widest hover:bg-secondary transition-all">
          {ICONS.Plus} Provision Credential
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((u) => (
          <div key={u.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 group hover:border-primary transition-all flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <img src={u.avatar} className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-slate-50 shadow-md group-hover:scale-110 transition-transform" alt="Avatar" />
                <div>
                  <h4 className="font-heading text-xl text-slate-800 uppercase tracking-widest leading-none mb-1">{u.name}</h4>
                  <p className="text-[9px] font-bold text-secondary uppercase tracking-[0.3em]">NODE ID: {u.id}</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-6 border-t border-slate-50">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Authority Level</span>
                  <span className="px-3 py-1 bg-primary text-white rounded-lg text-[8px] font-bold uppercase tracking-widest">{u.role}</span>
                </div>
                {u.specialization && (
                   <div className="flex justify-between items-center">
                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Specialization</span>
                     <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{u.specialization}</span>
                   </div>
                )}
                <div className="flex justify-between items-center">
                   <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Access Key</span>
                   <span className="text-[10px] font-mono text-slate-500">{u.email}</span>
                </div>
              </div>
            </div>
            
            <button onClick={() => handleEdit(u)} className="mt-8 w-full py-4 bg-slate-50 text-slate-400 font-heading uppercase text-[10px] tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all">Update Node Key</button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in">
            <div className="bg-primary p-10 text-white flex justify-between items-center shadow-lg">
              <div>
                <h3 className="text-2xl font-heading uppercase tracking-widest">{editingStaff ? 'Update Credential' : 'Provision New Key'}</h3>
                <p className="text-[9px] font-bold opacity-60 uppercase mt-2">Administrative Node Issuance</p>
              </div>
              <button onClick={closeModal} className="text-3xl text-white/50 hover:text-white leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Employee Name</label>
                   <input required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm text-slate-900" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Authority Level</label>
                   <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold uppercase text-slate-900" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                      {Object.values(UserRole).filter(r => r !== UserRole.SUPER_ADMIN).map(role => <option key={role} value={role}>{role}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Work Email</label>
                   <input required type="email" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm text-slate-900" placeholder="email@healflow.io" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-primary uppercase tracking-widest ml-2">Access Key (Password)</label>
                   <input required={!editingStaff} type="text" className="w-full p-4 bg-white border-2 border-primary/20 rounded-2xl outline-none text-sm text-slate-900 font-mono" placeholder="Set Secure Key" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                {formData.role === UserRole.DOCTOR && (
                  <div className="md:col-span-2 space-y-1">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Clinical Specialization</label>
                     <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm text-slate-900" placeholder="e.g. Cardiologist" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Discard Request</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-heading uppercase tracking-widest rounded-2xl hover:bg-secondary shadow-xl transition-all">Deploy Key</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;

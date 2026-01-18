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
    <div className="space-y-6 sm:space-y-10 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-heading text-primary uppercase leading-none">Staff Matrix</h2>
          <p className="subheading text-secondary font-bold text-[9px] tracking-widest uppercase">RBAC Deployment Terminal</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 rounded-xl shadow-xl flex items-center justify-center gap-2 font-heading uppercase text-[10px] tracking-widest hover:bg-secondary transition-all">
          {ICONS.Plus} Provision Credential
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {staff.map((u) => (
          <div key={u.id} className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[3rem] shadow-sm border border-slate-100 group hover:border-primary transition-all flex flex-col justify-between">
            <div className="space-y-5 sm:space-y-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <img src={u.avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-slate-50 shadow-md group-hover:scale-110 transition-transform" alt="Avatar" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-heading text-lg sm:text-xl text-slate-800 uppercase tracking-widest leading-none mb-1 truncate">{u.name}</h4>
                  <p className="text-[8px] font-bold text-secondary uppercase tracking-[0.2em] truncate">NODE ID: {u.id}</p>
                </div>
              </div>
              
              <div className="space-y-2.5 pt-4 sm:pt-6 border-t border-slate-50">
                <div className="flex justify-between items-center">
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Authority</span>
                  <span className="px-2.5 py-0.5 bg-primary text-white rounded-lg text-[7px] font-bold uppercase tracking-widest">{u.role}</span>
                </div>
                {u.specialization && (
                   <div className="flex justify-between items-center">
                     <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Focus</span>
                     <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest truncate max-w-[120px] text-right">{u.specialization}</span>
                   </div>
                )}
                <div className="flex justify-between items-center">
                   <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Access Key</span>
                   <span className="text-[9px] font-mono text-slate-500 truncate max-w-[150px] text-right">{u.email}</span>
                </div>
              </div>
            </div>
            
            <button onClick={() => handleEdit(u)} className="mt-6 sm:mt-8 w-full py-3 bg-slate-50 text-slate-400 font-heading uppercase text-[9px] tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all">Update Key</button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in my-auto">
            <div className="bg-primary p-6 sm:p-8 text-white flex justify-between items-center shadow-lg sticky top-0 z-10">
              <h3 className="text-lg font-heading uppercase tracking-widest">{editingStaff ? 'Update Creds' : 'Provision Key'}</h3>
              <button onClick={closeModal} className="text-2xl text-white/50 hover:text-white leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Name</label>
                   <input required className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs text-slate-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Authority</label>
                   <select className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold uppercase text-slate-900" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                      {Object.values(UserRole).filter(r => r !== UserRole.SUPER_ADMIN).map(role => <option key={role} value={role}>{role}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Email</label>
                   <input required type="email" className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs text-slate-900" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-bold text-primary uppercase ml-2">Key</label>
                   <input required={!editingStaff} type="text" className="w-full p-2.5 bg-white border border-primary/20 rounded-xl outline-none text-xs text-slate-900 font-mono" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                {formData.role === UserRole.DOCTOR && (
                  <div className="sm:col-span-2 space-y-1">
                     <label className="text-[8px] font-bold text-slate-400 uppercase ml-2">Focus</label>
                     <input className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs text-slate-900" placeholder="e.g. Cardiology" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-white">
                <button type="button" onClick={closeModal} className="flex-1 py-3 text-slate-400 font-bold uppercase text-[9px] tracking-widest">Discard</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white font-heading uppercase tracking-widest rounded-xl hover:bg-secondary shadow-xl transition-all">Deploy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;

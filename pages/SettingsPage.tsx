import React, { useState, useEffect } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { ICONS } from '../constants';
import { Tenant } from '../types';

interface SettingsPageProps {
  tenantId?: string;
  currentSettings: Tenant | null;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ tenantId, currentSettings }) => {
  const [fees, setFees] = useState({ consultation: 500, platform: 200 });
  const [clinicInfo, setClinicInfo] = useState({ address: '', phone: '', email: '', logoUrl: '', logoBase64: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setFees({
        consultation: currentSettings.consultationFee || 500,
        platform: currentSettings.platformFee || 200
      });
      setClinicInfo({
        address: currentSettings.address || '',
        phone: currentSettings.phone || '',
        email: currentSettings.email || '',
        logoUrl: currentSettings.logoUrl || '',
        logoBase64: currentSettings.logoBase64 || ''
      });
    }
  }, [currentSettings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClinicInfo({
          ...clinicInfo,
          logoBase64: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = async () => {
    if (!tenantId) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "tenants", tenantId), {
        consultationFee: fees.consultation,
        platformFee: fees.platform,
        address: clinicInfo.address,
        phone: clinicInfo.phone,
        email: clinicInfo.email,
        logoUrl: clinicInfo.logoUrl,
        logoBase64: clinicInfo.logoBase64
      });
      alert("Settings synced.");
    } catch (e) {
      alert("Failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in pb-10">
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading text-primary uppercase leading-none">Facility Hub</h2>
        <p className="subheading text-secondary font-bold text-[9px] tracking-widest uppercase">System Master Node</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
           <h3 className="font-heading text-base sm:text-lg text-slate-700 uppercase tracking-widest border-b pb-3">Branding</h3>
           <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Logo</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {clinicInfo.logoBase64 ? (
                    <img src={clinicInfo.logoBase64} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300">
                      {ICONS.Home}
                    </div>
                  )}
                  <input 
                    type="file"
                    accept="image/*"
                    className="w-full bg-slate-50 border border-slate-200 outline-none font-bold text-[9px] p-2 rounded-xl"
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Address</label>
                <textarea 
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 outline-none font-bold text-xs p-3 rounded-xl shadow-inner" 
                  value={clinicInfo.address} 
                  onChange={e => setClinicInfo({...clinicInfo, address: e.target.value})}
                  placeholder="Street, City..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Phone</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 outline-none font-bold text-xs p-2.5 rounded-xl shadow-inner" 
                    value={clinicInfo.phone} 
                    onChange={e => setClinicInfo({...clinicInfo, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Email</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 outline-none font-bold text-xs p-2.5 rounded-xl shadow-inner" 
                    value={clinicInfo.email} 
                    onChange={e => setClinicInfo({...clinicInfo, email: e.target.value})}
                  />
                </div>
              </div>
           </div>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
           <h3 className="font-heading text-base sm:text-lg text-slate-700 uppercase tracking-widest border-b pb-3">Financials</h3>
           <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Consultation (INR)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 outline-none font-black text-sm p-3 rounded-xl shadow-inner" 
                  value={fees.consultation} 
                  onChange={e => setFees({...fees, consultation: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Platform Fee (INR)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 outline-none font-black text-sm p-3 rounded-xl shadow-inner" 
                  value={fees.platform} 
                  onChange={e => setFees({...fees, platform: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="pt-4">
                <button 
                  onClick={saveSettings} 
                  disabled={isSaving}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:bg-secondary transition-all disabled:opacity-50 text-[10px]"
                >
                  {isSaving ? 'Saving...' : 'Sync Master Node'}
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

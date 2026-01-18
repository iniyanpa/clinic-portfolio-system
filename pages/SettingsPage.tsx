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
  const [clinicInfo, setClinicInfo] = useState({ address: '', phone: '', email: '', logoUrl: '' });
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
        logoUrl: currentSettings.logoUrl || ''
      });
    }
  }, [currentSettings]);

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
        logoUrl: clinicInfo.logoUrl
      });
      alert("Clinic profile and configuration synced.");
    } catch (e) {
      alert("Sync failed. Check connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in">
      <div>
        <h2 className="text-3xl font-heading text-primary uppercase leading-none">Facility Hub</h2>
        <p className="subheading text-secondary font-bold text-[10px] tracking-widest uppercase">System Master Node</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clinic Branding Section */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
           <h3 className="font-heading text-lg text-slate-700 uppercase tracking-widest border-b pb-3">Branding & Letterhead</h3>
           <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Clinic Logo URL</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 outline-none font-bold text-xs" 
                  value={clinicInfo.logoUrl} 
                  onChange={e => setClinicInfo({...clinicInfo, logoUrl: e.target.value})}
                  placeholder="Link to hosted logo image..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Clinic Physical Address</label>
                <textarea 
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 outline-none font-bold text-xs" 
                  value={clinicInfo.address} 
                  onChange={e => setClinicInfo({...clinicInfo, address: e.target.value})}
                  placeholder="Full clinic address for letterhead..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Support Phone</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 outline-none font-bold text-xs" 
                    value={clinicInfo.phone} 
                    onChange={e => setClinicInfo({...clinicInfo, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Support Email</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 outline-none font-bold text-xs" 
                    value={clinicInfo.email} 
                    onChange={e => setClinicInfo({...clinicInfo, email: e.target.value})}
                  />
                </div>
              </div>
           </div>
        </div>

        {/* Fees Section */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
           <h3 className="font-heading text-lg text-slate-700 uppercase tracking-widest border-b pb-3">Financial Configuration</h3>
           <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Base Consultation Fee (INR)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 outline-none font-black text-sm" 
                  value={fees.consultation} 
                  onChange={e => setFees({...fees, consultation: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Platform & Facility Charge (INR)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 outline-none font-black text-sm" 
                  value={fees.platform} 
                  onChange={e => setFees({...fees, platform: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="pt-6">
                <button 
                  onClick={saveSettings} 
                  disabled={isSaving}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:bg-secondary transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Updating Node...' : 'Sync Clinical Profile'}
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setFees({
        consultation: currentSettings.consultationFee || 500,
        platform: currentSettings.platformFee || 200
      });
    }
  }, [currentSettings]);

  const saveSettings = async () => {
    if (!tenantId) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "tenants", tenantId), {
        consultationFee: fees.consultation,
        platformFee: fees.platform
      });
      alert("Clinic fee configuration updated.");
    } catch (e) {
      alert("Error updating fees.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in">
      <div>
        <h2 className="text-4xl font-heading text-primary uppercase leading-none">Facility Hub</h2>
        <p className="subheading text-secondary font-bold text-[10px] tracking-widest uppercase">System Control Node</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 space-y-8">
           <h3 className="font-heading text-xl text-slate-700 uppercase tracking-widest border-b pb-4">Fee Structure Configuration</h3>
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Consultation Fee (INR)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 outline-none font-black text-lg" 
                  value={fees.consultation} 
                  onChange={e => setFees({...fees, consultation: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Platform & Facility Charge (INR)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 outline-none font-black text-lg" 
                  value={fees.platform} 
                  onChange={e => setFees({...fees, platform: parseInt(e.target.value) || 0})}
                />
              </div>
              <button 
                onClick={saveSettings} 
                disabled={isSaving}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:bg-secondary transition-all disabled:opacity-50"
              >
                {isSaving ? 'Updating...' : 'Sync Fee Profile'}
              </button>
           </div>
        </div>

        <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 space-y-10">
           <h3 className="font-heading text-xl text-slate-700 uppercase tracking-widest border-b pb-4">Terminal Options</h3>
           <div className="space-y-4">
              {[
                { label: 'Patient Onboarding Email', desc: 'Automatic greeting for new cases', enabled: true },
                { label: 'WhatsApp Automation', desc: 'Send Rx & Bills directly to mobile', enabled: true },
                { label: 'AI Diagnostic Assistant', desc: 'Gemini-powered consultation insights', enabled: true },
              ].map((opt, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-secondary transition-all">
                  <div>
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest block">{opt.label}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">{opt.desc}</span>
                  </div>
                  <div className={`w-14 h-7 rounded-full relative transition-all ${opt.enabled ? 'bg-secondary' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${opt.enabled ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
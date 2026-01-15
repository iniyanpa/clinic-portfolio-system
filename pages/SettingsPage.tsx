
import React from 'react';
import { ICONS } from '../constants';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-4xl font-heading text-primary uppercase">Facility Hub</h2>
        <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Clinical System Configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
           <h3 className="font-heading text-xl text-slate-700 uppercase tracking-widest border-b pb-4">Branding & Location</h3>
           <div className="space-y-6">
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Hospital Name</label>
                 <input className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-primary" defaultValue="SLS HOSPITAL" readOnly />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Location Matrix</label>
                 <input className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none" defaultValue="Tirupati, Andhra Pradesh, India" readOnly />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest subheading">Regional Contact</label>
                 <input className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none" defaultValue="+91 877 1234567" readOnly />
              </div>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
           <h3 className="font-heading text-xl text-slate-700 uppercase tracking-widest border-b pb-4">Communication Triggers</h3>
           <div className="space-y-4">
              {[
                { label: 'Patient Welcome Email', enabled: true },
                { label: 'Appointment WhatsApp Confirmation', enabled: true },
                { label: 'Digital Rx SMS Notification', enabled: false },
                { label: 'Payment Receipt Automation', enabled: true },
                { label: 'AI Diagnostic Suggestions', enabled: true }
              ].map((opt, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group transition-all">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{opt.label}</span>
                  <div className={`w-12 h-6 rounded-full relative transition-all ${opt.enabled ? 'bg-secondary' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${opt.enabled ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="bg-primary/5 p-10 rounded-[3rem] border border-primary/10 flex flex-col items-center justify-center text-center">
         <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary mb-6">{ICONS.Settings}</div>
         <h4 className="font-heading text-2xl text-primary uppercase mb-2">System Audit</h4>
         <p className="text-xs text-slate-400 max-w-sm mb-8 font-medium">Core engine is running HealFlow v2.5 Enterprise. All data transactions are secured using clinical-grade encryption protocol.</p>
         <button className="px-10 py-4 bg-primary text-white font-heading uppercase text-xs tracking-widest rounded-2xl hover:bg-secondary shadow-lg transition-all">Initiate Full Backup</button>
      </div>
    </div>
  );
};

export default SettingsPage;

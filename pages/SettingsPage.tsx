
import React from 'react';
import { ICONS } from '../constants';
import { isFirebaseConfigured } from '../firebase';

const SettingsPage: React.FC = () => {
  const isConnected = isFirebaseConfigured();

  return (
    <div className="space-y-10 animate-in fade-in">
      <div>
        <h2 className="text-4xl font-heading text-primary uppercase leading-none">Facility Hub</h2>
        <p className="subheading text-secondary font-bold text-[10px] tracking-widest uppercase">Clinical System Configuration • Node Health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 space-y-10">
           <h3 className="font-heading text-xl text-slate-700 uppercase tracking-widest border-b pb-4">Cloud Health Monitor</h3>
           <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl transition-all ${isConnected ? 'bg-green-500 text-white animate-pulse' : 'bg-amber-500 text-white'}`}>
                {ICONS.Settings}
              </div>
              <h4 className={`font-heading text-2xl uppercase mb-2 ${isConnected ? 'text-green-600' : 'text-amber-600'}`}>
                {isConnected ? 'System Pulse: Syncing' : 'System Pulse: Local Mode'}
              </h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-10 leading-relaxed max-w-xs mx-auto">
                {isConnected 
                  ? 'Clinical Registry is currently synchronized with the Global Database Node.' 
                  : 'Registry is operating in disconnected mode. Cloud persistence is currently disabled.'}
              </p>
              
              <div className="w-full bg-white p-6 rounded-[2rem] text-[9px] font-mono text-slate-500 text-left border border-slate-200">
                <span className="text-primary font-bold">STATUS REPORT</span> <br/>
                API Handshake: {isConnected ? 'SECURED' : 'UNAVAILABLE'} <br/>
                Latency: 24ms <br/>
                Registry Size: 1.2 MB <br/>
                Backup Schedule: HOURLY
              </div>
           </div>
        </div>

        <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 space-y-10">
           <h3 className="font-heading text-xl text-slate-700 uppercase tracking-widest border-b pb-4">Communications Hub</h3>
           <div className="space-y-4">
              {[
                { label: 'Patient Onboarding Email', desc: 'Automatic greeting for new case ID', enabled: true },
                { label: 'WhatsApp Scheduler', desc: 'Send booking details to patient phone', enabled: true },
                { label: 'SMS Billing Receipt', desc: 'Transactional SMS upon settlement', enabled: false },
                { label: 'AI Diagnostic Suggestions', desc: 'Enable Gemini assistant in Consultation', enabled: true },
                { label: '2-Factor Terminal Auth', desc: 'Secure staff logins via OTP', enabled: false }
              ].map((opt, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] group hover:border-secondary border border-transparent transition-all">
                  <div>
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest block">{opt.label}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">{opt.desc}</span>
                  </div>
                  <div className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${opt.enabled ? 'bg-secondary' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${opt.enabled ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="bg-primary p-12 rounded-[4rem] border border-primary/10 flex flex-col items-center justify-center text-center relative overflow-hidden text-white shadow-2xl">
         <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">{ICONS.Settings}</div>
         <h4 className="font-heading text-3xl uppercase tracking-widest mb-4">Registry Integrity Audit</h4>
         <p className="text-xs text-white/50 max-w-lg mb-10 font-bold uppercase tracking-widest leading-relaxed">System is running HealFlow Outpatient OS v2.5 Enterprise. All patient transactions are encrypted with 256-bit AES protocol.</p>
         <button className="px-12 py-5 bg-secondary text-white font-heading uppercase text-sm tracking-widest rounded-2xl hover:bg-white hover:text-primary shadow-2xl transition-all">Trigger Manual Backup Node</button>
      </div>
    </div>
  );
};

export default SettingsPage;

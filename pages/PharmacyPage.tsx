import React from 'react';
import { ICONS } from '../constants';
import { Prescription, Patient } from '../types';

interface PharmacyPageProps {
  prescriptions: Prescription[];
  patients: Patient[];
  clinicName: string;
  onDispense: (pxId: string) => void;
}

const PharmacyPage: React.FC<PharmacyPageProps> = ({ prescriptions, patients, clinicName, onDispense }) => {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase">Pharmacy Management</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest uppercase">Prescription Fulfillment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {prescriptions.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
            <p className="text-slate-300 font-bold italic">No pending medication orders.</p>
          </div>
        ) : (
          prescriptions.map((px) => {
            const p = patients.find(pat => pat.id === px.patientId);
            return (
              <div key={px.id} className={`bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all ${px.status === 'Dispensed' ? 'opacity-50 grayscale' : 'hover:border-secondary'}`}>
                <div className="flex flex-col md:flex-row">
                  <div className={`p-8 md:w-64 flex flex-col justify-center items-center text-center gap-2 ${px.status === 'Dispensed' ? 'bg-slate-100' : 'bg-primary text-white'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Rx ID</span>
                    <span className="font-mono text-xl font-bold">#{px.id.slice(-6)}</span>
                    <span className={`px-4 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest mt-2 ${px.status === 'Dispensed' ? 'bg-green-100 text-green-700' : 'bg-white/20 text-white'}`}>
                      {px.status}
                    </span>
                  </div>
                  <div className="flex-1 p-8 space-y-6">
                    <div>
                      <h4 className="font-heading text-2xl text-slate-800 uppercase tracking-widest">{p?.firstName} {p?.lastName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {p?.id} • Date: {px.date}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {px.medicines.map((med, idx) => (
                        <div key={idx} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                          <div>
                            <p className="text-sm font-bold text-slate-700">{med.name}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{med.instructions}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-primary">{med.dosage}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{med.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {px.status === 'Pending' && (
                      <div className="pt-6 border-t border-slate-50 flex justify-end">
                        <button 
                          onClick={() => {
                            if(window.confirm("Confirm medicine dispensing for this prescription?")) {
                              onDispense(px.id);
                            }
                          }}
                          className="bg-secondary text-white px-10 py-4 rounded-2xl font-heading text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95"
                        >
                          Dispense Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PharmacyPage;
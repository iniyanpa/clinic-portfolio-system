import React, { useMemo } from 'react';
import { ICONS } from '../constants';
import { Prescription, Patient, Appointment } from '../types';

interface PharmacyPageProps {
  prescriptions: Prescription[];
  patients: Patient[];
  appointments: Appointment[];
  clinicName: string;
  onDispense: (pxId: string) => void;
}

const PharmacyPage: React.FC<PharmacyPageProps> = ({ prescriptions, patients, appointments, clinicName, onDispense }) => {
  const pharmacyQueue = useMemo(() => {
    return prescriptions.map(px => {
      const appt = appointments.find(a => a.id === px.appointmentId);
      return {
        ...px,
        time: appt?.time || '00:00',
        visitDate: appt?.date || px.date
      };
    }).sort((a, b) => {
      const dateTimeA = `${a.visitDate} ${a.time}`;
      const dateTimeB = `${b.visitDate} ${b.time}`;
      return dateTimeB.localeCompare(dateTimeA);
    });
  }, [prescriptions, appointments]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading text-primary uppercase">Pharmacy Control</h2>
          <p className="subheading text-secondary font-bold text-[9px] tracking-widest uppercase">Clinical Fulfillment Node</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {pharmacyQueue.length === 0 ? (
          <div className="bg-white p-16 sm:p-20 rounded-[2rem] text-center border-2 border-dashed border-slate-100">
            <p className="text-slate-300 font-bold italic text-sm">No medication orders pending.</p>
          </div>
        ) : (
          pharmacyQueue.map((px) => {
            const p = patients.find(pat => pat.id === px.patientId);
            return (
              <div key={px.id} className={`bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden transition-all ${px.status === 'Dispensed' ? 'opacity-60 grayscale' : 'hover:border-secondary shadow-md'}`}>
                <div className="flex flex-col md:flex-row">
                  <div className={`p-6 sm:p-8 md:w-56 flex flex-col justify-center items-center text-center gap-1 sm:gap-1.5 ${px.status === 'Dispensed' ? 'bg-slate-100' : 'bg-primary text-white'}`}>
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Rx Terminal</span>
                    <span className="font-mono text-lg sm:text-xl font-bold">#{px.id.slice(-5)}</span>
                    <div className="mt-2 text-[9px] font-black font-mono bg-white/10 px-3 py-2 rounded-lg leading-tight w-full">
                      <div className="opacity-50 text-[7px] uppercase">Slot</div>
                      {px.visitDate} | {px.time}
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[7px] font-bold uppercase tracking-widest mt-2 ${px.status === 'Dispensed' ? 'bg-green-100 text-green-700' : 'bg-white/20 text-white'}`}>
                      {px.status}
                    </span>
                  </div>
                  <div className="flex-1 p-6 sm:p-8 space-y-4 sm:space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h4 className="font-heading text-xl sm:text-2xl text-slate-800 uppercase tracking-tight truncate">{p?.firstName} {p?.lastName}</h4>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">ID: {p?.id}</p>
                      </div>
                      <div className="hidden sm:block text-slate-100 flex-shrink-0">{ICONS.Staff}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {px.medicines.map((med, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-inner group transition-all">
                          <div className="min-w-0 flex-1 mr-2">
                            <p className="text-xs font-bold text-slate-700 leading-none truncate">{med.name}</p>
                            <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest mt-1 truncate">{med.instructions}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[10px] font-bold text-primary font-mono">{med.dosage}</p>
                            <p className="text-[7px] text-slate-400 font-bold uppercase">{med.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {px.status === 'Pending' && (
                      <div className="pt-4 sm:pt-6 border-t border-slate-50 flex justify-end">
                        <button 
                          onClick={() => {
                            if(window.confirm("Confirm dispensing?")) {
                              onDispense(px.id);
                            }
                          }}
                          className="w-full sm:w-auto bg-secondary text-white px-8 py-2.5 rounded-xl font-bold uppercase text-[8px] tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95"
                        >
                          Confirm
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

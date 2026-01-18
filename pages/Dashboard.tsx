import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ICONS } from '../constants';
import { Patient, Appointment, Bill, CommunicationLog } from '../types';

interface DashboardProps {
  patients: Patient[];
  appointments: Appointment[];
  bills: Bill[];
  logs: CommunicationLog[];
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ patients, appointments, bills, logs, setActiveTab }) => {
  const analytics = useMemo(() => {
    const totalRev = bills.reduce((acc, b) => acc + b.total, 0);
    const pendingAppts = appointments.filter(a => a.status === 'Scheduled' || a.status === 'Checked-in').length;
    const revData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dailyTotal = bills.filter(b => b.date === dateStr).reduce((sum, b) => sum + b.total, 0);
      return { name: d.toLocaleDateString('en-IN', { weekday: 'short' }), rev: dailyTotal };
    }).reverse();
    return { totalRev, pendingAppts, revData };
  }, [bills, appointments]);

  return (
    <div className="space-y-10 animate-in fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'OPD Revenue', value: '₹' + analytics.totalRev.toLocaleString('en-IN'), icon: ICONS.Billing, color: 'text-green-500' },
          { label: 'Active Queue', value: analytics.pendingAppts, icon: ICONS.Appointments, color: 'text-primary' },
          { label: 'Patient Nodes', value: patients.length, icon: ICONS.Patients, color: 'text-secondary' },
          { label: 'System Logs', value: logs.length, icon: ICONS.SMS, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 group hover:border-primary transition-all">
            <div className="flex justify-between items-center mb-6">
               <div className={`p-4 bg-slate-50 rounded-2xl ${stat.color} group-hover:bg-primary group-hover:text-white transition-all`}>{stat.icon}</div>
               <span className="bg-slate-50 text-[8px] font-black px-2 py-1 rounded-lg uppercase text-slate-300">Sync</span>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest subheading">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm">
           <h3 className="text-2xl font-heading text-slate-700 uppercase tracking-widest mb-10">Revenue Analytics</h3>
           <div className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#29baed" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#29baed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="rev" stroke="#29378c" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col">
           <h3 className="text-xl font-heading text-slate-700 uppercase tracking-widest mb-8 flex items-center gap-3">
              {ICONS.Notification} Live Queue
           </h3>
           <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              {appointments.filter(a => a.status === 'Checked-in').map(appt => {
                const p = patients.find(pat => pat.id === appt.patientId);
                return (
                  <div key={appt.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-secondary transition-all">
                     <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{p?.firstName} {p?.lastName}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Wait Time: {appt.time}</p>
                     </div>
                     <span className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_#29baed]"></span>
                  </div>
                );
              })}
              {appointments.filter(a => a.status === 'Checked-in').length === 0 && <p className="text-center py-20 text-slate-300 italic text-sm font-bold">Waiting hall empty.</p>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
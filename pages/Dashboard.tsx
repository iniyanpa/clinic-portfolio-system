
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

const Dashboard: React.FC<DashboardProps> = ({ patients, appointments, bills, logs }) => {
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
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {[
          { label: 'Total Revenue', value: '₹' + analytics.totalRev.toLocaleString('en-IN'), icon: ICONS.Billing, color: 'text-green-500' },
          { label: 'Today\'s Queue', value: analytics.pendingAppts, icon: ICONS.Appointments, color: 'text-primary' },
          { label: 'Active Patients', value: patients.length, icon: ICONS.Patients, color: 'text-secondary' },
          { label: 'Comms Sent', value: logs.length, icon: ICONS.SMS, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-100 group">
            <div className="flex justify-between items-start mb-4">
               <div className={`p-3 md:p-4 bg-slate-50 rounded-2xl ${stat.color} group-hover:bg-primary group-hover:text-white transition-all`}>
                 {stat.icon}
               </div>
               <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Real-time</span>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest subheading">{stat.label}</p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
           <h3 className="text-xl md:text-2xl font-heading text-slate-700 uppercase tracking-[0.2em] mb-8">Revenue Stream</h3>
           <div className="h-[250px] md:h-[350px]">
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
                  <Tooltip />
                  <Area type="monotone" dataKey="rev" stroke="#29baed" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
           <h3 className="text-xl md:text-2xl font-heading text-slate-700 uppercase tracking-[0.2em] mb-6 md:mb-8">Notifications</h3>
           <div className="space-y-4 max-h-[300px] lg:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.map(log => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">{log.type}</span>
                      <span className="text-[8px] text-slate-400">{new Date(log.sentAt).toLocaleTimeString()}</span>
                   </div>
                   <p className="text-[11px] text-slate-600 leading-relaxed italic">"{log.content}"</p>
                </div>
              ))}
              {logs.length === 0 && <p className="text-center py-10 text-slate-300 text-xs">No activity logs.</p>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

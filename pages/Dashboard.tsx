
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { ICONS } from '../constants';
import { Patient, Appointment, Bill } from '../types';

// Defined interface for Dashboard props to resolve 'IntrinsicAttributes' error
interface DashboardProps {
  patients: Patient[];
  appointments: Appointment[];
  bills: Bill[];
}

const statsData = [
  { name: 'Mon', appointments: 12, revenue: 2400 },
  { name: 'Tue', appointments: 19, revenue: 3800 },
  { name: 'Wed', appointments: 15, revenue: 3000 },
  { name: 'Thu', appointments: 22, revenue: 4400 },
  { name: 'Fri', appointments: 30, revenue: 6000 },
  { name: 'Sat', appointments: 10, revenue: 2000 },
];

const distributionData = [
  { name: 'General', value: 400 },
  { name: 'Pediatrics', value: 300 },
  { name: 'Dermatology', value: 200 },
  { name: 'Cardiology', value: 278 },
];

const COLORS_PIE = ['#29378c', '#29baed', '#10b981', '#f59e0b'];

// Updated component to use DashboardProps
const Dashboard: React.FC<DashboardProps> = ({ patients, appointments, bills }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase">Clinic Overview</h2>
          <p className="subheading text-secondary font-bold">Real-time Analytics</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition-colors">
            {ICONS.Download} Export PDF
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity">
            {ICONS.Plus} New Appointment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Patients', value: patients.length.toLocaleString(), trend: '+12%', color: 'border-l-4 border-primary' },
          { label: 'Today Appointments', value: appointments.length.toString(), trend: '+5', color: 'border-l-4 border-secondary' },
          { label: 'Monthly Revenue', value: '$' + bills.reduce((acc, b) => acc + b.total, 0).toLocaleString(), trend: '+18%', color: 'border-l-4 border-green-500' },
          { label: 'Avg Rating', value: '4.8/5', trend: 'Excellent', color: 'border-l-4 border-yellow-500' },
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-xl shadow-sm ${stat.color} hover:shadow-md transition-shadow`}>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
            <div className="flex justify-between items-end mt-2">
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <span className="text-green-500 text-sm font-bold">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-700 font-heading">Patient Traffic & Revenue</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#29baed" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#29baed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#29baed" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="appointments" stroke="#29378c" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-700 font-heading">Department Distribution</h3>
          <div className="h-80 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {distributionData.map((d, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS_PIE[i]}}></div>
                  <span className="text-xs text-gray-500">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-gray-700 font-heading">Today's Appointments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 font-semibold text-sm text-gray-500">Patient Name</th>
                <th className="pb-3 font-semibold text-sm text-gray-500">Time</th>
                <th className="pb-3 font-semibold text-sm text-gray-500">Reason</th>
                <th className="pb-3 font-semibold text-sm text-gray-500">Status</th>
                <th className="pb-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {/* Used appointments and patients props to render dynamic data instead of hardcoded items */}
              {appointments.slice(0, 5).map((appt) => {
                const patient = patients.find(p => p.id === appt.patientId);
                return (
                  <tr key={appt.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium text-gray-800">{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</td>
                    <td className="py-4 text-gray-600">{appt.time}</td>
                    <td className="py-4 text-gray-600">{appt.reason}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        appt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        appt.status === 'Waiting' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-primary hover:text-secondary font-bold text-sm">View Record</button>
                    </td>
                  </tr>
                );
              })}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 italic">No appointments for today</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

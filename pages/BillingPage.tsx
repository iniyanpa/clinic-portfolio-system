
import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { ICONS } from '../constants';
import { Patient, Appointment, Bill, PaymentMethod, MedicalRecord, Prescription, BillItem } from '../types';

interface BillingPageProps {
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  prescriptions: Prescription[];
  bills: Bill[];
  clinicName: string;
  addBill: (b: Bill) => void;
}

const BillingPage: React.FC<BillingPageProps> = ({ patients, appointments, records, prescriptions, bills, clinicName, addBill }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('UPI');
  const [searchHistory, setSearchHistory] = useState('');
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | ''>('');
  
  const [editingBillApptId, setEditingBillApptId] = useState<string | null>(null);
  const [editingItems, setEditingItems] = useState<BillItem[]>([
    { id: '1', description: 'OPD Consultation Fee', amount: 500 },
    { id: '2', description: 'Clinic Facility Charges', amount: 200 }
  ]);

  const pendingInvoices = useMemo(() => {
    return appointments.filter(appt => 
      appt.status === 'Completed' && 
      !bills.some(bill => bill.appointmentId === appt.id)
    );
  }, [appointments, bills]);

  const filteredHistory = useMemo(() => {
    return bills.filter(b => {
      const p = patients.find(pat => pat.id === b.patientId);
      const nameMatch = p ? `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchHistory.toLowerCase()) : false;
      const methodMatch = filterMethod ? b.paymentMethod === filterMethod : true;
      return nameMatch && methodMatch;
    }).sort((a,b) => b.date.localeCompare(a.date));
  }, [bills, patients, searchHistory, filterMethod]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayBills = bills.filter(b => b.date === today);
    return {
      dailyRevenue: todayBills.reduce((acc, b) => acc + b.total, 0),
      volume: todayBills.length,
      pendingCount: pendingInvoices.length
    };
  }, [bills, pendingInvoices]);

  const generateClinicalPDF = (patient: Patient, appt: Appointment, record?: MedicalRecord, prescription?: Prescription, finalizedItems?: BillItem[]) => {
    const doc = new jsPDF();
    const primaryColor = [41, 55, 140];
    const secondaryColor = [41, 186, 237];

    // Header Background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 50, 'F');
    
    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(clinicName.toUpperCase(), 20, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('CLINICAL FULFILLMENT SYSTEMS', 20, 33);
    doc.text(`DATE: ${new Date().toLocaleDateString('en-IN')}`, 20, 38);
    
    // Divider
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(20, 42, 190, 42);

    // Section Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CLINICAL SUMMARY & PRESCRIPTION', 20, 65);
    
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(1);
    doc.line(20, 68, 190, 68);

    // Patient Info
    doc.setFontSize(10);
    doc.text('PATIENT REGISTRY DETAILS', 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${patient.firstName} ${patient.lastName}`, 20, 86);
    doc.text(`Patient ID: ${patient.id}`, 20, 91);
    doc.text(`Gender/Age: ${patient.gender} • DOB: ${patient.dateOfBirth}`, 20, 96);
    
    doc.text(`Case ID: ${appt.id}`, 140, 91);
    doc.text(`Blood Group: ${patient.bloodGroup}`, 140, 96);

    let y = 110;

    // Assessment Info
    if (record) {
      doc.setFont('helvetica', 'bold');
      doc.text('VITALS & ASSESSMENT:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`BP: ${record.vitals?.bp || 'N/A'} | Pulse: ${record.vitals?.pulse || 'N/A'} | Temp: ${record.vitals?.temp || 'N/A'} | Wt: ${record.vitals?.weight || 'N/A'}kg`, 20, y + 6);
      y += 18;

      doc.setFont('helvetica', 'bold');
      doc.text('DIAGNOSIS:', 20, y);
      doc.setFont('helvetica', 'normal');
      const diagLines = doc.splitTextToSize(record.diagnosis || 'Clinical evaluation complete', 170);
      doc.text(diagLines, 20, y + 6);
      y += (diagLines.length * 5) + 12;
    }

    // Prescription Info
    if (prescription && prescription.medicines.length > 0) {
      doc.setFillColor(245, 247, 250);
      doc.rect(20, y, 170, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICINE NAME', 25, y + 5);
      doc.text('USAGE / DOSAGE', 120, y + 5);
      y += 12;

      prescription.medicines.forEach((med) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(med.name, 25, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`${med.duration}`, 25, y + 5);
        doc.text(`${med.dosage} (${med.instructions})`, 120, y);
        doc.setDrawColor(240, 240, 240);
        doc.line(20, y + 8, 190, y + 8);
        y += 15;
      });
    }

    // Settlement Info
    if (finalizedItems) {
        y = Math.max(y, 230);
        doc.setFont('helvetica', 'bold');
        doc.text('FINANCIAL SETTLEMENT', 20, y);
        doc.setLineWidth(0.2);
        doc.line(20, y + 2, 80, y + 2);
        y += 8;
        finalizedItems.forEach(item => {
            doc.setFontSize(8);
            doc.text(`${item.description}`, 20, y);
            doc.text(`INR ${item.amount.toFixed(2)}`, 80, y, { align: 'right' });
            y += 4;
        });
        doc.setFontSize(10);
        const total = finalizedItems.reduce((s, i) => s + i.amount, 0);
        doc.text(`TOTAL AMOUNT PAID: INR ${total.toFixed(2)}`, 20, y + 6);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`This is a digitally generated clinical document from ${clinicName} Terminal.`, 105, 285, { align: 'center' });
    
    // Stop and Ask before downloading
    if (window.confirm("Clinical Data PDF generated successfully. Would you like to download it now?")) {
        doc.save(`${clinicName.replace(/\s/g, '_')}_DigitalFile_${patient.firstName}.pdf`);
    }
  };

  const processPayment = (appt: Appointment) => {
    const p = patients.find(pat => pat.id === appt.patientId);
    if (!p) return;

    const total = editingItems.reduce((acc, item) => acc + item.amount, 0);

    const newBill: Bill = {
      id: `BILL-${Date.now().toString().slice(-6)}`,
      tenantId: p.tenantId,
      patientId: p.id,
      appointmentId: appt.id,
      date: new Date().toISOString().split('T')[0],
      items: [...editingItems],
      total: total,
      status: 'Paid',
      paymentMethod: selectedPayment
    };

    addBill(newBill);
    
    // Attempt to fetch matching clinical context
    const record = records.find(r => r.appointmentId === appt.id);
    const px = prescriptions.find(pr => pr.appointmentId === appt.id);
    
    generateClinicalPDF(p, appt, record, px, editingItems);

    setEditingBillApptId(null);
    setEditingItems([
      { id: '1', description: 'OPD Consultation Fee', amount: 500 },
      { id: '2', description: 'Clinic Facility Charges', amount: 200 }
    ]);
  };

  const resendFile = (bill: Bill) => {
    const p = patients.find(pat => pat.id === bill.patientId);
    const appt = appointments.find(a => a.id === bill.appointmentId);
    if (!p || !appt) {
      alert("Missing patient or appointment context. Journey incomplete.");
      return;
    }

    const record = records.find(r => r.appointmentId === bill.appointmentId);
    const px = prescriptions.find(pr => pr.appointmentId === bill.appointmentId);

    generateClinicalPDF(p, appt, record, px, bill.items);
  };

  return (
    <div className="space-y-10 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-primary transition-all">
           <div className="flex justify-between items-center mb-4">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Collection (Today)</p>
             <div className="text-primary opacity-20 group-hover:opacity-100 transition-opacity">{ICONS.Billing}</div>
           </div>
           <h3 className="text-3xl font-bold text-primary">₹{stats.dailyRevenue.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-secondary transition-all">
           <div className="flex justify-between items-center mb-4">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Transacted (Today)</p>
             <div className="text-secondary opacity-20 group-hover:opacity-100 transition-opacity">{ICONS.Records}</div>
           </div>
           <h3 className="text-3xl font-bold text-secondary">{stats.volume}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-amber-500 transition-all">
           <div className="flex justify-between items-center mb-4">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Incomplete Checks</p>
             <div className="text-amber-500 opacity-20 group-hover:opacity-100 transition-opacity">{ICONS.Appointments}</div>
           </div>
           <h3 className="text-3xl font-bold text-amber-500">{stats.pendingCount}</h3>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase leading-none">Accounts Desk</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Financial Matrix</p>
        </div>
        <div className="flex bg-white rounded-2xl shadow-sm border border-slate-100 p-1">
          <button onClick={() => setActiveTab('pending')} className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'pending' ? 'bg-primary text-white shadow-lg' : 'text-slate-400'}`}>Unpaid Visits</button>
          <button onClick={() => setActiveTab('history')} className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-lg' : 'text-slate-400'}`}>Transaction Ledger</button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {pendingInvoices.map(appt => {
             const p = patients.find(pat => pat.id === appt.patientId);
             const isEditing = editingBillApptId === appt.id;
             return (
               <div key={appt.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-secondary transition-all">
                  <div>
                    <div className="flex justify-between mb-8">
                      <div>
                        <h4 className="font-heading text-2xl text-slate-800 leading-none mb-2 uppercase tracking-widest">{p?.firstName} {p?.lastName}</h4>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em]">{appt.id} • {appt.department}</p>
                      </div>
                      <span className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center font-bold">₹</span>
                    </div>

                    <div className="space-y-3 mb-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Billable Entries (Editable)</p>
                       {isEditing ? (
                         <div className="space-y-4 animate-in slide-in-from-top-4">
                            {editingItems.map(item => (
                              <div key={item.id} className="flex gap-2 items-center">
                                <input 
                                  className="flex-1 bg-white p-2 rounded-lg text-xs outline-none focus:ring-1 ring-secondary text-slate-900"
                                  value={item.description}
                                  onChange={e => setEditingItems(editingItems.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))}
                                />
                                <input 
                                  className="w-20 bg-white p-2 rounded-lg text-xs outline-none focus:ring-1 ring-secondary font-mono text-slate-900"
                                  type="number"
                                  value={item.amount}
                                  onChange={e => setEditingItems(editingItems.map(i => i.id === item.id ? { ...i, amount: parseFloat(e.target.value) || 0 } : i))}
                                />
                                <button onClick={() => setEditingItems(editingItems.filter(i => i.id !== item.id))} className="text-red-300 hover:text-red-500 text-lg leading-none">×</button>
                              </div>
                            ))}
                            <button onClick={() => setEditingItems([...editingItems, { id: Date.now().toString(), description: 'Add-on Service', amount: 0 }])} className="text-[9px] font-bold text-secondary uppercase hover:underline">+ Add Charge Item</button>
                         </div>
                       ) : (
                         <div className="space-y-2">
                           {editingItems.map(item => (
                              <div key={item.id} className="flex justify-between text-xs text-slate-700">
                                <span className="font-medium">{item.description}</span>
                                <span className="font-mono">₹{item.amount.toFixed(2)}</span>
                              </div>
                           ))}
                         </div>
                       )}
                       <div className="pt-4 mt-2 border-t border-slate-200 flex justify-between text-xl font-bold text-primary">
                         <span className="font-heading uppercase tracking-widest">Net Payable</span>
                         <span className="font-mono">₹{editingItems.reduce((s, i) => s + i.amount, 0).toFixed(2)}</span>
                       </div>
                    </div>
                    
                    <div className="flex gap-4 mb-8">
                      <button 
                        onClick={() => {
                          if (isEditing) setEditingBillApptId(null);
                          else setEditingBillApptId(appt.id);
                        }}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all shadow-sm ${isEditing ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {isEditing ? 'Finalize Ledger' : 'Edit Bill Items'}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-8">
                      {(['UPI', 'Cash', 'Card'] as PaymentMethod[]).map(m => (
                        <button key={m} onClick={() => setSelectedPayment(m)} className={`py-3 rounded-xl text-[9px] font-bold uppercase transition-all ${selectedPayment === m ? 'bg-primary text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => processPayment(appt)} className="w-full py-5 bg-primary text-white font-heading text-xl uppercase tracking-widest rounded-3xl hover:bg-secondary transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                    {ICONS.Billing} Complete Payment & Export File
                  </button>
               </div>
             )
           })}
           {pendingInvoices.length === 0 && (
             <div className="lg:col-span-2 text-center py-20 bg-white rounded-[3rem] border border-slate-100 border-dashed">
                <p className="text-slate-300 italic font-medium">No pending clinical fees detected.</p>
             </div>
           )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row gap-4 items-center shadow-sm">
             <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                  {ICONS.Search}
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none text-sm text-slate-900"
                  placeholder="Search Ledger..."
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                />
             </div>
             <select className="p-3 bg-slate-50 rounded-xl text-xs font-bold uppercase outline-none text-slate-900" value={filterMethod} onChange={e => setFilterMethod(e.target.value as any)}>
                <option value="">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
             </select>
          </div>

          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50">
                     <tr>
                        <th className="px-10 py-6 text-[10px] text-slate-400 uppercase tracking-widest font-bold subheading">Invoice</th>
                        <th className="px-10 py-6 text-[10px] text-slate-400 uppercase tracking-widest font-bold subheading">Patient</th>
                        <th className="px-10 py-6 text-[10px] text-slate-400 uppercase tracking-widest font-bold subheading">Total</th>
                        <th className="px-10 py-6 text-[10px] text-slate-400 uppercase tracking-widest font-bold subheading text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredHistory.map(bill => (
                        <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-10 py-6 font-mono font-bold text-primary text-xs">#{bill.id.slice(-6)}</td>
                           <td className="px-10 py-6 font-bold text-slate-800 text-sm">
                              {patients.find(pat => pat.id === bill.patientId)?.firstName} {patients.find(pat => pat.id === bill.patientId)?.lastName}
                              <div className="text-[8px] font-bold text-slate-300 uppercase mt-1">{bill.date} • {bill.paymentMethod}</div>
                           </td>
                           <td className="px-10 py-6 font-bold text-slate-700 font-mono text-sm">₹{bill.total.toFixed(2)}</td>
                           <td className="px-10 py-6 text-right">
                              <button 
                                onClick={() => resendFile(bill)} 
                                className="inline-flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-sm"
                              >
                                {ICONS.Download} Re-export Clinical File
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;

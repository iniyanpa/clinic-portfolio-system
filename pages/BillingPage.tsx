
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
    const activeVitals = record?.vitals || appt.vitals;
    if (activeVitals) {
      doc.setFont('helvetica', 'bold');
      doc.text('VITALS & ASSESSMENT:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`BP: ${activeVitals.bp || 'N/A'} | Pulse: ${activeVitals.pulse || 'N/A'} | Temp: ${activeVitals.temp || 'N/A'} | Wt: ${activeVitals.weight || 'N/A'}kg`, 20, y + 6);
      y += 18;
    }

    if (record) {
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
      alert("System integrity error: Missing patient or appointment context.");
      return;
    }

    const record = records.find(r => r.appointmentId === bill.appointmentId);
    const px = prescriptions.find(pr => pr.appointmentId === bill.appointmentId);

    generateClinicalPDF(p, appt, record, px, bill.items);
  };

  return (
    <div className="space-y-10 animate-in fade-in">
      {/* Stats Cards */}
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
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest subheading">Unbilled Visits</p>
             <div className="text-amber-500 opacity-20 group-hover:opacity-100 transition-opacity">{ICONS.Appointments}</div>
           </div>
           <h3 className="text-3xl font-bold text-amber-500">{stats.pendingCount}</h3>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-heading text-primary uppercase leading-none">Financial Desk</h2>
          <p className="subheading text-secondary font-bold text-[10px] tracking-widest">Accounting Module</p>
        </div>
        <div className="flex bg-slate-50 rounded-2xl p-1 border border-slate-100 shadow-inner">
          <button onClick={() => setActiveTab('pending')} className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'pending' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-primary'}`}>Pending Invoices</button>
          <button onClick={() => setActiveTab('history')} className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-primary'}`}>Transaction Log</button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {pendingInvoices.map(appt => {
             const p = patients.find(pat => pat.id === appt.patientId);
             const isEditing = editingBillApptId === appt.id;
             return (
               <div key={appt.id} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-secondary transition-all">
                  <div>
                    <div className="flex justify-between mb-8">
                      <div>
                        <h4 className="font-heading text-2xl text-slate-800 leading-none mb-2 uppercase tracking-widest">{p?.firstName} {p?.lastName}</h4>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em]">{appt.id} • {appt.department}</p>
                      </div>
                      <span className="w-14 h-14 bg-slate-50 text-secondary rounded-[1.5rem] flex items-center justify-center font-bold border border-slate-100 shadow-inner">₹</span>
                    </div>

                    <div className="space-y-4 mb-8 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex justify-between items-center">
                          Breakdown Matrix
                          <span className="text-primary font-heading">Session Details</span>
                       </p>
                       {isEditing ? (
                         <div className="space-y-4 animate-in slide-in-from-top-4">
                            {editingItems.map(item => (
                              <div key={item.id} className="flex gap-3 items-center">
                                <input 
                                  className="flex-1 bg-white p-3 rounded-xl text-xs outline-none border border-slate-100 focus:ring-2 ring-secondary/20 text-slate-900 font-bold"
                                  value={item.description}
                                  onChange={e => setEditingItems(editingItems.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))}
                                />
                                <input 
                                  className="w-24 bg-white p-3 rounded-xl text-xs outline-none border border-slate-100 focus:ring-2 ring-secondary/20 font-mono text-slate-900 font-bold text-right"
                                  type="number"
                                  value={item.amount}
                                  onChange={e => setEditingItems(editingItems.map(i => i.id === item.id ? { ...i, amount: parseFloat(e.target.value) || 0 } : i))}
                                />
                                <button onClick={() => setEditingItems(editingItems.filter(i => i.id !== item.id))} className="text-red-400 hover:text-red-600 transition-colors p-1">×</button>
                              </div>
                            ))}
                            <button onClick={() => setEditingItems([...editingItems, { id: Date.now().toString(), description: 'Facility Add-on', amount: 0 }])} className="w-full py-3 border-2 border-dashed border-slate-200 text-[9px] font-bold text-secondary uppercase hover:border-secondary transition-all rounded-xl">+ Append Entry</button>
                         </div>
                       ) : (
                         <div className="space-y-3">
                           {editingItems.map(item => (
                              <div key={item.id} className="flex justify-between text-xs text-slate-600 font-medium">
                                <span>{item.description}</span>
                                <span className="font-mono text-slate-800">₹{item.amount.toFixed(2)}</span>
                              </div>
                           ))}
                         </div>
                       )}
                       <div className="pt-6 mt-4 border-t border-slate-200 flex justify-between items-end">
                         <span className="font-heading uppercase tracking-widest text-primary text-xl">Amount Due</span>
                         <span className="font-mono text-2xl font-bold text-primary">₹{editingItems.reduce((s, i) => s + i.amount, 0).toFixed(2)}</span>
                       </div>
                    </div>
                    
                    <div className="flex gap-4 mb-8">
                      <button 
                        onClick={() => {
                          if (isEditing) setEditingBillApptId(null);
                          else setEditingBillApptId(appt.id);
                        }}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${isEditing ? 'bg-secondary text-white' : 'bg-white text-slate-400 hover:text-primary border border-slate-100'}`}
                      >
                        {isEditing ? 'Confirm Ledger' : 'Modify Line Items'}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-10">
                      {(['UPI', 'Cash', 'Card'] as PaymentMethod[]).map(m => (
                        <button key={m} onClick={() => setSelectedPayment(m)} className={`py-4 rounded-2xl text-[9px] font-bold uppercase transition-all tracking-widest ${selectedPayment === m ? 'bg-primary text-white shadow-xl translate-y-[-2px]' : 'bg-slate-50 text-slate-300 hover:bg-white border border-slate-100'}`}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => processPayment(appt)} className="w-full py-6 bg-primary text-white font-heading text-xl uppercase tracking-[0.2em] rounded-[2rem] hover:bg-secondary transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4">
                    {ICONS.Billing} Finalize Settlement
                  </button>
               </div>
             )
           })}
           {pendingInvoices.length === 0 && (
             <div className="lg:col-span-2 text-center py-24 bg-slate-50 rounded-[4rem] border-4 border-dashed border-white">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-sm">{ICONS.Billing}</div>
                <p className="text-slate-400 font-heading uppercase tracking-widest text-lg">No Pending Collections</p>
                <p className="text-slate-300 text-xs mt-2 italic">All clinical sessions have been reconciled.</p>
             </div>
           )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-4 items-center shadow-sm">
             <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300">
                  {ICONS.Search}
                </div>
                <input
                  type="text"
                  className="block w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none text-sm text-slate-900 font-medium"
                  placeholder="Query Transaction History..."
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                />
             </div>
             <select className="p-4 bg-slate-50 rounded-2xl text-[10px] font-bold uppercase outline-none text-primary border border-slate-100" value={filterMethod} onChange={e => setFilterMethod(e.target.value as any)}>
                <option value="">All Settlement Modes</option>
                <option value="UPI">UPI Transfer</option>
                <option value="Cash">Cash Liquidity</option>
                <option value="Card">Terminal Credit/Debit</option>
             </select>
          </div>

          <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-50">
                     <tr>
                        <th className="px-12 py-8 text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">Protocol ID</th>
                        <th className="px-12 py-8 text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">Patient Link</th>
                        <th className="px-12 py-8 text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold text-center">Net Settlement</th>
                        <th className="px-12 py-8 text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold text-right">Fulfillment</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredHistory.map(bill => (
                        <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-12 py-8 font-mono font-bold text-primary text-xs tracking-widest">#{bill.id.slice(-6)}</td>
                           <td className="px-12 py-8 font-bold text-slate-800 text-sm">
                              {patients.find(pat => pat.id === bill.patientId)?.firstName} {patients.find(pat => pat.id === bill.patientId)?.lastName}
                              <div className="flex items-center gap-3 mt-2">
                                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{bill.date}</span>
                                 <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                 <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">{bill.paymentMethod}</span>
                              </div>
                           </td>
                           <td className="px-12 py-8 font-bold text-slate-700 font-mono text-sm text-center">₹{bill.total.toFixed(2)}</td>
                           <td className="px-12 py-8 text-right">
                              <button 
                                onClick={() => resendFile(bill)} 
                                className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-white rounded-2xl text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-secondary transition-all shadow-lg active:scale-95"
                              >
                                {ICONS.Download} Re-Export File
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

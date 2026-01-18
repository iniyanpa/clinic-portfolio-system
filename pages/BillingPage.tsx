import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { ICONS } from '../constants';
import { Patient, Appointment, Bill, PaymentMethod, MedicalRecord, Prescription, BillItem, Tenant } from '../types';

interface BillingPageProps {
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  prescriptions: Prescription[];
  bills: Bill[];
  clinicName: string;
  addBill: (b: Bill) => void;
  tenantSettings: Tenant | null;
}

const BillingPage: React.FC<BillingPageProps> = ({ patients, appointments, records, prescriptions, bills, clinicName, addBill, tenantSettings }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('UPI');
  
  const [editingItems, setEditingItems] = useState<BillItem[]>([]);

  useEffect(() => {
    if (tenantSettings) {
      setEditingItems([
        { id: '1', description: 'Consultation Fee', amount: tenantSettings.consultationFee || 500 },
        { id: '2', description: 'Platform & Clinic Maintenance', amount: tenantSettings.platformFee || 200 }
      ]);
    }
  }, [tenantSettings]);

  const pendingInvoices = useMemo(() => {
    return appointments.filter(appt => appt.status === 'Completed' && !bills.some(bill => bill.appointmentId === appt.id));
  }, [appointments, bills]);

  const generatePDF = (patient: Patient, appt: Appointment, bill: Bill, action: 'preview' | 'download' = 'preview') => {
    const doc = new jsPDF();
    const record = records.find(r => r.appointmentId === appt.id);
    const prescription = prescriptions.find(p => p.appointmentId === appt.id);
    
    // --- Header / Letterhead ---
    doc.setFillColor(41, 55, 140);
    doc.rect(0, 0, 210, 50, 'F');
    
    // Clinic Info on Left
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(clinicName.toUpperCase(), 20, 22);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const clinicAddress = tenantSettings?.address || "Address not provided in settings";
    const clinicContact = `Phone: ${tenantSettings?.phone || "N/A"} | Email: ${tenantSettings?.email || "N/A"}`;
    doc.text(clinicAddress, 20, 30);
    doc.text(clinicContact, 20, 35);
    
    doc.setFontSize(10);
    doc.text('COMPREHENSIVE CLINICAL REPORT & INVOICE', 20, 43);

    // Document Details on Top Right
    doc.setFontSize(8);
    doc.text(`DOC ID: ${bill.id}`, 145, 22);
    doc.text(`DATE: ${new Date(bill.date).toLocaleDateString('en-IN')}`, 145, 27);

    // --- Patient Module ---
    let y = 60;
    doc.setTextColor(41, 55, 140);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 20, y);
    doc.line(20, y + 2, 190, y + 2);
    
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${patient.firstName} ${patient.lastName}`, 20, y);
    doc.text(`Gender/Age: ${patient.gender} | ${patient.dateOfBirth}`, 80, y);
    doc.text(`Patient ID: ${patient.id}`, 150, y);
    
    y += 6;
    doc.text(`Contact: ${patient.phone}`, 20, y);
    doc.text(`Blood Group: ${patient.bloodGroup || 'N/A'}`, 80, y);

    // --- Vitals Module ---
    y += 15;
    doc.setTextColor(41, 55, 140);
    doc.setFont('helvetica', 'bold');
    doc.text('CLINICAL VITALS', 20, y);
    doc.line(20, y + 2, 190, y + 2);

    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    if (appt.vitals) {
        doc.text(`BP: ${appt.vitals.bp || 'N/A'}`, 20, y);
        doc.text(`Temp: ${appt.vitals.temp || 'N/A'}`, 60, y);
        doc.text(`Pulse: ${appt.vitals.pulse || 'N/A'}`, 100, y);
        doc.text(`Weight: ${appt.vitals.weight || 'N/A'} kg`, 140, y);
        y += 5;
        doc.text(`SpO2: ${appt.vitals.spo2 || 'N/A'}% | Sugar: ${appt.vitals.sugarLevel || 'N/A'}`, 20, y);
    } else {
        doc.text('No vital statistics recorded for this visit.', 20, y);
    }

    // --- Consultation Module ---
    y += 15;
    doc.setTextColor(41, 55, 140);
    doc.setFont('helvetica', 'bold');
    doc.text('DOCTOR\'S FINDINGS & DIAGNOSIS', 20, y);
    doc.line(20, y + 2, 190, y + 2);

    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Diagnosis: ${record?.diagnosis || 'N/A'}`, 20, y);
    
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Clinical Notes:`, 20, y);
    y += 5;
    doc.text(record?.notes || 'No specific clinical remarks provided.', 25, y, { maxWidth: 165 });
    
    y += (record?.notes ? (Math.ceil(record.notes.length / 80) * 5) + 5 : 10);

    // --- Pharmacy Module ---
    doc.setTextColor(41, 55, 140);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIPTION (Rx)', 20, y);
    doc.line(20, y + 2, 190, y + 2);

    y += 10;
    doc.setTextColor(0, 0, 0);
    if (prescription && prescription.medicines.length > 0) {
        prescription.medicines.forEach((med, i) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${i + 1}. ${med.name}`, 20, y);
            doc.setFont('helvetica', 'normal');
            doc.text(`- Dose: ${med.dosage} | Duration: ${med.duration}`, 20, y + 5);
            doc.text(`- Instructions: ${med.instructions}`, 20, y + 10);
            y += 16;
            // Page break check
            if (y > 260) { doc.addPage(); y = 20; }
        });
    } else {
        doc.text('No medication prescribed for this session.', 20, y);
        y += 10;
    }

    // --- Billing Module ---
    y += 10;
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setTextColor(41, 55, 140);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE & SETTLEMENT', 20, y);
    doc.line(20, y + 2, 190, y + 2);

    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    bill.items.forEach(item => {
        doc.text(item.description, 20, y);
        doc.text(`INR ${item.amount.toFixed(2)}`, 160, y, { align: 'right' });
        y += 6;
    });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NET PAYABLE:', 20, y + 6);
    doc.text(`INR ${bill.total.toFixed(2)}`, 160, y + 6, { align: 'right' });
    
    y += 20;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer-generated medical record and tax invoice.', 105, 285, { align: 'center' });
    doc.text('Generated via HealFlow Cloud Systems.', 105, 290, { align: 'center' });
    
    if (action === 'download') {
      doc.save(`ClinicalReport_${bill.id}_${patient.firstName}.pdf`);
    } else {
      const string = doc.output('bloburl');
      window.open(string, '_blank');
    }
  };

  const processPayment = (appt: Appointment) => {
    const p = patients.find(pat => pat.id === appt.patientId);
    if (!p) return;
    const total = editingItems.reduce((acc, item) => acc + item.amount, 0);
    const bill: Bill = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      tenantId: p.tenantId, patientId: p.id,
      appointmentId: appt.id, date: new Date().toISOString().split('T')[0],
      items: [...editingItems], total,
      status: 'Paid', paymentMethod: selectedPayment
    };
    addBill(bill);
    generatePDF(p, appt, bill, 'preview');
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-heading font-bold text-primary">Billing & GST</h2>
          <p className="subheading text-secondary font-bold text-[9px] tracking-widest uppercase">Visit Settlement Terminal</p>
        </div>
        <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1 font-bold shadow-inner">
          <button onClick={() => setActiveTab('pending')} className={`px-5 py-2 rounded-lg text-[9px] uppercase transition-all ${activeTab === 'pending' ? 'bg-primary text-white shadow-md' : 'text-slate-400'}`}>Pending ({pendingInvoices.length})</button>
          <button onClick={() => setActiveTab('history')} className={`px-5 py-2 rounded-lg text-[9px] uppercase transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-md' : 'text-slate-400'}`}>Paid Records</button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {pendingInvoices.map(appt => {
             const p = patients.find(pat => pat.id === appt.patientId);
             return (
               <div key={appt.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">{p?.firstName} {p?.lastName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case: {appt.id}</p>
                    </div>
                    <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[9px] font-bold uppercase">Ready</div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl space-y-2">
                    {editingItems.map(item => (
                      <div key={item.id} className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400 font-medium">{item.description}</span>
                        <span className="text-slate-800 font-mono">₹{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-4 mt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-primary font-heading text-lg">Invoice Total</span>
                      <span className="text-primary font-black text-2xl font-mono">₹{editingItems.reduce((s,i) => s + i.amount, 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 block">Settlement Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['UPI', 'Cash', 'Card'].map(m => (
                        <button key={m} onClick={() => setSelectedPayment(m as any)} className={`py-3 rounded-xl text-[9px] font-bold uppercase transition-all ${selectedPayment === m ? 'bg-secondary text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>{m}</button>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => processPayment(appt)} className="w-full py-4 bg-primary text-white rounded-2xl font-bold font-heading text-lg shadow-xl hover:bg-secondary transition-all uppercase text-xs">Settle & Preview Report</button>
               </div>
             )
           })}
           {pendingInvoices.length === 0 && <p className="lg:col-span-2 text-center py-20 text-slate-300 font-bold italic">No pending bills in queue.</p>}
        </div>
      ) : (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm">
           <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                 <tr>
                    <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Inv #</th>
                    <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Patient Name</th>
                    <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Amount</th>
                    <th className="px-6 py-4 text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {bills.sort((a,b) => b.id.localeCompare(a.id)).map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 font-mono font-bold text-primary text-[11px]">#{bill.id.split('-')[1]}</td>
                       <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 text-sm">{patients.find(p => p.id === bill.patientId)?.firstName} {patients.find(p => p.id === bill.patientId)?.lastName}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{bill.date} • {bill.paymentMethod}</p>
                       </td>
                       <td className="px-6 py-4 font-bold text-slate-700 text-center font-mono text-[11px]">₹{bill.total.toFixed(2)}</td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => {
                              const p = patients.find(pat => pat.id === bill.patientId);
                              const a = appointments.find(ap => ap.id === bill.appointmentId);
                              if (p && a) generatePDF(p, a, bill, 'preview');
                            }} className="text-secondary font-bold hover:underline text-[9px] uppercase tracking-widest">Preview</button>
                            <button onClick={() => {
                              const p = patients.find(pat => pat.id === bill.patientId);
                              const a = appointments.find(ap => ap.id === bill.appointmentId);
                              if (p && a) generatePDF(p, a, bill, 'download');
                            }} className="text-primary font-bold hover:underline text-[9px] uppercase tracking-widest">Download</button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
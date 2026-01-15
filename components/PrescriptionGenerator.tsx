
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { ICONS } from '../constants';

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

const PrescriptionGenerator: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: '', dosage: '', duration: '', instructions: '' }
  ]);

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '', instructions: '' }]);
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(41, 55, 140); // Primary color
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('HEALFLOW CLINIC', 20, 20);
    doc.setFontSize(10);
    doc.text('123 Medical Plaza, Metro City | +1 555-0100', 20, 30);

    // Body
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('PRESCRIPTION', 20, 55);
    doc.setDrawColor(41, 186, 237); // Secondary color
    doc.line(20, 58, 190, 58);

    doc.setFontSize(10);
    doc.text('Patient Name: Robert Chen', 20, 70);
    doc.text('Date: May 20, 2024', 150, 70);
    doc.text('Age/Gender: 38 / Male', 20, 75);

    doc.setFontSize(12);
    doc.text('Medications:', 20, 90);

    let y = 100;
    medicines.forEach((med, i) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${i + 1}. ${med.name || 'Medicine Name'}`, 25, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Dosage: ${med.dosage || 'N/A'} | Duration: ${med.duration || 'N/A'}`, 25, y + 5);
      doc.text(`Instructions: ${med.instructions || 'As directed'}`, 25, y + 10);
      y += 20;
    });

    doc.line(20, 250, 80, 250);
    doc.text('Doctor\'s Signature', 20, 255);

    doc.save('prescription_Robert_Chen.pdf');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-primary">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-heading text-primary">New Prescription</h3>
        <button 
          onClick={generatePDF}
          className="bg-secondary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-opacity-90 shadow-md"
        >
          {ICONS.Download} Generate PDF
        </button>
      </div>

      <div className="space-y-4">
        {medicines.map((med, idx) => (
          <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Medicine Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-200 rounded outline-none focus:border-secondary transition-colors"
                  value={med.name}
                  onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                  placeholder="e.g. Paracetamol"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Dosage</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-200 rounded outline-none focus:border-secondary transition-colors"
                  value={med.dosage}
                  onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                  placeholder="e.g. 500mg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Duration</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-200 rounded outline-none focus:border-secondary transition-colors"
                  value={med.duration}
                  onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                  placeholder="e.g. 5 Days"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Instructions</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-200 rounded outline-none focus:border-secondary transition-colors"
                  value={med.instructions}
                  onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                  placeholder="e.g. After food"
                />
              </div>
            </div>
            {medicines.length > 1 && (
              <button 
                onClick={() => removeMedicine(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="text-xs px-1">×</span>
              </button>
            )}
          </div>
        ))}

        <button 
          onClick={addMedicine}
          className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:border-secondary hover:text-secondary transition-all rounded-lg flex items-center justify-center gap-2"
        >
          {ICONS.Plus} Add Another Medicine
        </button>
      </div>

      <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
        {/* Fixed error: ICONS.Bell property does not exist, using ICONS.Notification instead */}
        <div className="text-secondary">{ICONS.Notification}</div>
        <p>This will automatically trigger an <b>SMS & Email notification</b> to the patient with a secure download link.</p>
      </div>
    </div>
  );
};

export default PrescriptionGenerator;

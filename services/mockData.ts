
import { User, UserRole, Patient, Appointment, Bill } from '../types';

export const MOCK_USERS: User[] = [
  { 
    id: 'D001', 
    name: 'Dr. Sarah Wilson', 
    email: 'sarah@slshospital.com', 
    role: UserRole.DOCTOR, 
    avatar: 'https://picsum.photos/seed/doc1/100/100', 
    specialization: 'Cardiologist',
    phone: '+91 9000012345'
  },
  { 
    id: 'A001', 
    name: 'Admin SLS', 
    email: 'admin@slshospital.com', 
    role: UserRole.ADMIN, 
    avatar: 'https://picsum.photos/seed/admin/100/100',
    phone: '+91 9000099999'
  },
  { 
    id: 'R001', 
    name: 'Jane Clerk', 
    email: 'jane@slshospital.com', 
    role: UserRole.RECEPTIONIST, 
    avatar: 'https://picsum.photos/seed/recep/100/100',
    phone: '+91 9000088888'
  },
  { 
    id: 'P001', 
    name: 'Mike Pharma', 
    email: 'mike@slshospital.com', 
    role: UserRole.PHARMACIST, 
    avatar: 'https://picsum.photos/seed/pharma/100/100',
    phone: '+91 9000077777'
  },
];

export const MOCK_PATIENTS: Patient[] = [
  { 
    id: 'SLS#1001', 
    firstName: 'Robert', 
    lastName: 'Chen', 
    dateOfBirth: '1985-06-15', 
    gender: 'Male', 
    phone: '+91 9876543210', 
    email: 'robert@email.com', 
    bloodGroup: 'O+',
    address: 'Flat 402, Tirumala Heights, Tirupati',
    guardianName: 'Michael Chen',
    motherName: 'Linda Chen',
    history: ['Hypertension'],
    registeredDate: '2024-01-15'
  },
  { 
    id: 'SLS#1002', 
    firstName: 'Alice', 
    lastName: 'Johnson', 
    dateOfBirth: '1992-11-22', 
    gender: 'Female', 
    phone: '+91 9988776655', 
    email: 'alice@email.com', 
    bloodGroup: 'A-',
    address: 'Bunglow 12, SV University Area, Tirupati',
    guardianName: 'George Johnson',
    motherName: 'Mary Johnson',
    history: ['Asthma'],
    registeredDate: '2024-03-10'
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'A001', patientId: 'SLS#1001', doctorId: 'D001', date: new Date().toISOString().split('T')[0], time: '10:30', status: 'Scheduled', reason: 'Routine Checkup', department: 'Cardiology' },
  { id: 'A002', patientId: 'SLS#1002', doctorId: 'D001', date: new Date().toISOString().split('T')[0], time: '11:45', status: 'Completed', reason: 'Flu symptoms', department: 'General Medicine' },
];

export const MOCK_BILLS: Bill[] = [
  { 
    id: 'BILL#5001', 
    patientId: 'SLS#1002', 
    appointmentId: 'A002',
    date: new Date().toISOString().split('T')[0], 
    total: 750.00, 
    status: 'Paid', 
    paymentMethod: 'UPI',
    // Added missing 'id' field for each BillItem to match the interface definition.
    items: [
      { id: 'item-1', description: 'Consultation Fee', amount: 500 }, 
      { id: 'item-2', description: 'Registration', amount: 250 }
    ]
  },
];

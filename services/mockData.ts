
import { User, UserRole, Patient, Appointment, Bill } from '../types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Dr. Sarah Wilson', email: 'sarah@healflow.com', role: UserRole.DOCTOR, avatar: 'https://picsum.photos/seed/doc1/100/100', specialization: 'Cardiology' },
  { id: '2', name: 'Admin User', email: 'admin@healflow.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/seed/admin/100/100' },
  { id: '3', name: 'Jane Clerk', email: 'jane@healflow.com', role: UserRole.RECEPTIONIST, avatar: 'https://picsum.photos/seed/recep/100/100' },
];

export const MOCK_PATIENTS: Patient[] = [
  { 
    id: 'P001', 
    firstName: 'Robert', 
    lastName: 'Chen', 
    dateOfBirth: '1985-06-15', 
    gender: 'Male', 
    phone: '+91 9876543210', 
    email: 'robert@email.com', 
    bloodGroup: 'O+',
    address: 'Flat 402, Lotus Apts, Mumbai',
    guardianName: 'Michael Chen',
    motherName: 'Linda Chen',
    history: ['Hypertension'],
    registeredDate: '2024-01-15'
  },
  { 
    id: 'P002', 
    firstName: 'Alice', 
    lastName: 'Johnson', 
    dateOfBirth: '1992-11-22', 
    gender: 'Female', 
    phone: '+91 9988776655', 
    email: 'alice@email.com', 
    bloodGroup: 'A-',
    address: 'Bunglow 12, Green Park, Bangalore',
    guardianName: 'George Johnson',
    motherName: 'Mary Johnson',
    history: ['Asthma'],
    registeredDate: '2024-03-10'
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  // Changed status 'Waiting' to 'Scheduled' to comply with ApptStatus type
  { id: 'A001', patientId: 'P001', doctorId: '1', date: new Date().toISOString().split('T')[0], time: '10:30', status: 'Scheduled', reason: 'Routine Checkup', department: 'General Medicine' },
  { id: 'A002', patientId: 'P002', doctorId: '1', date: new Date().toISOString().split('T')[0], time: '11:45', status: 'Completed', reason: 'Flu symptoms', department: 'General Medicine' },
];

export const MOCK_BILLS: Bill[] = [
  { 
    id: 'INV-1001', 
    patientId: 'P002', 
    appointmentId: 'A002',
    date: new Date().toISOString().split('T')[0], 
    total: 750.00, 
    status: 'Paid', 
    paymentMethod: 'UPI',
    items: [{ description: 'Consultation Fee', amount: 500 }, { description: 'Registration', amount: 250 }]
  },
];
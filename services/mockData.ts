
import { User, UserRole, Patient, Appointment, Bill } from '../types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Dr. Sarah Wilson', email: 'sarah@healflow.com', role: UserRole.DOCTOR, avatar: 'https://picsum.photos/seed/doc1/100/100' },
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
    phone: '+1 555-0102', 
    email: 'robert@email.com', 
    bloodGroup: 'O+',
    address: '123 Pine St, Metro City',
    history: ['Hypertension'],
    // Added missing registeredDate property to comply with Patient interface
    registeredDate: '2024-01-15'
  },
  { 
    id: 'P002', 
    firstName: 'Alice', 
    lastName: 'Johnson', 
    dateOfBirth: '1992-11-22', 
    gender: 'Female', 
    phone: '+1 555-0199', 
    email: 'alice@email.com', 
    bloodGroup: 'A-',
    address: '456 Oak Ln, Suburbia',
    history: ['Asthma'],
    // Added missing registeredDate property to comply with Patient interface
    registeredDate: '2024-03-10'
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  // Corrected status from 'Scheduled' to 'Waiting' to match the allowed status union in Appointment interface
  { id: 'A001', patientId: 'P001', doctorId: '1', date: '2024-05-20', time: '10:30', status: 'Waiting', reason: 'Routine Checkup' },
  { id: 'A002', patientId: 'P002', doctorId: '1', date: '2024-05-20', time: '11:45', status: 'Completed', reason: 'Flu symptoms' },
];

export const MOCK_BILLS: Bill[] = [
  { 
    id: 'INV-1001', 
    patientId: 'P001', 
    date: '2024-05-18', 
    total: 150.00, 
    status: 'Paid', 
    items: [{ description: 'Consultation Fee', amount: 100 }, { description: 'X-Ray', amount: 50 }]
  },
];

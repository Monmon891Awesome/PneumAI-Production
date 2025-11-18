/**
 * Patient Data Management Utilities
 * Handles localStorage persistence for patient data, scans, and appointments
 */

const STORAGE_KEYS = {
  PATIENT_PROFILE: 'pneumai_patient_profile',
  SCAN_HISTORY: 'pneumai_scan_history',
  APPOINTMENTS: 'pneumai_appointments',
  DOCTORS: 'pneumai_doctors',
  MESSAGES: 'pneumai_messages'
};

// ============ Patient Profile Management ============

export const getPatientProfile = () => {
  try {
    const profile = localStorage.getItem(STORAGE_KEYS.PATIENT_PROFILE);
    return profile ? JSON.parse(profile) : getDefaultProfile();
  } catch (error) {
    console.error('Error loading patient profile:', error);
    return getDefaultProfile();
  }
};

export const savePatientProfile = (profile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PATIENT_PROFILE, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Error saving patient profile:', error);
    return false;
  }
};

const getDefaultProfile = () => ({
  name: 'Robert Johnson',
  id: 'PAT-2023-8642',
  age: '54 years',
  dateOfBirth: '1971-03-15',
  email: 'robert.johnson@email.com',
  phone: '(555) 123-4567',
  address: '123 Main St, Anytown, USA',
  clinicalNotes: 'Patient presents with persistent cough for 3 months. Former smoker (2 packs/day for 20 years, quit 5 years ago). Family history of lung cancer.',
  medicalHistory: [
    'Former smoker (quit 5 years ago)',
    'Hypertension (controlled)',
    'Family history of lung cancer'
  ],
  emergencyContact: {
    name: 'Mary Johnson',
    relationship: 'Spouse',
    phone: '(555) 123-4568'
  }
});

// ============ Scan History Management ============

export const getScanHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.SCAN_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading scan history:', error);
    return [];
  }
};

export const saveScan = (scanData) => {
  try {
    const history = getScanHistory();

    // Add additional metadata
    const enrichedScan = {
      ...scanData,
      savedAt: new Date().toISOString(),
      patientId: getPatientProfile().id
    };

    // Add to beginning of array (most recent first)
    history.unshift(enrichedScan);

    // Keep only last 50 scans to avoid storage limits
    const trimmedHistory = history.slice(0, 50);

    localStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(trimmedHistory));
    return true;
  } catch (error) {
    console.error('Error saving scan:', error);
    return false;
  }
};

export const deleteScan = (scanId) => {
  try {
    const history = getScanHistory();
    const filtered = history.filter(scan => scan.scanId !== scanId);
    localStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting scan:', error);
    return false;
  }
};

export const getScanById = (scanId) => {
  const history = getScanHistory();
  return history.find(scan => scan.scanId === scanId);
};

export const clearScanHistory = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify([]));
    return true;
  } catch (error) {
    console.error('Error clearing scan history:', error);
    return false;
  }
};

// ============ Appointments Management ============

export const getAppointments = () => {
  try {
    const appointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return appointments ? JSON.parse(appointments) : getDefaultAppointments();
  } catch (error) {
    console.error('Error loading appointments:', error);
    return getDefaultAppointments();
  }
};

export const saveAppointment = (appointment) => {
  try {
    const appointments = getAppointments();

    const newAppointment = {
      ...appointment,
      id: `appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    };

    appointments.push(newAppointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    return newAppointment;
  } catch (error) {
    console.error('Error saving appointment:', error);
    return null;
  }
};

export const updateAppointment = (appointmentId, updates) => {
  try {
    const appointments = getAppointments();
    const index = appointments.findIndex(a => a.id === appointmentId);

    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating appointment:', error);
    return false;
  }
};

export const deleteAppointment = (appointmentId) => {
  try {
    const appointments = getAppointments();
    const filtered = appointments.filter(a => a.id !== appointmentId);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return false;
  }
};

const getDefaultAppointments = () => [
  {
    id: 'appt_1',
    doctor: 'Dr. Sarah Miller',
    doctorId: 'doc_1',
    specialty: 'Pulmonology',
    type: 'Pulmonology Consultation',
    date: '2025-05-15',
    time: '10:30 AM - 11:30 AM',
    status: 'scheduled',
    notes: ''
  },
  {
    id: 'appt_2',
    doctor: 'Dr. James Rodriguez',
    doctorId: 'doc_2',
    specialty: 'Oncology',
    type: 'Follow-up CT Scan',
    date: '2025-06-02',
    time: '9:00 AM - 10:00 AM',
    status: 'scheduled',
    notes: ''
  }
];

// ============ Doctors Management ============

export const getDoctors = () => {
  try {
    const doctors = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    return doctors ? JSON.parse(doctors) : getDefaultDoctors();
  } catch (error) {
    console.error('Error loading doctors:', error);
    return getDefaultDoctors();
  }
};

const getDefaultDoctors = () => [
  {
    id: 'doc_1',
    name: 'Dr. Sarah Miller',
    specialty: 'Pulmonology',
    availability: 'Available May 15-20',
    email: 'sarah.miller@hospital.com',
    phone: '(555) 234-5678',
    image: '/assets/ai-doc1.jpg'
  },
  {
    id: 'doc_2',
    name: 'Dr. James Rodriguez',
    specialty: 'Oncology',
    availability: 'Available May 12-18',
    email: 'james.rodriguez@hospital.com',
    phone: '(555) 234-5679',
    image: '/assets/ai-doc2.jpg'
  },
  {
    id: 'doc_3',
    name: 'Dr. Emily Chen',
    specialty: 'Radiology',
    availability: 'Available May 10-16',
    email: 'emily.chen@hospital.com',
    phone: '(555) 234-5680',
    image: '/assets/ai-doc3.png'
  }
];

// ============ Messages Management ============

export const getMessages = () => {
  try {
    const messages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return messages ? JSON.parse(messages) : getDefaultMessages();
  } catch (error) {
    console.error('Error loading messages:', error);
    return getDefaultMessages();
  }
};

export const sendMessage = (message) => {
  try {
    const messages = getMessages();

    const newMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sentAt: new Date().toISOString(),
      status: 'sent',
      replied: false
    };

    messages.unshift(newMessage);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    return newMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

const getDefaultMessages = () => [
  {
    id: 'msg_1',
    subject: 'Question about medication',
    recipient: 'Dr. Sarah Miller',
    recipientId: 'doc_1',
    message: "I've been experiencing some side effects from the new medication...",
    sentAt: '2025-04-30T10:30:00Z',
    status: 'sent',
    replied: true
  },
  {
    id: 'msg_2',
    subject: 'Follow-up appointment',
    recipient: 'Dr. James Rodriguez',
    recipientId: 'doc_2',
    message: 'I wanted to confirm my follow-up appointment scheduled for...',
    sentAt: '2025-04-22T14:15:00Z',
    status: 'sent',
    replied: true
  }
];

// ============ Statistics & Dashboard Data ============

export const getDashboardStats = () => {
  const scanHistory = getScanHistory();
  const appointments = getAppointments();

  const totalScans = scanHistory.length;
  const detectedScans = scanHistory.filter(scan =>
    scan.results && scan.results.detected
  ).length;

  const upcomingAppointments = appointments.filter(appt => {
    const apptDate = new Date(appt.date);
    return apptDate >= new Date() && appt.status === 'scheduled';
  }).length;

  const recentScans = scanHistory.slice(0, 5);

  return {
    totalScans,
    detectedScans,
    upcomingAppointments,
    recentScans,
    lastScanDate: scanHistory.length > 0 ? scanHistory[0].uploadTime : null
  };
};

// ============ Export/Import Data ============

export const exportAllData = () => {
  return {
    profile: getPatientProfile(),
    scans: getScanHistory(),
    appointments: getAppointments(),
    doctors: getDoctors(),
    messages: getMessages(),
    exportedAt: new Date().toISOString()
  };
};

export const importData = (data) => {
  try {
    if (data.profile) savePatientProfile(data.profile);
    if (data.scans) localStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(data.scans));
    if (data.appointments) localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data.appointments));
    if (data.doctors) localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(data.doctors));
    if (data.messages) localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(data.messages));
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// ============ Utility Functions ============

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRiskLevelColor = (riskLevel) => {
  const colors = {
    high: '#f44336',
    medium: '#ff9800',
    low: '#ffc107',
    none: '#4caf50'
  };
  return colors[riskLevel] || '#999';
};

export const getRiskLevelLabel = (riskLevel) => {
  const labels = {
    high: 'High Risk',
    medium: 'Medium Risk',
    low: 'Low Risk',
    none: 'No Risk'
  };
  return labels[riskLevel] || 'Unknown';
};

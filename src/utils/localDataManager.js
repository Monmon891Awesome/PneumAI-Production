/**
 * Local Data Manager
 * Centralized localStorage management for PneumAI platform
 * Handles users, patients, doctors, scans, and sessions
 */

// Storage keys
const STORAGE_KEYS = {
  USERS: 'pneumAIUsers',
  DOCTORS: 'pneumAIDoctors',
  PATIENTS: 'pneumAIPatients',
  SCANS: 'pneumAIScans',
  SESSION: 'pneumAISession',
  SETTINGS: 'pneumAISettings',
  APP_DATA: 'pneumAIAppData'
};

// Default admin account
const DEFAULT_ADMIN = {
  username: 'Admin',
  email: 'admin@pneumai.com',
  password: 'admin123',
  userType: 'admin',
  registeredAt: new Date().toISOString()
};

// Sample demo doctors
const DEMO_DOCTORS = [
  {
    id: 'DOC-001',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@pneumai.com',
    password: 'doctor123',
    specialty: 'General Practitioner',
    phone: '+1 (555) 101-2001',
    image: '/assets/ai-doc1.jpg',
    yearsOfExperience: 15,
    bio: '15+ years of experience in primary care and diagnostic imaging review.',
    userType: 'doctor',
    createdAt: new Date().toISOString()
  },
  {
    id: 'DOC-002',
    name: 'Dr. Michael Torres',
    email: 'michael.torres@pneumai.com',
    password: 'doctor123',
    specialty: 'Medical Specialist',
    phone: '+1 (555) 102-2002',
    image: '/assets/ai-doc2.jpg',
    yearsOfExperience: 12,
    bio: 'Specialized in respiratory conditions and CT scan interpretation.',
    userType: 'doctor',
    createdAt: new Date().toISOString()
  },
  {
    id: 'DOC-003',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@pneumai.com',
    password: 'doctor123',
    specialty: 'Clinical Consultant',
    phone: '+1 (555) 103-2003',
    image: '/assets/ai-doc3.png',
    yearsOfExperience: 10,
    bio: 'Expert in patient care coordination and clinical decision support.',
    userType: 'doctor',
    createdAt: new Date().toISOString()
  }
];

// Sample demo patients
const DEMO_PATIENTS = [
  {
    id: 'PAT-2023-8642',
    userId: 'USER-8642',
    fullName: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    age: 54,
    gender: 'male',
    phone: '+1 (555) 201-3001',
    dateOfBirth: '1971-03-15',
    lastVisit: '2025-05-03',
    status: 'Follow-up Required',
    assignedDoctor: 'DOC-001',
    medicalHistory: 'Former smoker (2 packs/day for 20 years, quit 5 years ago). Family history of lung cancer.',
    createdAt: '2023-08-01T10:00:00Z'
  },
  {
    id: 'PAT-2023-7512',
    userId: 'USER-7512',
    fullName: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    age: 62,
    gender: 'female',
    phone: '+1 (555) 202-3002',
    dateOfBirth: '1963-07-22',
    lastVisit: '2025-05-01',
    status: 'Stable',
    assignedDoctor: 'DOC-002',
    medicalHistory: 'Regular screening, no significant history.',
    createdAt: '2023-07-15T10:00:00Z'
  },
  {
    id: 'PAT-2023-9215',
    userId: 'USER-9215',
    fullName: 'Michael Brown',
    email: 'michael.brown@example.com',
    age: 47,
    gender: 'male',
    phone: '+1 (555) 203-3003',
    dateOfBirth: '1978-11-08',
    lastVisit: '2025-04-28',
    status: 'Urgent',
    assignedDoctor: 'DOC-001',
    medicalHistory: 'Persistent cough for 3 months, requires immediate follow-up.',
    createdAt: '2023-09-12T10:00:00Z'
  },
  {
    id: 'PAT-2023-6381',
    userId: 'USER-6381',
    fullName: 'Emily Davis',
    email: 'emily.davis@example.com',
    age: 58,
    gender: 'female',
    phone: '+1 (555) 204-3004',
    dateOfBirth: '1967-04-19',
    lastVisit: '2025-04-25',
    status: 'Stable',
    assignedDoctor: 'DOC-003',
    medicalHistory: 'Annual check-up, clear results.',
    createdAt: '2023-06-20T10:00:00Z'
  },
  {
    id: 'PAT-2023-5247',
    userId: 'USER-5247',
    fullName: 'James Wilson',
    email: 'james.wilson@example.com',
    age: 71,
    gender: 'male',
    phone: '+1 (555) 205-3005',
    dateOfBirth: '1954-02-11',
    lastVisit: '2025-04-22',
    status: 'Follow-up Required',
    assignedDoctor: 'DOC-002',
    medicalHistory: 'Long-term smoker, monitoring required.',
    createdAt: '2023-05-10T10:00:00Z'
  }
];

// ==================== INITIALIZATION ====================

/**
 * Initialize the database with default data
 */
export function initializeDatabase() {
  try {
    // Check if already initialized
    const appData = getFromStorage(STORAGE_KEYS.APP_DATA);
    if (appData && appData.initialized) {
      console.log('Database already initialized');
      return;
    }

    // Initialize users with admin account
    const existingUsers = getFromStorage(STORAGE_KEYS.USERS) || [];
    const adminExists = existingUsers.some(user => user.email === DEFAULT_ADMIN.email);

    if (!adminExists) {
      existingUsers.push(DEFAULT_ADMIN);
    }

    // Add demo doctors to users
    DEMO_DOCTORS.forEach(doctor => {
      const doctorExists = existingUsers.some(user => user.email === doctor.email);
      if (!doctorExists) {
        existingUsers.push({
          username: doctor.name,
          email: doctor.email,
          password: doctor.password,
          userType: 'doctor',
          specialty: doctor.specialty,
          registeredAt: doctor.createdAt
        });
      }
    });

    saveToStorage(STORAGE_KEYS.USERS, existingUsers);

    // Initialize doctors
    const existingDoctors = getFromStorage(STORAGE_KEYS.DOCTORS) || [];
    if (existingDoctors.length === 0) {
      saveToStorage(STORAGE_KEYS.DOCTORS, DEMO_DOCTORS);
    }

    // Initialize patients
    const existingPatients = getFromStorage(STORAGE_KEYS.PATIENTS) || [];
    if (existingPatients.length === 0) {
      saveToStorage(STORAGE_KEYS.PATIENTS, DEMO_PATIENTS);
    }

    // Initialize scans
    const existingScans = getFromStorage(STORAGE_KEYS.SCANS) || [];
    saveToStorage(STORAGE_KEYS.SCANS, existingScans);

    // Mark as initialized
    saveToStorage(STORAGE_KEYS.APP_DATA, {
      initialized: true,
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    });

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

// ==================== STORAGE HELPERS ====================

/**
 * Get data from localStorage
 */
function getFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
}

/**
 * Save data to localStorage
 */
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
}

/**
 * Remove data from localStorage
 */
function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
}

// ==================== USER MANAGEMENT ====================

/**
 * Get all users
 */
export function getAllUsers() {
  return getFromStorage(STORAGE_KEYS.USERS) || [];
}

/**
 * Get user by email
 */
export function getUserByEmail(email) {
  const users = getAllUsers();
  return users.find(user => user.email === email);
}

/**
 * Create new user
 */
export function createUser(userData) {
  const users = getAllUsers();

  // Check if email already exists
  if (users.some(user => user.email === userData.email)) {
    throw new Error('Email already exists');
  }

  const newUser = {
    ...userData,
    registeredAt: new Date().toISOString()
  };

  users.push(newUser);
  saveToStorage(STORAGE_KEYS.USERS, users);
  return newUser;
}

/**
 * Update user
 */
export function updateUser(email, updates) {
  const users = getAllUsers();
  const index = users.findIndex(user => user.email === email);

  if (index === -1) {
    throw new Error('User not found');
  }

  users[index] = { ...users[index], ...updates };
  saveToStorage(STORAGE_KEYS.USERS, users);
  return users[index];
}

/**
 * Delete user
 */
export function deleteUser(email) {
  const users = getAllUsers();
  const filteredUsers = users.filter(user => user.email !== email);
  saveToStorage(STORAGE_KEYS.USERS, filteredUsers);
  return true;
}

// ==================== DOCTOR MANAGEMENT ====================

/**
 * Get all doctors
 */
export function getAllDoctors() {
  return getFromStorage(STORAGE_KEYS.DOCTORS) || [];
}

/**
 * Get doctor by ID
 */
export function getDoctorById(id) {
  const doctors = getAllDoctors();
  return doctors.find(doctor => doctor.id === id);
}

/**
 * Create new doctor
 */
export function createDoctor(doctorData) {
  const doctors = getAllDoctors();

  // Check if email already exists
  if (doctors.some(doctor => doctor.email === doctorData.email)) {
    throw new Error('Doctor with this email already exists');
  }

  const newDoctor = {
    ...doctorData,
    id: doctorData.id || `DOC-${Date.now()}`,
    userType: 'doctor',
    createdAt: new Date().toISOString()
  };

  doctors.push(newDoctor);
  saveToStorage(STORAGE_KEYS.DOCTORS, doctors);

  // Also add to users for login
  createUser({
    username: newDoctor.name,
    email: newDoctor.email,
    password: newDoctor.password,
    userType: 'doctor',
    specialty: newDoctor.specialty
  });

  return newDoctor;
}

/**
 * Update doctor
 */
export function updateDoctor(id, updates) {
  const doctors = getAllDoctors();
  const index = doctors.findIndex(doctor => doctor.id === id);

  if (index === -1) {
    throw new Error('Doctor not found');
  }

  doctors[index] = { ...doctors[index], ...updates };
  saveToStorage(STORAGE_KEYS.DOCTORS, doctors);

  // Update user entry if email or password changed
  if (updates.email || updates.password) {
    const originalEmail = doctors[index].email;
    updateUser(originalEmail, {
      email: updates.email || originalEmail,
      password: updates.password,
      username: updates.name
    });
  }

  return doctors[index];
}

/**
 * Delete doctor
 */
export function deleteDoctor(id) {
  const doctors = getAllDoctors();
  const doctor = doctors.find(d => d.id === id);

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  // Remove from doctors
  const filteredDoctors = doctors.filter(d => d.id !== id);
  saveToStorage(STORAGE_KEYS.DOCTORS, filteredDoctors);

  // Remove from users
  deleteUser(doctor.email);

  return true;
}

// ==================== PATIENT MANAGEMENT ====================

/**
 * Get all patients
 */
export function getAllPatients() {
  return getFromStorage(STORAGE_KEYS.PATIENTS) || [];
}

/**
 * Get patient by ID
 */
export function getPatientById(id) {
  const patients = getAllPatients();
  return patients.find(patient => patient.id === id);
}

/**
 * Get patients by doctor ID
 */
export function getPatientsByDoctor(doctorId) {
  const patients = getAllPatients();
  return patients.filter(patient => patient.assignedDoctor === doctorId);
}

/**
 * Create new patient
 */
export function createPatient(patientData) {
  const patients = getAllPatients();

  // Check if email already exists
  if (patients.some(patient => patient.email === patientData.email)) {
    throw new Error('Patient with this email already exists');
  }

  const newPatient = {
    ...patientData,
    id: patientData.id || `PAT-${new Date().getFullYear()}-${Date.now()}`,
    userId: patientData.userId || `USER-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  patients.push(newPatient);
  saveToStorage(STORAGE_KEYS.PATIENTS, patients);

  // Also add to users for login
  createUser({
    username: newPatient.fullName,
    email: newPatient.email,
    password: patientData.password || 'patient123',
    userType: 'patient'
  });

  return newPatient;
}

/**
 * Update patient
 */
export function updatePatient(id, updates) {
  const patients = getAllPatients();
  const index = patients.findIndex(patient => patient.id === id);

  if (index === -1) {
    throw new Error('Patient not found');
  }

  patients[index] = { ...patients[index], ...updates, lastUpdated: new Date().toISOString() };
  saveToStorage(STORAGE_KEYS.PATIENTS, patients);
  return patients[index];
}

/**
 * Delete patient
 */
export function deletePatient(id) {
  const patients = getAllPatients();
  const patient = patients.find(p => p.id === id);

  if (!patient) {
    throw new Error('Patient not found');
  }

  // Remove from patients
  const filteredPatients = patients.filter(p => p.id !== id);
  saveToStorage(STORAGE_KEYS.PATIENTS, filteredPatients);

  // Remove from users
  deleteUser(patient.email);

  return true;
}

// ==================== SCAN MANAGEMENT ====================

/**
 * Get all scans
 */
export function getAllScans() {
  return getFromStorage(STORAGE_KEYS.SCANS) || [];
}

/**
 * Get scans by patient ID
 */
export function getScansByPatient(patientId) {
  const scans = getAllScans();
  return scans.filter(scan => scan.patientId === patientId);
}

/**
 * Get scan by ID
 */
export function getScanById(id) {
  const scans = getAllScans();
  return scans.find(scan => scan.id === id);
}

/**
 * Create new scan
 */
export function createScan(scanData) {
  const scans = getAllScans();

  const newScan = {
    ...scanData,
    id: scanData.id || `SCAN-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: scanData.status || 'pending'
  };

  scans.push(newScan);
  saveToStorage(STORAGE_KEYS.SCANS, scans);
  return newScan;
}

/**
 * Update scan
 */
export function updateScan(id, updates) {
  const scans = getAllScans();
  const index = scans.findIndex(scan => scan.id === id);

  if (index === -1) {
    throw new Error('Scan not found');
  }

  scans[index] = { ...scans[index], ...updates, lastUpdated: new Date().toISOString() };
  saveToStorage(STORAGE_KEYS.SCANS, scans);
  return scans[index];
}

/**
 * Delete scan
 */
export function deleteScan(id) {
  const scans = getAllScans();
  const filteredScans = scans.filter(scan => scan.id !== id);
  saveToStorage(STORAGE_KEYS.SCANS, filteredScans);
  return true;
}

// ==================== SESSION MANAGEMENT ====================

/**
 * Get current session
 */
export function getCurrentSession() {
  return getFromStorage(STORAGE_KEYS.SESSION);
}

/**
 * Create session
 */
export function createSession(sessionData) {
  const session = {
    ...sessionData,
    createdAt: new Date().toISOString()
  };
  saveToStorage(STORAGE_KEYS.SESSION, session);
  return session;
}

/**
 * Clear session (logout)
 */
export function clearSession() {
  removeFromStorage(STORAGE_KEYS.SESSION);
  return true;
}

// ==================== DATA EXPORT/IMPORT ====================

/**
 * Export all data to JSON
 */
export function exportAllData() {
  const data = {
    users: getAllUsers(),
    doctors: getAllDoctors(),
    patients: getAllPatients(),
    scans: getAllScans(),
    settings: getFromStorage(STORAGE_KEYS.SETTINGS),
    appData: getFromStorage(STORAGE_KEYS.APP_DATA),
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON
 */
export function importData(jsonData) {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    if (data.users) saveToStorage(STORAGE_KEYS.USERS, data.users);
    if (data.doctors) saveToStorage(STORAGE_KEYS.DOCTORS, data.doctors);
    if (data.patients) saveToStorage(STORAGE_KEYS.PATIENTS, data.patients);
    if (data.scans) saveToStorage(STORAGE_KEYS.SCANS, data.scans);
    if (data.settings) saveToStorage(STORAGE_KEYS.SETTINGS, data.settings);
    if (data.appData) saveToStorage(STORAGE_KEYS.APP_DATA, data.appData);

    console.log('✅ Data imported successfully');
    return true;
  } catch (error) {
    console.error('❌ Data import failed:', error);
    throw new Error('Failed to import data: ' + error.message);
  }
}

/**
 * Download data as JSON file
 */
export function downloadDataBackup() {
  const data = exportAllData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pneumai-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clear all data (reset database)
 */
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
  console.log('✅ All data cleared');
  return true;
}

// ==================== STATISTICS ====================

/**
 * Get dashboard statistics
 */
export function getDashboardStats() {
  const patients = getAllPatients();
  const scans = getAllScans();
  const doctors = getAllDoctors();

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    totalPatients: patients.length,
    newPatientsThisMonth: patients.filter(p => new Date(p.createdAt) >= thisMonth).length,
    followUpRequired: patients.filter(p => p.status === 'Follow-up Required').length,
    criticalCases: patients.filter(p => p.status === 'Urgent').length,
    totalDoctors: doctors.length,
    totalScans: scans.length,
    pendingScans: scans.filter(s => s.status === 'pending').length,
    reviewedScans: scans.filter(s => s.status === 'reviewed').length
  };
}

// Export storage keys for external use
export { STORAGE_KEYS };

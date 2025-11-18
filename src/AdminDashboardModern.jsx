import React, { useState, useEffect } from 'react';
import { Users, FileText, Layers, Settings, HelpCircle, LogOut, Bell, Search, Home, UserPlus, Stethoscope, Download, Upload, Database, Activity, TrendingUp, CheckCircle, AlertCircle, Shield, MessageSquare, BarChart3, Clock, Target, Moon, Sun, ArrowRight, X, Calendar, Send, Mail } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import {
  getAllDoctors,
  getAllPatients,
  createDoctor,
  deleteDoctor,
  deletePatient,
  getDashboardStats,
  downloadDataBackup,
  importData,
  initializeDatabase
} from './utils/localDataManager';
import {
  getAppointments,
  getMessages,
  sendMessage,
  formatDate
} from './utils/patientDataManager';
import { patientAPI } from './services/apiService';

const AdminDashboard = ({ username, onLogout, onToggleDashboardStyle }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const { darkMode, toggleDarkMode } = useTheme();

  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    phone: '',
    image: ''
  });

  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    medicalHistory: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setDoctors(getAllDoctors());
    setStats(getDashboardStats());
    setAppointments(getAppointments());
    setMessages(getMessages());

    // Load patients from API
    try {
      const response = await patientAPI.getAll();
      if (response.patients && response.patients.length > 0) {
        // Convert API format to UI format
        const formattedPatients = response.patients.map(p => ({
          id: p.id,
          fullName: p.name,
          age: calculateAge(p.dateOfBirth),
          lastVisit: p.lastVisit || 'Never',
          status: 'Active',
          email: p.email,
          phone: p.phone,
          dateOfBirth: p.dateOfBirth,
          gender: p.gender,
          medicalHistory: p.medicalHistory
        }));
        setPatients(formattedPatients);
      } else {
        // Fallback to localStorage
        setPatients(getAllPatients());
      }
    } catch (error) {
      console.error('Error loading patients from API:', error);
      // Fallback to localStorage
      setPatients(getAllPatients());
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleCreateDoctor = (e) => {
    e.preventDefault();
    try {
      createDoctor(newDoctor);
      loadData();
      alert(`Doctor ${newDoctor.name} created successfully!`);
      setShowDoctorModal(false);
      setNewDoctor({ name: '', email: '', password: '', specialty: '', phone: '', image: '' });
    } catch (error) {
      alert(`Error creating doctor: ${error.message}`);
    }
  };

  const handleDeleteDoctor = (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        deleteDoctor(doctorId);
        loadData();
        alert('Doctor deleted successfully!');
      } catch (error) {
        alert(`Error deleting doctor: ${error.message}`);
      }
    }
  };

  const handleExportData = () => {
    try {
      downloadDataBackup();
      alert('Data exported successfully!');
    } catch (error) {
      alert(`Error exporting data: ${error.message}`);
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        importData(e.target.result);
        loadData();
        alert('Data imported successfully!');
      } catch (error) {
        alert(`Error importing data: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleInitializeDatabase = () => {
    if (window.confirm('This will initialize the database with demo data. Continue?')) {
      try {
        initializeDatabase();
        loadData();
        alert('Database initialized!');
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  // ============ Patient CRUD Handlers ============

  const handleAddPatient = () => {
    setEditingPatient(null);
    setNewPatient({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      medicalHistory: ''
    });
    setShowPatientModal(true);
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setNewPatient({
      name: patient.fullName,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      medicalHistory: patient.medicalHistory
    });
    setShowPatientModal(true);
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();

    try {
      if (editingPatient) {
        // Update existing patient
        await patientAPI.update(editingPatient.id, newPatient);
        alert(`Patient ${newPatient.name} updated successfully!`);
      } else {
        // Create new patient
        await patientAPI.create(newPatient);
        alert(`Patient ${newPatient.name} created successfully!`);
      }

      // Reload data
      await loadData();
      setShowPatientModal(false);
      setEditingPatient(null);
      setNewPatient({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        medicalHistory: ''
      });
    } catch (error) {
      alert(`Error saving patient: ${error.message}`);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        deletePatient(patientId);
        loadData();
        alert('Patient deleted successfully!');
      } catch (error) {
        alert(`Error deleting patient: ${error.message}`);
      }
    }
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'scans', label: 'CT Scans', icon: Layers },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              PneumAI
            </h1>
            <span className="px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 rounded-full">
              Admin
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              onClick={() => setActiveTab('appointments')}
              title={`${appointments.length} appointments, ${messages.length} messages`}
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {(appointments.length > 0 || messages.length > 0) && (
                <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {appointments.length + messages.length}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Dr. {username}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Pill Style */}
        <div className="px-6 pb-3 overflow-x-auto">
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === item.id
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time insights into system performance and healthcare delivery
              </p>
            </div>

            {/* Key Metrics - Large Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-soft-lg">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 opacity-80" />
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">+2.3%</span>
                </div>
                <p className="text-sm opacity-90 mb-1">AI Detection Accuracy</p>
                <p className="text-4xl font-bold">96.8%</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-soft-lg">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-sm opacity-90 mb-1">Scans Analyzed</p>
                <p className="text-4xl font-bold">{stats.totalScans || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-soft-lg">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 opacity-80" />
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">-0.5s</span>
                </div>
                <p className="text-sm opacity-90 mb-1">Avg Response Time</p>
                <p className="text-4xl font-bold">2.8s</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-soft-lg">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-sm opacity-90 mb-1">User Satisfaction</p>
                <p className="text-4xl font-bold">4.7/5</p>
                <p className="text-xs opacity-75 mt-1">248 reviews</p>
              </div>
            </div>

            {/* Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Performance */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Performance</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Classification</span>
                      <span className="text-xl font-bold text-success-600">96.8%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-success-500 rounded-full" style={{ width: '96.8%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Sensitivity</span>
                      <span className="text-xl font-bold text-success-600">94.2%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-success-500 rounded-full" style={{ width: '94.2%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Specificity</span>
                      <span className="text-xl font-bold text-success-600">97.5%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-success-500 rounded-full" style={{ width: '97.5%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Healthcare Impact */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-secondary-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Healthcare Impact</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary-600">87%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Early Detection</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary-600">42%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Error Reduction</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary-600">{stats.totalPatients || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Patients Helped</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary-600">92%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Accessibility</p>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-5 h-5 text-success-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                    <span className="text-sm font-semibold text-success-600">99.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">API Response</span>
                    <span className="text-sm font-semibold text-success-600">2.8s avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Processing</span>
                    <span className="text-sm font-semibold text-success-600">1.2s avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Server Health</span>
                    <span className="px-2 py-1 text-xs font-semibold text-success-700 bg-success-100 dark:bg-success-900/30 rounded-full">Optimal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportData}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Backup</span>
                </button>
                <label className="flex items-center space-x-2 px-4 py-2 bg-success-500 hover:bg-success-600 text-white rounded-lg font-medium cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Import Data</span>
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>
                <button
                  onClick={handleInitializeDatabase}
                  className="flex items-center space-x-2 px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Database className="w-4 h-4" />
                  <span>Initialize Demo Data</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Management</h2>
              <button
                onClick={handleAddPatient}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Patient</span>
              </button>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Visit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
                    {patients.length > 0 ? (
                      patients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{patient.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{patient.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{patient.age}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{patient.lastVisit}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              patient.status === 'Urgent' ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400' :
                              patient.status === 'Follow-up Required' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' :
                              'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                            }`}>
                              {patient.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleEditPatient(patient)}
                              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium mr-3"
                            >
                              View/Edit
                            </button>
                            <button
                              onClick={() => handleDeletePatient(patient.id)}
                              className="text-danger-600 hover:text-danger-700 dark:text-danger-400 font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          No patients found. Initialize demo data to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Management</h2>
              <button
                onClick={() => setShowDoctorModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Doctor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <div key={doctor.id} className="bg-white dark:bg-dark-800 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700 overflow-hidden hover:shadow-soft-lg transition-shadow">
                    <div className="h-32 bg-gradient-to-br from-primary-500 to-secondary-500"></div>
                    <div className="p-6 -mt-16">
                      <div className="w-24 h-24 rounded-full bg-white dark:bg-dark-800 border-4 border-white dark:border-dark-800 overflow-hidden mb-4">
                        <img
                          src={doctor.image || '/assets/ai-doc1.jpg'}
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{doctor.name}</h3>
                      <p className="text-sm text-primary-600 dark:text-primary-400 mb-2">{doctor.specialty}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{doctor.email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{doctor.phone}</p>
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doctor.id)}
                          className="flex-1 px-3 py-2 bg-danger-100 dark:bg-danger-900/30 hover:bg-danger-200 dark:hover:bg-danger-900/50 text-danger-700 dark:text-danger-400 rounded-lg text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <Stethoscope className="w-16 h-16 mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Doctors Yet</h3>
                  <p className="text-sm">Click "Add Doctor" to create the first doctor account.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Appointments</h2>
              <span className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg font-medium">
                {appointments.length} Total
              </span>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
                    {appointments.length > 0 ? (
                      appointments.map((appointment) => {
                        const formattedDate = formatDate(appointment.date) || appointment.date;
                        return (
                          <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formattedDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{appointment.time}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{appointment.doctor}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{appointment.type}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{appointment.notes || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                appointment.status === 'scheduled' ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' :
                                appointment.status === 'completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' :
                                'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'
                              }`}>
                                {appointment.status || 'scheduled'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No appointments found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Messages</h2>
              <span className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg font-medium">
                {messages.length} Total
              </span>
            </div>

            <div className="grid gap-4">
              {messages.length > 0 ? (
                messages.map((message) => {
                  const content = message.content || '';
                  const subject = content.split('\n')[0]?.replace('Subject: ', '') || 'No Subject';
                  const messageBody = content.split('\n\n')[1] || content;
                  const isFromPatient = message.senderRole === 'patient';

                  return (
                    <div key={message.id} className="bg-white dark:bg-dark-800 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700 p-6 hover:shadow-soft-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                            {isFromPatient
                              ? (message.senderName ? message.senderName.charAt(0).toUpperCase() : 'P')
                              : (message.receiverName ? message.receiverName.charAt(0).toUpperCase() : 'D')
                            }
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{subject}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {isFromPatient ? `From: ${message.senderName || 'Patient'}` : `To: ${message.receiverName || 'Doctor'}`}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                        {messageBody}
                      </p>
                      <div className="flex items-center space-x-2">
                        {isFromPatient && (
                          <span className="px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                            Patient Message
                          </span>
                        )}
                        {!message.read && (
                          <span className="px-3 py-1 text-xs font-semibold text-warning-700 dark:text-warning-300 bg-warning-100 dark:bg-warning-900/30 rounded-full">
                            Unread
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-700 p-12 text-center">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Messages Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Patient messages will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab - Functional */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appearance Settings */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enable dark theme across the application</p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        darkMode ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Dashboard Style</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Switch to classic dashboard layout</p>
                    </div>
                    <button
                      onClick={onToggleDashboardStyle}
                      className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Switch to Classic
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security & Privacy</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">End-to-end encryption</span>
                    <CheckCircle className="w-5 h-5 text-success-500" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">HTTPS SSL certificate</span>
                    <CheckCircle className="w-5 h-5 text-success-500" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Data Privacy Act compliance</span>
                    <CheckCircle className="w-5 h-5 text-success-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Tab */}
        {activeTab === 'help' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Help & Documentation</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer">
                <HelpCircle className="w-10 h-10 text-primary-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Getting Started</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Learn how to use the PneumAI admin dashboard</p>
                <button className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                  Read guide <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer">
                <MessageSquare className="w-10 h-10 text-primary-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Get help from our support team</p>
                <button className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                  Contact us <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer">
                <FileText className="w-10 h-10 text-primary-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Documentation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Browse comprehensive documentation</p>
                <button className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                  View docs <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="fixed bottom-6 right-6 flex items-center space-x-2 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <LogOut className="w-4 h-4" />
        <span className="font-medium">Logout</span>
      </button>

      {/* Doctor Creation Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDoctorModal(false)}>
          <div className="bg-white dark:bg-dark-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Doctor</h2>
              <button onClick={() => setShowDoctorModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Doctor Name *</label>
                  <input
                    type="text"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white"
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role *</label>
                  <select
                    value={newDoctor.specialty}
                    onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white"
                  >
                    <option value="">Select Role</option>
                    <option value="General Practitioner">General Practitioner</option>
                    <option value="Healthcare Professional">Healthcare Professional</option>
                    <option value="Medical Specialist">Medical Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white"
                    placeholder="doctor@pneumai.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newDoctor.phone}
                    onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white"
                    placeholder="+63 (2) 1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label>
                  <input
                    type="password"
                    value={newDoctor.password}
                    onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                    required
                    minLength="8"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Image</label>
                  <select
                    value={newDoctor.image}
                    onChange={(e) => setNewDoctor({...newDoctor, image: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white"
                  >
                    <option value="">Select Image</option>
                    <option value="/assets/ai-doc1.jpg">AI Doctor 1</option>
                    <option value="/assets/ai-doc2.jpg">AI Doctor 2</option>
                    <option value="/assets/ai-doc3.png">AI Doctor 3</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                >
                  Create Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Modal (Add/Edit) */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingPatient ? 'Edit Patient' : 'Add New Patient'}
              </h2>
              <button
                onClick={() => setShowPatientModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white"
                    placeholder="patient@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender *</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medical History</label>
                  <textarea
                    value={newPatient.medicalHistory}
                    onChange={(e) => setNewPatient({...newPatient, medicalHistory: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-700 dark:text-white"
                    placeholder="Enter relevant medical history..."
                  ></textarea>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPatientModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                >
                  {editingPatient ? 'Update Patient' : 'Create Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

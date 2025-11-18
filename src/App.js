import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PneumAIUI from './PneumAIUI';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import PatientDashboard from './PatientDashboard';
import PatientRegistration from './PatientRegistration';
import PatientPlatform from './PatientPlatform';
import './App.css';
import './Login.css';
import './Dashboard.css';
import './PatientRegistration.css';
import './PneumAI.css';
import './PneumAIIcons.css';
import './PatientPlatformIntegration.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PneumAIUI />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<PatientRegistration />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/platform" element={<PatientPlatform />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

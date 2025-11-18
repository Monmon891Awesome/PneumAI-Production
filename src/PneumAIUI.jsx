import React, { useState, useEffect } from 'react';
import { Stethoscope, Users, FileText, HelpCircle, Home, Menu, X, Upload, ChevronRight, LogIn, Activity, Layers } from 'lucide-react';
import './PneumAI.css'; // Import the CSS file
import './Login.css'; // Import login CSS
import './Dashboard.css'; // Import dashboard CSS
import './PatientRegistration.css'; // Import patient registration CSS
import Login from './Login'; // Import Login component
import PatientRegistration from './PatientRegistration'; // Import Patient Registration component
import PatientDashboard from './PatientDashboard'; // Import Patient Dashboard (Classic)
// ...existing code...
import AdminDashboard from './AdminDashboard'; // Import Admin Dashboard (Classic)
import AdminDashboardModern from './AdminDashboardModern'; // Import Admin Dashboard (Modern)
// ...existing code...
import DoctorDashboard from './DoctorDashboard'; // Import Doctor Dashboard
import { initializeDatabase } from './utils/localDataManager'; // Import database initialization

const PneumAIUI = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Authentication states
  const [showLogin, setShowLogin] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'patient' or 'admin'
  const [username, setUsername] = useState('');
  const [dashboardStyle, setDashboardStyle] = useState('modern'); // Options: 'classic', 'modern'

  // Check if user was previously logged in and initialize database
  useEffect(() => {
    // Initialize database with demo data
    initializeDatabase();

    const savedSession = JSON.parse(localStorage.getItem('pneumAISession') || 'null');
    if (savedSession) {
      setIsLoggedIn(true);
      setUserType(savedSession.userType);
      setUsername(savedSession.username);
    }

    // Load dashboard preference
    const dashboardPref = localStorage.getItem('dashboardStyle');
    if (dashboardPref) {
      setDashboardStyle(dashboardPref);
    }
  }, []);
  
  // Handle login button click
  const handleLoginClick = () => {
    setShowLogin(true);
    setIsMenuOpen(false); // Close mobile menu if open
  };
  
  // Handle login form submission
  const handleLogin = (type, user) => {
    setIsLoggedIn(true);
    setUserType(type);
    setUsername(user);
    setShowLogin(false);
    
    // Save session to localStorage
    const session = { userType: type, username: user };
    localStorage.setItem('pneumAISession', JSON.stringify(session));
  };
  
  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setUsername('');
    
    // Remove session from localStorage
    localStorage.removeItem('pneumAISession');
  };
  
  // Close login modal
  const handleCloseLogin = () => {
    setShowLogin(false);
  };
  
  // Open registration form
  const handleRegisterClick = () => {
    setShowLogin(false);
    setShowRegistration(true);
  };
  
  // Close registration form
  const handleCloseRegistration = () => {
    setShowRegistration(false);
  };
  
  // Return to login from registration
  const handleBackToLogin = () => {
    setShowRegistration(false);
    setShowLogin(true);
  };

  // Toggle dashboard style - cycles through all available styles
  const toggleDashboardStyle = () => {
    const styles = ['classic', 'modern'];
    const currentIndex = styles.indexOf(dashboardStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    const newStyle = styles[nextIndex];
    setDashboardStyle(newStyle);
    localStorage.setItem('dashboardStyle', newStyle);
  } 

  // If user is logged in, show the appropriate dashboard
  if (isLoggedIn) {
    if (userType === 'patient') {
      // Choose patient dashboard style
      switch (dashboardStyle) {
        case 'modern':
          return <PatientDashboard username={username} onLogout={handleLogout} />;
        case 'classic':
        default:
          return <PatientDashboard username={username} onLogout={handleLogout} />;
      }
    } else if (userType === 'admin') {
      // Choose admin dashboard style
      switch (dashboardStyle) {
        case 'modern':
          return <AdminDashboardModern username={username} onLogout={handleLogout} onToggleDashboardStyle={toggleDashboardStyle} />;
        case 'classic':
        default:
          return <AdminDashboard username={username} onLogout={handleLogout} onToggleDashboardStyle={toggleDashboardStyle} />;
      }
    } else if (userType === 'doctor') {
      return <DoctorDashboard username={username} onLogout={handleLogout} />;
    }
  }
  
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container header-container">
          <div className="logo-container">
            <img src="/assets/logo-medic.jpg" alt="PneumAI Logo" className="logo-image" />
            <h1 className="logo-text">PneumAI</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <a href="#" className="nav-link">Home</a>
            <button className="sign-in-button" onClick={handleLoginClick} type="button">
              <LogIn className="icon-sm" /> Sign In
            </button>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="mobile-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
          >
            {isMenuOpen ? <X className="icon" /> : <Menu className="icon" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav">
            <div className="container mobile-nav-container">
              <a href="#" className="mobile-nav-link">Home</a>
              <button className="mobile-sign-in-button" onClick={handleLoginClick} type="button">
                <LogIn className="icon-sm" /> Sign In
              </button>
            </div>
          </div>
        )}
      </header>
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="lung-background-left"></div>
        <div className="lung-background-right"></div>
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">AI-Assisted Healthcare Support</div>
            <h2 className="hero-title">Supporting Lung Cancer Detection and Care</h2>
            <p className="hero-description">AI-powered analysis tool designed to assist healthcare professionals in reviewing CT scans, paired with comprehensive patient support resources. A supportive tool to help in the detection and analysis of lung conditions.</p>
            <div className="hero-buttons">
              <button className="hero-button-primary" onClick={handleLoginClick} type="button">
                <Upload className="icon-sm" /> Patient Portal
              </button>
              <button className="hero-button-secondary" onClick={handleLoginClick} type="button">
                <Stethoscope className="icon-sm" /> Healthcare Professional Access
              </button>
            </div>
          </div>
          <div className="hero-image-container">
            <div className="hero-image-wrapper">
              <img
                src="/assets/lungs.png"
                alt="AI Lung Scan Analysis"
                className="hero-image hero-lungs-animation"
              />
              <div className="scan-lines"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Rest of the component remains unchanged */}
      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">How PneumAI Works</h2>
          
          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-container">
                <FileText className="feature-icon icon" />
              </div>
              <h3 className="feature-title">AI-Assisted Analysis</h3>
              <p className="feature-description">Machine learning algorithms assist in analyzing CT scans to help identify potential areas of concern for healthcare professional review.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-container">
                <Stethoscope className="feature-icon icon" />
              </div>
              <h3 className="feature-title">Healthcare Professional Support</h3>
              <p className="feature-description">Healthcare professionals receive detailed insights and analysis results to support their diagnostic review and treatment planning.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-container">
                <HelpCircle className="feature-icon icon" />
              </div>
              <h3 className="feature-title">Emotional Support</h3>
              <p className="feature-description">Comprehensive resources to help patients understand their condition and manage psychological aspects of lung health.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Doctor Platform Preview */}
      <section className="platform-section">
        <div className="container">
          <h2 className="section-title">Healthcare Professional Platform</h2>
          <p className="platform-description">
            A supportive analysis tool designed for healthcare professionals to review CT scans with AI-assisted insights.
          </p>
          
          {/* Sample Dashboard */}
          <div className="dashboard-container">
            <div className="dashboard-header">
              <h3 className="dashboard-title">Doctor Dashboard</h3>
              <div className="dashboard-actions">
                <a href="#" className="dashboard-action-link">Help</a>
                <a href="#" className="dashboard-action-link">Settings</a>
                <div className="dashboard-user">
                  <div className="user-avatar">
                    <span className="user-initials">DR</span>
                  </div>
                  <span className="user-name">Dr. Rodriguez</span>
                </div>
              </div>
            </div>
            
            <div className="dashboard-content">
              {/* Sidebar */}
              <div className="dashboard-sidebar">
                <div className="sidebar-nav">
                  <button 
                    className={`sidebar-nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                    type="button"
                  >
                    <Home className="icon-sm" /> Dashboard
                  </button>
                  <button 
                    className={`sidebar-nav-button ${activeTab === 'patients' ? 'active' : ''}`}
                    onClick={() => setActiveTab('patients')}
                    type="button"
                  >
                    <Users className="icon-sm" /> Patients
                  </button>
                  <button 
                    className={`sidebar-nav-button ${activeTab === 'scans' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scans')}
                    type="button"
                  >
                    <Layers className="icon-sm" /> CT Scans
                  </button>
                  <button 
                    className={`sidebar-nav-button ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                    type="button"
                  >
                    <FileText className="icon-sm" /> Reports
                  </button>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="dashboard-main">
                <div className="main-header">
                  <h3 className="main-title">CT Scan Analysis</h3>
                  <button type="button" className="upload-button">
                    <Upload className="icon-sm" /> Upload New Scan
                  </button>
                </div>
                
                <div className="scan-grid">
                  {/* Scan Viewer */}
                  <div className="scan-viewer">
                    <img
                      src="/assets/lungs.png"
                      alt="CT Scan"
                      className="scan-image"
                    />
                  </div>
                  
                  {/* Analysis Results */}
                  <div className="analysis-container">
                    <h4 className="analysis-title">AI Analysis Results</h4>
                    
                    <div className="analysis-content">
                      <div className="analysis-section">
                        <div className="probability-header">
                          <span className="probability-label">Areas Requiring Attention</span>
                          <span className="probability-value">Detected</span>
                        </div>
                      </div>
                      
                      <div className="section-divider">
                        <h5 className="section-subtitle">Detected Abnormalities</h5>
                        <ul className="abnormality-list">
                          <li className="abnormality-item">
                            <ChevronRight className="abnormality-icon icon-sm" />
                            <div className="abnormality-content">
                              <p className="abnormality-title">Nodule detected in right upper lobe</p>
                              <p className="abnormality-details">Size: 1.8cm x 1.4cm, Irregular borders</p>
                            </div>
                          </li>
                          <li className="abnormality-item">
                            <ChevronRight className="abnormality-icon warning icon-sm" />
                            <div className="abnormality-content">
                              <p className="abnormality-title">Ground-glass opacity</p>
                              <p className="abnormality-details">Left lower lobe, 4.2mm diameter</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="section-divider">
                        <h5 className="section-subtitle">Suggested Considerations</h5>
                        <ul className="action-list">
                          <li className="action-item">
                            <Activity className="action-icon icon-sm" />
                            May benefit from follow-up imaging
                          </li>
                          <li className="action-item">
                            <Activity className="action-icon icon-sm" />
                            Healthcare professional review recommended
                          </li>
                          <li className="action-item">
                            <Activity className="action-icon icon-sm" />
                            Further clinical evaluation may be needed
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="analysis-actions">
                      <button type="button" className="primary-button">
                        Generate Detailed Report
                      </button>
                      <button type="button" className="secondary-button">
                        Second Opinion
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="patient-info">
                  <h4 className="patient-title">Patient Information</h4>
                  <div className="patient-card">
                    <div className="patient-grid">
                      <div className="patient-field">
                        <p className="field-label">Patient Name</p>
                        <p className="field-value">Robert Johnson</p>
                      </div>
                      <div className="patient-field">
                        <p className="field-label">Patient ID</p>
                        <p className="field-value">PAT-2023-8642</p>
                      </div>
                      <div className="patient-field">
                        <p className="field-label">Age</p>
                        <p className="field-value">54 years</p>
                      </div>
                      <div className="patient-field">
                        <p className="field-label">Scan Date</p>
                        <p className="field-value">May 3, 2025</p>
                      </div>
                    </div>
                    
                    <div className="patient-notes">
                      <p className="notes-label">Clinical Notes</p>
                      <p className="notes-text">Patient presents with persistent cough for 3 months. Former smoker (2 packs/day for 20 years, quit 5 years ago). Family history of lung cancer.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Professionals Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title">Our Healthcare Professionals</h2>
          <p className="platform-description">
            Experienced medical professionals ready to support your healthcare journey.
          </p>

          <div className="team-grid">
            {/* Doctor 1 */}
            <div className="team-card">
              <div className="team-image-container">
                <img src="/assets/ai-doc1.jpg" alt="Dr. Sarah Chen" className="team-image" />
              </div>
              <div className="team-info">
                <h3 className="team-name">Dr. Sarah Chen</h3>
                <p className="team-role">General Practitioner</p>
                <p className="team-description">15+ years of experience in primary care and diagnostic imaging review.</p>
              </div>
            </div>

            {/* Doctor 2 */}
            <div className="team-card">
              <div className="team-image-container">
                <img src="/assets/ai-doc2.jpg" alt="Dr. Michael Torres" className="team-image" />
              </div>
              <div className="team-info">
                <h3 className="team-name">Dr. Michael Torres</h3>
                <p className="team-role">Medical Specialist</p>
                <p className="team-description">Specialized in respiratory conditions and CT scan interpretation.</p>
              </div>
            </div>

            {/* Doctor 3 */}
            <div className="team-card">
              <div className="team-image-container">
                <img src="/assets/ai-doc3.png" alt="Dr. Emily Rodriguez" className="team-image" />
              </div>
              <div className="team-info">
                <h3 className="team-name">Dr. Emily Rodriguez</h3>
                <p className="team-role">Clinical Consultant</p>
                <p className="team-description">Expert in patient care coordination and clinical decision support.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Section */}
      <section className="support-section">
        <div className="container">
          <h2 className="section-title">Patient Support</h2>
          <p className="support-description">
            Our platform provides comprehensive emotional and psychological support for patients
            dealing with lung conditions and cancer diagnoses.
          </p>
          
          <div className="support-grid">
            {/* Support Card 1 */}
            <div className="support-card">
              <div className="support-icon-container">
                <Users className="support-icon icon" />
              </div>
              <h3 className="support-title">Support Communities</h3>
              <p className="support-description">Connect with others facing similar challenges through our moderated support communities.</p>
              <a href="#" className="support-link">
                Join a community <ChevronRight className="icon-sm" />
              </a>
            </div>
            
            {/* Support Card 2 */}
            <div className="support-card">
              <div className="support-icon-container">
                <FileText className="support-icon icon" />
              </div>
              <h3 className="support-title">Educational Resources</h3>
              <p className="support-description">Access comprehensive information about lung conditions, treatments, and lifestyle recommendations.</p>
              <a href="#" className="support-link">
                Browse resources <ChevronRight className="icon-sm" />
              </a>
            </div>
            
            {/* Support Card 3 */}
            <div className="support-card">
              <div className="support-icon-container">
                <HelpCircle className="support-icon icon" />
              </div>
              <h3 className="support-title">Mental Health Tools</h3>
              <p className="support-description">Guided exercises, meditation, and coping strategies to manage anxiety and stress related to diagnosis.</p>
              <a href="#" className="support-link">
                Explore tools <ChevronRight className="icon-sm" />
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Login Modal */}
      {showLogin && (
        <Login 
          onClose={handleCloseLogin} 
          onLogin={handleLogin} 
          onRegister={handleRegisterClick}
        />
      )}
      
      {/* Patient Registration Modal */}
      {showRegistration && (
        <PatientRegistration 
          onClose={handleCloseRegistration}
          onBackToLogin={handleBackToLogin}
        />
      )}
    </div>
  );
};

export default PneumAIUI;

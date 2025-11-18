import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Layers, 
  FileText, 
  Upload,
  ChevronRight,
  Activity
} from 'lucide-react';

const PatientPlatform = () => {
  // Rest of the component remains the same
  const [activeTab, setActiveTab] = useState('scans');
  
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  
  // Mock patient data
  const patientInfo = {
    name: 'Robert Johnson',
    id: 'PAT-2023-8642',
    age: '54 years',
    scanDate: 'May 3, 2025'
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main Header */}
      <header className="py-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Patient Platform</h1>
        <p className="mt-2 text-gray-600 max-w-3xl mx-auto">
          View and understand your CT scan results with our advanced AI system designed to help you and your healthcare providers monitor your lung health.
        </p>
      </header>
      
      {/* Dashboard Header */}
      <div className="bg-blue-700 text-white py-4 px-8 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Patient Dashboard</h2>
        <div className="flex items-center gap-4">
          <button className="hover:underline" type="button">Help</button>
          <button className="hover:underline" type="button">Settings</button>
          <div className="flex items-center gap-2">
            <div className="bg-white text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-semibold">
              RJ
            </div>
            <span>{patientInfo.name}</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white p-4">
          <ul className="space-y-1">
            <li>
              <button 
                className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}
                onClick={() => handleTabClick('dashboard')}
                type="button"
              >
                <Home size={20} />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${activeTab === 'appointments' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}
                onClick={() => handleTabClick('appointments')}
                type="button"
              >
                <Users size={20} />
                <span>Appointments</span>
              </button>
            </li>
            <li>
              <button 
                className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${activeTab === 'scans' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}
                onClick={() => handleTabClick('scans')}
                type="button"
              >
                <Layers size={20} />
                <span>CT Scans</span>
              </button>
            </li>
            <li>
              <button 
                className={`flex items-center gap-3 p-3 w-full text-left rounded-md ${activeTab === 'reports' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}
                onClick={() => handleTabClick('reports')}
                type="button"
              >
                <FileText size={20} />
                <span>Reports</span>
              </button>
            </li>
          </ul>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">CT Scan Analysis</h2>
            <button 
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center gap-2"
            >
              <Upload size={18} />
              Upload New Scan
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CT Scan Viewer */}
            <div className="bg-white rounded-lg overflow-hidden flex items-center justify-center p-4" style={{ minHeight: '400px' }}>
              <img src="/api/placeholder/400/400" alt="CT Scan" className="max-w-full max-h-full" />
            </div>
            
            {/* AI Analysis Results */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">AI Analysis Results</h3>
              
              {/* Cancer Probability */}
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Cancer Probability</span>
                  <span className="text-red-600 font-semibold">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              
              {/* Detected Abnormalities */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Detected Abnormalities</h4>
                <ul className="space-y-3">
                  <li className="flex">
                    <ChevronRight className="text-red-500 mr-2 flex-shrink-0 mt-1" size={18} />
                    <div>
                      <p className="font-medium">Nodule detected in right upper lobe</p>
                      <p className="text-sm text-gray-600">Size: 1.8cm x 1.4cm, Irregular borders</p>
                    </div>
                  </li>
                  <li className="flex">
                    <ChevronRight className="text-yellow-500 mr-2 flex-shrink-0 mt-1" size={18} />
                    <div>
                      <p className="font-medium">Ground-glass opacity</p>
                      <p className="text-sm text-gray-600">Left lower lobe, 4.2mm diameter</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              {/* Recommended Actions */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Recommended Actions</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Activity className="text-blue-500 mr-2" size={16} />
                    <span>Schedule follow-up scan in 30 days</span>
                  </li>
                  <li className="flex items-center">
                    <Activity className="text-blue-500 mr-2" size={16} />
                    <span>Consider biopsy of right upper lobe nodule</span>
                  </li>
                  <li className="flex items-center">
                    <Activity className="text-blue-500 mr-2" size={16} />
                    <span>Refer to pulmonary specialist</span>
                  </li>
                </ul>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                <button type="button" className="bg-blue-600 text-white py-2 px-4 rounded flex-1 hover:bg-blue-700">
                  View Detailed Report
                </button>
                <button type="button" className="border border-gray-300 text-gray-700 py-2 px-4 rounded flex-1 hover:bg-gray-50">
                  Contact Doctor
                </button>
              </div>
            </div>
          </div>
          
          {/* Patient Information */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Patient Information</h3>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Patient Name</p>
                  <p className="font-medium">{patientInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Patient ID</p>
                  <p className="font-medium">{patientInfo.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{patientInfo.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Scan Date</p>
                  <p className="font-medium">{patientInfo.scanDate}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Clinical Notes</p>
                <p className="mt-1">Patient presents with persistent cough for 3 months. Former smoker (2 packs/day for 20 years, quit 5 years ago). Family history of lung cancer.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientPlatform;

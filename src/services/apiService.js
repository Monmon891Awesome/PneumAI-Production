/**
 * API Service for PneumAI Backend
 * Handles API calls to the FastAPI backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ============================================================================
// APPOINTMENT API
// ============================================================================

export const appointmentAPI = {
  // Create a new appointment
  create: async (appointmentData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create appointment');
    }

    return response.json();
  },

  // Get appointments for a patient
  getByPatient: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/appointments/patient/${patientId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }

    return response.json();
  },

  // Get appointments for a doctor
  getByDoctor: async (doctorId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/appointments/doctor/${doctorId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }

    return response.json();
  },

  // Get specific appointment
  getById: async (appointmentId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${appointmentId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch appointment');
    }

    return response.json();
  },

  // Update appointment
  update: async (appointmentId, updateData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update appointment');
    }

    return response.json();
  },

  // Cancel appointment
  cancel: async (appointmentId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${appointmentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to cancel appointment');
    }

    return response.json();
  },
};

// ============================================================================
// MESSAGING API
// ============================================================================

export const messageAPI = {
  // Send a message
  send: async (messageData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message');
    }

    return response.json();
  },

  // Get all messages for a user
  getByUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/user/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  },

  // Get conversation between two users
  getConversation: async (user1Id, user2Id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/conversation/${user1Id}/${user2Id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }

    return response.json();
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/${messageId}/read`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to mark message as read');
    }

    return response.json();
  },

  // Delete message
  delete: async (messageId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/${messageId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete message');
    }

    return response.json();
  },
};

// ============================================================================
// PATIENT API
// ============================================================================

export const patientAPI = {
  // Create a new patient
  create: async (patientData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create patient');
    }

    return response.json();
  },

  // Get all patients
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/patients`);

    if (!response.ok) {
      throw new Error('Failed to fetch patients');
    }

    return response.json();
  },

  // Get patient by ID
  getById: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/patients/${patientId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch patient');
    }

    return response.json();
  },

  // Update patient
  update: async (patientId, updateData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update patient');
    }

    return response.json();
  },

  // Delete patient
  delete: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/patients/${patientId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete patient');
    }

    return response.json();
  },
};

// ============================================================================
// DOCTOR API
// ============================================================================

export const doctorAPI = {
  // Get all doctors
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/doctors`);

    if (!response.ok) {
      throw new Error('Failed to fetch doctors');
    }

    return response.json();
  },

  // Get doctor by ID
  getById: async (doctorId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/doctors/${doctorId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch doctor');
    }

    return response.json();
  },
};

export default {
  appointments: appointmentAPI,
  messages: messageAPI,
  patients: patientAPI,
  doctors: doctorAPI,
};

import React, { useState } from 'react';
import './Platform.css';

const SimplifiedPatientPlatform = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Dr. Smith',
      message: 'Your recent scan results look good. No immediate concerns.',
      time: '2 hours ago',
      type: 'received'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'You',
          message: newMessage,
          time: 'Just now',
          type: 'sent'
        }
      ]);
      setNewMessage('');
    }
  };

  return (
    <div className="platform-container">
      <div className="platform-header">
        <h2>Patient-Physician Communication Platform</h2>
        <p>Communicate with your healthcare team about your scan results</p>
      </div>

      <div className="platform-content">
        <div className="platform-section">
          <h2>Messages</h2>
          <div className="messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-card ${msg.type}`}
              >
                <div className="message-header">
                  <strong>{msg.sender}</strong>
                  <span className="message-time">{msg.time}</span>
                </div>
                <div className="message-body">
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          <div className="message-input-container">
            <textarea
              className="message-input"
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
            />
            <button
              className="platform-button send-button"
              onClick={handleSendMessage}
              type="button"
            >
              Send Message
            </button>
          </div>
        </div>

        <div className="platform-section">
          <h2>Quick Actions</h2>
          <div className="platform-grid">
            <div className="platform-card">
              <h3>Request Appointment</h3>
              <p>Schedule a follow-up consultation with your physician</p>
              <button className="platform-button" type="button">
                Request
              </button>
            </div>

            <div className="platform-card">
              <h3>Share Results</h3>
              <p>Share your scan results with another healthcare provider</p>
              <button className="platform-button" type="button">
                Share
              </button>
            </div>

            <div className="platform-card">
              <h3>Ask a Question</h3>
              <p>Get answers about your diagnosis or treatment options</p>
              <button className="platform-button" type="button">
                Ask
              </button>
            </div>
          </div>
        </div>

        <div className="platform-section">
          <h2>Resources</h2>
          <div className="resources-list">
            <div className="resource-item">
              <h4>Understanding Your Scan Results</h4>
              <p>Learn how to interpret your CT scan findings</p>
            </div>
            <div className="resource-item">
              <h4>Treatment Options</h4>
              <p>Explore available treatment paths for lung health</p>
            </div>
            <div className="resource-item">
              <h4>Support Groups</h4>
              <p>Connect with others on similar health journeys</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedPatientPlatform;

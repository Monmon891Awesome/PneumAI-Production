import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Download, Share2, Eye, Mail } from 'lucide-react';
import './ScanResults.css';
import { generatePDFReport, generateJSONReport } from '../utils/pdfReportGenerator';
import { shareWithDoctor, copyShareableLink } from '../utils/emailService';
import { getPatientProfile, getDoctors } from '../utils/patientDataManager';

const ScanResults = ({ scanData }) => {
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!scanData || !scanData.results) {
    return null;
  }

  const patientProfile = getPatientProfile();
  const doctors = getDoctors();

  const { results, metadata, uploadTime, scanId } = scanData;
  const { detected, confidence, riskLevel = 'none', detections } = results;

  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#ffc107';
      default:
        return '#4caf50';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'high':
      case 'medium':
        return <AlertTriangle color={getRiskColor(level)} size={32} />;
      case 'low':
        return <Info color={getRiskColor(level)} size={32} />;
      default:
        return <CheckCircle color={getRiskColor(level)} size={32} />;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await generatePDFReport(scanData, patientProfile);
      alert('PDF report downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  const handleDownloadJSON = () => {
    try {
      generateJSONReport(scanData, patientProfile);
    } catch (error) {
      console.error('Error generating JSON:', error);
      alert('Failed to generate JSON report. Please try again.');
    }
  };

  const handleShareWithDoctor = () => {
    setShowShareModal(true);
    setShareSuccess(false);
  };

  const handleShareSubmit = async () => {
    if (!selectedDoctor) {
      alert('Please select a doctor to share with.');
      return;
    }

    setShareLoading(true);

    try {
      const doctor = doctors.find(d => d.id === selectedDoctor);
      if (doctor) {
        shareWithDoctor(scanData, patientProfile, doctor.email, doctor.name);
        setShareSuccess(true);
        setTimeout(() => {
          setShowShareModal(false);
          setShareSuccess(false);
          setSelectedDoctor('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      alert('Failed to share report. Please try again.');
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const result = await copyShareableLink(scanId);
    if (result.success) {
      alert('Link copied to clipboard!');
    } else {
      alert('Failed to copy link. Please try again.');
    }
  };

  return (
    <div className="scan-results-container">
      {/* Header */}
      <div className="results-header">
        <h2>Scan Analysis Results</h2>
        <div className="results-actions">
          <button className="action-button" onClick={handleDownloadPDF} type="button">
            <Download size={18} />
            Download PDF
          </button>
          <button className="action-button secondary" onClick={handleDownloadJSON} type="button">
            <Download size={18} />
            JSON
          </button>
          <button className="action-button" onClick={handleShareWithDoctor} type="button">
            <Share2 size={18} />
            Share with Doctor
          </button>
        </div>
      </div>

      {/* Overall Assessment */}
      <div className="overall-assessment" style={{ borderColor: getRiskColor(riskLevel) }}>
        <div className="assessment-icon">
          {getRiskIcon(riskLevel)}
        </div>
        <div className="assessment-content">
          <h3>Overall Assessment</h3>
          <p className="assessment-status">
            {detected ? 'Potential abnormality detected' : 'No significant abnormalities detected'}
          </p>
          <div className="assessment-details">
            <div className="detail-item">
              <span className="detail-label">Risk Level:</span>
              <span className="detail-value" style={{ color: getRiskColor(riskLevel) }}>
                {riskLevel.toUpperCase()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value">Analysis Complete</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Scan ID:</span>
              <span className="detail-value">{scanId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Visualization */}
      {results.imageUrl && (
        <div className="image-visualization">
          <div className="visualization-header">
            <h3>CT Scan Image</h3>
            <div className="image-toggle">
              <button
                className={`toggle-button ${showAnnotations ? 'active' : ''}`}
                onClick={() => setShowAnnotations(true)}
                type="button"
              >
                <Eye size={16} />
                With Annotations
              </button>
              <button
                className={`toggle-button ${!showAnnotations ? 'active' : ''}`}
                onClick={() => setShowAnnotations(false)}
                type="button"
              >
                Original
              </button>
            </div>
          </div>
          <div className="scan-image-container">
            <img
              src={showAnnotations && results.annotatedImageUrl ? results.annotatedImageUrl : results.imageUrl}
              alt="CT Scan"
              className="scan-image"
              onError={(e) => {
                console.error('Failed to load image:', e.target.src);
                // Try to fallback to the original image if annotated fails
                if (showAnnotations && results.imageUrl && e.target.src !== results.imageUrl) {
                  console.log('Falling back to original image');
                  e.target.src = results.imageUrl;
                } else {
                  console.error('Both image URLs failed to load');
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Detections List */}
      {detected && detections && detections.length > 0 && (
        <div className="detections-section">
          <h3>Detected Findings ({detections.length})</h3>
          <div className="detections-list">
            {detections.map((detection, index) => (
              <div key={index} className="detection-card">
                <div className="detection-header">
                  <span className="detection-class">{detection.class}</span>
                  <span className="detection-status">
                    Detected
                  </span>
                </div>
                {detection.characteristics && (
                  <div className="detection-characteristics">
                    {detection.characteristics.size_mm && (
                      <div className="characteristic">
                        <span className="char-label">Size:</span>
                        <span className="char-value">{detection.characteristics.size_mm} mm</span>
                      </div>
                    )}
                    {detection.characteristics.shape && (
                      <div className="characteristic">
                        <span className="char-label">Shape:</span>
                        <span className="char-value">{detection.characteristics.shape}</span>
                      </div>
                    )}
                    {detection.characteristics.density && (
                      <div className="characteristic">
                        <span className="char-label">Density:</span>
                        <span className="char-value">{detection.characteristics.density}</span>
                      </div>
                    )}
                  </div>
                )}
                {detection.boundingBox && (
                  <div className="detection-location">
                    <span className="location-label">Location:</span>
                    <span className="location-value">
                      X: {Math.round(detection.boundingBox.x)},
                      Y: {Math.round(detection.boundingBox.y)},
                      W: {Math.round(detection.boundingBox.width)},
                      H: {Math.round(detection.boundingBox.height)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {metadata && (
        <div className="metadata-section">
          <h3>Scan Metadata</h3>
          <div className="metadata-grid">
            {metadata.imageSize && (
              <div className="metadata-item">
                <span className="meta-label">Image Size:</span>
                <span className="meta-value">
                  {metadata.imageSize.width} x {metadata.imageSize.height}
                </span>
              </div>
            )}
            {metadata.fileSize && (
              <div className="metadata-item">
                <span className="meta-label">File Size:</span>
                <span className="meta-value">
                  {(metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
            {metadata.format && (
              <div className="metadata-item">
                <span className="meta-label">Format:</span>
                <span className="meta-value">{metadata.format}</span>
              </div>
            )}
            {uploadTime && (
              <div className="metadata-item">
                <span className="meta-label">Upload Time:</span>
                <span className="meta-value">
                  {new Date(uploadTime).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="results-disclaimer">
        <Info size={18} />
        <p>
          <strong>Important:</strong> These results are generated by an AI model and should not be
          used as the sole basis for medical decisions. Please consult with a qualified healthcare
          professional for proper diagnosis and treatment recommendations.
        </p>
      </div>

      {/* Share with Doctor Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => !shareLoading && setShowShareModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share Results with Doctor</h3>
              <button
                className="modal-close"
                onClick={() => setShowShareModal(false)}
                disabled={shareLoading}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {shareSuccess ? (
                <div className="success-message">
                  <CheckCircle size={48} color="#4caf50" />
                  <h4>Report Shared Successfully!</h4>
                  <p>Your email client has been opened with the report details.</p>
                </div>
              ) : (
                <>
                  <p className="modal-description">
                    Select a doctor to share your scan results with. This will open your email client
                    with a pre-filled message containing your scan details.
                  </p>

                  <div className="form-group">
                    <label htmlFor="doctor-select">Select Doctor:</label>
                    <select
                      id="doctor-select"
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="form-select"
                      disabled={shareLoading}
                    >
                      <option value="">Choose a doctor...</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="share-options">
                    <p className="share-options-label">Alternative sharing options:</p>
                    <button
                      className="share-option-button"
                      onClick={handleCopyLink}
                      type="button"
                      disabled={shareLoading}
                    >
                      <Mail size={16} />
                      Copy Shareable Link
                    </button>
                  </div>

                  <div className="modal-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => setShowShareModal(false)}
                      disabled={shareLoading}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handleShareSubmit}
                      disabled={shareLoading || !selectedDoctor}
                      type="button"
                    >
                      {shareLoading ? 'Sharing...' : 'Share via Email'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanResults;

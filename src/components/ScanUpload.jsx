import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { uploadScanWithProgress } from '../services/yoloApi';
import { getCurrentPatientProfile } from '../utils/unifiedDataManager';
import './ScanUpload.css';

const ScanUpload = ({ onScanComplete, onError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('');
  const [scanResult, setScanResult] = useState(null);

  // Supported file formats
  const SUPPORTED_FORMATS = ['.dcm', '.nii', '.nii.gz', '.jpg', '.jpeg', '.png'];
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const validateFile = (file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 100MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // Check file format
    const fileName = file.name.toLowerCase();
    const isSupported = SUPPORTED_FORMATS.some(format => fileName.endsWith(format));

    if (!isSupported) {
      return {
        valid: false,
        error: `Unsupported file format. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (file) => {
    const validation = validateFile(file);

    if (!validation.valid) {
      setErrorMessage(validation.error);
      setUploadStatus('error');
      return;
    }

    setSelectedFile(file);
    setUploadStatus(null);
    setErrorMessage('');
    setUploadProgress(0);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload');
      setUploadStatus('error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);
    setErrorMessage('');

    try {
      // Get current patient profile
      const patientProfile = getCurrentPatientProfile();
      const patientId = patientProfile?.id || null;

      const result = await uploadScanWithProgress(
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
        },
        patientId
      );

      setScanResult(result);
      setUploadStatus('success');
      setIsUploading(false);

      // Notify parent component
      if (onScanComplete) {
        onScanComplete(result);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setErrorMessage(error.message || 'Failed to upload and analyze scan');
      setUploadStatus('error');
      setIsUploading(false);

      // Notify parent component of error
      if (onError) {
        onError(error);
      }
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus(null);
    setErrorMessage('');
    setScanResult(null);
    setIsUploading(false);
  };

  return (
    <div className="scan-upload-container">
      <div className="upload-header">
        <h2>Upload CT Scan for Analysis</h2>
        <p>Upload your CT scan image for AI-powered lung cancer detection using YOLOv12</p>
      </div>

      {/* Upload Status Messages */}
      {uploadStatus === 'error' && (
        <div className="upload-message error-message">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="upload-message success-message">
          <CheckCircle size={20} />
          <span>Scan uploaded and analyzed successfully!</span>
        </div>
      )}

      {/* Drag and Drop Area */}
      <div
        className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <>
            <Upload size={48} className="upload-icon" />
            <h3>Drag & Drop Your CT Scan Here</h3>
            <p>or</p>
            <label className="browse-button">
              Browse Files
              <input
                type="file"
                accept=".dcm,.nii,.nii.gz,.jpg,.jpeg,.png"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
            </label>
          </>
        ) : (
          <div className="selected-file-info">
            <FileText size={48} className="file-icon" />
            <div className="file-details">
              <h4>{selectedFile.name}</h4>
              <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!isUploading && uploadStatus !== 'success' && (
              <button className="change-file-button" onClick={resetUpload} type="button">
                Change File
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="upload-progress-container">
          <div className="progress-info">
            <Loader size={20} className="spinner" />
            <span>Uploading and analyzing... {uploadProgress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !isUploading && uploadStatus !== 'success' && (
        <button
          className="upload-submit-button"
          onClick={handleUpload}
          type="button"
        >
          Upload & Analyze Scan
        </button>
      )}

      {/* File Requirements */}
      <div className="upload-requirements">
        <h4>File Requirements</h4>
        <ul>
          <li>Supported formats: DICOM (.dcm), NIFTI (.nii, .nii.gz), JPEG, PNG</li>
          <li>Maximum file size: 100MB</li>
          <li>High-quality CT scan images recommended for best results</li>
        </ul>
      </div>

      {/* Quick Results Preview */}
      {uploadStatus === 'success' && scanResult && (
        <div className="quick-results-preview">
          <h3>Analysis Complete</h3>
          <div className="result-summary">
            <div className="result-item">
              <span className="label">Status:</span>
              <span className={`value ${scanResult.results.detected ? 'detected' : 'clear'}`}>
                {scanResult.results.detected ? 'Detection Found' : 'No Detection'}
              </span>
            </div>
            <div className="result-item">
              <span className="label">Risk Level:</span>
              <span className={`value risk-${scanResult.results.riskLevel}`}>
                {scanResult.results.riskLevel.toUpperCase()}
              </span>
            </div>
            <div className="result-item">
              <span className="label">Confidence:</span>
              <span className="value">
                {(scanResult.results.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <button className="view-details-button" onClick={() => onScanComplete(scanResult)} type="button">
            View Detailed Results
          </button>
        </div>
      )}
    </div>
  );
};

export default ScanUpload;

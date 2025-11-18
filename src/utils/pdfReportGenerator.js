/**
 * PDF Report Generator for CT Scan Results
 * Uses jsPDF library to generate professional medical reports
 */

import { jsPDF } from 'jspdf';
import { formatDate, formatTime, getRiskLevelLabel } from './patientDataManager';

export const generatePDFReport = async (scanData, patientInfo) => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // ============ Header ============
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PneumAI', margin, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('CT Scan Analysis Report', margin, 30);

  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPos = 50;

  // ============ Patient Information ============
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const patientFields = [
    ['Patient Name:', patientInfo.name || 'N/A'],
    ['Patient ID:', patientInfo.id || 'N/A'],
    ['Age:', patientInfo.age || 'N/A'],
    ['Scan Date:', formatDate(scanData.uploadTime)],
    ['Scan ID:', scanData.scanId]
  ];

  patientFields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 50, yPos);
    yPos += 7;
  });

  yPos += 5;

  // ============ Scan Results Summary ============
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Analysis Results', margin, yPos);
  yPos += 10;

  // Risk level box
  const riskLevel = scanData.results.riskLevel;
  const riskColor = getRiskColor(riskLevel);

  doc.setFillColor(riskColor.r, riskColor.g, riskColor.b);
  doc.roundedRect(margin, yPos - 5, 170, 20, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Level: ' + getRiskLevelLabel(riskLevel).toUpperCase(), margin + 5, yPos + 5);
  doc.setTextColor(0, 0, 0);
  yPos += 25;

  // Detection status
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detection Status:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  const detectionText = scanData.results.detected
    ? 'Potential abnormality detected'
    : 'No significant abnormalities detected';
  doc.text(detectionText, margin + 50, yPos);
  yPos += 10;

  // Confidence score
  doc.setFont('helvetica', 'bold');
  doc.text('Confidence Score:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${(scanData.results.confidence * 100).toFixed(1)}%`, margin + 50, yPos);
  yPos += 10;

  // Top class
  if (scanData.results.topClass) {
    doc.setFont('helvetica', 'bold');
    doc.text('Classification:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formatClassName(scanData.results.topClass), margin + 50, yPos);
    yPos += 15;
  }

  // ============ Detailed Findings ============
  if (scanData.results.detections && scanData.results.detections.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Findings', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    scanData.results.detections.forEach((detection, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`Finding ${index + 1}:`, margin, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      doc.text(`Class: ${formatClassName(detection.class)}`, margin + 10, yPos);
      yPos += 6;

      doc.text(`Confidence: ${(detection.confidence * 100).toFixed(1)}%`, margin + 10, yPos);
      yPos += 6;

      if (detection.boundingBox) {
        doc.text(
          `Location: X=${Math.round(detection.boundingBox.x)}, Y=${Math.round(detection.boundingBox.y)}`,
          margin + 10,
          yPos
        );
        yPos += 6;
      }

      if (detection.characteristics) {
        if (detection.characteristics.size_mm) {
          doc.text(`Size: ${detection.characteristics.size_mm} mm`, margin + 10, yPos);
          yPos += 6;
        }
        if (detection.characteristics.shape) {
          doc.text(`Shape: ${detection.characteristics.shape}`, margin + 10, yPos);
          yPos += 6;
        }
      }

      yPos += 5;
    });
  }

  // ============ Scan Metadata ============
  yPos += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Scan Metadata', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (scanData.metadata) {
    if (scanData.metadata.imageSize) {
      doc.text(
        `Image Size: ${scanData.metadata.imageSize.width} x ${scanData.metadata.imageSize.height}`,
        margin,
        yPos
      );
      yPos += 7;
    }

    if (scanData.metadata.fileSize) {
      doc.text(
        `File Size: ${(scanData.metadata.fileSize / 1024 / 1024).toFixed(2)} MB`,
        margin,
        yPos
      );
      yPos += 7;
    }

    if (scanData.metadata.format) {
      doc.text(`Format: ${scanData.metadata.format}`, margin, yPos);
      yPos += 7;
    }
  }

  doc.text(`Processing Time: ${scanData.processingTime || 'N/A'}s`, margin, yPos);
  yPos += 7;

  doc.text(`Report Generated: ${formatDate(new Date().toISOString())} ${formatTime(new Date().toISOString())}`, margin, yPos);
  yPos += 15;

  // ============ Medical Disclaimer ============
  // Ensure we have enough space for disclaimer
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = margin;
  }

  doc.setFillColor(255, 243, 205); // Light yellow
  doc.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 50, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT MEDICAL DISCLAIMER', margin + 5, yPos + 5);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const disclaimerText = [
    'These results are generated by an AI-powered analysis system and should not be',
    'used as the sole basis for medical decisions. This report is intended to assist',
    'healthcare professionals and should be reviewed by a qualified radiologist or',
    'physician. Please consult with your healthcare provider for proper diagnosis',
    'and treatment recommendations.'
  ];

  disclaimerText.forEach((line) => {
    doc.text(line, margin + 5, yPos);
    yPos += 5;
  });

  // ============ Footer ============
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    'PneumAI - AI-Powered Lung Cancer Detection System',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // ============ Save PDF ============
  const filename = `PneumAI_Report_${scanData.scanId}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);

  return filename;
};

// Helper function to get risk level color
const getRiskColor = (riskLevel) => {
  const colors = {
    high: { r: 244, g: 67, b: 54 },
    medium: { r: 255, g: 152, b: 0 },
    low: { r: 255, g: 193, b: 7 },
    none: { r: 76, g: 175, b: 80 }
  };
  return colors[riskLevel] || { r: 150, g: 150, b: 150 };
};

// Format class name for display
const formatClassName = (className) => {
  return className
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Generate JSON report (alternative format)
export const generateJSONReport = (scanData, patientInfo) => {
  const report = {
    reportGeneratedAt: new Date().toISOString(),
    patient: patientInfo,
    scan: scanData,
    summary: {
      detected: scanData.results.detected,
      riskLevel: scanData.results.riskLevel,
      confidence: scanData.results.confidence,
      classification: scanData.results.topClass
    }
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PneumAI_Report_${scanData.scanId}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  return report;
};

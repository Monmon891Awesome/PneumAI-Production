# PneumAI - YOLOv12-Powered Lung Cancer Detection Platform

An integrated platform for early lung cancer detection and patient-physician collaborative care, powered by YOLOv12.

## Features

- Patient Registration and Login
- AI-Powered Lung Cancer Detection using YOLOv12
- Patient Dashboard for viewing results and history
- Admin Dashboard for physicians
- Patient-Physician Communication Platform

## Prerequisites

- Node.js 16.x or higher
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd YOLO12ELCDPPCC-1
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API endpoints.

## Development

Run the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Build

Create a production build:
```bash
npm run build
```

## Deployment to Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Option 2: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Vercel will auto-detect it's a Create React App
6. Click "Deploy"

### Environment Variables on Vercel

Add these environment variables in your Vercel project settings:
- `REACT_APP_API_URL` - Your backend API URL
- `REACT_APP_YOLO_API_URL` - Your YOLOv12 model API URL

## Project Structure

```
YOLO12ELCDPPCC-1/
├── public/              # Static files
│   └── index.html       # HTML template
├── src/                 # Source files
│   ├── components/      # React components
│   ├── App.js          # Main app with routing
│   ├── index.js        # Entry point
│   ├── PneumAIUI.jsx # Landing page
│   ├── Login.jsx       # Login page
│   ├── AdminDashboard.jsx
│   ├── PatientDashboard.jsx
│   ├── PatientRegistration.jsx
│   └── PatientPlatform.jsx
├── docs/               # Documentation
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore rules
└── package.json       # Dependencies

```

## Available Routes

- `/` - Landing page
- `/login` - User login
- `/register` - Patient registration
- `/admin` - Admin dashboard
- `/patient` - Patient dashboard
- `/platform` - Patient platform

## Technologies Used

- React 18.2.0
- React Router DOM 6.16.0
- React Scripts 5.0.1
- Lucide React 0.263.1 (Icons)

## YOLOv12 Model Integration

### Overview

The application integrates with a YOLOv12 backend API for lung cancer detection from CT scans. The frontend includes:

- **API Service** ([src/services/yoloApi.js](src/services/yoloApi.js)) - Handles all API communication
- **Upload Component** ([src/components/ScanUpload.jsx](src/components/ScanUpload.jsx)) - File upload with progress tracking
- **Results Component** ([src/components/ScanResults.jsx](src/components/ScanResults.jsx)) - Visualizes scan results and detections

### Setting Up the Backend

#### Option 1: Quick Start (Mock Backend)

Use the provided example backend for development:

```bash
# Navigate to docs folder
cd docs

# Install dependencies
pip install fastapi uvicorn python-multipart opencv-python pillow numpy

# Run the mock server
uvicorn backend_example:app --host 0.0.0.0 --port 8000 --reload
```

#### Option 2: Production Backend with YOLOv12

1. Train or obtain a YOLOv12 model for lung cancer detection
2. Install dependencies:
```bash
pip install fastapi uvicorn ultralytics opencv-python pillow numpy
```

3. Update [backend_example.py](docs/backend_example.py):
```python
from ultralytics import YOLO

# Load your trained model
model = YOLO('path/to/your/yolov12_lung_cancer.pt')
MODEL_LOADED = True
```

4. Implement the API endpoints as specified in [BACKEND_API_REQUIREMENTS.md](docs/BACKEND_API_REQUIREMENTS.md)

### Frontend Configuration

Update your `.env` file:

```env
REACT_APP_YOLO_API_URL=http://localhost:8000
```

For production:
```env
REACT_APP_YOLO_API_URL=https://your-backend-api.com
```

### Using the Scan Upload Feature

1. Import the components in your page:
```javascript
import ScanUpload from './components/ScanUpload';
import ScanResults from './components/ScanResults';
```

2. Add the upload component:
```javascript
const [scanResult, setScanResult] = useState(null);

<ScanUpload
  onScanComplete={(result) => setScanResult(result)}
  onError={(error) => console.error(error)}
/>

{scanResult && <ScanResults scanData={scanResult} />}
```

### Supported File Formats

- DICOM (.dcm)
- NIFTI (.nii, .nii.gz)
- JPEG (.jpg, .jpeg)
- PNG (.png)

Maximum file size: 100MB

### API Endpoints

The backend should implement these endpoints:

- `POST /api/v1/scan/analyze` - Upload and analyze scan
- `GET /api/v1/scan/:scanId` - Get scan results
- `GET /api/v1/patient/:patientId/scans` - Get patient's scans
- `POST /api/v1/scan/batch-analyze` - Batch analysis
- `GET /api/v1/config/thresholds` - Get detection thresholds
- `GET /health` - Health check

Full API specification: [docs/BACKEND_API_REQUIREMENTS.md](docs/BACKEND_API_REQUIREMENTS.md)

### Detection Results Format

The API returns detection results with:
- **Risk Level**: high, medium, low, or none
- **Confidence Score**: 0.0 to 1.0
- **Detections**: Array of found nodules/masses with:
  - Class (nodule, mass, opacity)
  - Bounding box coordinates
  - Characteristics (size, shape, density)

### Deployment Notes

For production deployment:

1. Deploy backend API to cloud platform (AWS, GCP, Azure, etc.)
2. Update CORS settings in backend to include your Vercel domain
3. Set `REACT_APP_YOLO_API_URL` environment variable in Vercel
4. Ensure backend has sufficient GPU resources for YOLO inference
5. Implement proper authentication and data security

## AWS S3 Integration

### Features

The platform includes comprehensive AWS S3 integration for secure image storage:

- **Image Hashing**: SHA-256 hashing for deduplication and integrity verification
- **Thumbnail Generation**: Automatic thumbnail creation for fast previews
- **Presigned URLs**: Secure, time-limited access to stored images
- **Duplicate Detection**: Prevent redundant uploads of the same image

### Setup

1. **Create S3 Bucket**:
```bash
aws s3 mb s3://pneumai-scans --region us-east-1
```

2. **Configure IAM Permissions**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::pneumai-scans/*"
    }
  ]
}
```

3. **Set Environment Variables**:
```env
REACT_APP_S3_BUCKET=pneumai-scans
REACT_APP_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

4. **Install Dependencies**:
```bash
npm install crypto-js
```

### S3 Service API

The [S3 service](src/services/s3Service.js) provides:
- `hashImage(file)` - Generate SHA-256 hash
- `generateThumbnail(file)` - Create image thumbnail
- `uploadImageComplete(file, onProgress)` - Complete upload workflow
- `checkDuplicateImage(hash)` - Check for existing uploads

See [s3_backend_example.py](docs/s3_backend_example.py) for backend implementation.

## Security Features

### Input Sanitization

The platform includes comprehensive security utilities in [src/utils/security.js](src/utils/security.js):

- **XSS Prevention**: HTML tag removal and special character escaping
- **SQL Injection Prevention**: Input sanitization for database queries
- **Caesar Cipher**: Basic data obfuscation (use AES-256 for production)
- **Rate Limiting**: Client-side request throttling
- **File Validation**: Type and size checking for uploads

### Usage Example

```javascript
import { sanitizeInput, sanitizeSQLInput, validateFileUpload } from './utils/security';

// Sanitize user input
const cleanInput = sanitizeInput(userInput);

// Prevent SQL injection
const safeData = sanitizeSQLInput(formData);

// Validate file before upload
const { valid, error } = validateFileUpload(file, ['.jpg', '.png'], 100);
```

### Security Best Practices

1. **Never trust user input** - Always sanitize on both client and server
2. **Use parameterized queries** - Prevent SQL injection
3. **Implement HTTPS** - Encrypt data in transit
4. **Use strong encryption** - AES-256 for sensitive data, not Caesar cipher
5. **Regular security audits** - Keep dependencies updated
6. **Rate limiting** - Prevent abuse and DDoS attacks
7. **HIPAA compliance** - For handling medical data

See [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md) for the full security roadmap.

## Improvements & Roadmap

Check [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md) for:
- Current implementation status
- Planned features and enhancements
- Technical debt and known issues
- Timeline and milestones
- Deployment checklist

## License

Private Project
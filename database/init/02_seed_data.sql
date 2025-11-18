-- ========================================
-- PneumAI Seed Data
-- Demo data for development and testing
-- ========================================

-- Note: In production, passwords should be properly hashed with bcrypt
-- These are plaintext for development only
-- Password hashing will be handled by the backend API

-- ========================================
-- ADMIN USERS
-- ========================================
INSERT INTO users (username, email, password_hash, role, email_verified, is_active)
VALUES
    ('Admin', 'admin@pneumai.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS1MjkTBm', 'admin', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- DOCTOR USERS & PROFILES
-- ========================================

-- Dr. Sarah Miller - Pulmonology
INSERT INTO users (username, email, password_hash, role, email_verified, is_active)
VALUES
    ('Dr. Sarah Miller', 'sarah.miller@pneumai.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS1MjkTBm', 'doctor', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO doctors (
    user_id, first_name, last_name, specialty, license_number,
    phone, office_address, hospital_affiliation,
    years_of_experience, bio, availability,
    profile_image_url, is_accepting_patients, is_verified
)
SELECT
    u.id, 'Sarah', 'Miller', 'Pulmonology', 'MD-PUL-12345',
    '(555) 234-5678', '123 Medical Plaza, Suite 200, Boston, MA 02108', 'Mass General Hospital',
    15, 'Specialized in respiratory conditions and CT scan interpretation. Board-certified pulmonologist with extensive experience in lung cancer screening.',
    'Available weekdays 9AM-5PM',
    '/assets/ai-doc1.jpg', TRUE, TRUE
FROM users u
WHERE u.email = 'sarah.miller@pneumai.com'
ON CONFLICT (user_id) DO NOTHING;

-- Dr. James Rodriguez - Oncology
INSERT INTO users (username, email, password_hash, role, email_verified, is_active)
VALUES
    ('Dr. James Rodriguez', 'james.rodriguez@pneumai.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS1MjkTBm', 'doctor', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO doctors (
    user_id, first_name, last_name, specialty, license_number,
    phone, office_address, hospital_affiliation,
    years_of_experience, bio, availability,
    profile_image_url, is_accepting_patients, is_verified
)
SELECT
    u.id, 'James', 'Rodriguez', 'Oncology', 'MD-ONC-67890',
    '(555) 234-5679', '456 Cancer Center Dr, Suite 301, Boston, MA 02109', 'Dana-Farber Cancer Institute',
    12, 'Expert in lung cancer diagnosis and treatment planning. Specializes in early detection and minimally invasive treatment options.',
    'Available Mon-Fri 10AM-6PM',
    '/assets/ai-doc2.jpg', TRUE, TRUE
FROM users u
WHERE u.email = 'james.rodriguez@pneumai.com'
ON CONFLICT (user_id) DO NOTHING;

-- Dr. Emily Chen - Radiology
INSERT INTO users (username, email, password_hash, role, email_verified, is_active)
VALUES
    ('Dr. Emily Chen', 'emily.chen@pneumai.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS1MjkTBm', 'doctor', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO doctors (
    user_id, first_name, last_name, specialty, license_number,
    phone, office_address, hospital_affiliation,
    years_of_experience, bio, availability,
    profile_image_url, is_accepting_patients, is_verified
)
SELECT
    u.id, 'Emily', 'Chen', 'Radiology', 'MD-RAD-11223',
    '(555) 234-5680', '789 Imaging Center, Suite 150, Boston, MA 02110', 'Brigham and Women''s Hospital',
    10, 'Radiologist specializing in thoracic imaging and AI-assisted diagnostics. Pioneer in machine learning applications for medical imaging.',
    'Available Tue-Sat 8AM-4PM',
    '/assets/ai-doc3.png', TRUE, TRUE
FROM users u
WHERE u.email = 'emily.chen@pneumai.com'
ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- PATIENT USERS & PROFILES
-- ========================================

-- Robert Johnson - Demo Patient 1
INSERT INTO users (username, email, password_hash, role, email_verified, is_active)
VALUES
    ('Robert Johnson', 'robert.johnson@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS1MjkTBm', 'patient', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO patients (
    user_id, first_name, last_name, date_of_birth, gender,
    phone, address, city, state, zip_code,
    emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
    medical_history, smoking_status, smoking_years, family_history_lung_cancer,
    clinical_notes, status
)
SELECT
    u.id, 'Robert', 'Johnson', '1971-03-15', 'male',
    '(555) 123-4567', '123 Main St', 'Boston', 'MA', '02108',
    'Mary Johnson', 'Spouse', '(555) 123-4568',
    'Former smoker (2 packs/day for 20 years, quit 5 years ago). Hypertension (controlled with medication). No previous lung issues.',
    'former', 20, TRUE,
    'Patient presents with persistent cough for 3 months. Family history of lung cancer (father diagnosed at age 65). Recommended for CT screening.',
    'Active'
FROM users u
WHERE u.email = 'robert.johnson@email.com'
ON CONFLICT (user_id) DO NOTHING;

-- Maria Garcia - Demo Patient 2
INSERT INTO users (username, email, password_hash, role, email_verified, is_active)
VALUES
    ('Maria Garcia', 'maria.garcia@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS1MjkTBm', 'patient', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO patients (
    user_id, first_name, last_name, date_of_birth, gender,
    phone, address, city, state, zip_code,
    emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
    medical_history, smoking_status, smoking_years, family_history_lung_cancer,
    clinical_notes, status
)
SELECT
    u.id, 'Maria', 'Garcia', '1965-08-22', 'female',
    '(555) 234-8901', '456 Oak Avenue', 'Cambridge', 'MA', '02139',
    'Carlos Garcia', 'Brother', '(555) 234-8902',
    'Never smoker. Asthma (well-controlled). No significant medical history.',
    'never', 0, FALSE,
    'Routine screening. Patient is asymptomatic but concerned due to occupational exposure (worked in manufacturing for 30 years).',
    'Active'
FROM users u
WHERE u.email = 'maria.garcia@email.com'
ON CONFLICT (user_id) DO NOTHING;

-- David Thompson - Demo Patient 3
INSERT INTO users (username, email, password_hash, role, email_verified, is_active)
VALUES
    ('David Thompson', 'david.thompson@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS1MjkTBm', 'patient', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO patients (
    user_id, first_name, last_name, date_of_birth, gender,
    phone, address, city, state, zip_code,
    emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
    medical_history, smoking_status, smoking_years, family_history_lung_cancer,
    clinical_notes, status
)
SELECT
    u.id, 'David', 'Thompson', '1958-11-30', 'male',
    '(555) 345-6789', '789 Elm Street', 'Somerville', 'MA', '02143',
    'Jennifer Thompson', 'Daughter', '(555) 345-6790',
    'Current smoker (attempting to quit). COPD diagnosis 2 years ago. High blood pressure.',
    'current', 35, FALSE,
    'Follow-up scan scheduled. Previous scan showed suspicious nodule (8mm) in right upper lobe. Requires monitoring.',
    'Follow-up Required'
FROM users u
WHERE u.email = 'david.thompson@email.com'
ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- DEMO APPOINTMENTS
-- ========================================

-- Upcoming appointment for Robert Johnson
INSERT INTO appointments (
    appointment_id, patient_id, doctor_id,
    appointment_date, appointment_time, duration_minutes,
    appointment_type, reason, location,
    status
)
SELECT
    'APPT-2025-0001',
    p.id,
    d.id,
    CURRENT_DATE + INTERVAL '3 days',
    '10:00:00',
    30,
    'scan_review',
    'Review recent CT scan results and discuss findings',
    '123 Medical Plaza, Suite 200',
    'scheduled'
FROM patients p
JOIN doctors d ON d.specialty = 'Pulmonology'
WHERE p.first_name = 'Robert' AND p.last_name = 'Johnson'
  AND d.first_name = 'Sarah'
LIMIT 1
ON CONFLICT (appointment_id) DO NOTHING;

-- Past appointment for Maria Garcia
INSERT INTO appointments (
    appointment_id, patient_id, doctor_id,
    appointment_date, appointment_time, duration_minutes,
    appointment_type, reason, location,
    status
)
SELECT
    'APPT-2025-0002',
    p.id,
    d.id,
    CURRENT_DATE - INTERVAL '7 days',
    '14:30:00',
    30,
    'consultation',
    'Initial consultation for CT screening',
    '789 Imaging Center, Suite 150',
    'completed'
FROM patients p
JOIN doctors d ON d.specialty = 'Radiology'
WHERE p.first_name = 'Maria' AND p.last_name = 'Garcia'
  AND d.first_name = 'Emily'
LIMIT 1
ON CONFLICT (appointment_id) DO NOTHING;

-- Upcoming appointment for David Thompson (Follow-up)
INSERT INTO appointments (
    appointment_id, patient_id, doctor_id,
    appointment_date, appointment_time, duration_minutes,
    appointment_type, reason, location,
    status
)
SELECT
    'APPT-2025-0003',
    p.id,
    d.id,
    CURRENT_DATE + INTERVAL '1 day',
    '11:00:00',
    45,
    'follow_up',
    'Follow-up on nodule detected in previous scan',
    '456 Cancer Center Dr, Suite 301',
    'confirmed'
FROM patients p
JOIN doctors d ON d.specialty = 'Oncology'
WHERE p.first_name = 'David' AND p.last_name = 'Thompson'
  AND d.first_name = 'James'
LIMIT 1
ON CONFLICT (appointment_id) DO NOTHING;

-- ========================================
-- SYSTEM SETTINGS
-- ========================================

INSERT INTO system_settings (setting_key, setting_value, description, is_public)
VALUES
    ('app_version', '"2.0.0"', 'Current application version', TRUE),
    ('maintenance_mode', 'false', 'Enable/disable maintenance mode', FALSE),
    ('max_upload_size_mb', '100', 'Maximum CT scan upload size in MB', TRUE),
    ('ai_model_version', '"YOLOv12"', 'Current AI model version', TRUE),
    ('email_notifications_enabled', 'true', 'Enable/disable email notifications', FALSE),
    ('demo_mode', 'true', 'Enable demo mode with sample data', TRUE)
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    updated_at = CURRENT_TIMESTAMP;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================
DO $$
DECLARE
    user_count INTEGER;
    doctor_count INTEGER;
    patient_count INTEGER;
    appointment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO doctor_count FROM doctors;
    SELECT COUNT(*) INTO patient_count FROM patients;
    SELECT COUNT(*) INTO appointment_count FROM appointments;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'PneumAI Seed Data Loaded Successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Users created: %', user_count;
    RAISE NOTICE 'Doctors created: %', doctor_count;
    RAISE NOTICE 'Patients created: %', patient_count;
    RAISE NOTICE 'Appointments created: %', appointment_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Demo Credentials:';
    RAISE NOTICE 'Admin: admin@pneumai.com / admin123';
    RAISE NOTICE 'Doctor: sarah.miller@pneumai.com / doctor123';
    RAISE NOTICE 'Patient: robert.johnson@email.com / patient123';
    RAISE NOTICE '========================================';
END $$;

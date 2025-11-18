"""
Doctors Router for PneumAI
Doctor management and registration
"""

from fastapi import APIRouter, HTTPException
from typing import List
import logging

from app.models.schemas import DoctorCreate, DoctorResponse
from app.database import get_all_doctors, get_doctor, create_doctor
from app.utils.helpers import generate_doctor_id
from app.utils.security import (
    validate_email,
    validate_password_strength,
    hash_password,
    sanitize_input
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=List[DoctorResponse])
@router.get("/", response_model=List[DoctorResponse])
async def list_doctors():
    """
    Get all doctors

    Returns list of all doctors (passwords excluded)
    """
    try:
        doctors = get_all_doctors()
        return doctors
    except Exception as e:
        logger.error(f"Error fetching doctors: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch doctors")


@router.get("/{doctor_id}", response_model=DoctorResponse)
async def get_doctor_by_id(doctor_id: str):
    """
    Get doctor by ID

    Returns doctor information (password excluded)
    """
    try:
        doctor = get_doctor(doctor_id)

        if not doctor:
            raise HTTPException(status_code=404, detail=f"Doctor not found: {doctor_id}")

        return doctor
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching doctor {doctor_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch doctor")


@router.post("/register", response_model=DoctorResponse, status_code=201)
async def register_doctor(doctor: DoctorCreate):
    """
    Register a new doctor

    Validates email, password strength, and creates secure password hash
    """
    try:
        # Validate email
        if not validate_email(doctor.email):
            raise HTTPException(status_code=400, detail="Invalid email format")

        # Validate password strength
        is_valid, error_message = validate_password_strength(doctor.password)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)

        # Sanitize inputs
        name = sanitize_input(doctor.name, max_length=255)
        specialization = sanitize_input(doctor.specialization, max_length=100) if doctor.specialization else None
        license_number = sanitize_input(doctor.license_number, max_length=100) if doctor.license_number else None

        # Generate doctor ID
        doctor_id = generate_doctor_id(doctor.email)

        # Hash password
        password_hash = hash_password(doctor.password)

        # Prepare doctor data
        doctor_data = {
            'id': doctor_id,
            'name': name,
            'email': doctor.email.lower(),
            'phone': doctor.phone,
            'specialization': specialization,
            'licenseNumber': license_number,
            'passwordHash': password_hash
        }

        # Create doctor
        created_doctor = create_doctor(doctor_data)

        logger.info(f"✅ Doctor registered: {doctor_id} - {name}")

        return created_doctor

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering doctor: {e}")
        # Check for duplicate email
        if "unique constraint" in str(e).lower() or "duplicate key" in str(e).lower():
            raise HTTPException(status_code=409, detail="Email already exists")
        raise HTTPException(status_code=500, detail="Failed to register doctor")

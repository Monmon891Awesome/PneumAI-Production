"""
Appointments Router for PneumAI
Appointment scheduling and management
"""

from fastapi import APIRouter, HTTPException
from typing import List
import logging

from app.models.schemas import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    MessageOnlyResponse
)
from app.database import (
    create_appointment,
    get_patient_appointments,
    get_doctor_appointments,
    get_appointment,
    update_appointment,
    delete_appointment
)
from app.utils.helpers import generate_appointment_id
from app.utils.security import sanitize_input

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/patient/{patient_id}", response_model=List[AppointmentResponse])
async def get_appointments_for_patient(patient_id: str):
    """
    Get all appointments for a patient

    Returns list of appointments sorted by date (newest first)
    """
    try:
        appointments = get_patient_appointments(patient_id)
        return appointments
    except Exception as e:
        logger.error(f"Error fetching appointments for patient {patient_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch appointments")


@router.get("/doctor/{doctor_id}", response_model=List[AppointmentResponse])
async def get_appointments_for_doctor(doctor_id: str):
    """
    Get all appointments for a doctor

    Returns list of appointments sorted by date (newest first)
    """
    try:
        appointments = get_doctor_appointments(doctor_id)
        return appointments
    except Exception as e:
        logger.error(f"Error fetching appointments for doctor {doctor_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch appointments")


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment_by_id(appointment_id: str):
    """
    Get appointment by ID

    Returns detailed appointment information
    """
    try:
        appointment = get_appointment(appointment_id)

        if not appointment:
            raise HTTPException(status_code=404, detail=f"Appointment not found: {appointment_id}")

        return appointment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching appointment {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch appointment")


@router.post("", response_model=AppointmentResponse, status_code=201)
@router.post("/", response_model=AppointmentResponse, status_code=201)
async def create_new_appointment(appointment: AppointmentCreate):
    """
    Create a new appointment

    Generates unique appointment ID and schedules appointment
    """
    try:
        # Generate appointment ID
        appointment_id = generate_appointment_id()

        # Sanitize notes
        notes = sanitize_input(appointment.notes, max_length=5000) if appointment.notes else None

        # Prepare appointment data
        appointment_data = {
            'id': appointment_id,
            'patientId': appointment.patientId,
            'doctorId': appointment.doctorId,
            'doctorName': appointment.doctorName,
            'date': appointment.date.isoformat(),
            'time': appointment.time.isoformat(),
            'type': appointment.type,
            'status': 'scheduled',  # Default status
            'notes': notes
        }

        # Create appointment
        created_appointment = create_appointment(appointment_data)

        logger.info(f"✅ Appointment created: {appointment_id} - {appointment.date} at {appointment.time}")

        return created_appointment

    except Exception as e:
        logger.error(f"Error creating appointment: {e}")
        raise HTTPException(status_code=500, detail="Failed to create appointment")


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment_info(appointment_id: str, updates: AppointmentUpdate):
    """
    Update an appointment

    Can update status, notes, date, or time
    """
    try:
        # Check if appointment exists
        existing_appointment = get_appointment(appointment_id)
        if not existing_appointment:
            raise HTTPException(status_code=404, detail=f"Appointment not found: {appointment_id}")

        # Prepare update data
        update_data = {}
        if updates.status:
            update_data['status'] = updates.status.value
        if updates.notes is not None:
            update_data['notes'] = sanitize_input(updates.notes, max_length=5000)
        if updates.date:
            update_data['appointment_date'] = updates.date.isoformat()
        if updates.time:
            update_data['appointment_time'] = updates.time.isoformat()

        # Update appointment
        updated_appointment = update_appointment(appointment_id, update_data)

        logger.info(f"✅ Appointment updated: {appointment_id}")

        return updated_appointment

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating appointment {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update appointment")


@router.delete("/{appointment_id}", response_model=MessageOnlyResponse)
async def cancel_appointment(appointment_id: str):
    """
    Delete/cancel an appointment

    Removes appointment from the system
    """
    try:
        # Check if appointment exists
        existing_appointment = get_appointment(appointment_id)
        if not existing_appointment:
            raise HTTPException(status_code=404, detail=f"Appointment not found: {appointment_id}")

        # Delete appointment
        delete_appointment(appointment_id)

        logger.info(f"✅ Appointment cancelled: {appointment_id}")

        return MessageOnlyResponse(message=f"Appointment {appointment_id} cancelled successfully")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling appointment {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel appointment")

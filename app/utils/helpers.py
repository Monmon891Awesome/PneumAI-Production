"""
Helper utilities for PneumAI
ID generation, date formatting, and common utilities
"""

from datetime import datetime, date, time
from typing import Union, Optional
import uuid
import hashlib
import logging

logger = logging.getLogger(__name__)


# ============================================================
# ID GENERATION
# ============================================================

def generate_scan_id() -> str:
    """
    Generate unique scan ID with timestamp

    Format: scan_YYYYMMDD_HHMMSS

    Returns:
        Unique scan ID string
    """
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    return f"scan_{timestamp}"


def generate_patient_id(name: str) -> str:
    """
    Generate patient ID based on name and timestamp

    Format: pat_HASH_TIMESTAMP

    Args:
        name: Patient name

    Returns:
        Unique patient ID
    """
    # Create short hash from name
    name_hash = hashlib.md5(name.encode()).hexdigest()[:8]
    timestamp = datetime.utcnow().strftime('%Y%m%d')
    return f"pat_{name_hash}_{timestamp}"


def generate_doctor_id(email: str) -> str:
    """
    Generate doctor ID based on email

    Format: doc_HASH

    Args:
        email: Doctor email

    Returns:
        Unique doctor ID
    """
    email_hash = hashlib.md5(email.encode()).hexdigest()[:12]
    return f"doc_{email_hash}"


def generate_appointment_id() -> str:
    """
    Generate appointment ID with UUID

    Format: apt_UUID

    Returns:
        Unique appointment ID
    """
    return f"apt_{uuid.uuid4().hex[:16]}"


def generate_message_id() -> str:
    """
    Generate message ID with UUID

    Format: msg_UUID

    Returns:
        Unique message ID
    """
    return f"msg_{uuid.uuid4().hex[:16]}"


def generate_session_token() -> str:
    """
    Generate secure session token

    Returns:
        Secure random session token
    """
    return uuid.uuid4().hex


# ============================================================
# DATE/TIME FORMATTING
# ============================================================

def format_datetime(dt: Union[datetime, str], format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Format datetime to string

    Args:
        dt: Datetime object or ISO string
        format_str: Output format string

    Returns:
        Formatted datetime string
    """
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt)
        except ValueError:
            return dt

    if isinstance(dt, datetime):
        return dt.strftime(format_str)

    return str(dt)


def format_date(d: Union[date, str], format_str: str = "%Y-%m-%d") -> str:
    """
    Format date to string

    Args:
        d: Date object or ISO string
        format_str: Output format string

    Returns:
        Formatted date string
    """
    if isinstance(d, str):
        try:
            d = date.fromisoformat(d)
        except ValueError:
            return d

    if isinstance(d, date):
        return d.strftime(format_str)

    return str(d)


def format_time(t: Union[time, str], format_str: str = "%H:%M:%S") -> str:
    """
    Format time to string

    Args:
        t: Time object or ISO string
        format_str: Output format string

    Returns:
        Formatted time string
    """
    if isinstance(t, str):
        try:
            t = time.fromisoformat(t)
        except ValueError:
            return t

    if isinstance(t, time):
        return t.strftime(format_str)

    return str(t)


def parse_datetime(dt_string: str) -> Optional[datetime]:
    """
    Parse datetime string to datetime object

    Args:
        dt_string: Datetime string (ISO format)

    Returns:
        Datetime object or None if parsing fails
    """
    try:
        return datetime.fromisoformat(dt_string)
    except (ValueError, AttributeError) as e:
        logger.warning(f"Failed to parse datetime: {dt_string} - {e}")
        return None


def parse_date(date_string: str) -> Optional[date]:
    """
    Parse date string to date object

    Args:
        date_string: Date string (ISO format YYYY-MM-DD)

    Returns:
        Date object or None if parsing fails
    """
    try:
        return date.fromisoformat(date_string)
    except (ValueError, AttributeError) as e:
        logger.warning(f"Failed to parse date: {date_string} - {e}")
        return None


def parse_time(time_string: str) -> Optional[time]:
    """
    Parse time string to time object

    Args:
        time_string: Time string (ISO format HH:MM:SS)

    Returns:
        Time object or None if parsing fails
    """
    try:
        return time.fromisoformat(time_string)
    except (ValueError, AttributeError) as e:
        logger.warning(f"Failed to parse time: {time_string} - {e}")
        return None


def get_current_timestamp() -> str:
    """
    Get current timestamp in ISO format

    Returns:
        Current timestamp string
    """
    return datetime.utcnow().isoformat()


def get_current_date() -> str:
    """
    Get current date in ISO format

    Returns:
        Current date string (YYYY-MM-DD)
    """
    return date.today().isoformat()


# ============================================================
# FILE SIZE FORMATTING
# ============================================================

def format_file_size(size_bytes: int) -> str:
    """
    Format file size in bytes to human-readable format

    Args:
        size_bytes: File size in bytes

    Returns:
        Formatted size string (e.g., "1.5 MB")
    """
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 ** 2:
        return f"{size_bytes / 1024:.2f} KB"
    elif size_bytes < 1024 ** 3:
        return f"{size_bytes / (1024 ** 2):.2f} MB"
    else:
        return f"{size_bytes / (1024 ** 3):.2f} GB"


# ============================================================
# DATA TRANSFORMATION
# ============================================================

def serialize_datetime_fields(data: dict) -> dict:
    """
    Convert datetime objects to ISO strings in a dictionary

    Args:
        data: Dictionary potentially containing datetime objects

    Returns:
        Dictionary with datetime objects converted to strings
    """
    result = {}
    for key, value in data.items():
        if isinstance(value, (datetime, date, time)):
            result[key] = value.isoformat()
        elif isinstance(value, dict):
            result[key] = serialize_datetime_fields(value)
        elif isinstance(value, list):
            result[key] = [
                serialize_datetime_fields(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            result[key] = value
    return result


def safe_get(data: dict, key: str, default=None):
    """
    Safely get value from dictionary with default

    Args:
        data: Dictionary to get value from
        key: Key to retrieve
        default: Default value if key doesn't exist

    Returns:
        Value from dictionary or default
    """
    return data.get(key, default)


def safe_int(value, default: int = 0) -> int:
    """
    Safely convert value to integer

    Args:
        value: Value to convert
        default: Default value if conversion fails

    Returns:
        Integer value or default
    """
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def safe_float(value, default: float = 0.0) -> float:
    """
    Safely convert value to float

    Args:
        value: Value to convert
        default: Default value if conversion fails

    Returns:
        Float value or default
    """
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


# ============================================================
# RISK LEVEL HELPERS
# ============================================================

def calculate_risk_level(confidence: float, detected: bool) -> str:
    """
    Calculate risk level based on detection confidence

    Args:
        confidence: Detection confidence (0.0 - 1.0)
        detected: Whether abnormality was detected

    Returns:
        Risk level: "none", "low", "medium", or "high"
    """
    if not detected:
        return "none"
    elif confidence >= 0.75:
        return "high"
    elif confidence >= 0.50:
        return "medium"
    else:
        return "low"


def get_risk_color(risk_level: str) -> str:
    """
    Get color code for risk level

    Args:
        risk_level: Risk level string

    Returns:
        Color code (hex)
    """
    colors = {
        "none": "#10B981",    # Green
        "low": "#FBBF24",     # Yellow
        "medium": "#F97316",  # Orange
        "high": "#EF4444"     # Red
    }
    return colors.get(risk_level.lower(), "#6B7280")  # Gray default


# ============================================================
# HASH HELPERS
# ============================================================

def hash_file_content(content: bytes) -> str:
    """
    Generate SHA-256 hash of file content

    Args:
        content: File content as bytes

    Returns:
        Hex digest of SHA-256 hash
    """
    return hashlib.sha256(content).hexdigest()


def generate_short_hash(text: str, length: int = 8) -> str:
    """
    Generate short hash from text

    Args:
        text: Text to hash
        length: Length of hash (default 8)

    Returns:
        Short hash string
    """
    return hashlib.md5(text.encode()).hexdigest()[:length]

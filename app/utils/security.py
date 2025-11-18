"""
Security utilities for PneumAI
Password hashing, validation, and input sanitization
"""

import bcrypt
import re
from typing import Optional
import logging

logger = logging.getLogger(__name__)


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt

    Args:
        password: Plain text password

    Returns:
        Hashed password string

    Note:
        bcrypt has a 72-byte limit, so passwords are truncated if necessary
    """
    # bcrypt has a 72-byte limit, truncate if necessary
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]

    # Generate salt and hash password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)

    # Return as string
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password from database

    Returns:
        True if password matches, False otherwise
    """
    try:
        # Convert password to bytes
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]

        # Convert hash to bytes
        hashed_bytes = hashed_password.encode('utf-8')

        # Verify password
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


# ============================================================
# INPUT VALIDATION
# ============================================================

def validate_email(email: str) -> bool:
    """
    Validate email format

    Args:
        email: Email address to validate

    Returns:
        True if valid email format, False otherwise
    """
    if not email:
        return False

    # Basic email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    """
    Validate password strength

    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit

    Args:
        password: Password to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not password or len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"

    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"

    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"

    return True, None


def validate_phone(phone: str) -> bool:
    """
    Validate phone number format

    Accepts formats:
    - +1-555-123-4567
    - (555) 123-4567
    - 555-123-4567
    - 5551234567

    Args:
        phone: Phone number to validate

    Returns:
        True if valid format, False otherwise
    """
    if not phone:
        return True  # Phone is optional

    # Remove spaces, dashes, parentheses
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)

    # Check if it's a valid phone number (10-15 digits, optionally starting with +)
    pattern = r'^\+?\d{10,15}$'
    return re.match(pattern, cleaned) is not None


# ============================================================
# INPUT SANITIZATION
# ============================================================

def sanitize_input(text: str, max_length: int = 1000) -> str:
    """
    Sanitize user input to prevent injection attacks

    Args:
        text: Input text to sanitize
        max_length: Maximum allowed length

    Returns:
        Sanitized text
    """
    if not text:
        return ""

    # Remove null bytes
    text = text.replace('\0', '')

    # Limit length
    text = text[:max_length]

    # Remove control characters except newlines and tabs
    text = ''.join(char for char in text if char.isprintable() or char in ['\n', '\t'])

    return text.strip()


def sanitize_sql_input(text: str) -> str:
    """
    Additional sanitization for SQL inputs (used with parameterized queries)

    Note: This is a defense-in-depth measure. Always use parameterized queries.

    Args:
        text: Input text to sanitize

    Returns:
        Sanitized text
    """
    if not text:
        return ""

    # Remove dangerous SQL characters (when not using parameterized queries)
    # Since we use parameterized queries, this is just extra safety
    dangerous_chars = ["'", '"', ';', '--', '/*', '*/']
    sanitized = text

    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '')

    return sanitized_input(sanitized)


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal attacks

    Args:
        filename: Original filename

    Returns:
        Sanitized filename safe for filesystem
    """
    if not filename:
        return "unnamed_file"

    # Remove path components
    filename = filename.split('/')[-1]
    filename = filename.split('\\')[-1]

    # Remove dangerous characters
    filename = re.sub(r'[^\w\s\-\.]', '', filename)

    # Remove leading/trailing dots and spaces
    filename = filename.strip('. ')

    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:250] + ('.' + ext if ext else '')

    return filename or "unnamed_file"


# ============================================================
# VALIDATION HELPERS
# ============================================================

def validate_scan_id(scan_id: str) -> bool:
    """
    Validate scan ID format (scan_YYYYMMDD_HHMMSS)

    Args:
        scan_id: Scan ID to validate

    Returns:
        True if valid format, False otherwise
    """
    if not scan_id:
        return False

    pattern = r'^scan_\d{8}_\d{6}$'
    return re.match(pattern, scan_id) is not None


def validate_user_id(user_id: str) -> bool:
    """
    Validate user ID format (alphanumeric with underscores, 3-50 chars)

    Args:
        user_id: User ID to validate

    Returns:
        True if valid format, False otherwise
    """
    if not user_id:
        return False

    pattern = r'^[a-zA-Z0-9_]{3,50}$'
    return re.match(pattern, user_id) is not None


def validate_uuid(uuid_string: str) -> bool:
    """
    Validate UUID format

    Args:
        uuid_string: UUID string to validate

    Returns:
        True if valid UUID, False otherwise
    """
    if not uuid_string:
        return False

    pattern = r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
    return re.match(pattern, uuid_string.lower()) is not None


# ============================================================
# ROLE VALIDATION
# ============================================================

ALLOWED_ROLES = ['patient', 'doctor', 'admin']


def validate_role(role: str) -> bool:
    """
    Validate user role

    Args:
        role: User role to validate

    Returns:
        True if valid role, False otherwise
    """
    return role and role.lower() in ALLOWED_ROLES


def normalize_role(role: str) -> str:
    """
    Normalize role to lowercase

    Args:
        role: User role

    Returns:
        Normalized role or raises ValueError
    """
    normalized = role.lower().strip()
    if not validate_role(normalized):
        raise ValueError(f"Invalid role: {role}. Must be one of {ALLOWED_ROLES}")
    return normalized

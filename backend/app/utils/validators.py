import re


def validate_email(email):
    """Returns True if email format is valid."""
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password):
    """
    Password must be at least 6 characters.
    Returns (is_valid, error_message)
    """
    if not password or len(password) < 6:
        return False, 'Password must be at least 6 characters'
    return True, None


def validate_required_fields(data, fields):
    """
    Check that all required fields are present and not empty in a dict.
    Returns (is_valid, missing_fields_list)
    """
    missing = []
    for field in fields:
        value = data.get(field)
        if value is None or (isinstance(value, str) and not value.strip()):
            missing.append(field)
    return len(missing) == 0, missing


def validate_date_range(check_in, check_out):
    """
    Validate check_in is before check_out.
    Both should be date objects.
    Returns (is_valid, error_message)
    """
    if check_in >= check_out:
        return False, 'Check-out date must be after check-in date'
    return True, None


VALID_ROLES = ['guest', 'admin', 'manager', 'receptionist', 'housekeeping', 'finance']
VALID_HOTEL_TYPES = ['Luxury', 'Resort', 'Boutique', 'Villa', 'Budget', 'Business']
VALID_ROOM_STATUSES = ['available', 'occupied', 'maintenance', 'reserved']
VALID_BOOKING_STATUSES = ['confirmed', 'cancelled', 'completed', 'checked_in', 'checked_out']


def validate_role(role):
    return role in VALID_ROLES


def validate_room_status(status):
    return status in VALID_ROOM_STATUSES
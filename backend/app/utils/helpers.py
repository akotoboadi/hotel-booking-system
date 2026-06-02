import random
import string
from datetime import datetime


def generate_booking_ref():
    """
    Generate a unique booking reference like AK-1721234567-AB3
    """
    timestamp = str(int(datetime.utcnow().timestamp()))
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=3))
    return f'AK-{timestamp}-{suffix}'


def calculate_nights(check_in, check_out):
    """Calculate number of nights between two date objects."""
    delta = check_out - check_in
    return max(0, delta.days)


def calculate_taxes(amount, rate=0.10):
    """Calculate taxes at a given rate (default 10%)."""
    return round(amount * rate, 2)


def paginate_query(query, page, per_page=10):
    """
    Apply pagination to a SQLAlchemy query.
    Returns dict with items and pagination metadata.
    """
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        'items':       [item.to_dict() for item in paginated.items],
        'total':       paginated.total,
        'pages':       paginated.pages,
        'page':        paginated.page,
        'per_page':    paginated.per_page,
        'has_next':    paginated.has_next,
        'has_prev':    paginated.has_prev,
    }


def success_response(data=None, message='Success', status=200):
    """Standard success response format."""
    response = {'success': True, 'message': message}
    if data is not None:
        response['data'] = data
    return response, status


def error_response(message='An error occurred', status=400, details=None):
    """Standard error response format."""
    response = {'success': False, 'error': message}
    if details:
        response['details'] = details
    return response, status
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User


def get_current_user():
    """Get the currently logged in user from JWT token."""
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


def roles_required(*roles):
    """
    Decorator that checks the user has one of the allowed roles.
    Usage:
        @roles_required('admin')
        @roles_required('admin', 'manager')
        @roles_required('manager', 'receptionist')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Verify JWT exists and is valid
            verify_jwt_in_request()
            user = get_current_user()

            if not user:
                return jsonify({'error': 'User not found'}), 404

            if not user.is_active:
                return jsonify({'error': 'Account is deactivated'}), 403

            if user.role not in roles:
                return jsonify({
                    'error': 'Access denied',
                    'required_roles': list(roles),
                    'your_role': user.role
                }), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator


def hotel_staff_required(*roles):
    """
    Like roles_required but also checks the user belongs
    to the hotel being accessed (via hotel_id in route).
    Usage: for routes like /api/hotels/<hotel_id>/rooms
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user = get_current_user()

            if not user:
                return jsonify({'error': 'User not found'}), 404

            if not user.is_active:
                return jsonify({'error': 'Account is deactivated'}), 403

            if user.role not in roles:
                return jsonify({'error': 'Access denied'}), 403

            # Admin can access any hotel
            if user.role == 'admin':
                return fn(*args, **kwargs)

            # Hotel staff must belong to the hotel in the route
            hotel_id = kwargs.get('hotel_id')
            if hotel_id and user.hotel_id != int(hotel_id):
                return jsonify({'error': 'You do not have access to this hotel'}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator


def jwt_optional_user():
    """
    For public routes where login is optional.
    Returns user if logged in, None if not.
    """
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            return User.query.get(int(user_id))
    except Exception:
        pass
    return None
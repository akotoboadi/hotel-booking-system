from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.user import User
from app.models.hotel import Hotel
from app.middleware.auth_middleware import roles_required, get_current_user
from app.utils.helpers import success_response, error_response
from app.utils.validators import (
    validate_required_fields, validate_email,
    validate_password, validate_role, VALID_ROLES
)

staff_bp = Blueprint('staff', __name__)

# Staff roles that can be assigned to a hotel
HOTEL_STAFF_ROLES = ['manager', 'receptionist', 'housekeeping', 'finance']


# ── Get all staff for a hotel ────────────────────────────────────
@staff_bp.route('/hotel/<int:hotel_id>', methods=['GET'])
@roles_required('admin', 'manager')
def get_hotel_staff(hotel_id):
    hotel = Hotel.query.get_or_404(hotel_id)
    user  = get_current_user()

    if user.role == 'manager' and user.hotel_id != hotel_id:
        return error_response('Access denied', 403)

    role_filter = request.args.get('role', '')
    query = User.query.filter_by(hotel_id=hotel_id)

    if role_filter:
        query = query.filter_by(role=role_filter)

    staff = query.order_by(User.name).all()
    return success_response(data=[s.to_dict() for s in staff])


# ── Create staff account (admin creates managers, manager creates others) ──
@staff_bp.route('/hotel/<int:hotel_id>', methods=['POST'])
@roles_required('admin', 'manager')
def create_staff(hotel_id):
    hotel = Hotel.query.get_or_404(hotel_id)
    user  = get_current_user()

    # Manager can only add staff to their own hotel
    if user.role == 'manager' and user.hotel_id != hotel_id:
        return error_response('You can only add staff to your own hotel', 403)

    data = request.get_json()
    if not data:
        return error_response('No data provided')

    valid, missing = validate_required_fields(
        data, ['name', 'email', 'password', 'role']
    )
    if not valid:
        return error_response(f'Missing required fields: {", ".join(missing)}')

    # Validate role
    requested_role = data['role']
    if requested_role not in HOTEL_STAFF_ROLES:
        return error_response(
            f'Invalid role. Hotel staff roles are: {", ".join(HOTEL_STAFF_ROLES)}'
        )

    # Manager cannot create other managers — only admin can
    if user.role == 'manager' and requested_role == 'manager':
        return error_response('Only admins can create manager accounts', 403)

    # Validate email and password
    if not validate_email(data['email']):
        return error_response('Invalid email address')

    pwd_valid, pwd_error = validate_password(data['password'])
    if not pwd_valid:
        return error_response(pwd_error)

    # Check email not already taken
    if User.query.filter_by(email=data['email'].lower()).first():
        return error_response('An account with this email already exists', 409)

    # Create staff member
    staff = User(
        name     = data['name'].strip(),
        email    = data['email'].lower().strip(),
        role     = requested_role,
        phone    = data.get('phone', ''),
        hotel_id = hotel_id,
        provider = 'email',
        is_active = True,
    )
    staff.set_password(data['password'])

    db.session.add(staff)
    db.session.commit()

    return success_response(
        data=staff.to_dict(),
        message=f'{staff.name} added as {requested_role} at {hotel.name}',
        status=201
    )


# ── Update staff member ──────────────────────────────────────────
@staff_bp.route('/<int:staff_id>', methods=['PUT'])
@roles_required('admin', 'manager')
def update_staff(staff_id):
    staff = User.query.get_or_404(staff_id)
    user  = get_current_user()

    # Manager can only update staff in their own hotel
    if user.role == 'manager' and staff.hotel_id != user.hotel_id:
        return error_response('Access denied', 403)

    data = request.get_json()
    if not data:
        return error_response('No data provided')

    allowed = ['name', 'phone', 'shift']
    for field in allowed:
        if field in data:
            setattr(staff, field, data[field])

    db.session.commit()
    return success_response(data=staff.to_dict(), message='Staff member updated')


# ── Toggle staff active/inactive ─────────────────────────────────
@staff_bp.route('/<int:staff_id>/status', methods=['PATCH'])
@roles_required('admin', 'manager')
def toggle_staff_status(staff_id):
    staff = User.query.get_or_404(staff_id)
    user  = get_current_user()

    if user.role == 'manager' and staff.hotel_id != user.hotel_id:
        return error_response('Access denied', 403)

    staff.is_active = not staff.is_active
    db.session.commit()

    status_text = 'activated' if staff.is_active else 'deactivated'
    return success_response(
        data=staff.to_dict(),
        message=f'{staff.name} has been {status_text}'
    )


# ── Remove staff member ──────────────────────────────────────────
@staff_bp.route('/<int:staff_id>', methods=['DELETE'])
@roles_required('admin', 'manager')
def delete_staff(staff_id):
    staff = User.query.get_or_404(staff_id)
    user  = get_current_user()

    if user.role == 'manager' and staff.hotel_id != user.hotel_id:
        return error_response('Access denied', 403)

    # Cannot delete admin accounts
    if staff.role == 'admin':
        return error_response('Admin accounts cannot be deleted', 403)

    name = staff.name
    db.session.delete(staff)
    db.session.commit()

    return success_response(message=f'{name} has been removed from the system')
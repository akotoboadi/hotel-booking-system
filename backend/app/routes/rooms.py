from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.room import Room
from app.models.hotel import Hotel
from app.models.housekeeping import HousekeepingTask
from app.middleware.auth_middleware import roles_required, hotel_staff_required, get_current_user
from app.utils.helpers import success_response, error_response
from app.utils.validators import validate_required_fields, validate_room_status

rooms_bp = Blueprint('rooms', __name__)


# ── Get all rooms for a hotel (any logged-in staff or public) ────

@rooms_bp.route('/hotel/<int:hotel_id>', methods=['GET'])
def get_hotel_rooms(hotel_id):
    from app.middleware.auth_middleware import jwt_optional_user
    Hotel.query.get_or_404(hotel_id)

    user   = jwt_optional_user()
    status = request.args.get('status', '')

    # Staff (non-admin) can only view rooms in their own hotel
    if user and user.role not in ['guest', 'admin'] and user.hotel_id != hotel_id:
        return error_response('You can only view rooms in your assigned hotel', 403)

    query = Room.query.filter_by(hotel_id=hotel_id)
    if status:
        query = query.filter_by(status=status)

    rooms = query.order_by(Room.floor, Room.name).all()
    return success_response(data=[r.to_dict() for r in rooms])
# @rooms_bp.route('/hotel/<int:hotel_id>', methods=['GET'])
# def get_hotel_rooms(hotel_id):
#     hotel = Hotel.query.get_or_404(hotel_id)
#     status = request.args.get('status', '')

#     query = Room.query.filter_by(hotel_id=hotel_id)
#     if status:
#         query = query.filter_by(status=status)

#     rooms = query.order_by(Room.floor, Room.name).all()
#     return success_response(data=[r.to_dict() for r in rooms])


# ── Get single room ──────────────────────────────────────────────
@rooms_bp.route('/<int:room_id>', methods=['GET'])
def get_room(room_id):
    room = Room.query.get_or_404(room_id)
    return success_response(data=room.to_dict())


# ── Create room (manager of that hotel or admin) ─────────────────
@rooms_bp.route('/hotel/<int:hotel_id>', methods=['POST'])
@roles_required('admin', 'manager')
def create_room(hotel_id):
    hotel = Hotel.query.get_or_404(hotel_id)
    user  = get_current_user()

    # Manager can only add rooms to their own hotel
    if user.role == 'manager' and user.hotel_id != hotel_id:
        return error_response('You can only add rooms to your own hotel', 403)

    data = request.get_json()
    if not data:
        return error_response('No data provided')

    valid, missing = validate_required_fields(data, ['name', 'price'])
    if not valid:
        return error_response(f'Missing required fields: {", ".join(missing)}')

    try:
        price = float(data['price'])
        if price <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return error_response('Price must be a positive number')

    room = Room(
        hotel_id    = hotel_id,
        name        = data['name'].strip(),
        type        = data.get('type', 'Standard'),
        floor       = data.get('floor', 1),
        capacity    = data.get('capacity', 2),
        price       = price,
        description = data.get('description', ''),
        status      = data.get('status', 'available'),
    )
    room.amenities = data.get('amenities', [])
    room.images    = data.get('images', [])

    db.session.add(room)
    db.session.commit()

    return success_response(
        data=room.to_dict(),
        message='Room created successfully',
        status=201
    )


# ── Update room (manager or admin) ──────────────────────────────
@rooms_bp.route('/<int:room_id>', methods=['PUT'])
@roles_required('admin', 'manager')
def update_room(room_id):
    room = Room.query.get_or_404(room_id)
    user = get_current_user()

    # Manager can only update rooms in their hotel
    if user.role == 'manager' and user.hotel_id != room.hotel_id:
        return error_response('You can only update rooms in your hotel', 403)

    data = request.get_json()
    if not data:
        return error_response('No data provided')

    updatable = ['name', 'type', 'floor', 'capacity', 'price', 'description', 'status']
    for field in updatable:
        if field in data:
            setattr(room, field, data[field])

    if 'amenities' in data:
        room.amenities = data['amenities']
    if 'images' in data:
        room.images = data['images']

    db.session.commit()
    return success_response(data=room.to_dict(), message='Room updated successfully')


# # ── Update room status only (receptionist, housekeeping, manager, admin) ──

@rooms_bp.route('/<int:room_id>/status', methods=['PATCH'])
@roles_required('admin', 'manager', 'receptionist', 'housekeeping')
def update_room_status(room_id):
    room = Room.query.get_or_404(room_id)
    user = get_current_user()

    # Admin can update any room
    # All other staff can only update rooms in their assigned hotel
    if user.role != 'admin' and user.hotel_id != room.hotel_id:
        return error_response(
            'You can only update rooms in your assigned hotel', 403
        )

    data = request.get_json()
    if not data or 'status' not in data:
        return error_response('Status is required')

    new_status = data['status']
    if not validate_room_status(new_status):
        return error_response(
            'Invalid status. Must be one of: available, occupied, maintenance, reserved'
        )

    old_status  = room.status
    room.status = new_status
    db.session.commit()

    # If room becomes available after being occupied, create housekeeping task
    if old_status == 'occupied' and new_status == 'available':
        task = HousekeepingTask(
            room_id  = room.id,
            hotel_id = room.hotel_id,
            status   = 'dirty',
            priority = 'normal',
            notes    = 'Room needs cleaning after guest checkout',
        )
        db.session.add(task)
        db.session.commit()

    return success_response(
        data=room.to_dict(),
        message=f'Room status updated to {new_status}'
    )
# @rooms_bp.route('/<int:room_id>/status', methods=['PATCH'])
# @roles_required('admin', 'manager', 'receptionist', 'housekeeping')
# def update_room_status(room_id):
#     room = Room.query.get_or_404(room_id)
#     data = request.get_json()

#     if not data or 'status' not in data:
#         return error_response('Status is required')

#     new_status = data['status']
#     if not validate_room_status(new_status):
#         return error_response(f'Invalid status. Must be one of: available, occupied, maintenance, reserved')

#     old_status  = room.status
#     room.status = new_status
#     db.session.commit()

#     # If room becomes dirty after checkout, create housekeeping task
#     if old_status == 'occupied' and new_status == 'available':
#         task = HousekeepingTask(
#             room_id  = room.id,
#             hotel_id = room.hotel_id,
#             status   = 'dirty',
#             priority = 'normal',
#             notes    = f'Room needs cleaning after guest checkout',
#         )
#         db.session.add(task)
#         db.session.commit()

#     return success_response(
#         data=room.to_dict(),
#         message=f'Room status updated to {new_status}'
#     )


# ── Delete room (manager or admin) ───────────────────────────────
@rooms_bp.route('/<int:room_id>', methods=['DELETE'])
@roles_required('admin', 'manager')
def delete_room(room_id):
    room = Room.query.get_or_404(room_id)
    user = get_current_user()

    if user.role == 'manager' and user.hotel_id != room.hotel_id:
        return error_response('You can only delete rooms in your hotel', 403)

    # Check for active bookings
    from app.models.booking import Booking
    active = Booking.query.filter_by(
        room_id=room_id
    ).filter(
        Booking.status.in_(['confirmed', 'checked_in'])
    ).first()

    if active:
        return error_response(
            'Cannot delete room with active bookings. Cancel bookings first.', 409
        )

    db.session.delete(room)
    db.session.commit()
    return success_response(message=f'Room "{room.name}" has been deleted')
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from datetime import datetime, date
from app.extensions import db
from app.models.booking import Booking
from app.models.room import Room
from app.models.hotel import Hotel
from app.middleware.auth_middleware import roles_required, get_current_user
from app.utils.helpers import (
    success_response, error_response,
    generate_booking_ref, calculate_nights, calculate_taxes, paginate_query
)
from app.utils.validators import validate_required_fields, validate_date_range

bookings_bp = Blueprint('bookings', __name__)


# ── Create booking (guest or receptionist for walk-ins) ──────────
@bookings_bp.route('/', methods=['POST'])
@roles_required('guest', 'admin', 'receptionist')
def create_booking():
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    valid, missing = validate_required_fields(
        data, ['room_id', 'check_in', 'check_out', 'guests']
    )
    if not valid:
        return error_response(f'Missing required fields: {", ".join(missing)}')

    # Parse dates
    try:
        check_in  = date.fromisoformat(data['check_in'])
        check_out = date.fromisoformat(data['check_out'])
    except ValueError:
        return error_response('Invalid date format. Use YYYY-MM-DD')

    # Validate date range
    date_valid, date_error = validate_date_range(check_in, check_out)
    if not date_valid:
        return error_response(date_error)

    # Check room exists
    room = Room.query.get(data['room_id'])
    if not room:
        return error_response('Room not found', 404)

    # Check room is available
    if room.status not in ['available', 'reserved']:
        return error_response(f'Room is currently {room.status} and cannot be booked')

    # Check for conflicting bookings on this room
    conflict = Booking.query.filter(
        Booking.room_id == room.id,
        Booking.status.in_(['confirmed', 'checked_in']),
        Booking.check_in  < check_out,
        Booking.check_out > check_in,
    ).first()

    if conflict:
        return error_response(
            f'Room is already booked from {conflict.check_in} to {conflict.check_out}'
        )

    user        = get_current_user()
    nights      = calculate_nights(check_in, check_out)
    total       = room.price * nights
    taxes       = calculate_taxes(total)
    booking_ref = generate_booking_ref()

    booking = Booking(
        booking_ref     = booking_ref,
        user_id         = user.id,
        room_id         = room.id,
        hotel_id        = room.hotel_id,
        check_in        = check_in,
        check_out       = check_out,
        nights          = nights,
        guests          = int(data['guests']),
        price_per_night = room.price,
        total_amount    = total,
        taxes           = taxes,
        payment_method  = data.get('payment_method', 'Pay at Hotel'),
        payment_status  = 'pending',
        status          = 'confirmed',
        special_requests = data.get('special_requests', ''),
    )

    # Mark room as reserved
    room.status = 'reserved'

    db.session.add(booking)
    db.session.commit()

    return success_response(
        data=booking.to_dict(include_details=True),
        message='Booking confirmed successfully',
        status=201
    )


# ── Get current guest's bookings ─────────────────────────────────
@bookings_bp.route('/my', methods=['GET'])
@roles_required('guest')
def my_bookings():
    user   = get_current_user()
    page   = request.args.get('page', 1, type=int)
    status = request.args.get('status', '')

    query = Booking.query.filter_by(user_id=user.id)
    if status:
        query = query.filter_by(status=status)

    query  = query.order_by(Booking.created_at.desc())
    result = paginate_query(query, page)

    # Include hotel and room details for each booking
    bookings_data = []
    for b in query.paginate(page=page, per_page=10, error_out=False).items:
        bookings_data.append(b.to_dict(include_details=True))

    return success_response(data={
        'items':    bookings_data,
        'total':    query.count(),
        'page':     page,
    })


# ── Get single booking ───────────────────────────────────────────
@bookings_bp.route('/<int:booking_id>', methods=['GET'])
@roles_required('guest', 'admin', 'manager', 'receptionist')
def get_booking(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    user    = get_current_user()

    # Guests can only see their own bookings
    if user.role == 'guest' and booking.user_id != user.id:
        return error_response('Access denied', 403)

    return success_response(data=booking.to_dict(include_details=True))


# ── Get all bookings for a hotel (manager, receptionist, admin) ──
@bookings_bp.route('/hotel/<int:hotel_id>', methods=['GET'])
@roles_required('admin', 'manager', 'receptionist')
def hotel_bookings(hotel_id):
    hotel  = Hotel.query.get_or_404(hotel_id)
    user   = get_current_user()
    page   = request.args.get('page', 1, type=int)
    status = request.args.get('status', '')

    # Manager and receptionist can only see their hotel's bookings
    if user.role in ['manager', 'receptionist'] and user.hotel_id != hotel_id:
        return error_response('Access denied', 403)

    query = Booking.query.filter_by(hotel_id=hotel_id)
    if status:
        query = query.filter_by(status=status)

    query    = query.order_by(Booking.check_in.desc())
    bookings = query.paginate(page=page, per_page=20, error_out=False)

    return success_response(data={
        'items':    [b.to_dict(include_details=True) for b in bookings.items],
        'total':    bookings.total,
        'pages':    bookings.pages,
        'page':     bookings.page,
    })


# ── Today's arrivals and departures (receptionist) ───────────────
@bookings_bp.route('/hotel/<int:hotel_id>/today', methods=['GET'])
@roles_required('admin', 'manager', 'receptionist')
def today_bookings(hotel_id):
    user = get_current_user()
    if user.role in ['manager', 'receptionist'] and user.hotel_id != hotel_id:
        return error_response('Access denied', 403)

    today = date.today()

    arrivals = Booking.query.filter_by(
        hotel_id=hotel_id,
    ).filter(
        Booking.check_in == today,
        Booking.status.in_(['confirmed', 'checked_in'])
    ).all()

    departures = Booking.query.filter_by(
        hotel_id=hotel_id,
    ).filter(
        Booking.check_out == today,
        Booking.status.in_(['confirmed', 'checked_in'])
    ).all()

    return success_response(data={
        'date':       today.isoformat(),
        'arrivals':   [b.to_dict(include_details=True) for b in arrivals],
        'departures': [b.to_dict(include_details=True) for b in departures],
    })


# ── Check in guest (receptionist) ────────────────────────────────
@bookings_bp.route('/<int:booking_id>/checkin', methods=['PATCH'])
@roles_required('admin', 'manager', 'receptionist')
def check_in(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    user    = get_current_user()

    if user.role in ['manager', 'receptionist'] and user.hotel_id != booking.hotel_id:
        return error_response('Access denied', 403)

    if booking.status != 'confirmed':
        return error_response(f'Cannot check in a booking with status: {booking.status}')

    booking.status        = 'checked_in'
    booking.checked_in_at = datetime.utcnow()

    # Mark room as occupied
    room        = Room.query.get(booking.room_id)
    room.status = 'occupied'

    db.session.commit()

    return success_response(
        data=booking.to_dict(include_details=True),
        message=f'{booking.guest.name} has been checked in to Room {room.name}'
    )


# ── Check out guest (receptionist) ───────────────────────────────
@bookings_bp.route('/<int:booking_id>/checkout', methods=['PATCH'])
@roles_required('admin', 'manager', 'receptionist')
def check_out(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    user    = get_current_user()

    if user.role in ['manager', 'receptionist'] and user.hotel_id != booking.hotel_id:
        return error_response('Access denied', 403)

    if booking.status != 'checked_in':
        return error_response(f'Guest must be checked in first. Current status: {booking.status}')

    booking.status         = 'completed'
    booking.checked_out_at = datetime.utcnow()
    booking.payment_status = 'paid'

    # Mark room as available (triggers housekeeping task in room status route)
    room        = Room.query.get(booking.room_id)
    room.status = 'available'

    # Create housekeeping task
    from app.models.housekeeping import HousekeepingTask
    task = HousekeepingTask(
        room_id  = room.id,
        hotel_id = room.hotel_id,
        status   = 'dirty',
        priority = 'high',
        notes    = f'Post-checkout cleaning for booking {booking.booking_ref}',
    )
    db.session.add(task)
    db.session.commit()

    return success_response(
        data=booking.to_dict(include_details=True),
        message=f'{booking.guest.name} has been checked out. Room sent to housekeeping.'
    )


# ── Cancel booking (guest cancels own, manager/admin cancels any) ─
@bookings_bp.route('/<int:booking_id>/cancel', methods=['PATCH'])
@roles_required('guest', 'admin', 'manager', 'receptionist')
def cancel_booking(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    user    = get_current_user()

    # Guest can only cancel their own booking
    if user.role == 'guest' and booking.user_id != user.id:
        return error_response('Access denied', 403)

    if booking.status in ['cancelled', 'completed']:
        return error_response(f'Booking is already {booking.status}')

    if booking.status == 'checked_in':
        return error_response('Cannot cancel a booking where guest is already checked in')

    booking.status = 'cancelled'

    # Free up the room
    room = Room.query.get(booking.room_id)
    if room and room.status == 'reserved':
        room.status = 'available'

    db.session.commit()

    return success_response(
        data=booking.to_dict(include_details=True),
        message='Booking cancelled successfully'
    )
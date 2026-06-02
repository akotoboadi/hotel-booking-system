from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from datetime import date, timedelta
from app.extensions import db
from app.models.hotel import Hotel
from app.models.room import Room
from app.models.booking import Booking
from app.models.user import User
from app.middleware.auth_middleware import roles_required, get_current_user
from app.utils.helpers import success_response, error_response
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)


# ── Admin dashboard — platform-wide stats ────────────────────────
@dashboard_bp.route('/admin', methods=['GET'])
@roles_required('admin')
def admin_dashboard():
    total_hotels   = Hotel.query.count()
    active_hotels  = Hotel.query.filter_by(status='active').count()
    total_rooms    = Room.query.count()
    total_guests   = User.query.filter_by(role='guest').count()
    total_bookings = Booking.query.count()

    # Revenue — sum of all completed + checked_in bookings
    revenue_result = db.session.query(
        func.sum(Booking.total_amount + Booking.taxes)
    ).filter(
        Booking.status.in_(['confirmed', 'checked_in', 'completed'])
    ).scalar()
    total_revenue = round(revenue_result or 0, 2)

    # This month's bookings
    today          = date.today()
    month_start    = today.replace(day=1)
    month_bookings = Booking.query.filter(
        Booking.created_at >= month_start,
        Booking.status != 'cancelled'
    ).count()

    # Today's activity
    today_arrivals   = Booking.query.filter(
        Booking.check_in == today,
        Booking.status.in_(['confirmed', 'checked_in'])
    ).count()
    today_departures = Booking.query.filter(
        Booking.check_out == today,
        Booking.status == 'checked_in'
    ).count()

    # Recent bookings
    recent_bookings = Booking.query.order_by(
        Booking.created_at.desc()
    ).limit(10).all()

    # Hotels list with stats
    hotels = Hotel.query.all()
    hotels_data = []
    for h in hotels:
        h_revenue = db.session.query(
            func.sum(Booking.total_amount)
        ).filter(
            Booking.hotel_id == h.id,
            Booking.status.in_(['confirmed', 'checked_in', 'completed'])
        ).scalar() or 0

        hotels_data.append({
            **h.to_dict(),
            'revenue':       round(h_revenue, 2),
            'booking_count': Booking.query.filter_by(hotel_id=h.id).count(),
        })

    return success_response(data={
        'stats': {
            'total_hotels':    total_hotels,
            'active_hotels':   active_hotels,
            'total_rooms':     total_rooms,
            'total_guests':    total_guests,
            'total_bookings':  total_bookings,
            'total_revenue':   total_revenue,
            'month_bookings':  month_bookings,
            'today_arrivals':  today_arrivals,
            'today_departures': today_departures,
        },
        'recent_bookings': [b.to_dict(include_details=True) for b in recent_bookings],
        'hotels':          hotels_data,
    })


# ── Manager dashboard — hotel-specific stats ─────────────────────
@dashboard_bp.route('/hotel/<int:hotel_id>', methods=['GET'])
@roles_required('admin', 'manager')
def hotel_dashboard(hotel_id):
    hotel = Hotel.query.get_or_404(hotel_id)
    user  = get_current_user()

    if user.role == 'manager' and user.hotel_id != hotel_id:
        return error_response('Access denied', 403)

    today       = date.today()
    month_start = today.replace(day=1)

    # Room stats
    total_rooms   = Room.query.filter_by(hotel_id=hotel_id).count()
    available     = Room.query.filter_by(hotel_id=hotel_id, status='available').count()
    occupied      = Room.query.filter_by(hotel_id=hotel_id, status='occupied').count()
    maintenance   = Room.query.filter_by(hotel_id=hotel_id, status='maintenance').count()
    reserved      = Room.query.filter_by(hotel_id=hotel_id, status='reserved').count()

    # Occupancy rate
    occupancy_rate = round((occupied / total_rooms * 100), 1) if total_rooms > 0 else 0

    # Revenue
    total_revenue = db.session.query(
        func.sum(Booking.total_amount)
    ).filter(
        Booking.hotel_id == hotel_id,
        Booking.status.in_(['confirmed', 'checked_in', 'completed'])
    ).scalar() or 0

    month_revenue = db.session.query(
        func.sum(Booking.total_amount)
    ).filter(
        Booking.hotel_id == hotel_id,
        Booking.created_at >= month_start,
        Booking.status != 'cancelled'
    ).scalar() or 0

    # Today
    today_arrivals   = Booking.query.filter(
        Booking.hotel_id == hotel_id,
        Booking.check_in == today,
        Booking.status.in_(['confirmed', 'checked_in'])
    ).count()

    today_departures = Booking.query.filter(
        Booking.hotel_id == hotel_id,
        Booking.check_out == today,
        Booking.status == 'checked_in'
    ).count()

    # Staff count
    staff_count = User.query.filter_by(hotel_id=hotel_id).filter(
        User.role != 'guest'
    ).count()

    # Recent bookings
    recent_bookings = Booking.query.filter_by(hotel_id=hotel_id).order_by(
        Booking.created_at.desc()
    ).limit(10).all()

    # Weekly revenue (last 7 days)
    weekly_data = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_revenue = db.session.query(
            func.sum(Booking.total_amount)
        ).filter(
            Booking.hotel_id == hotel_id,
            func.date(Booking.created_at) == day,
            Booking.status != 'cancelled'
        ).scalar() or 0
        weekly_data.append({
            'day':     day.strftime('%a'),
            'date':    day.isoformat(),
            'revenue': round(day_revenue, 2),
        })

    return success_response(data={
        'hotel': hotel.to_dict(),
        'stats': {
            'total_rooms':     total_rooms,
            'available':       available,
            'occupied':        occupied,
            'maintenance':     maintenance,
            'reserved':        reserved,
            'occupancy_rate':  occupancy_rate,
            'total_revenue':   round(total_revenue, 2),
            'month_revenue':   round(month_revenue, 2),
            'today_arrivals':  today_arrivals,
            'today_departures': today_departures,
            'staff_count':     staff_count,
        },
        'weekly_revenue':  weekly_data,
        'recent_bookings': [b.to_dict(include_details=True) for b in recent_bookings],
    })
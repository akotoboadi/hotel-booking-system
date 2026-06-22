from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.hotel import Hotel
from app.models.user import User
from app.middleware.auth_middleware import roles_required, get_current_user, jwt_optional_user
from app.utils.helpers import success_response, error_response, paginate_query
from app.utils.validators import validate_required_fields

hotels_bp = Blueprint('hotels', __name__)


# ── Get all hotels (public) ──────────────────────────────────────
# @hotels_bp.route('/', methods=['GET'])
# def get_hotels():
#     page     = request.args.get('page', 1, type=int)
#     per_page = request.args.get('per_page', 12, type=int)
#     type_    = request.args.get('type', '')
#     status   = request.args.get('status', 'active')

#     query = Hotel.query

#     # Guests only see active hotels
#     user = jwt_optional_user()
#     if not user or user.role == 'guest':
#         query = query.filter_by(status='active')
#     elif status:
#         query = query.filter_by(status=status)

#     if type_:
#         query = query.filter(Hotel.type.ilike(f'%{type_}%'))

#     result = paginate_query(query.order_by(Hotel.created_at.desc()), page, per_page)
#     return success_response(data=result)

@hotels_bp.route('/', methods=['GET'])
def get_hotels():
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    type_    = request.args.get('type', '')

    query = Hotel.query

    # Check if request has a valid admin/staff token
    user = jwt_optional_user()
    if user and user.role in ['admin', 'manager', 'receptionist']:
        # Staff see all hotels regardless of status
        status = request.args.get('status', '')
        if status:
            query = query.filter_by(status=status)
    else:
        # Guests and public only see active hotels
        query = query.filter_by(status='active')

    if type_:
        query = query.filter(Hotel.type.ilike(f'%{type_}%'))

    result = paginate_query(
        query.order_by(Hotel.created_at.desc()),
        page, per_page
    )
    return success_response(data=result)


# ── Search hotels (public) ───────────────────────────────────────
@hotels_bp.route('/search', methods=['GET'])
def search_hotels():
    destination = request.args.get('destination', '').strip()
    type_       = request.args.get('type', '').strip()
    min_price   = request.args.get('min_price', type=float)
    max_price   = request.args.get('max_price', type=float)
    page        = request.args.get('page', 1, type=int)

    query = Hotel.query.filter_by(status='active')

    if destination:
        query = query.filter(
            db.or_(
                Hotel.name.ilike(f'%{destination}%'),
                Hotel.location.ilike(f'%{destination}%'),
            )
        )

    if type_:
        query = query.filter(Hotel.type.ilike(f'%{type_}%'))

    hotels = query.all()

    # Filter by price if provided (based on min room price)
    if min_price or max_price:
        filtered = []
        for hotel in hotels:
            if hotel.rooms:
                prices = [r.price for r in hotel.rooms]
                min_room_price = min(prices)
                if min_price and min_room_price < min_price:
                    continue
                if max_price and min_room_price > max_price:
                    continue
            filtered.append(hotel)
        hotels = filtered

    return success_response(data={
        'items': [h.to_dict() for h in hotels],
        'total': len(hotels),
    })


# ── Get single hotel (public) ────────────────────────────────────
@hotels_bp.route('/<int:hotel_id>', methods=['GET'])
def get_hotel(hotel_id):
    hotel = Hotel.query.get_or_404(hotel_id)
    return success_response(data=hotel.to_dict(include_rooms=True))


# ── Create hotel (admin only) ────────────────────────────────────
@hotels_bp.route('/', methods=['POST'])
@roles_required('admin')
def create_hotel():
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    valid, missing = validate_required_fields(data, ['name', 'location'])
    if not valid:
        return error_response(f'Missing required fields: {", ".join(missing)}')

    hotel = Hotel(
        name        = data['name'].strip(),
        location    = data['location'].strip(),
        description = data.get('description', ''),
        type        = data.get('type', ''),
        phone       = data.get('phone', ''),
        email       = data.get('email', ''),
        star_rating = data.get('star_rating', 3),
        status      = data.get('status', 'active'),
    )
    hotel.amenities = data.get('amenities', [])
    hotel.images    = data.get('images', [])

    db.session.add(hotel)
    db.session.commit()

    return success_response(
        data=hotel.to_dict(),
        message='Hotel created successfully',
        status=201
    )


# ── Update hotel (admin or manager of that hotel) ────────────────
@hotels_bp.route('/<int:hotel_id>', methods=['PUT'])
@roles_required('admin', 'manager')
def update_hotel(hotel_id):
    hotel = Hotel.query.get_or_404(hotel_id)
    user  = get_current_user()

    # Manager can only update their own hotel
    if user.role == 'manager' and hotel.manager_id != user.id:
        return error_response('You can only update your own hotel', 403)

    data = request.get_json()
    if not data:
        return error_response('No data provided')

    updatable = ['name', 'location', 'description', 'type', 'phone',
                 'email', 'star_rating', 'status']
    for field in updatable:
        if field in data:
            setattr(hotel, field, data[field])

    if 'amenities' in data:
        hotel.amenities = data['amenities']
    if 'images' in data:
        hotel.images = data['images']

    db.session.commit()
    return success_response(data=hotel.to_dict(), message='Hotel updated successfully')


# ── Assign manager to hotel (admin only) ─────────────────────────
@hotels_bp.route('/<int:hotel_id>/assign-manager', methods=['POST'])
@roles_required('admin')
def assign_manager(hotel_id):
    hotel = Hotel.query.get_or_404(hotel_id)
    data  = request.get_json()

    if not data or not data.get('manager_id'):
        return error_response('manager_id is required')

    manager = User.query.get(data['manager_id'])
    if not manager:
        return error_response('User not found', 404)

    if manager.role != 'manager':
        return error_response('User must have the manager role')

    hotel.manager_id  = manager.id
    manager.hotel_id  = hotel.id
    db.session.commit()

    return success_response(
        data=hotel.to_dict(),
        message=f'{manager.name} assigned as manager of {hotel.name}'
    )


# ── Delete hotel (admin only) ────────────────────────────────────
@hotels_bp.route('/<int:hotel_id>', methods=['DELETE'])
@roles_required('admin')
def delete_hotel(hotel_id):
    hotel = Hotel.query.get_or_404(hotel_id)
    db.session.delete(hotel)
    db.session.commit()
    return success_response(message=f'Hotel "{hotel.name}" has been removed')
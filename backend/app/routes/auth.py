from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from app.extensions import db
from app.models.user import User
from app.utils.helpers import success_response, error_response
from app.utils.validators import validate_email, validate_password, validate_required_fields
from app.middleware.auth_middleware import get_current_user
import requests as http_requests

auth_bp = Blueprint('auth', __name__)


# ── Register ────────────────────────────────────────────────────
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    # Validate required fields
    valid, missing = validate_required_fields(data, ['name', 'email', 'password'])
    if not valid:
        return error_response(f'Missing required fields: {", ".join(missing)}')

    # Validate email format
    if not validate_email(data['email']):
        return error_response('Invalid email address')

    # Validate password
    pwd_valid, pwd_error = validate_password(data['password'])
    if not pwd_valid:
        return error_response(pwd_error)

    # Check email not already taken
    if User.query.filter_by(email=data['email'].lower()).first():
        return error_response('An account with this email already exists', 409)

    # Create user
    user = User(
        name     = data['name'].strip(),
        email    = data['email'].lower().strip(),
        role     = 'guest',
        phone    = data.get('phone'),
        provider = 'email',
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    # Generate tokens
    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return success_response(
        data={
            'user':          user.to_dict(),
            'access_token':  access_token,
            'refresh_token': refresh_token,
        },
        message='Account created successfully',
        status=201
    )


# ── Login ────────────────────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    valid, missing = validate_required_fields(data, ['email', 'password'])
    if not valid:
        return error_response(f'Missing fields: {", ".join(missing)}')

    # Find user
    user = User.query.filter_by(email=data['email'].lower().strip()).first()

    if not user or not user.check_password(data['password']):
        return error_response('Invalid email or password', 401)

    if not user.is_active:
        return error_response('Your account has been deactivated. Contact support.', 403)

    # Generate tokens
    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return success_response(
        data={
            'user':          user.to_dict(),
            'access_token':  access_token,
            'refresh_token': refresh_token,
        },
        message=f'Welcome back, {user.name}'
    )


# ── Google OAuth ─────────────────────────────────────────────────
@auth_bp.route('/google', methods=['POST'])
def google_auth():
    """
    Frontend sends the Google ID token.
    We verify it with Google and log the user in or create their account.
    """
    data = request.get_json()
    if not data or not data.get('token'):
        return error_response('Google token is required')

    google_token = data['token']

    # Verify token with Google
    try:
        google_response = http_requests.get(
            f'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={google_token}',
            timeout=10
        )
        if google_response.status_code != 200:
            return error_response('Invalid Google token', 401)

        google_data = google_response.json()

        # Check token has required fields
        if 'email' not in google_data:
            return error_response('Could not get email from Google', 401)

        email = google_data['email'].lower()
        name  = google_data.get('name', email.split('@')[0])

    except Exception:
        return error_response('Failed to verify Google token', 500)

    # Find or create user
    user = User.query.filter_by(email=email).first()

    if not user:
        # New user — create account automatically
        user = User(
            name     = name,
            email    = email,
            role     = 'guest',
            provider = 'google',
            is_active = True,
        )
        db.session.add(user)
        db.session.commit()

    elif not user.is_active:
        return error_response('Your account has been deactivated', 403)

    # Generate tokens
    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return success_response(
        data={
            'user':          user.to_dict(),
            'access_token':  access_token,
            'refresh_token': refresh_token,
        },
        message='Google sign-in successful'
    )


# ── Get current user profile ─────────────────────────────────────
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user = get_current_user()
    if not user:
        return error_response('User not found', 404)
    return success_response(data=user.to_dict())


# ── Update profile ───────────────────────────────────────────────
@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user = get_current_user()
    if not user:
        return error_response('User not found', 404)

    data = request.get_json()
    if not data:
        return error_response('No data provided')

    # Only allow updating these fields
    allowed_fields = ['name', 'phone', 'address', 'dob']
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])

    # Handle password change
    if data.get('new_password'):
        if not data.get('current_password'):
            return error_response('Current password is required to set a new one')
        if not user.check_password(data['current_password']):
            return error_response('Current password is incorrect', 401)
        pwd_valid, pwd_error = validate_password(data['new_password'])
        if not pwd_valid:
            return error_response(pwd_error)
        user.set_password(data['new_password'])

    db.session.commit()
    return success_response(data=user.to_dict(), message='Profile updated successfully')


# ── Refresh token ────────────────────────────────────────────────
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id      = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return success_response(data={'access_token': access_token})


# ── Logout (client-side — just a confirmation endpoint) ──────────
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return success_response(message='Logged out successfully')
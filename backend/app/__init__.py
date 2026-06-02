from flask import Flask, jsonify
from .config import config_map, DevelopmentConfig
from .extensions import db, migrate, jwt, cors, bcrypt
import os


def create_app(config_name=None):
    app = Flask(__name__)

    # Load config
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config_map.get(config_name, DevelopmentConfig))

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app,
        resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}},
        supports_credentials=True
    )

    # Import models so Flask-Migrate can detect them
    from .models import user, hotel, room, booking, housekeeping

    # Register blueprints
    from .routes.auth      import auth_bp
    from .routes.hotels    import hotels_bp
    from .routes.rooms     import rooms_bp
    from .routes.bookings  import bookings_bp
    from .routes.staff     import staff_bp
    from .routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp,      url_prefix='/api/auth')
    app.register_blueprint(hotels_bp,    url_prefix='/api/hotels')
    app.register_blueprint(rooms_bp,     url_prefix='/api/rooms')
    app.register_blueprint(bookings_bp,  url_prefix='/api/bookings')
    app.register_blueprint(staff_bp,     url_prefix='/api/staff')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    # ── JWT error handlers ──────────────────────────────────────
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired', 'code': 'TOKEN_EXPIRED'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Invalid token', 'code': 'INVALID_TOKEN'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'No token provided', 'code': 'NO_TOKEN'}), 401

    # ── Global error handlers ───────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'error': 'Method not allowed'}), 405

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

    # ── Health check ────────────────────────────────────────────
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'ok',
            'message': 'AKStay API is running'
        })

    return app
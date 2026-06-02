import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Core
    SECRET_KEY = os.getenv('SECRET_KEY', 'fallback-secret-key')
    DEBUG = False
    TESTING = False

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///akstay.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False

    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback-jwt-secret')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # CORS — all frontends allowed
    CORS_ORIGINS = [
        os.getenv('FRONTEND_GUEST_URL',        'http://localhost:5173'),
        os.getenv('FRONTEND_ADMIN_URL',         'http://localhost:5174'),
        os.getenv('FRONTEND_MANAGER_URL',       'http://localhost:5175'),
        os.getenv('FRONTEND_RECEPTIONIST_URL',  'http://localhost:5176'),
    ]

    # Google OAuth
    GOOGLE_CLIENT_ID     = os.getenv('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = False  # Set True to see SQL queries in terminal


class ProductionConfig(Config):
    DEBUG = False
    # In production swap to PostgreSQL:
    # SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///akstay_test.db'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)


# Map string name to class — used in create_app()
config_map = {
    'development': DevelopmentConfig,
    'production':  ProductionConfig,
    'testing':     TestingConfig,
}
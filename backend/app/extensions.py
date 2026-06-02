from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt

# Instantiate extensions — NOT bound to any app yet
# They get bound inside create_app() via init_app()
db      = SQLAlchemy()
migrate = Migrate()
jwt     = JWTManager()
cors    = CORS()
bcrypt  = Bcrypt()
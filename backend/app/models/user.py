from app.extensions import db, bcrypt
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id           = db.Column(db.Integer, primary_key=True)
    name         = db.Column(db.String(100), nullable=False)
    email        = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(200), nullable=True)  # nullable for Google users
    role         = db.Column(
        db.String(20),
        nullable=False,
        default='guest'
        # Values: guest | admin | manager | receptionist | housekeeping | finance
    )
    phone        = db.Column(db.String(20),  nullable=True)
    address      = db.Column(db.String(200), nullable=True)
    dob          = db.Column(db.String(20),  nullable=True)
    provider     = db.Column(db.String(20),  default='email')  # email | google
    is_active    = db.Column(db.Boolean, default=True)

    # For hotel staff — links them to their hotel
    hotel_id     = db.Column(db.Integer, db.ForeignKey('hotels.id'), nullable=True)

    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    bookings     = db.relationship('Booking', backref='guest', lazy=True,
                                   foreign_keys='Booking.user_id')
    managed_hotel = db.relationship('Hotel', backref='manager', lazy=True,
                                    foreign_keys='Hotel.manager_id')

    # ── Password methods ────────────────────────────────────────
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        if not self.password_hash:
            return False
        return bcrypt.check_password_hash(self.password_hash, password)

    # ── Serialization ───────────────────────────────────────────
    def to_dict(self, include_private=False):
        data = {
            'id':         self.id,
            'name':       self.name,
            'email':      self.email,
            'role':       self.role,
            'phone':      self.phone,
            'address':    self.address,
            'dob':        self.dob,
            'provider':   self.provider,
            'is_active':  self.is_active,
            'hotel_id':   self.hotel_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        return data

    def __repr__(self):
        return f'<User {self.email} ({self.role})>'
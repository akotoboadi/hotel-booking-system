from app.extensions import db
from datetime import datetime
import json

class Hotel(db.Model):
    __tablename__ = 'hotels'

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(100), nullable=False)
    location    = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    type        = db.Column(db.String(50), nullable=True)
    phone       = db.Column(db.String(20),  nullable=True)
    email       = db.Column(db.String(120), nullable=True)
    star_rating = db.Column(db.Integer, default=3)
    status      = db.Column(db.String(20), default='active')
    # active | maintenance | inactive

    # JSON fields stored as text
    _amenities  = db.Column('amenities', db.Text, default='[]')
    _images     = db.Column('images',    db.Text, default='[]')

    # Manager assigned to this hotel
    manager_id  = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    rooms       = db.relationship('Room',    backref='hotel', lazy=True,
                                  cascade='all, delete-orphan')
    bookings    = db.relationship('Booking', backref='hotel', lazy=True,
                                  foreign_keys='Booking.hotel_id')
    staff       = db.relationship('User', backref='hotel', lazy=True,
                                  foreign_keys='User.hotel_id')
    tasks       = db.relationship('HousekeepingTask', backref='hotel', lazy=True)

    # ── JSON property helpers ───────────────────────────────────
    @property
    def amenities(self):
        try:
            return json.loads(self._amenities or '[]')
        except Exception:
            return []

    @amenities.setter
    def amenities(self, value):
        self._amenities = json.dumps(value if isinstance(value, list) else [])

    @property
    def images(self):
        try:
            return json.loads(self._images or '[]')
        except Exception:
            return []

    @images.setter
    def images(self, value):
        self._images = json.dumps(value if isinstance(value, list) else [])

    # ── Serialization ───────────────────────────────────────────
    def to_dict(self, include_rooms=False):
        data = {
            'id':          self.id,
            'name':        self.name,
            'location':    self.location,
            'description': self.description,
            'type':        self.type,
            'phone':       self.phone,
            'email':       self.email,
            'star_rating': self.star_rating,
            'status':      self.status,
            'amenities':   self.amenities,
            'images':      self.images,
            'manager_id':  self.manager_id,
            'manager':     self.manager.name if self.manager else None,
            'room_count':  len(self.rooms),
            'created_at':  self.created_at.isoformat() if self.created_at else None,
        }
        if include_rooms:
            data['rooms'] = [r.to_dict() for r in self.rooms]
        return data

    def __repr__(self):
        return f'<Hotel {self.name}>'
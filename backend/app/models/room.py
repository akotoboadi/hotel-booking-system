from app.extensions import db
from datetime import datetime
import json

class Room(db.Model):
    __tablename__ = 'rooms'

    id          = db.Column(db.Integer, primary_key=True)
    hotel_id    = db.Column(db.Integer, db.ForeignKey('hotels.id'), nullable=False)
    name        = db.Column(db.String(100), nullable=False)
    type        = db.Column(db.String(50),  nullable=True)
    floor       = db.Column(db.Integer, default=1)
    capacity    = db.Column(db.Integer, default=2)
    price       = db.Column(db.Float,   nullable=False)
    description = db.Column(db.Text,    nullable=True)
    status      = db.Column(db.String(20), default='available')
    # available | occupied | maintenance | reserved

    _amenities  = db.Column('amenities', db.Text, default='[]')
    _images     = db.Column('images',    db.Text, default='[]')

    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    bookings    = db.relationship('Booking', backref='room', lazy=True,
                                  foreign_keys='Booking.room_id')
    tasks       = db.relationship('HousekeepingTask', backref='room', lazy=True)

    # ── JSON helpers ────────────────────────────────────────────
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
    def to_dict(self):
        return {
            'id':          self.id,
            'hotel_id':    self.hotel_id,
            'name':        self.name,
            'type':        self.type,
            'floor':       self.floor,
            'capacity':    self.capacity,
            'price':       self.price,
            'description': self.description,
            'status':      self.status,
            'amenities':   self.amenities,
            'images':      self.images,
            'created_at':  self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<Room {self.name} (Hotel {self.hotel_id})>'
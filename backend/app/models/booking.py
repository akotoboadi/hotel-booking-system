from app.extensions import db
from datetime import datetime

class Booking(db.Model):
    __tablename__ = 'bookings'

    id             = db.Column(db.Integer, primary_key=True)
    booking_ref    = db.Column(db.String(30), unique=True, nullable=False, index=True)

    # Foreign keys
    user_id        = db.Column(db.Integer, db.ForeignKey('users.id'),   nullable=False)
    room_id        = db.Column(db.Integer, db.ForeignKey('rooms.id'),   nullable=False)
    hotel_id       = db.Column(db.Integer, db.ForeignKey('hotels.id'),  nullable=False)

    # Stay details
    check_in       = db.Column(db.Date,    nullable=False)
    check_out      = db.Column(db.Date,    nullable=False)
    nights         = db.Column(db.Integer, nullable=False)
    guests         = db.Column(db.Integer, default=1)

    # Pricing
    price_per_night = db.Column(db.Float, nullable=False)
    total_amount    = db.Column(db.Float, nullable=False)
    taxes           = db.Column(db.Float, default=0)

    # Payment
    payment_method  = db.Column(db.String(50), default='Pay at Hotel')
    payment_status  = db.Column(db.String(20), default='pending')
    # pending | paid

    # Booking status
    status          = db.Column(db.String(20), default='confirmed')
    # confirmed | cancelled | completed | checked_in | checked_out

    special_requests = db.Column(db.Text, nullable=True)

    # Timestamps
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at      = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    checked_in_at   = db.Column(db.DateTime, nullable=True)
    checked_out_at  = db.Column(db.DateTime, nullable=True)

    # ── Serialization ───────────────────────────────────────────
    def to_dict(self, include_details=False):
        data = {
            'id':               self.id,
            'booking_ref':      self.booking_ref,
            'user_id':          self.user_id,
            'room_id':          self.room_id,
            'hotel_id':         self.hotel_id,
            'check_in':         self.check_in.isoformat() if self.check_in else None,
            'check_out':        self.check_out.isoformat() if self.check_out else None,
            'nights':           self.nights,
            'guests':           self.guests,
            'price_per_night':  self.price_per_night,
            'total_amount':     self.total_amount,
            'taxes':            self.taxes,
            'payment_method':   self.payment_method,
            'payment_status':   self.payment_status,
            'status':           self.status,
            'special_requests': self.special_requests,
            'created_at':       self.created_at.isoformat() if self.created_at else None,
            'checked_in_at':    self.checked_in_at.isoformat() if self.checked_in_at else None,
            'checked_out_at':   self.checked_out_at.isoformat() if self.checked_out_at else None,
        }
        if include_details:
            data['guest_name']     = self.guest.name  if self.guest else None
            data['guest_email']    = self.guest.email if self.guest else None
            data['hotel_name']     = self.hotel.name  if self.hotel else None
            data['hotel_location'] = self.hotel.location if self.hotel else None
            data['room_name']      = self.room.name   if self.room  else None
            data['room_type']      = self.room.type   if self.room  else None
            data['hotel_image']    = self.hotel.images[0] if self.hotel and self.hotel.images else None
        return data

    def __repr__(self):
        return f'<Booking {self.booking_ref}>'
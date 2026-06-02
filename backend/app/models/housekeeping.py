from app.extensions import db
from datetime import datetime

class HousekeepingTask(db.Model):
    __tablename__ = 'housekeeping_tasks'

    id          = db.Column(db.Integer, primary_key=True)
    room_id     = db.Column(db.Integer, db.ForeignKey('rooms.id'),   nullable=False)
    hotel_id    = db.Column(db.Integer, db.ForeignKey('hotels.id'),  nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'),   nullable=True)

    status      = db.Column(db.String(20), default='dirty')
    # dirty | in_progress | clean | inspected

    priority    = db.Column(db.String(10), default='normal')
    # low | normal | high | urgent

    notes       = db.Column(db.Text, nullable=True)

    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assignee    = db.relationship('User', foreign_keys=[assigned_to], backref='tasks')

    def to_dict(self):
        return {
            'id':          self.id,
            'room_id':     self.room_id,
            'hotel_id':    self.hotel_id,
            'assigned_to': self.assigned_to,
            'assignee':    self.assignee.name if self.assignee else None,
            'room_name':   self.room.name if self.room else None,
            'status':      self.status,
            'priority':    self.priority,
            'notes':       self.notes,
            'created_at':  self.created_at.isoformat() if self.created_at else None,
            'updated_at':  self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f'<HousekeepingTask room={self.room_id} status={self.status}>'
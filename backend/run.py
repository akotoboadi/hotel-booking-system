from app import create_app
from app.extensions import db
from app.models import user, hotel, room, booking, housekeeping

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': user.User,
        'Hotel': hotel.Hotel,
        'Room': room.Room,
        'Booking': booking.Booking,
    }

if __name__ == '__main__':
    app.run(debug=True, port=5000)
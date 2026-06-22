from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.hotel import Hotel
from app.models.room import Room
from app.models.booking import Booking
from app.utils.helpers import generate_booking_ref
from datetime import date, timedelta

app = create_app()

def seed():
    with app.app_context():
        print("Dropping and recreating all tables...")
        db.drop_all()
        db.create_all()

        print("Creating users...")

        # Super Admin
        admin = User(name='Super Admin', email='akotoboadi18@gmail.com', role='admin', provider='email', is_active=True)
        admin.set_password('@sdrf123')

        # Hotel Manager 1
        mgr1 = User(name='John Boadu', email='manager@grandmeridian.com', role='manager', provider='email', is_active=True, phone='+233530354594')
        mgr1.set_password('manager123')

        # Hotel Manager 2
        mgr2 = User(name='Akosua Boadi', email='manager@azura.com', role='manager', provider='email', is_active=True, phone='+233208337276')
        mgr2.set_password('manager123')

        # Guest
        guest = User(name='Kwame Asante', email='guest@akstay.com', role='guest', provider='email', is_active=True, phone='+233 55 123 4567')
        guest.set_password('guest123')

        # Receptionist
        recep = User(name='Abena Owusu', email='reception@akstay.com', role='receptionist', provider='email', is_active=True, phone='+233 55 111 2222')
        recep.set_password('reception123')

        db.session.add_all([admin, mgr1, mgr2, guest, recep])
        db.session.commit()
        print(f"  Created: {admin.name}, {mgr1.name}, {mgr2.name}, {guest.name}, {recep.name}")

        print("Creating hotels...")

        hotel1 = Hotel(
            name='The Grand Meridian', location='Paris, France',
            description='Nestled in the heart of Paris, The Grand Meridian offers an unparalleled blend of classic French elegance and modern luxury.',
            type='Luxury', phone='+33 1 23 45 67 89', email='info@grandmeridian.com',
            star_rating=5, status='active', manager_id=mgr1.id,
        )
        hotel1.amenities = ['WiFi', 'Parking', 'Breakfast', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service']
        hotel1.images    = ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200']

        hotel2 = Hotel(
            name='Azura Beach Resort', location='Maldives',
            description='Azura Beach Resort is an exclusive overwater paradise in the crystal-clear lagoons of the Maldives.',
            type='Resort', phone='+960 300 1234', email='info@azura.com',
            star_rating=5, status='active', manager_id=mgr2.id,
        )
        hotel2.amenities = ['WiFi', 'Breakfast', 'Pool', 'Spa', 'Dive Center', 'Restaurant', 'Bar']
        hotel2.images    = ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200']

        hotel3 = Hotel(
            name='The Vine Boutique', location='Tuscany, Italy',
            description='Tucked among rolling Tuscan vineyards, The Vine Boutique is a lovingly restored 16th-century farmhouse.',
            type='Boutique', phone='+39 055 123 456', email='info@vinetuscany.com',
            star_rating=4, status='active',
        )
        hotel3.amenities = ['WiFi', 'Parking', 'Breakfast', 'Pool', 'Wine Tasting', 'Restaurant']
        hotel3.images    = ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200']

        db.session.add_all([hotel1, hotel2, hotel3])
        db.session.commit()

        # Assign receptionit to hotel1
        recep.hotel_id = hotel1.id
        mgr1.hotel_id  = hotel1.id
        mgr2.hotel_id  = hotel2.id
        db.session.commit()
        print(f"  Created: {hotel1.name}, {hotel2.name}, {hotel3.name}")

        print("Creating rooms...")

        rooms_h1 = [
            Room(hotel_id=hotel1.id, name='Deluxe Room',        type='Deluxe',  floor=1, capacity=2, price=320, status='available'),
            Room(hotel_id=hotel1.id, name='Superior Suite',     type='Suite',   floor=2, capacity=3, price=520, status='available'),
            Room(hotel_id=hotel1.id, name='Presidential Suite', type='Suite',   floor=4, capacity=4, price=980, status='available'),
        ]
        for r in rooms_h1:
            r.amenities = ['WiFi', 'TV', 'AC', 'Mini Bar']
            r.images    = []

        rooms_h2 = [
            Room(hotel_id=hotel2.id, name='Beach Villa',        type='Villa',   floor=1, capacity=2, price=750,  status='available'),
            Room(hotel_id=hotel2.id, name='Overwater Bungalow', type='Villa',   floor=1, capacity=2, price=1100, status='available'),
            Room(hotel_id=hotel2.id, name='Reef Suite',         type='Suite',   floor=2, capacity=4, price=1800, status='available'),
        ]
        for r in rooms_h2:
            r.amenities = ['WiFi', 'TV', 'AC', 'Private Pool']
            r.images    = []

        rooms_h3 = [
            Room(hotel_id=hotel3.id, name='Garden Room',        type='Standard', floor=1, capacity=2, price=220, status='available'),
            Room(hotel_id=hotel3.id, name='Vineyard Suite',     type='Suite',    floor=2, capacity=2, price=380, status='available'),
        ]
        for r in rooms_h3:
            r.amenities = ['WiFi', 'TV', 'AC']
            r.images    = []

        all_rooms = rooms_h1 + rooms_h2 + rooms_h3
        db.session.add_all(all_rooms)
        db.session.commit()
        print(f"  Created {len(all_rooms)} rooms")

        print("Creating sample bookings...")

        booking1 = Booking(
            booking_ref     = generate_booking_ref(),
            user_id         = guest.id,
            room_id         = rooms_h1[1].id,
            hotel_id        = hotel1.id,
            check_in        = date.today() + timedelta(days=7),
            check_out       = date.today() + timedelta(days=10),
            nights          = 3,
            guests          = 2,
            price_per_night = 520,
            total_amount    = 1560,
            taxes           = 156,
            payment_method  = 'Pay at Hotel',
            payment_status  = 'pending',
            status          = 'confirmed',
            special_requests = 'High floor if possible',
        )

        booking2 = Booking(
            booking_ref     = generate_booking_ref(),
            user_id         = guest.id,
            room_id         = rooms_h3[0].id,
            hotel_id        = hotel3.id,
            check_in        = date.today() - timedelta(days=5),
            check_out       = date.today() - timedelta(days=2),
            nights          = 3,
            guests          = 2,
            price_per_night = 220,
            total_amount    = 660,
            taxes           = 66,
            payment_method  = 'Pay at Hotel',
            payment_status  = 'paid',
            status          = 'completed',
        )

        db.session.add_all([booking1, booking2])
        db.session.commit()
        print(f"  Created 2 bookings for {guest.name}")

        print("\n✅ Seed complete! Login credentials:")
        print("  Admin:       akotoboadi18@gmail.com       / @sdrf123")
        print("  Manager 1:   manager@grandmeridian.com / manager123")
        print("  Manager 2:   manager@azura.com       / manager123")
        print("  Receptionist: reception@akstay.com   / reception123")
        print("  Guest:        guest@akstay.com        / guest123")
        # for Odasani hotel , email for manager added is ababio@odasani.com , password staff123, default password for managers it would be changed by the manager when he logs in,

if __name__ == '__main__':
    seed()
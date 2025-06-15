-- Hotel Service Database Schema (Consumer Only)
USE travel_hotel_db;

-- Drop old tables if they exist
DROP TABLE IF EXISTS RoomPricing;
DROP TABLE IF EXISTS RoomAvailability;
DROP TABLE IF EXISTS RoomTypes;
DROP TABLE IF EXISTS HotelDailyStatus; -- Drop in case of partial old version
DROP TABLE IF EXISTS Hotels;

CREATE TABLE IF NOT EXISTS Hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    kabupaten VARCHAR(50), -- Kabupaten or regency for Indonesian address granularity
    province VARCHAR(50) NOT NULL,
    postal_code VARCHAR(10), -- Postal code for Indonesian context
    address TEXT NOT NULL,
    property_type ENUM('hotel', 'villa', 'losmen', 'guest_house', 'resort') DEFAULT 'hotel', -- Maps to 'accommodation_type' in API
    star_rating DECIMAL(2,1),
    description TEXT,
    facilities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS HotelDailyStatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    date DATE NOT NULL,
    room_type_name VARCHAR(255) NOT NULL, -- e.g., 'Deluxe', 'Executive Suite'
    available_rooms INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES Hotels(id) ON DELETE CASCADE,
    UNIQUE KEY uq_hotel_date_room_type (hotel_id, date, room_type_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Data for Hotels (remains the same)
INSERT INTO Hotels (name, city, kabupaten, province, postal_code, address, property_type, star_rating, description, facilities) VALUES
('Hotel Mulia Senayan', 'Jakarta', 'Jakarta Pusat', 'DKI Jakarta', '10270', 'Jl. Asia Afrika No.8, Senayan, Jakarta 10270', 'hotel', 5.0, 'Luxury hotel in the heart of Jakarta', 'Swimming pool, spa, gym, restaurant, conference rooms'),
('The Trans Resort', 'Bali', 'Badung', 'Bali', '80361', 'Jl. Sunset Road, Kerobokan, Seminyak, Bali 80361', 'resort', 5.0, 'Luxury resort in Seminyak', 'Private pool villas, spa, kids club, restaurants'),
('Aston Pasteur', 'Bandung', 'Bandung', 'Jawa Barat', '40162', 'Jl. Dr. Djunjunan No.162, Sukabungah, Bandung 40162', 'hotel', 4.0, 'Modern hotel in Bandung', 'Swimming pool, meeting rooms, restaurant'),
('Losmen Setia Kawan', 'Yogyakarta', 'Yogyakarta', 'DI Yogyakarta', '55271', 'Jl. Sosrowijayan No.24, Sosromenduran, Yogyakarta 55271', 'losmen', 2.0, 'Budget accommodation in Yogyakarta', 'Free wifi, shared bathroom'),
('Villa Borobudur', 'Magelang', 'Magelang', 'Jawa Tengah', '56553', 'Dusun Tingal Kulon, Wanurejo, Borobudur, Magelang 56553', 'villa', 4.5, 'Luxury villa with Borobudur view', 'Private pool, butler service, restaurant'),
-- Additional Future Hotels (Indonesian Context)
('Hotel Tentrem Yogyakarta', 'Yogyakarta', 'Sleman', 'DI Yogyakarta', '55281', 'Jl. P. Mangkubumi No.72A, Cokrodiningratan, Jetis, Yogyakarta', 'hotel', 5.0, 'Luxury Javanese heritage hotel', 'Swimming pool, spa, gym, multiple restaurants, ballroom, kids club'),
('Padma Hotel Bandung', 'Bandung', 'Bandung', 'Jawa Barat', '40142', 'Jl. Rancabentang No.56-58, Ciumbuleuit, Bandung', 'hotel', 5.0, 'Hillside hotel with stunning views and extensive grounds', 'Infinity pool, adventure park, mini zoo, spa, restaurants, jogging track'),
('Amanjiwo Resort', 'Magelang', 'Magelang', 'Jawa Tengah', '56553', 'Ds. Majaksingi, Borobudur, Magelang', 'resort', 5.0, 'Ultra-luxury resort overlooking Borobudur Temple', 'Private pool suites, library, art gallery, spa, Javanese restaurant, cultural experiences'),
('Komaneka at Bisma Ubud', 'Ubud', 'Gianyar', 'Bali', '80571', 'Jl. Bisma, Ubud, Gianyar, Bali', 'resort', 5.0, 'Luxury resort nestled in rice paddies with valley views', 'Infinity pools, spa, fine dining, yoga pavilion, rice paddy trekking'),
-- Batch 2: Additional 10 Future Hotels (Indonesian Context)
('The Ritz-Carlton Jakarta, Pacific Place', 'Jakarta', 'Jakarta Selatan', 'DKI Jakarta', '12190', 'Sudirman Central Business District (SCBD), Jl. Jend. Sudirman Kav. 52-53, Jakarta', 'hotel', 5.0, 'Sophisticated luxury hotel with spacious rooms and suites in a prime business district.', 'Club lounge, indoor pool, spa, fitness center, Pacific Restaurant & Lounge, meeting spaces'),
('Four Seasons Resort Bali at Sayan', 'Ubud', 'Gianyar', 'Bali', '80571', 'Jl. Raya Sayan, Sayan, Ubud, Gianyar, Bali', 'resort', 5.0, 'Iconic resort offering a tranquil riverside sanctuary amidst lush tropical valleys.', 'Private villas with pools, Sacred River Spa, Ayung Terrace restaurant, Jati Bar, yoga, cooking classes'),
('GH Universal Hotel Bandung', 'Bandung', 'Bandung Barat', 'Jawa Barat', '40154', 'Jl. Setiabudi No.376, Ledeng, Cidadap, Bandung', 'hotel', 5.0, 'European Renaissance-style hotel offering panoramic city views and unique architecture.', 'Rooftop pool, Chapelle du ciel (Chapel), Belle Vue Restaurant, kids playground, fitness center'),
('Hyatt Regency Yogyakarta', 'Yogyakarta', 'Sleman', 'DI Yogyakarta', '55281', 'Jl. Palagan Tentara Pelajar, Panggung Sari, Sariharjo, Ngaglik, Sleman', 'hotel', 5.0, 'Resort-style hotel set in 22 hectares of landscaped gardens with a golf course.', 'Multi-level swimming pool, 9-hole golf course, spa, Kemangi Bistro, Paseban Lounge, tennis courts'),
('Plataran Komodo Beach Resort', 'Labuan Bajo', 'Manggarai Barat', 'Nusa Tenggara Timur', '86754', 'Waecicu Beach, Labuan Bajo, Komodo, Manggarai Barat', 'resort', 5.0, 'Secluded beachfront luxury resort offering stunning ocean views and access to Komodo National Park.', 'Private villas, beachfront infinity pool, Xanadu Restaurant, Atlantis On The Rock Bar, Plataran Water World, dive center'),
('Sheraton Grand Jakarta Gandaria City Hotel', 'Jakarta', 'Jakarta Selatan', 'DKI Jakarta', '12240', 'Jl. Sultan Iskandar Muda, Kebayoran Lama, Jakarta', 'hotel', 5.0, 'Contemporary hotel directly connected to Gandaria City Mall, offering convenience and style.', 'Outdoor pool, fitness center, Anigre Restaurant, The Lobby Lounge, extensive meeting facilities'),
('Mulia Resort & Villas Nusa Dua', 'Nusa Dua', 'Badung', 'Bali', '80363', 'Jl. Raya Nusa Dua Selatan, Kawasan Sawangan, Nusa Dua, Bali', 'resort', 5.0, 'Expansive luxury beachfront resort with multiple pools, dining options, and entertainment.', 'Multiple swimming pools including oceanfront pool, Mulia Spa, 9 restaurants & bars, Mulia Kidz, fitness center, ZJs Bar'),
('Grand Mercure Bandung Setiabudi', 'Bandung', 'Bandung', 'Jawa Barat', '40143', 'Jl. Dr. Setiabudi No.269-275, Isola, Sukasari, Bandung', 'hotel', 5.0, 'Modern upscale hotel with warm hospitality, located in the cool climate of North Bandung.', 'Heated outdoor pool, fitness center, Hardy''s Dining Room, Kepler Sky Lounge, meeting rooms'),
('Phoenix Hotel Yogyakarta - MGallery', 'Yogyakarta', 'Yogyakarta', 'DI Yogyakarta', '55231', 'Jl. Jend. Sudirman No.9, Cokrodiningratan, Jetis, Yogyakarta', 'hotel', 5.0, 'Historic colonial-style boutique hotel offering a blend of Javanese heritage and modern luxury.', 'Courtyard swimming pool, Paprika Restaurant, Vino Bar, spa, fitness center, heritage building'),
('Ayana Komodo Waecicu Beach', 'Labuan Bajo', 'Manggarai Barat', 'Nusa Tenggara Timur', '86754', 'Waecicu Beach, Labuan Bajo, Komodo, Manggarai Barat', 'resort', 5.0, 'The first and only 5-star resort on Waecicu Beach, offering breathtaking ocean views and luxurious amenities.', 'Oceanfront infinity pools, rooftop bar, multiple dining venues, kids club, dive center, private jetty for excursions');

-- Sample Data for HotelDailyStatus
-- Derived from previous RoomTypes, RoomAvailability, and RoomPricing sample data
-- Assuming hotel_id mapping: Hotel Mulia (1), Trans Resort (2), Aston Pasteur (3), Losmen Setia Kawan (4), Villa Borobudur (5)
-- Assuming room_type_id to room_type_name mapping based on old RoomTypes sample:
-- 1: Deluxe (Hotel Mulia)
-- 2: Executive Suite (Hotel Mulia)
-- 3: Garden Villa (Trans Resort)
-- 4: Family Suite (Trans Resort)
-- 5: Superior (Aston Pasteur)
-- 6: Deluxe (Aston Pasteur)
-- 7: Standard (Losmen Setia Kawan)
-- 8: Private Villa (Villa Borobudur)

INSERT INTO HotelDailyStatus (hotel_id, date, room_type_name, available_rooms, price, currency) VALUES
-- Hotel Mulia Senayan (ID: 1)
(1, '2025-06-10', 'Deluxe', 8, 1850000.00, 'IDR'),
(1, '2025-06-10', 'Executive Suite', 3, 3500000.00, 'IDR'),
-- The Trans Resort (ID: 2)
(2, '2025-06-10', 'Garden Villa', 5, 4200000.00, 'IDR'), -- Original RoomAvailability had room_type_id 3 with 5 rooms, and another entry with 8 rooms. Taking the first one.
(2, '2025-06-10', 'Family Suite', 2, 3800000.00, 'IDR'),
-- Aston Pasteur (ID: 3)
(3, '2025-06-10', 'Superior', 12, 950000.00, 'IDR'),
(3, '2025-06-10', 'Deluxe', 15, 1100000.00, 'IDR'),
-- Losmen Setia Kawan (ID: 4)
(4, '2025-06-10', 'Standard', 6, 250000.00, 'IDR'),
-- Villa Borobudur (ID: 5)
(5, '2025-06-10', 'Private Villa', 1, 5500000.00, 'IDR');
-- Additional Future HotelDailyStatus Data (IDs 6-9 correspond to new hotels above)
-- Hotel Tentrem Yogyakarta (ID: 6)
(6, '2025-06-13', 'Deluxe Room', 10, 2500000.00, 'IDR'),
(6, '2025-06-13', 'Premier Room', 5, 3200000.00, 'IDR'),
(6, '2025-06-14', 'Deluxe Room', 8, 2600000.00, 'IDR'),
(6, '2025-06-14', 'Executive Suite', 3, 4500000.00, 'IDR'),
-- Padma Hotel Bandung (ID: 7)
(7, '2025-06-14', 'Deluxe Room Hillside', 12, 2800000.00, 'IDR'),
(7, '2025-06-14', 'Premier Suite', 4, 4800000.00, 'IDR'),
(7, '2025-06-15', 'Deluxe Room Hillside', 10, 2900000.00, 'IDR'),
(7, '2025-06-15', 'Family Suite', 2, 5500000.00, 'IDR'),
-- Amanjiwo Resort (ID: 8)
(8, '2025-06-15', 'Garden Pool Suite', 3, 15000000.00, 'IDR'),
(8, '2025-06-15', 'Borobudur Pool Suite', 1, 25000000.00, 'IDR'),
(8, '2025-06-16', 'Garden Pool Suite', 2, 15500000.00, 'IDR'),
-- Komaneka at Bisma Ubud (ID: 9)
(9, '2025-06-16', 'Bisma Suite', 7, 3800000.00, 'IDR'),
(9, '2025-06-16', 'One Bedroom Pool Villa', 3, 6500000.00, 'IDR'),
(9, '2025-06-17', 'Bisma Suite', 6, 3900000.00, 'IDR'),
(9, '2025-06-17', 'Family Pool Villa', 1, 8000000.00, 'IDR');
-- Batch 2: Additional 10 Future HotelDailyStatus Data (IDs 10-19 correspond to new hotels above)
-- The Ritz-Carlton Jakarta, Pacific Place (ID: 10)
(10, '2025-06-18', 'Grand Club Room', 10, 4500000.00, 'IDR'),
(10, '2025-06-18', 'Mayfair Suite', 5, 7500000.00, 'IDR'),
(10, '2025-06-19', 'Grand Club Room', 8, 4600000.00, 'IDR'),
(10, '2025-06-19', 'Executive Grand Room', 7, 5500000.00, 'IDR'),
-- Four Seasons Resort Bali at Sayan (ID: 11)
(11, '2025-06-20', 'One-Bedroom Duplex Suite', 6, 9000000.00, 'IDR'),
(11, '2025-06-20', 'Riverfront One-Bedroom Villa', 3, 15000000.00, 'IDR'),
(11, '2025-06-21', 'One-Bedroom Duplex Suite', 5, 9200000.00, 'IDR'),
(11, '2025-06-21', 'Sayan Villa', 2, 20000000.00, 'IDR'),
-- GH Universal Hotel Bandung (ID: 12)
(12, '2025-06-22', 'Superior King Room', 15, 1800000.00, 'IDR'),
(12, '2025-06-22', 'Princess Suite', 4, 3500000.00, 'IDR'),
(12, '2025-06-23', 'Superior King Room', 12, 1850000.00, 'IDR'),
(12, '2025-06-23', 'Honeymoon Suite', 2, 4000000.00, 'IDR'),
-- Hyatt Regency Yogyakarta (ID: 13)
(13, '2025-06-24', 'Garden View King', 20, 1500000.00, 'IDR'),
(13, '2025-06-24', 'Regency Club King', 8, 2500000.00, 'IDR'),
(13, '2025-06-25', 'Garden View King', 18, 1550000.00, 'IDR'),
(13, '2025-06-25', 'Regency Suite King', 3, 3500000.00, 'IDR'),
-- Plataran Komodo Beach Resort (ID: 14)
(14, '2025-06-26', 'Deluxe Beach Front Villa', 7, 6000000.00, 'IDR'),
(14, '2025-06-26', 'Exclusive Beach Front Villa', 3, 8500000.00, 'IDR'),
(14, '2025-06-27', 'Deluxe Beach Front Villa', 6, 6200000.00, 'IDR'),
(14, '2025-06-27', 'Grand Pool Villa', 2, 12000000.00, 'IDR'),
-- Sheraton Grand Jakarta Gandaria City Hotel (ID: 15)
(15, '2025-06-28', 'Deluxe Room', 25, 2200000.00, 'IDR'),
(15, '2025-06-28', 'Club Room', 10, 3200000.00, 'IDR'),
(15, '2025-06-29', 'Deluxe Room', 22, 2250000.00, 'IDR'),
(15, '2025-06-29', 'Executive Suite', 5, 4500000.00, 'IDR'),
-- Mulia Resort & Villas Nusa Dua (ID: 16)
(16, '2025-06-30', 'Mulia Grandeur', 30, 3000000.00, 'IDR'),
(16, '2025-06-30', 'Mulia Signature Ocean Court', 15, 4500000.00, 'IDR'),
(16, '2025-07-01', 'Mulia Grandeur', 28, 3100000.00, 'IDR'),
(16, '2025-07-01', 'The Baron Suite', 5, 7000000.00, 'IDR'),
-- Grand Mercure Bandung Setiabudi (ID: 17)
(17, '2025-07-02', 'Superior Room King Bed', 20, 1200000.00, 'IDR'),
(17, '2025-07-02', 'Executive Suite', 7, 2800000.00, 'IDR'),
(17, '2025-07-03', 'Superior Room King Bed', 18, 1250000.00, 'IDR'),
(17, '2025-07-03', 'Junior Suite', 4, 2200000.00, 'IDR'),
-- Phoenix Hotel Yogyakarta - MGallery (ID: 18)
(18, '2025-07-04', 'Superior Heritage Room', 15, 1600000.00, 'IDR'),
(18, '2025-07-04', 'Deluxe Legacy Room', 8, 2400000.00, 'IDR'),
(18, '2025-07-05', 'Superior Heritage Room', 12, 1650000.00, 'IDR'),
(18, '2025-07-05', 'Executive Suite', 3, 3800000.00, 'IDR'),
-- Ayana Komodo Waecicu Beach (ID: 19)
(19, '2025-07-06', 'Full Ocean View Suite', 10, 7000000.00, 'IDR'),
(19, '2025-07-06', 'Grand Ocean View Suite', 5, 9500000.00, 'IDR'),
(19, '2025-07-07', 'Full Ocean View Suite', 8, 7200000.00, 'IDR'),
(19, '2025-07-07', 'Ocean Front Suite', 4, 11000000.00, 'IDR');

-- Note: The duplicate entry in old RoomAvailability (room_type_id 3, date 2025-06-10, available_rooms 8) is ignored to maintain UNIQUE KEY constraint.
-- In a real migration, such conflicts would need a defined resolution strategy.

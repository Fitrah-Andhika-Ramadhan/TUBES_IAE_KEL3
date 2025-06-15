-- Consolidated Database Initialization Script

-- Set the context to the central database created by Docker Compose
-- (Ensure DB_NAME in docker-compose.yml matches 'travel_agency_db' or your chosen name)
USE travel_agency_db;

--
-- Schema and data for: users-service
--
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL, -- Storing plain text for simplicity in this example
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    birth_date DATE NULL,
    no_nik VARCHAR(32) NULL,
    address VARCHAR(255),
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    kabupaten_kota VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Users (email, password, full_name, phone_number, birth_date, no_nik, address, kelurahan, kecamatan, kabupaten_kota, province, postal_code)
VALUES 
('budi.santoso@example.com', 'password123', 'Budi Santoso', '+6281234567890', '1990-01-15', '3173082501900001', 'Jl. Sudirman No. 123', 'Karet Tengsin', 'Tanah Abang', 'Jakarta Pusat', 'DKI Jakarta', '10250'),
('siti.rahayu@example.com', 'password456', 'Siti Rahayu', '+6287654321098', '1985-05-20', '3173084505850002', 'Jl. Gatot Subroto No. 45', 'Kuningan Barat', 'Mampang Prapatan', 'Jakarta Selatan', 'DKI Jakarta', '12710'),
('ahmad.wijaya@example.com', 'password789', 'Ahmad Wijaya', '+6282112345678', '1988-11-10', '3173081011880003', 'Jl. Malioboro No. 88', 'Sosromenduran', 'Gedong Tengen', 'Yogyakarta', 'DI Yogyakarta', '55271'),
('dewi.lestari@example.com', 'passwordabc', 'Dewi Lestari', '+6281398765432', '1992-07-25', '3173082507920004', 'Jl. Bukit Darmo No. 15', 'Pradahkalikendal', 'Dukuh Pakis', 'Surabaya', 'Jawa Timur', '60226'),
('rini.wulandari@example.com', 'password123', 'Rini Wulandari', '+6281234567891', '1995-03-18', '3173081803950005', 'Jl. Ahmad Yani No. 56', 'Manahan', 'Banjarsari', 'Solo', 'Jawa Tengah', '57139'),
('agus.purnomo@example.com', 'password456', 'Agus Purnomo', '+6287654321099', '1982-09-12', '3173081209820006', 'Jl. Raya Kuta No. 77', 'Kuta', 'Kuta', 'Badung', 'Bali', '80361'),
('rina.fitriani@example.com', 'password789', 'Rina Fitriani', '+6282112345679', '1991-12-05', '3173080512910007', 'Jl. Diponegoro No. 34', 'Darmo', 'Wonokromo', 'Surabaya', 'Jawa Timur', '60241'),
('hadi.santoso@example.com', 'passwordabc', 'Hadi Santoso', '+6281398765433', '1987-06-30', '3173083006870008', 'Jl. Merdeka No. 22', 'Braga', 'Sumur Bandung', 'Bandung', 'Jawa Barat', '40111');

-- END OF users-service SCHEMA --

--
-- Schema and data for: flight-service
--
DROP TABLE IF EXISTS FlightPricing;
DROP TABLE IF EXISTS FlightAvailability;
DROP TABLE IF EXISTS FlightDailyStatus;
DROP TABLE IF EXISTS Flights;

CREATE TABLE IF NOT EXISTS Flights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    origin_code VARCHAR(10) NOT NULL, 
    origin_name VARCHAR(100) NOT NULL, 
    origin_city VARCHAR(100) NOT NULL, 
    destination_code VARCHAR(10) NOT NULL, 
    destination_name VARCHAR(100) NOT NULL, 
    destination_city VARCHAR(100) NOT NULL, 
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    airline_code VARCHAR(5) NOT NULL, 
    airline_name VARCHAR(100) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS FlightDailyStatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT NOT NULL,
    date DATE NOT NULL,
    available_seats INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES Flights(id) ON DELETE CASCADE,
    UNIQUE KEY uq_flight_date (flight_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Flights (flight_number, origin_code, origin_name, origin_city, destination_code, destination_name, destination_city, departure_time, arrival_time, airline_code, airline_name) VALUES
('GA100', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'DPS', 'Ngurah Rai International Airport', 'Denpasar', '2025-06-10 08:00:00', '2025-06-10 11:00:00', 'GA', 'Garuda Indonesia'),
('ID6870', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'SUB', 'Juanda International Airport', 'Surabaya', '2025-06-10 09:30:00', '2025-06-10 11:15:00', 'ID', 'Batik Air'),
('JT707', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'YIA', 'Yogyakarta International Airport', 'Yogyakarta', '2025-06-10 10:45:00', '2025-06-10 12:00:00', 'JT', 'Lion Air'),
('QG720', 'DPS', 'Ngurah Rai International Airport', 'Denpasar', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', '2025-06-11 14:30:00', '2025-06-11 17:15:00', 'QG', 'Citilink'),
('IW1880', 'SUB', 'Juanda International Airport', 'Surabaya', 'UPG', 'Sultan Hasanuddin International Airport', 'Makassar', '2025-06-12 07:15:00', '2025-06-12 09:45:00', 'IW', 'Wings Air'),
('GA412', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'DPS', 'Ngurah Rai International Airport', 'Denpasar', '2025-06-12 16:00:00', '2025-06-12 19:00:00', 'GA', 'Garuda Indonesia'),
('GA200', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'KNO', 'Kualanamu International Airport', 'Medan', '2025-06-13 10:00:00', '2025-06-13 12:20:00', 'GA', 'Garuda Indonesia'),
('SJ182', 'BDO', 'Husein Sastranegara International Airport', 'Bandung', 'LOP', 'Lombok International Airport', 'Praya', '2025-06-14 14:00:00', '2025-06-14 16:50:00', 'SJ', 'Sriwijaya Air'),
('QZ7510', 'DPS', 'Ngurah Rai International Airport', 'Denpasar', 'SIN', 'Changi Airport', 'Singapore', '2025-06-15 09:00:00', '2025-06-15 11:40:00', 'QZ', 'Indonesia AirAsia'),
('ID7263', 'UPG', 'Sultan Hasanuddin International Airport', 'Makassar', 'DJJ', 'Sentani International Airport', 'Jayapura', '2025-06-16 06:00:00', '2025-06-16 10:30:00', 'ID', 'Batik Air'),
('JT690', 'SUB', 'Juanda International Airport', 'Surabaya', 'BPN', 'Sultan Aji Muhammad Sulaiman Sepinggan Airport', 'Balikpapan', '2025-06-17 07:00:00', '2025-06-17 09:30:00', 'JT', 'Lion Air'),
('QG800', 'HLP', 'Halim Perdanakusuma International Airport', 'Jakarta', 'PLM', 'Sultan Mahmud Badaruddin II Airport', 'Palembang', '2025-06-18 11:00:00', '2025-06-18 12:10:00', 'QG', 'Citilink'),
('GA7026', 'DPS', 'Ngurah Rai International Airport', 'Denpasar', 'LBJ', 'Komodo Airport', 'Labuan Bajo', '2025-06-19 13:00:00', '2025-06-19 14:00:00', 'GA', 'Garuda Indonesia'),
('ID6370', 'YIA', 'Yogyakarta International Airport', 'Yogyakarta', 'PNK', 'Supadio International Airport', 'Pontianak', '2025-06-20 08:30:00', '2025-06-20 10:10:00', 'ID', 'Batik Air'),
('IW1250', 'KNO', 'Kualanamu International Airport', 'Medan', 'PDG', 'Minangkabau International Airport', 'Padang', '2025-06-21 10:00:00', '2025-06-21 11:15:00', 'IW', 'Wings Air'),
('SJ590', 'UPG', 'Sultan Hasanuddin International Airport', 'Makassar', 'MDC', 'Sam Ratulangi International Airport', 'Manado', '2025-06-22 14:00:00', '2025-06-22 16:30:00', 'SJ', 'Sriwijaya Air'),
('IN180', 'SRG', 'Jenderal Ahmad Yani International Airport', 'Semarang', 'PKN', 'Iskandar Airport', 'Pangkalan Bun', '2025-06-23 09:00:00', '2025-06-23 10:10:00', 'IN', 'NAM Air'),
('8B652', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'KOE', 'El Tari Airport', 'Kupang', '2025-06-24 05:00:00', '2025-06-24 08:50:00', '8B', 'TransNusa'),
('IU770', 'BDO', 'Husein Sastranegara International Airport', 'Bandung', 'PKU', 'Sultan Syarif Kasim II Airport', 'Pekanbaru', '2025-06-25 12:30:00', '2025-06-25 14:15:00', 'IU', 'Super Air Jet'),
('IP210', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'SOQ', 'Domine Eduard Osok Airport', 'Sorong', '2025-06-26 22:00:00', '2025-06-27 04:00:00', 'IP', 'Pelita Air');

INSERT INTO FlightDailyStatus (flight_id, date, available_seats, price, currency) VALUES
(1, '2025-06-10', 120, 1850000.00, 'IDR'),
(2, '2025-06-10', 180, 950000.00, 'IDR'),
(3, '2025-06-10', 200, 750000.00, 'IDR'),
(4, '2025-06-11', 150, 1650000.00, 'IDR'),
(5, '2025-06-12', 70, 850000.00, 'IDR'),
(6, '2025-06-12', 30, 3500000.00, 'IDR'),
(7, '2025-06-13', 150, 2200000.00, 'IDR'),
(7, '2025-06-14', 140, 2300000.00, 'IDR'),
(8, '2025-06-14', 100, 1500000.00, 'IDR'),
(8, '2025-06-15', 90, 1550000.00, 'IDR'),
(9, '2025-06-15', 160, 1100000.00, 'IDR'),
(9, '2025-06-16', 160, 1150000.00, 'IDR'),
(10, '2025-06-16', 60, 2800000.00, 'IDR'),
(10, '2025-06-17', 55, 2900000.00, 'IDR'),
(11, '2025-06-17', 170, 980000.00, 'IDR'),
(11, '2025-06-18', 165, 1050000.00, 'IDR'),
(12, '2025-06-18', 140, 750000.00, 'IDR'),
(12, '2025-06-19', 130, 800000.00, 'IDR'),
(13, '2025-06-19', 90, 1200000.00, 'IDR'),
(13, '2025-06-20', 85, 1250000.00, 'IDR'),
(14, '2025-06-20', 150, 1100000.00, 'IDR'),
(14, '2025-06-21', 140, 1150000.00, 'IDR'),
(15, '2025-06-21', 60, 850000.00, 'IDR'),
(15, '2025-06-22', 55, 900000.00, 'IDR'),
(16, '2025-06-22', 110, 1300000.00, 'IDR'),
(16, '2025-06-23', 100, 1350000.00, 'IDR'),
(17, '2025-06-23', 65, 950000.00, 'IDR'),
(17, '2025-06-24', 60, 1000000.00, 'IDR'),
(18, '2025-06-24', 120, 1700000.00, 'IDR'),
(18, '2025-06-25', 110, 1750000.00, 'IDR'),
(19, '2025-06-25', 160, 900000.00, 'IDR'),
(19, '2025-06-26', 150, 950000.00, 'IDR'),
(20, '2025-06-26', 100, 2500000.00, 'IDR'),
(20, '2025-06-27', 90, 2600000.00, 'IDR');

-- END OF flight-service SCHEMA --

--
-- Schema and data for: hotel-service
--

-- Drop old tables if they exist
DROP TABLE IF EXISTS RoomPricing;
DROP TABLE IF EXISTS RoomAvailability;
DROP TABLE IF EXISTS RoomTypes;
DROP TABLE IF EXISTS HotelDailyStatus;
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
(5, '2025-06-10', 'Private Villa', 1, 5500000.00, 'IDR'),
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
(9, '2025-06-17', 'Family Pool Villa', 1, 8000000.00, 'IDR'),
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

-- End of hotel-service data

-- 
-- Schema and data for booking-service
-- 

CREATE TABLE IF NOT EXISTS Bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(20) NOT NULL, -- Unique booking reference code
    user_id INT NOT NULL,
    
    -- Service Details (merged from BookingItems)
    type ENUM('flight','hotel','train','local_travel') NOT NULL,
    ref_id INT NOT NULL, -- ID of the flight, hotel, etc.
    travel_date DATE,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    details JSON, -- To store service-specific details

    -- Booking Status & Financials
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    special_requests TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Data
INSERT INTO Bookings (booking_code, user_id, type, ref_id, travel_date, quantity, unit_price, details, status, total_amount, currency, payment_status, special_requests) VALUES
('BOOK-FL-001', 1, 'flight', 1, '2025-10-20', 2, 850000.00, '{"flight_number":"GA210"}', 'confirmed', 1700000.00, 'IDR', 'paid', 'Aisle seats, please.'),
('BOOK-HT-001', 2, 'hotel', 101, '2025-11-15', 1, 1200000.00, '{"room_type":"Deluxe King", "nights": 3}', 'confirmed', 3600000.00, 'IDR', 'pending', 'Late check-in at 10 PM.'),
('BOOK-TR-001', 1, 'train', 52, '2025-12-01', 4, 350000.00, '{"train_name":"Argo Wilis", "class":"Executive"}', 'cancelled', 1400000.00, 'IDR', 'refunded', NULL),
('BOOK-LT-001', 3, 'local_travel', 23, '2025-10-21', 1, 450000.00, '{"service":"Airport Transfer", "vehicle":"Van"}', 'completed', 450000.00, 'IDR', 'paid', NULL);

-- End of booking-service data

-- 
-- Schema and data for payment-service
-- 

CREATE TABLE IF NOT EXISTS Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    payment_method_type VARCHAR(32) NOT NULL, -- 'virtual_account_bca', 'gopay', 'ovo', 'dana', 'credit_card', etc.
    payment_reference VARCHAR(64), -- For VA numbers, e-wallet transaction IDs, etc.
    status ENUM('pending','completed','failed','expired') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Data
INSERT INTO Payments (user_id, booking_id, amount, currency, payment_method_type, payment_reference, status) VALUES
(1, 1, 3500000.00, 'IDR', 'virtual_account_bca', '12345678901234', 'completed'),
(2, 2, 2750000.00, 'IDR', 'gopay', 'GP12345678', 'completed'),
(3, 3, 1850000.00, 'IDR', 'ovo', 'OV98765432', 'pending'),
(4, 4, 4250000.00, 'IDR', 'dana', 'DN87654321', 'pending'),
(1, 5, 1250000.00, 'IDR', 'credit_card', '4111-XXXX-XXXX-1111', 'completed'),
(2, 6, 950000.00, 'IDR', 'virtual_account_mandiri', '89012345678901', 'pending');

-- End of payment-service data

-- 
-- Schema and data for local-travel-service
-- 

DROP TABLE IF EXISTS LocalTravelDailyStatus;
DROP TABLE IF EXISTS LocalTravel;

CREATE TABLE IF NOT EXISTS LocalTravel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(64) NOT NULL,
    operator_name VARCHAR(100) NOT NULL, -- Full company name (e.g., PT. Sinar Jaya)
    type VARCHAR(32) NOT NULL, -- e.g., 'Inter-City Bus', 'Shuttle', 'Travel', 'Ojek', 'Taksi', 'Angkot'
    origin_city VARCHAR(64) NOT NULL,
    destination_city VARCHAR(64) NOT NULL,
    origin_kabupaten VARCHAR(64), -- Indonesian administrative division
    destination_kabupaten VARCHAR(64), -- Indonesian administrative division
    origin_province VARCHAR(64) NOT NULL,
    destination_province VARCHAR(64) NOT NULL,
    route VARCHAR(128), -- Detailed route information
    capacity INT, -- Number of passengers
    features TEXT, -- e.g., AC, WiFi, etc.
    departure_time VARCHAR(32),
    arrival_time VARCHAR(32),
    vehicle_model VARCHAR(64),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS LocalTravelDailyStatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    local_travel_id INT NOT NULL,
    date DATE NOT NULL,
    available_units INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (local_travel_id) REFERENCES LocalTravel(id) ON DELETE CASCADE,
    UNIQUE KEY uq_localtravel_date (local_travel_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Data
INSERT INTO LocalTravel (provider, operator_name, type, origin_city, destination_city, origin_kabupaten, destination_kabupaten, origin_province, destination_province, route, capacity, features, departure_time, arrival_time, vehicle_model, description) VALUES
('Blue Bird', 'PT. Blue Bird Tbk', 'Taksi', 'Jakarta', 'Jakarta', 'Jakarta Pusat', 'Jakarta Selatan', 'DKI Jakarta', 'DKI Jakarta', NULL, 4, 'AC, Mobile App Booking, Argo Meter', '08:00', '08:30', 'Toyota Alphard', 'Layanan taksi premium di Jakarta'),
('TransJakarta', 'PT. Transportasi Jakarta', 'Bus Kota', 'Jakarta', 'Jakarta', 'Jakarta Pusat', 'Jakarta Barat', 'DKI Jakarta', 'DKI Jakarta', 'Koridor 1: Blok M - Kota', 85, 'AC, Jalur Khusus, Halte Permanen', '06:00', '23:00', 'Mercedes-Benz OH 1626', 'Sistem bus rapid transit di Jakarta'),
('Sinar Jaya', 'PT. Sinar Jaya Megah Langgeng', 'Inter-City Bus', 'Jakarta', 'Bandung', 'Jakarta Barat', 'Bandung', 'DKI Jakarta', 'Jawa Barat', 'Jakarta - Bandung via Puncak', 40, 'AC, Kursi Reclining, Toilet, WiFi', '07:00', '11:00', 'Hino RK8', 'Layanan bus antar kota'),
('Damri', 'Perum DAMRI', 'Shuttle', 'Tangerang', 'Jakarta', 'Tangerang', 'Jakarta Pusat', 'Banten', 'DKI Jakarta', 'Bandara Soekarno-Hatta - Gambir', 20, 'AC, Ruang Bagasi, WiFi', '05:00', '06:00', 'Isuzu ELF', 'Layanan shuttle resmi bandara'),
('Gojek', 'PT. Aplikasi Karya Anak Bangsa', 'Ojek', 'Jakarta', 'Jakarta', 'Jakarta Selatan', 'Jakarta Selatan', 'DKI Jakarta', 'DKI Jakarta', NULL, 1, 'Aplikasi Mobile, Helm Disediakan, Masker', 'Anytime', 'Anytime', 'Honda Vario', 'Layanan ojek online via aplikasi'),
('Grab', 'PT. Grab Indonesia', 'Travel', 'Yogyakarta', 'Semarang', 'Yogyakarta', 'Semarang', 'DI Yogyakarta', 'Jawa Tengah', 'Yogyakarta - Semarang via Magelang', 4, 'Aplikasi Mobile, Pilihan Mobil Beragam', '09:00', '12:00', 'Toyota Innova', 'Layanan travel antar kota'),
('Kopaja', 'Koperasi Angkutan Jakarta', 'Angkot', 'Jakarta', 'Jakarta', 'Jakarta Selatan', 'Jakarta Timur', 'DKI Jakarta', 'DKI Jakarta', 'Blok M - Kampung Melayu', 12, 'Tarif Terjangkau', '05:30', '22:00', 'Mitsubishi Colt Diesel', 'Angkutan kota tradisional'),
('Trac', 'PT. Serasi Autoraya', 'Rental Mobil', 'Bali', 'Bali', 'Badung', 'Badung', 'Bali', 'Bali', NULL, 5, 'AC, Pilihan Mobil Beragam, Sopir/Lepas Kunci', '08:00', '12:00', 'Toyota Innova', 'Layanan sewa mobil dengan/tanpa sopir'),
('Xtrans', 'PT. Batavia Prosperindo Trans', 'Travel', 'Jakarta', 'Bandung', 'Jakarta Selatan', 'Bandung', 'DKI Jakarta', 'Jawa Barat', 'Jakarta (Pondok Indah) - Bandung (Pasteur)', 8, 'AC, Kursi Nyaman, WiFi, USB Charging', '07:00', '11:00', 'Toyota Innova', 'Layanan travel premium Jakarta-Bandung'),
('Pahala Kencana', 'PT. Pahala Kencana', 'Inter-City Bus', 'Jakarta', 'Surabaya', 'Jakarta Timur', 'Surabaya', 'DKI Jakarta', 'Jawa Timur', 'Jakarta - Surabaya via Pantura', 40, 'AC, Toilet, Selimut, Bantal, Makan', '06:00', '10:00', 'Toyota Innova', 'Bus AKAP kelas eksekutif'),
('DayTrans', 'PT. DayTrans', 'Shuttle', 'Bandung', 'Jakarta', 'Bandung', 'Jakarta Selatan', 'Jawa Barat', 'DKI Jakarta', 'Bandung (Dipatiukur) - Jakarta (Blok M)', 10, 'AC, Reclining Seat, Music', '08:00', '11:30', 'Isuzu ELF NLR', 'Layanan shuttle Bandung-Jakarta'),
('Primajasa', 'PT. Primajasa Perdanaraya Utama', 'Inter-City Bus', 'Tasikmalaya', 'Bekasi', 'Tasikmalaya', 'Bekasi', 'Jawa Barat', 'Jawa Barat', 'Tasikmalaya - Bekasi via Tol Cipularang', 44, 'AC, TV, Toilet', '09:30', '14:00', 'Hino R260', 'Bus AKAP Tasikmalaya-Bekasi'),
('Cipaganti', 'PT. Cipaganti Citra Graha', 'Travel', 'Cirebon', 'Semarang', 'Cirebon', 'Semarang', 'Jawa Barat', 'Jawa Tengah', 'Cirebon - Semarang via Tol Trans-Jawa', 8, 'AC, Reclining Seat, Snack', '10:00', '15:00', 'Toyota HiAce Commuter', 'Layanan travel Cirebon-Semarang'),
('Jackal Holidays', 'PT. Jackal Holidays', 'Shuttle', 'Surabaya', 'Malang', 'Surabaya', 'Malang', 'Jawa Timur', 'Jawa Timur', 'Surabaya (Juanda) - Malang (Kota)', 12, 'AC, Reclining Seat, Air Purifier', '11:00', '13:30', 'Isuzu ELF NLR', 'Layanan shuttle Surabaya-Malang'),
('Baraya Travel', 'PT. Baraya Travel', 'Shuttle', 'Bandung', 'Jakarta', 'Bandung', 'Jakarta Pusat', 'Jawa Barat', 'DKI Jakarta', 'Bandung (Surapati) - Jakarta (Melawai)', 10, 'AC, Reclining Seat, USB Charger', '07:30', '11:00', 'Toyota HiAce Commuter', 'Shuttle populer Bandung-Jakarta'),
('Rosalia Indah', 'PT. Rosalia Indah Transport', 'Inter-City Bus', 'Solo', 'Jakarta', 'Surakarta', 'Jakarta Timur', 'Jawa Tengah', 'DKI Jakarta', 'Solo (Palur) - Jakarta (Pulo Gebang) via Tol Trans-Jawa', 36, 'AC, Executive Class, Toilet, Snack, Selimut', '15:00', '05:00', 'Mercedes-Benz OH 1626', 'Bus AKAP eksekutif Solo-Jakarta'),
('Nusantara Gemilang', 'PO Nusantara Gemilang', 'Travel', 'Kudus', 'Semarang', 'Kudus', 'Semarang', 'Jawa Tengah', 'Jawa Tengah', 'Kudus - Semarang (Banyumanik)', 7, 'AC, Reclining Seat, Antar Jemput', '09:00', '11:00', 'Isuzu ELF', 'Travel door-to-door Kudus-Semarang'),
('PO Haryanto', 'PT. Haryanto Motor Indonesia', 'Inter-City Bus', 'Jakarta', 'Jepara', 'Jakarta Timur', 'Jepara', 'DKI Jakarta', 'Jawa Tengah', 'Jakarta (Kalideres) - Jepara via Pantura', 32, 'AC, VIP Class, Toilet, Makan, WiFi', '18:00', '04:00', 'Hino RN285', 'Bus AKAP VIP Jakarta-Jepara'),
('Sangkuriang Shuttle', 'CV. Sangkuriang', 'Shuttle', 'Bandung', 'Cirebon', 'Bandung', 'Cirebon', 'Jawa Barat', 'Jawa Barat', 'Bandung (Pasteur) - Cirebon (Grage Mall)', 9, 'AC, Reclining Seat, Air Mineral', '10:30', '14:00', 'Toyota HiAce Premio', 'Shuttle Bandung-Cirebon'),
('Lorena', 'PT. Eka Sari Lorena Transport Tbk', 'Inter-City Bus', 'Malang', 'Denpasar', 'Malang', 'Denpasar', 'Jawa Timur', 'Bali', 'Malang (Arjosari) - Denpasar (Mengwi) via Probolinggo-Banyuwangi', 30, 'AC, Executive Class, Toilet, Selimut, Ferry Included', '16:00', '05:00', 'Mercedes-Benz OH 1526', 'Bus AKAP eksekutif Malang-Denpasar'),
('Beebiz Shuttle', 'PT. Beebiz Trans Nusantara', 'Shuttle', 'Yogyakarta', 'Purwokerto', 'Yogyakarta', 'Banyumas', 'DI Yogyakarta', 'Jawa Tengah', 'Yogyakarta (Jombor) - Purwokerto (Terminal Bulupitu)', 10, 'AC, Reclining Seat, Musik', '08:00', '11:30', 'Isuzu ELF NLR', 'Shuttle Yogyakarta-Purwokerto'),
('Budiman', 'PT. Budiman', 'Inter-City Bus', 'Tasikmalaya', 'Pangandaran', 'Tasikmalaya', 'Pangandaran', 'Jawa Barat', 'Jawa Barat', 'Tasikmalaya (Indihiang) - Pangandaran', 40, 'AC, Ekonomi AC, Cepat Terbatas', '07:00', '10:00', 'Mitsubishi Fuso Canter', 'Bus cepat terbatas Tasikmalaya-Pangandaran'),
('Arnes Shuttle', 'PT. Arnes Shuttle', 'Shuttle', 'Jakarta', 'Sukabumi', 'Jakarta Selatan', 'Sukabumi', 'DKI Jakarta', 'Jawa Barat', 'Jakarta (Blok M) - Sukabumi (Kota)', 11, 'AC, Reclining Seat, Full Music', '13:00', '16:30', 'Toyota HiAce Commuter', 'Shuttle Jakarta-Sukabumi'),
('Efisiensi', 'PO. Efisiensi Putra Utama', 'Inter-City Bus', 'Cilacap', 'Yogyakarta', 'Cilacap', 'Yogyakarta', 'Jawa Tengah', 'DI Yogyakarta', 'Cilacap - Yogyakarta (Giwangan) via Kebumen', 38, 'AC, Patas, Reclining Seat, Toilet', '06:00', '10:30', 'Hino RK8 R260', 'Bus Patas Cilacap-Yogyakarta');

-- Sample Data for LocalTravelDailyStatus
-- Combining data from former LocalTravelAvailability and LocalTravelPricing
-- For items with multiple class_types, the 'Ekonomi' or 'Reguler' price is used, or the only price if no class was specified.
INSERT INTO LocalTravelDailyStatus (local_travel_id, date, available_units, price, currency) VALUES
(1, '2025-06-10', 25, 100000.00, 'IDR'), -- Blue Bird
(2, '2025-06-10', 10, 3500.00, 'IDR'),   -- TransJakarta
(3, '2025-06-10', 5, 120000.00, 'IDR'),  -- Sinar Jaya (Ekonomi price)
(4, '2025-06-10', 8, 75000.00, 'IDR'),   -- Damri
(5, '2025-06-10', 50, 15000.00, 'IDR'),  -- Gojek
(6, '2025-06-10', 30, 180000.00, 'IDR'), -- Grab
(7, '2025-06-10', 15, 5000.00, 'IDR'),    -- Kopaja
(8, '2025-06-10', 12, 500000.00, 'IDR'), -- Trac (Ekonomi price)
(9, '2025-06-10', 6, 135000.00, 'IDR'),  -- Xtrans
(10, '2025-06-10', 3, 250000.00, 'IDR'), -- Pahala Kencana (Ekonomi price)
-- Additional Future LocalTravelDailyStatus Data (IDs 11-14 correspond to new LocalTravel entries)
(11, '2025-06-13', 8, 140000.00, 'IDR'),  -- DayTrans BDO-JKT (ID 11)
(11, '2025-06-14', 7, 145000.00, 'IDR'),  -- DayTrans BDO-JKT (ID 11)
(12, '2025-06-14', 30, 95000.00, 'IDR'),  -- Primajasa TSM-BKS (ID 12)
(12, '2025-06-15', 25, 100000.00, 'IDR'), -- Primajasa TSM-BKS (ID 12)
(13, '2025-06-15', 6, 175000.00, 'IDR'),  -- Cipaganti CBN-SRG (ID 13)
(13, '2025-06-16', 5, 180000.00, 'IDR'),  -- Cipaganti CBN-SRG (ID 13)
(14, '2025-06-16', 10, 85000.00, 'IDR'),  -- Jackal Holidays SUB-MLG (ID 14)
(14, '2025-06-17', 9, 90000.00, 'IDR');   -- Jackal Holidays SUB-MLG (ID 14)
-- Batch 2: Additional 10 Future LocalTravelDailyStatus Data (IDs 15-24 correspond to new LocalTravel entries)
(15, '2025-06-18', 8, 130000.00, 'IDR'),  -- Baraya Travel BDO-JKT (ID 15)
(15, '2025-06-19', 7, 135000.00, 'IDR'),  -- Baraya Travel BDO-JKT (ID 15)
(16, '2025-06-19', 25, 280000.00, 'IDR'), -- Rosalia Indah SLO-JKT (ID 16)
(16, '2025-06-20', 20, 290000.00, 'IDR'), -- Rosalia Indah SLO-JKT (ID 16)
(17, '2025-06-20', 5, 70000.00, 'IDR'),   -- Nusantara Gemilang KDS-SMG (ID 17)
(17, '2025-06-21', 4, 75000.00, 'IDR'),   -- Nusantara Gemilang KDS-SMG (ID 17)
(18, '2025-06-21', 20, 250000.00, 'IDR'), -- PO Haryanto JKT-JPR (ID 18)
(18, '2025-06-22', 18, 260000.00, 'IDR'), -- PO Haryanto JKT-JPR (ID 18)
(19, '2025-06-22', 7, 110000.00, 'IDR'),  -- Sangkuriang Shuttle BDO-CBN (ID 19)
(19, '2025-06-23', 6, 115000.00, 'IDR'),  -- Sangkuriang Shuttle BDO-CBN (ID 19)
(20, '2025-06-23', 15, 350000.00, 'IDR'), -- Lorena MLG-DPS (ID 20)
(20, '2025-06-24', 12, 360000.00, 'IDR'), -- Lorena MLG-DPS (ID 20)
(21, '2025-06-24', 8, 80000.00, 'IDR'),   -- Beebiz Shuttle YOG-PWT (ID 21)
(21, '2025-06-25', 7, 85000.00, 'IDR'),   -- Beebiz Shuttle YOG-PWT (ID 21)
(22, '2025-06-25', 30, 60000.00, 'IDR'),  -- Budiman TSM-PND (ID 22)
(22, '2025-06-26', 28, 65000.00, 'IDR'),  -- Budiman TSM-PND (ID 22)
(23, '2025-06-26', 9, 95000.00, 'IDR'),   -- Arnes Shuttle JKT-SKB (ID 23)
(23, '2025-06-27', 8, 100000.00, 'IDR'),  -- Arnes Shuttle JKT-SKB (ID 23)
(24, '2025-06-27', 22, 100000.00, 'IDR'), -- Efisiensi CLP-YOG (ID 24)
(24, '2025-06-28', 20, 105000.00, 'IDR'); -- Efisiensi CLP-YOG (ID 24)

-- Note: Data migration from old tables to LocalTravelDailyStatus would be required in a real scenario.
-- The sample data above is illustrative and replaces the old sample data.

-- End of local-travel-service data

-- 
-- Schema and data for train-service
-- 

DROP TABLE IF EXISTS TrainDailyStatus;
DROP TABLE IF EXISTS Trains;

CREATE TABLE IF NOT EXISTS Trains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_code VARCHAR(20) NOT NULL, -- KAI train code (e.g., KA-123)
    name VARCHAR(64) NOT NULL, -- Train name (e.g., Argo Bromo Anggrek)
    operator VARCHAR(64) DEFAULT 'PT Kereta Api Indonesia (Persero)',
    origin_station_code VARCHAR(10) NOT NULL, -- Station code (e.g., GMR)
    origin_station_name VARCHAR(100) NOT NULL, -- Station name (e.g., Gambir)
    origin_city VARCHAR(64) NOT NULL, -- City name (e.g., Jakarta)
    origin_province VARCHAR(64) NOT NULL, -- Province name (e.g., DKI Jakarta)
    destination_station_code VARCHAR(10) NOT NULL, -- Station code (e.g., SBI)
    destination_station_name VARCHAR(100) NOT NULL, -- Station name (e.g., Surabaya Gubeng)
    destination_city VARCHAR(64) NOT NULL, -- City name (e.g., Surabaya)
    destination_province VARCHAR(64) NOT NULL, -- Province name (e.g., Jawa Timur)
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    travel_duration INT NOT NULL, -- in minutes
    train_type VARCHAR(50), -- Type of train (e.g., Kereta Api Jarak Jauh, Kereta Api Lokal, Kereta Api Komuter)
    description TEXT,
    facilities TEXT, -- Facilities in Bahasa Indonesia
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS TrainDailyStatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    date DATE NOT NULL,
    available_seats INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (train_id) REFERENCES Trains(id) ON DELETE CASCADE,
    UNIQUE KEY uq_train_date (train_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Data
INSERT INTO Trains (train_code, name, operator, origin_station_code, origin_station_name, origin_city, origin_province, destination_station_code, destination_station_name, destination_city, destination_province, departure_time, arrival_time, travel_duration, train_type, description, facilities) VALUES
('KA-1', 'Argo Bromo Anggrek', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'SBI', 'Surabaya Pasar Turi', 'Surabaya', 'Jawa Timur', '08:00:00', '16:30:00', 510, 'Kereta Api Jarak Jauh', 'Kereta api ekspres premium Jakarta-Surabaya', 'AC, Kursi Bisa Direbahkan, Stop Kontak, Restorasi, WiFi'),
('KA-2', 'Gajayana', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'ML', 'Malang', 'Malang', 'Jawa Timur', '18:30:00', '07:15:00', 765, 'Kereta Api Jarak Jauh', 'Kereta api malam Jakarta-Malang', 'AC, Kursi Bisa Direbahkan, Stop Kontak, Restorasi, Selimut, Bantal'),
('KA-3', 'Argo Dwipangga', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'SLO', 'Solo Balapan', 'Solo', 'Jawa Tengah', '08:30:00', '16:00:00', 450, 'Kereta Api Jarak Jauh', 'Kereta api ekspres Jakarta-Solo', 'AC, Kursi Bisa Direbahkan, Stop Kontak, WiFi'),
('KA-4', 'Lodaya', 'PT Kereta Api Indonesia (Persero)', 'BD', 'Bandung', 'Bandung', 'Jawa Barat', 'SLO', 'Solo Balapan', 'Solo', 'Jawa Tengah', '07:00:00', '15:30:00', 510, 'Kereta Api Jarak Jauh', 'Kereta api ekspres Bandung-Solo', 'AC, Kursi Bisa Direbahkan, Stop Kontak'),
('KA-5', 'Taksaka', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'YK', 'Yogyakarta', 'Yogyakarta', 'DI Yogyakarta', '08:00:00', '15:30:00', 450, 'Kereta Api Jarak Jauh', 'Kereta api ekspres Jakarta-Yogyakarta', 'AC, Kursi Bisa Direbahkan, Stop Kontak, WiFi'),
('KA-6', 'Sancaka', 'PT Kereta Api Indonesia (Persero)', 'YK', 'Yogyakarta', 'Yogyakarta', 'DI Yogyakarta', 'SBI', 'Surabaya Gubeng', 'Surabaya', 'Jawa Timur', '06:15:00', '11:45:00', 330, 'Kereta Api Jarak Jauh', 'Kereta api ekspres Yogyakarta-Surabaya', 'AC, Kursi Bisa Direbahkan, Stop Kontak'),
('KA-7', 'Serayu', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'KY', 'Kroya', 'Cilacap', 'Jawa Tengah', '07:30:00', '15:00:00', 450, 'Kereta Api Jarak Menengah', 'Kereta api regional Jakarta-Kroya', 'AC, Kursi Standar'),
('KA-8', 'Prambanan Express', 'PT Kereta Api Indonesia (Persero)', 'YK', 'Yogyakarta', 'Yogyakarta', 'DI Yogyakarta', 'SLO', 'Solo Balapan', 'Solo', 'Jawa Tengah', '06:00:00', '07:15:00', 75, 'Kereta Api Komuter', 'Kereta api komuter Yogyakarta-Solo', 'AC, Kursi Standar'),
('KA-9', 'Malioboro Express', 'PT Kereta Api Indonesia (Persero)', 'TG', 'Tugu', 'Yogyakarta', 'DI Yogyakarta', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', '20:00:00', '04:15:00', 495, 'Kereta Api Jarak Jauh', 'Kereta api malam Yogyakarta-Jakarta', 'AC, Kursi Bisa Direbahkan, Stop Kontak, Selimut, Bantal, WiFi'),
('KA-10', 'Bima', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'SBI', 'Surabaya Gubeng', 'Surabaya', 'Jawa Timur', '17:00:00', '04:30:00', 690, 'Kereta Api Jarak Jauh', 'Kereta api malam Jakarta-Surabaya', 'AC, Kursi Bisa Direbahkan, Stop Kontak, Restorasi, Selimut, Bantal, WiFi'),
('KA-11', 'Argo Parahyangan', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'BD', 'Bandung', 'Bandung', 'Jawa Barat', '09:15:00', '12:15:00', 180, 'Kereta Api Jarak Jauh', 'Kereta api ekspres Jakarta-Bandung', 'AC, Kursi Bisa Direbahkan, Stop Kontak, Restorasi'),
('KA-12', 'Jayakarta Premium', 'PT Kereta Api Indonesia (Persero)', 'SGU', 'Surabaya Gubeng', 'Surabaya', 'Jawa Timur', 'PSE', 'Pasar Senen', 'Jakarta', 'DKI Jakarta', '15:00:00', '02:30:00', 690, 'Kereta Api Jarak Jauh', 'Kereta api kelas ekonomi premium Surabaya-Jakarta', 'AC, Kursi Bisa Direbahkan (Premium Ekonomi), Stop Kontak, Restorasi'),
('KA-13', 'Ranggajati', 'PT Kereta Api Indonesia (Persero)', 'CN', 'Cirebon', 'Cirebon', 'Jawa Barat', 'JR', 'Jember', 'Jember', 'Jawa Timur', '06:45:00', '19:00:00', 735, 'Kereta Api Jarak Jauh', 'Kereta api lintas selatan Jawa', 'AC, Kursi Bisa Direbahkan (Eksekutif & Bisnis), Stop Kontak, Restorasi'),
('KA-14', 'Kamandaka', 'PT Kereta Api Indonesia (Persero)', 'SMT', 'Semarang Tawang', 'Semarang', 'Jawa Tengah', 'PWT', 'Purwokerto', 'Purwokerto', 'Jawa Tengah', '05:00:00', '09:45:00', 285, 'Kereta Api Jarak Menengah', 'Kereta api regional Semarang-Purwokerto', 'AC, Kursi Standar, Stop Kontak'),
('KA-15', 'Tawang Jaya Premium', 'PT Kereta Api Indonesia (Persero)', 'SMC', 'Semarang Poncol', 'Semarang', 'Jawa Tengah', 'PSE', 'Pasar Senen', 'Jakarta', 'DKI Jakarta', '07:00:00', '13:30:00', 390, 'Kereta Api Jarak Jauh', 'Kereta api ekonomi premium Semarang-Jakarta', 'AC, Kursi Premium Ekonomi, Stop Kontak, TV Hiburan'),
('KA-16', 'Mutiara Selatan', 'PT Kereta Api Indonesia (Persero)', 'BD', 'Bandung', 'Bandung', 'Jawa Barat', 'SGU', 'Surabaya Gubeng', 'Surabaya', 'Jawa Timur', '19:30:00', '08:45:00', 795, 'Kereta Api Jarak Jauh', 'Kereta api malam Bandung-Surabaya via jalur selatan', 'AC, Kursi Eksekutif & Ekonomi Premium, Stop Kontak, Restorasi, Selimut'),
('KA-17', 'Kertajaya', 'PT Kereta Api Indonesia (Persero)', 'SBI', 'Surabaya Pasar Turi', 'Surabaya', 'Jawa Timur', 'PSE', 'Pasar Senen', 'Jakarta', 'DKI Jakarta', '21:00:00', '07:45:00', 645, 'Kereta Api Jarak Jauh', 'Kereta api ekonomi Surabaya-Jakarta via jalur utara', 'AC, Kursi Ekonomi, Stop Kontak, Restorasi'),
('KA-18', 'Progo', 'PT Kereta Api Indonesia (Persero)', 'LPN', 'Lempuyangan', 'Yogyakarta', 'DI Yogyakarta', 'PSE', 'Pasar Senen', 'Jakarta', 'DKI Jakarta', '15:10:00', '23:30:00', 500, 'Kereta Api Jarak Jauh', 'Kereta api ekonomi Yogyakarta-Jakarta', 'AC, Kursi Ekonomi, Stop Kontak'),
('KA-19', 'Kaligung', 'PT Kereta Api Indonesia (Persero)', 'SMC', 'Semarang Poncol', 'Semarang', 'Jawa Tengah', 'TG', 'Tegal', 'Tegal', 'Jawa Tengah', '05:00:00', '07:15:00', 135, 'Kereta Api Lokal', 'Kereta api lokal Semarang-Tegal', 'AC, Kursi Ekonomi'),
('KA-20', 'Wijayakusuma', 'PT Kereta Api Indonesia (Persero)', 'CP', 'Cilacap', 'Cilacap', 'Jawa Tengah', 'KTG', 'Banyuwangi Ketapang', 'Banyuwangi', 'Jawa Timur', '14:10:00', '04:00:00', 830, 'Kereta Api Jarak Jauh', 'Kereta api lintas Cilacap-Banyuwangi', 'AC, Kursi Eksekutif & Ekonomi Premium, Stop Kontak, Restorasi'),
('KA-21', 'Matarmaja', 'PT Kereta Api Indonesia (Persero)', 'ML', 'Malang', 'Malang', 'Jawa Timur', 'PSE', 'Pasar Senen', 'Jakarta', 'DKI Jakarta', '17:30:00', '07:50:00', 860, 'Kereta Api Jarak Jauh', 'Kereta api ekonomi Malang-Jakarta', 'AC, Kursi Ekonomi, Stop Kontak, Restorasi'),
('KA-22', 'Logawa', 'PT Kereta Api Indonesia (Persero)', 'PWT', 'Purwokerto', 'Purwokerto', 'Jawa Tengah', 'JR', 'Jember', 'Jember', 'Jawa Timur', '05:30:00', '17:00:00', 690, 'Kereta Api Jarak Menengah', 'Kereta api ekonomi Purwokerto-Jember', 'AC, Kursi Ekonomi, Stop Kontak'),
('KA-23', 'Sritanjung', 'PT Kereta Api Indonesia (Persero)', 'LPN', 'Lempuyangan', 'Yogyakarta', 'DI Yogyakarta', 'KTG', 'Banyuwangi Ketapang', 'Banyuwangi', 'Jawa Timur', '07:20:00', '19:05:00', 705, 'Kereta Api Jarak Jauh', 'Kereta api ekonomi Yogyakarta-Banyuwangi', 'AC, Kursi Ekonomi, Stop Kontak'),
('KA-24', 'Kahuripan', 'PT Kereta Api Indonesia (Persero)', 'KAC', 'Kiaracondong', 'Bandung', 'Jawa Barat', 'BL', 'Blitar', 'Blitar', 'Jawa Timur', '23:15:00', '12:30:00', 855, 'Kereta Api Jarak Jauh', 'Kereta api ekonomi PSO Bandung-Blitar', 'AC, Kursi Ekonomi, Stop Kontak');

-- Sample Data for TrainDailyStatus
INSERT INTO TrainDailyStatus (train_id, date, available_seats, price, currency) VALUES
(1, '2025-06-10', 350, 450000.00, 'IDR'),
(2, '2025-06-10', 280, 500000.00, 'IDR'),
(3, '2025-06-10', 300, 350000.00, 'IDR'),
(4, '2025-06-10', 320, 300000.00, 'IDR'),
(5, '2025-06-10', 350, 375000.00, 'IDR'),
(6, '2025-06-10', 300, 250000.00, 'IDR'),
(7, '2025-06-10', 400, 180000.00, 'IDR'),
(8, '2025-06-10', 250, 10000.00, 'IDR'),
(9, '2025-06-10', 320, 450000.00, 'IDR'),
(10, '2025-06-10', 380, 480000.00, 'IDR'),
(11, '2025-06-13', 400, 150000.00, 'IDR'),
(11, '2025-06-14', 380, 160000.00, 'IDR'),
(12, '2025-06-14', 300, 280000.00, 'IDR'),
(12, '2025-06-15', 290, 290000.00, 'IDR'),
(13, '2025-06-15', 200, 350000.00, 'IDR'),
(13, '2025-06-16', 180, 360000.00, 'IDR'),
(14, '2025-06-16', 250, 70000.00, 'IDR'),
(14, '2025-06-17', 240, 75000.00, 'IDR'),
(15, '2025-06-18', 300, 180000.00, 'IDR'),
(15, '2025-06-19', 280, 190000.00, 'IDR'),
(16, '2025-06-19', 250, 420000.00, 'IDR'),
(16, '2025-06-20', 240, 430000.00, 'IDR'),
(17, '2025-06-20', 400, 150000.00, 'IDR'),
(17, '2025-06-21', 380, 160000.00, 'IDR'),
(18, '2025-06-21', 350, 130000.00, 'IDR'),
(18, '2025-06-22', 330, 140000.00, 'IDR'),
(19, '2025-06-22', 500, 50000.00, 'IDR'),
(19, '2025-06-23', 480, 55000.00, 'IDR'),
(20, '2025-06-23', 200, 380000.00, 'IDR'),
(20, '2025-06-24', 190, 390000.00, 'IDR'),
(21, '2025-06-24', 450, 140000.00, 'IDR'),
(21, '2025-06-25', 430, 150000.00, 'IDR'),
(22, '2025-06-25', 300, 120000.00, 'IDR'),
(22, '2025-06-26', 280, 125000.00, 'IDR'),
(23, '2025-06-26', 380, 94000.00, 'IDR'),
(23, '2025-06-27', 360, 100000.00, 'IDR'),
(24, '2025-06-27', 420, 84000.00, 'IDR'),
(24, '2025-06-28', 400, 90000.00, 'IDR');

-- End of train-service data

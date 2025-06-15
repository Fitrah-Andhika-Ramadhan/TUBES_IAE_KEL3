-- Flight Service Database Schema (Consumer Only)
USE travel_flight_db;

DROP TABLE IF EXISTS FlightPricing;
DROP TABLE IF EXISTS FlightAvailability;
DROP TABLE IF EXISTS FlightDailyStatus;
DROP TABLE IF EXISTS Flights;

CREATE TABLE IF NOT EXISTS Flights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    origin_code VARCHAR(10) NOT NULL, -- Airport IATA code
    origin_name VARCHAR(100) NOT NULL, -- Airport name
    origin_city VARCHAR(100) NOT NULL, -- City name
    destination_code VARCHAR(10) NOT NULL, -- Airport IATA code
    destination_name VARCHAR(100) NOT NULL, -- Airport name
    destination_city VARCHAR(100) NOT NULL, -- City name
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    airline_code VARCHAR(5) NOT NULL, -- Airline IATA code
    airline_name VARCHAR(100) NOT NULL, -- Airline full name
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

-- Sample Data
INSERT INTO Flights (flight_number, origin_code, origin_name, origin_city, destination_code, destination_name, destination_city, departure_time, arrival_time, airline_code, airline_name) VALUES
('GA100', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'DPS', 'Ngurah Rai International Airport', 'Denpasar', '2025-06-10 08:00:00', '2025-06-10 11:00:00', 'GA', 'Garuda Indonesia'),
('ID6870', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'SUB', 'Juanda International Airport', 'Surabaya', '2025-06-10 09:30:00', '2025-06-10 11:15:00', 'ID', 'Batik Air'),
('JT707', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'YIA', 'Yogyakarta International Airport', 'Yogyakarta', '2025-06-10 10:45:00', '2025-06-10 12:00:00', 'JT', 'Lion Air'),
('QG720', 'DPS', 'Ngurah Rai International Airport', 'Denpasar', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', '2025-06-11 14:30:00', '2025-06-11 17:15:00', 'QG', 'Citilink'),
('IW1880', 'SUB', 'Juanda International Airport', 'Surabaya', 'UPG', 'Sultan Hasanuddin International Airport', 'Makassar', '2025-06-12 07:15:00', '2025-06-12 09:45:00', 'IW', 'Wings Air'),
('GA412', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'DPS', 'Ngurah Rai International Airport', 'Denpasar', '2025-06-12 16:00:00', '2025-06-12 19:00:00', 'GA', 'Garuda Indonesia'),
-- Additional Future Flights (Indonesian Context)
('GA200', 'CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'KNO', 'Kualanamu International Airport', 'Medan', '2025-06-13 10:00:00', '2025-06-13 12:20:00', 'GA', 'Garuda Indonesia'),
('SJ182', 'BDO', 'Husein Sastranegara International Airport', 'Bandung', 'LOP', 'Lombok International Airport', 'Praya', '2025-06-14 14:00:00', '2025-06-14 16:50:00', 'SJ', 'Sriwijaya Air'),
('QZ7510', 'DPS', 'Ngurah Rai International Airport', 'Denpasar', 'SIN', 'Changi Airport', 'Singapore', '2025-06-15 09:00:00', '2025-06-15 11:40:00', 'QZ', 'Indonesia AirAsia'),
('ID7263', 'UPG', 'Sultan Hasanuddin International Airport', 'Makassar', 'DJJ', 'Sentani International Airport', 'Jayapura', '2025-06-16 06:00:00', '2025-06-16 10:30:00', 'ID', 'Batik Air'),
-- Batch 2: Additional 10 Future Flights (Indonesian Context)
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

-- Sample Data for FlightDailyStatus
-- Based on original sample data for FlightAvailability and FlightPricing
INSERT INTO FlightDailyStatus (flight_id, date, available_seats, price, currency) VALUES
(1, '2025-06-10', 120, 1850000.00, 'IDR'), -- GA100 Economy
(2, '2025-06-10', 180, 950000.00, 'IDR'),  -- ID6870 Economy
(3, '2025-06-10', 200, 750000.00, 'IDR'),  -- JT707 Economy
(4, '2025-06-11', 150, 1650000.00, 'IDR'), -- QG720 Economy
(5, '2025-06-12', 70, 850000.00, 'IDR'),   -- IW1880 Economy
(6, '2025-06-12', 30, 3500000.00, 'IDR'),  -- GA412 Business (price reflects this, class distinction now implicit)
(7, '2025-06-13', 150, 2200000.00, 'IDR'), -- GA200 CGK-KNO (ID 7)
(7, '2025-06-14', 140, 2300000.00, 'IDR'), -- GA200 CGK-KNO (ID 7)
(8, '2025-06-14', 100, 1500000.00, 'IDR'), -- SJ182 BDO-LOP (ID 8)
(8, '2025-06-15', 90, 1550000.00, 'IDR'),  -- SJ182 BDO-LOP (ID 8)
(9, '2025-06-15', 160, 1100000.00, 'IDR'), -- QZ7510 DPS-SIN (ID 9)
(9, '2025-06-16', 160, 1150000.00, 'IDR'), -- QZ7510 DPS-SIN (ID 9)
(10, '2025-06-16', 60, 2800000.00, 'IDR'), -- ID7263 UPG-DJJ (ID 10)
(10, '2025-06-17', 55, 2900000.00, 'IDR'), -- ID7263 UPG-DJJ (ID 10)
(11, '2025-06-17', 170, 980000.00, 'IDR'),    -- JT690 SUB-BPN (ID 11)
(11, '2025-06-18', 165, 1050000.00, 'IDR'),   -- JT690 SUB-BPN (ID 11)
(12, '2025-06-18', 140, 750000.00, 'IDR'),    -- QG800 HLP-PLM (ID 12)
(12, '2025-06-19', 130, 800000.00, 'IDR'),    -- QG800 HLP-PLM (ID 12)
(13, '2025-06-19', 90, 1200000.00, 'IDR'),    -- GA7026 DPS-LBJ (ID 13)
(13, '2025-06-20', 85, 1250000.00, 'IDR'),    -- GA7026 DPS-LBJ (ID 13)
(14, '2025-06-20', 150, 1100000.00, 'IDR'),   -- ID6370 YIA-PNK (ID 14)
(14, '2025-06-21', 140, 1150000.00, 'IDR'),   -- ID6370 YIA-PNK (ID 14)
(15, '2025-06-21', 60, 850000.00, 'IDR'),     -- IW1250 KNO-PDG (ID 15)
(15, '2025-06-22', 55, 900000.00, 'IDR'),     -- IW1250 KNO-PDG (ID 15)
(16, '2025-06-22', 110, 1300000.00, 'IDR'),   -- SJ590 UPG-MDC (ID 16)
(16, '2025-06-23', 100, 1350000.00, 'IDR'),   -- SJ590 UPG-MDC (ID 16)
(17, '2025-06-23', 65, 950000.00, 'IDR'),     -- IN180 SRG-PKN (ID 17)
(17, '2025-06-24', 60, 1000000.00, 'IDR'),    -- IN180 SRG-PKN (ID 17)
(18, '2025-06-24', 120, 1700000.00, 'IDR'),   -- 8B652 CGK-KOE (ID 18)
(18, '2025-06-25', 110, 1750000.00, 'IDR'),   -- 8B652 CGK-KOE (ID 18)
(19, '2025-06-25', 160, 900000.00, 'IDR'),    -- IU770 BDO-PKU (ID 19)
(19, '2025-06-26', 150, 950000.00, 'IDR'),    -- IU770 BDO-PKU (ID 19)
(20, '2025-06-26', 100, 2500000.00, 'IDR'),   -- IP210 CGK-SOQ (ID 20)
(20, '2025-06-27', 90, 2600000.00, 'IDR');    -- IP210 CGK-SOQ (ID 20)

-- Note: Data migration from old tables to FlightDailyStatus would be required in a real scenario.
-- The sample data above is illustrative and replaces the old sample data for FlightAvailability and FlightPricing.

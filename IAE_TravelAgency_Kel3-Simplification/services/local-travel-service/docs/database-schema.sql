-- Local Travel Service Database Schema (Consumer Only)
USE travel_local_travel_db;

DROP TABLE IF EXISTS LocalTravelPricing;
DROP TABLE IF EXISTS LocalTravelAvailability;
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

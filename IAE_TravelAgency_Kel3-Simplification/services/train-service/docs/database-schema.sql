-- Train Service Database Schema (Consumer Only)
USE travel_train_db;

DROP TABLE IF EXISTS TrainPricing;
DROP TABLE IF EXISTS TrainAvailability;
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
-- Additional Future Trains (Indonesian Context)
('KA-11', 'Argo Parahyangan', 'PT Kereta Api Indonesia (Persero)', 'GMR', 'Gambir', 'Jakarta', 'DKI Jakarta', 'BD', 'Bandung', 'Bandung', 'Jawa Barat', '09:15:00', '12:15:00', 180, 'Kereta Api Jarak Jauh', 'Kereta api ekspres Jakarta-Bandung', 'AC, Kursi Bisa Direbahkan, Stop Kontak, Restorasi'),
('KA-12', 'Jayakarta Premium', 'PT Kereta Api Indonesia (Persero)', 'SGU', 'Surabaya Gubeng', 'Surabaya', 'Jawa Timur', 'PSE', 'Pasar Senen', 'Jakarta', 'DKI Jakarta', '15:00:00', '02:30:00', 690, 'Kereta Api Jarak Jauh', 'Kereta api kelas ekonomi premium Surabaya-Jakarta', 'AC, Kursi Bisa Direbahkan (Premium Ekonomi), Stop Kontak, Restorasi'),
('KA-13', 'Ranggajati', 'PT Kereta Api Indonesia (Persero)', 'CN', 'Cirebon', 'Cirebon', 'Jawa Barat', 'JR', 'Jember', 'Jember', 'Jawa Timur', '06:45:00', '19:00:00', 735, 'Kereta Api Jarak Jauh', 'Kereta api lintas selatan Jawa', 'AC, Kursi Bisa Direbahkan (Eksekutif & Bisnis), Stop Kontak, Restorasi'),
('KA-14', 'Kamandaka', 'PT Kereta Api Indonesia (Persero)', 'SMT', 'Semarang Tawang', 'Semarang', 'Jawa Tengah', 'PWT', 'Purwokerto', 'Purwokerto', 'Jawa Tengah', '05:00:00', '09:45:00', 285, 'Kereta Api Jarak Menengah', 'Kereta api regional Semarang-Purwokerto', 'AC, Kursi Standar, Stop Kontak'),
-- Batch 2: Additional 10 Future Trains (Indonesian Context)
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
-- Combining data from former TrainAvailability and TrainPricing (using 'Regular' price where multiple categories existed)
INSERT INTO TrainDailyStatus (train_id, date, available_seats, price, currency) VALUES
(1, '2025-06-10', 350, 450000.00, 'IDR'), -- Argo Bromo Anggrek (was Eksekutif A)
(2, '2025-06-10', 280, 500000.00, 'IDR'), -- Gajayana (was Eksekutif A)
(3, '2025-06-10', 300, 350000.00, 'IDR'), -- Argo Dwipangga (was Eksekutif A)
(4, '2025-06-10', 320, 300000.00, 'IDR'), -- Lodaya (was Eksekutif B)
(5, '2025-06-10', 350, 375000.00, 'IDR'), -- Taksaka (was Eksekutif A, Regular price)
(6, '2025-06-10', 300, 250000.00, 'IDR'), -- Sancaka (was Eksekutif B)
(7, '2025-06-10', 400, 180000.00, 'IDR'), -- Serayu (was Bisnis H)
(8, '2025-06-10', 250, 10000.00, 'IDR'),  -- Prambanan Express (was Ekonomi AC C)
(9, '2025-06-10', 320, 450000.00, 'IDR'), -- Malioboro Express (was Eksekutif A)
(10, '2025-06-10', 380, 480000.00, 'IDR'), -- Bima (was Eksekutif A)
-- Additional Future TrainDailyStatus Data (IDs 11-14 correspond to new trains above)
(11, '2025-06-13', 400, 150000.00, 'IDR'), -- Argo Parahyangan GMR-BD (ID 11)
(11, '2025-06-14', 380, 160000.00, 'IDR'), -- Argo Parahyangan GMR-BD (ID 11)
(12, '2025-06-14', 300, 280000.00, 'IDR'), -- Jayakarta Premium SGU-PSE (ID 12)
(12, '2025-06-15', 290, 290000.00, 'IDR'), -- Jayakarta Premium SGU-PSE (ID 12)
(13, '2025-06-15', 200, 350000.00, 'IDR'), -- Ranggajati CN-JR (ID 13, assuming mix Eksekutif/Bisnis)
(13, '2025-06-16', 180, 360000.00, 'IDR'), -- Ranggajati CN-JR (ID 13)
(14, '2025-06-16', 250, 70000.00, 'IDR'),  -- Kamandaka SMT-PWT (ID 14)
(14, '2025-06-17', 240, 75000.00, 'IDR');   -- Kamandaka SMT-PWT (ID 14)
-- Batch 2: Additional 10 Future TrainDailyStatus Data (IDs 15-24 correspond to new trains above)
(15, '2025-06-18', 300, 180000.00, 'IDR'), -- Tawang Jaya Premium SMC-PSE (ID 15)
(15, '2025-06-19', 280, 190000.00, 'IDR'), -- Tawang Jaya Premium SMC-PSE (ID 15)
(16, '2025-06-19', 250, 420000.00, 'IDR'), -- Mutiara Selatan BD-SGU (ID 16)
(16, '2025-06-20', 240, 430000.00, 'IDR'), -- Mutiara Selatan BD-SGU (ID 16)
(17, '2025-06-20', 400, 150000.00, 'IDR'), -- Kertajaya SBI-PSE (ID 17)
(17, '2025-06-21', 380, 160000.00, 'IDR'), -- Kertajaya SBI-PSE (ID 17)
(18, '2025-06-21', 350, 130000.00, 'IDR'), -- Progo LPN-PSE (ID 18)
(18, '2025-06-22', 330, 140000.00, 'IDR'), -- Progo LPN-PSE (ID 18)
(19, '2025-06-22', 500, 50000.00, 'IDR'),  -- Kaligung SMC-TG (ID 19)
(19, '2025-06-23', 480, 55000.00, 'IDR'),  -- Kaligung SMC-TG (ID 19)
(20, '2025-06-23', 200, 380000.00, 'IDR'), -- Wijayakusuma CP-KTG (ID 20)
(20, '2025-06-24', 190, 390000.00, 'IDR'), -- Wijayakusuma CP-KTG (ID 20)
(21, '2025-06-24', 450, 140000.00, 'IDR'), -- Matarmaja ML-PSE (ID 21)
(21, '2025-06-25', 430, 150000.00, 'IDR'), -- Matarmaja ML-PSE (ID 21)
(22, '2025-06-25', 300, 120000.00, 'IDR'), -- Logawa PWT-JR (ID 22)
(22, '2025-06-26', 280, 125000.00, 'IDR'), -- Logawa PWT-JR (ID 22)
(23, '2025-06-26', 380, 94000.00, 'IDR'),  -- Sritanjung LPN-KTG (ID 23)
(23, '2025-06-27', 360, 100000.00, 'IDR'), -- Sritanjung LPN-KTG (ID 23)
(24, '2025-06-27', 420, 84000.00, 'IDR'),  -- Kahuripan KAC-BL (ID 24)
(24, '2025-06-28', 400, 90000.00, 'IDR');  -- Kahuripan KAC-BL (ID 24)

-- Note: Data migration from old tables to TrainDailyStatus would be required in a real scenario.
-- The sample data above is illustrative and replaces the old sample data for TrainAvailability and TrainPricing.

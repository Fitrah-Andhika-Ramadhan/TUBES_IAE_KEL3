-- Users Service Database Schema (Simplified)
-- Drop and create database to reset
DROP DATABASE IF EXISTS travel_users_db;
CREATE DATABASE travel_users_db;

-- Use the users service database
USE travel_users_db;

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL, -- Simple password storage (not hashed for simplicity)
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

-- Sample data for testing
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


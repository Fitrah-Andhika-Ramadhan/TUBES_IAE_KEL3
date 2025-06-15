-- Booking Service Database Schema (Consumer Only)
USE travel_booking_db;

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

-- Payment Service Database Schema (Consumer Only)
DROP DATABASE IF EXISTS travel_payment_db;
CREATE DATABASE travel_payment_db;
USE travel_payment_db;
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

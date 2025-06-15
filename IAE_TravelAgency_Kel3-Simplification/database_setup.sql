-- Drop and create databases for each microservice
DROP DATABASE IF EXISTS travel_users_db;
CREATE DATABASE travel_users_db;
DROP DATABASE IF EXISTS travel_flight_db;
CREATE DATABASE travel_flight_db;
DROP DATABASE IF EXISTS travel_hotel_db;
CREATE DATABASE travel_hotel_db;
DROP DATABASE IF EXISTS travel_booking_db;
CREATE DATABASE travel_booking_db;
DROP DATABASE IF EXISTS travel_payment_db;
CREATE DATABASE travel_payment_db;
DROP DATABASE IF EXISTS travel_local_travel_db;
CREATE DATABASE travel_local_travel_db;
DROP DATABASE IF EXISTS travel_train_db;
CREATE DATABASE travel_train_db;

-- Create a general user for microservices to use
-- Replace 'microservice_user' and 'secure_password' with your preferred values
CREATE USER IF NOT EXISTS 'microservice_user'@'localhost' IDENTIFIED BY 'secure_password';
CREATE USER IF NOT EXISTS 'microservice_user'@'127.0.0.1' IDENTIFIED BY 'secure_password';

-- Grant privileges to the user for each database
GRANT ALL PRIVILEGES ON travel_users_db.* TO 'microservice_user'@'localhost';
GRANT ALL PRIVILEGES ON travel_users_db.* TO 'microservice_user'@'127.0.0.1';

GRANT ALL PRIVILEGES ON travel_flight_db.* TO 'microservice_user'@'localhost';
GRANT ALL PRIVILEGES ON travel_flight_db.* TO 'microservice_user'@'127.0.0.1';

GRANT ALL PRIVILEGES ON travel_hotel_db.* TO 'microservice_user'@'localhost';
GRANT ALL PRIVILEGES ON travel_hotel_db.* TO 'microservice_user'@'127.0.0.1';

GRANT ALL PRIVILEGES ON travel_booking_db.* TO 'microservice_user'@'localhost';
GRANT ALL PRIVILEGES ON travel_booking_db.* TO 'microservice_user'@'127.0.0.1';

GRANT ALL PRIVILEGES ON travel_payment_db.* TO 'microservice_user'@'localhost';
GRANT ALL PRIVILEGES ON travel_payment_db.* TO 'microservice_user'@'127.0.0.1';

GRANT ALL PRIVILEGES ON travel_local_travel_db.* TO 'microservice_user'@'localhost';
GRANT ALL PRIVILEGES ON travel_local_travel_db.* TO 'microservice_user'@'127.0.0.1';

GRANT ALL PRIVILEGES ON travel_train_db.* TO 'microservice_user'@'localhost';
GRANT ALL PRIVILEGES ON travel_train_db.* TO 'microservice_user'@'127.0.0.1';

-- Apply the changes
FLUSH PRIVILEGES;

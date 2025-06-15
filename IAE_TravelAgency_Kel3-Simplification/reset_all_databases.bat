@echo off
REM ===============================
REM  Travel Agency Microservices DB Reset Script
REM ===============================
REM This script resets all microservice databases using the current setup.
REM It uses the environment from database_setup.sql for user/password.

REM === Configuration ===
REM You can edit these if your environment changes
set MYSQL_USER=microservice_user
set MYSQL_PASS=secure_password
set MYSQL_HOST=localhost
REM Update MYSQL_BIN path if your MySQL version or Laragon path is different
set MYSQL_BIN="C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe"

REM === Run the main environment setup (creates user/db if needed) ===
echo Running environment setup (database_setup.sql)...
%MYSQL_BIN% -u%MYSQL_USER% -p%MYSQL_PASS% -h%MYSQL_HOST% < database_setup.sql

REM === Run each microservice schema in order ===
echo Seeding users-service...
%MYSQL_BIN% -u%MYSQL_USER% -p%MYSQL_PASS% -h%MYSQL_HOST% < services\users-service\docs\database-schema.sql

echo Seeding booking-service...
%MYSQL_BIN% -u%MYSQL_USER% -p%MYSQL_PASS% -h%MYSQL_HOST% < services\booking-service\docs\database-schema.sql

echo Seeding flight-service...
%MYSQL_BIN% -u%MYSQL_USER% -p%MYSQL_PASS% -h%MYSQL_HOST% < services\flight-service\docs\database-schema.sql

echo Seeding hotel-service...
%MYSQL_BIN% -u%MYSQL_USER% -p%MYSQL_PASS% -h%MYSQL_HOST% < services\hotel-service\docs\database-schema.sql

echo Seeding local-travel-service...
%MYSQL_BIN% -u%MYSQL_USER% -p%MYSQL_PASS% -h%MYSQL_HOST% < services\local-travel-service\docs\database-schema.sql

echo Seeding train-service...
%MYSQL_BIN% -u%MYSQL_USER% -p%MYSQL_PASS% -h%MYSQL_HOST% < services\train-service\docs\database-schema.sql

echo Seeding payment-service...
%MYSQL_BIN% -u%MYSQL_USER% -p%MYSQL_PASS% -h%MYSQL_HOST% < services\payment-service\docs\database-schema.sql

echo All databases have been reset and seeded!
pause

# ER Diagram: Flight Service

```
+---------------------------+
|         Flights           |
+---------------------------+
| id (PK)                   |
| flight_number             |
| origin_code               |
| origin_name               |
| origin_city               |
| destination_code          |
| destination_name          |
| destination_city          |
| departure_time            |
| arrival_time              |
| airline_code              |
| airline_name              |
| flight_class              |
| created_at                |
| updated_at                |
+---------------------------+
        | 1
        |
        | N
+---------------------------+
|   FlightAvailability      |
+---------------------------+
| id (PK)                   |
| flight_id (FK)            |
| travel_date               |
| available_seats           |
+---------------------------+
        | 1
        |
        | N
+---------------------------+
|     FlightPricing         |
+---------------------------+
| id (PK)                   |
| flight_id (FK)            |
| travel_date               |
| price                     |
| currency                  |
+---------------------------+
```

- Flights have many availabilities and pricing entries by date.
 (Consumer Only)

```
+-------------------+
|     Flights       |
+-------------------+
| id (PK)           |
| flight_number     |
| origin            |
| destination       |
| departure_time    |
| arrival_time      |
| airline           |
| created_at        |
| updated_at        |
+-------------------+
        | 1
        |
        | N
+-----------------------+
|  FlightAvailability   |
+-----------------------+
| id (PK)               |
| flight_id (FK)        |
| travel_date           |
| available_seats       |
+-----------------------+
        | 1
        |
        | N
+-------------------+
|  FlightPricing   |
+-------------------+
| id (PK)           |
| flight_id (FK)    |
| travel_date       |
| price            |
| currency         |
+-------------------+
```

- A Flight has many availabilities (by date)
- A Flight has many pricing entries (by date)
- Availability is updated via dedicated endpoints (`/availability/decrease` and `/availability/increase`) for booking/cancellation, but the schema is unchanged.

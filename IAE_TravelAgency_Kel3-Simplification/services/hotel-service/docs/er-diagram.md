# ER Diagram: Hotel Service

```
+---------------------------+
|          Hotels           |
+---------------------------+
| id (PK)                   |
| name                      |
| city                      |
| kabupaten                 |
| province                  |
| postal_code               |
| address                   |
| property_type             |
| star_rating               |
| description               |
| facilities                |
| created_at                |
| updated_at                |
+---------------------------+
        | 1
        |
        | N
+---------------------------+
|        RoomTypes          |
+---------------------------+
| id (PK)                   |
| hotel_id (FK)             |
| type                      |
| description               |
| max_guests                |
| bed_type                  |
| room_size                 |
| has_breakfast             |
| has_wifi                  |
+---------------------------+
        | 1
        |
        | N
+---------------------------+
|    RoomAvailability       |
+---------------------------+
| id (PK)                   |
| room_type_id (FK)         |
| date                      |
| available_rooms           |
+---------------------------+
        | 1
        |
        | N
+---------------------------+
|     RoomPricing           |
+---------------------------+
| id (PK)                   |
| room_type_id (FK)         |
| date                      |
| price                     |
| currency                  |
+---------------------------+

- Hotels have many room types, each with their own availability and pricing. (Consumer Only)
- Availability is updated via dedicated endpoints (`/availability/decrease` and `/availability/increase`) for booking/cancellation, but the schema is unchanged.

```
+-------------------+
|      Hotels       |
+-------------------+
| id (PK)           |
| name              |
| location          |
| description       |
| created_at        |
| updated_at        |
+-------------------+
        | 1
        |
        | N
+-------------------+
|    RoomTypes      |
+-------------------+
| id (PK)           |
| hotel_id (FK)     |
| type              |
| description       |
| max_guests        |
+-------------------+
        | 1
        |
        | N
+-----------------------+
|  RoomAvailability     |
+-----------------------+
| id (PK)               |
| room_type_id (FK)     |
| date                  |
| available_rooms       |
+-----------------------+
        | 1
        |
        | N
+-------------------+
|   RoomPricing    |
+-------------------+
| id (PK)           |
| room_type_id (FK) |
| date              |
| price             |
| currency          |
+-------------------+
```

- A Hotel has many RoomTypes
- A RoomType has many availabilities and pricing entries (by date)

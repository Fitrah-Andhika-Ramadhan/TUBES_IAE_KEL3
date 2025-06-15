# ER Diagram: Local Travel Service

```
+------------------------------+
|        LocalTravel           |
+------------------------------+
| id (PK)                      |
| provider                     |
| operator_name                |
| type                         |
| origin_city                  |
| destination_city             |
| origin_kabupaten             |
| destination_kabupaten        |
| origin_province              |
| destination_province         |
| route                        |
| capacity                     |
| features                     |
| description                  |
| created_at                   |
| updated_at                   |
+------------------------------+
        | 1
        |
        | N
+------------------------------+
| LocalTravelAvailability      |
+------------------------------+
| id (PK)                      |
| local_travel_id (FK)         |
| date                         |
| available_units              |
+------------------------------+
        | 1
        |
        | N
+------------------------------+
|    LocalTravelPricing        |
+------------------------------+
| id (PK)                      |
| local_travel_id (FK)         |
| date                         |
| price                        |
| currency                     |
| class_type                   |
+------------------------------+

- LocalTravel has many availabilities (by date)
- LocalTravel has many pricing entries (by date)
- Availability is updated via dedicated endpoints (`/availability/decrease` and `/availability/increase`) for booking/cancellation, but the schema is unchanged.
 (Consumer Only)

```
+-------------------------+
|      LocalTravel        |
+-------------------------+
| id (PK)                 |
| provider                |
| type                    |
| location                |
| description             |
+-------------------------+
        | 1
        |
        | N
+-------------------------------+
|   LocalTravelAvailability     |
+-------------------------------+
| id (PK)                       |
| local_travel_id (FK)          |
| date                          |
| available_units               |
+-------------------------------+
        | 1
        |
        | N
+---------------------------+
|   LocalTravelPricing      |
+---------------------------+
| id (PK)                   |
| local_travel_id (FK)      |
| date                      |
| price                     |
| currency                  |
+---------------------------+
```

- A LocalTravel option has many availability and pricing entries.

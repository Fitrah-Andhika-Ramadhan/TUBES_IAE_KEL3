# ER Diagram: Train Service

```
+---------------------------+
|          Trains           |
+---------------------------+
| id (PK)                   |
| train_code                |
| name                      |
| operator                  |
| origin_station_code       |
| origin_station_name       |
| origin_city               |
| origin_province           |
| destination_station_code  |
| destination_station_name  |
| destination_city          |
| destination_province      |
| departure_time            |
| arrival_time              |
| travel_duration           |
| train_class               |
| subclass                  |
| train_type                |
| description               |
| facilities                |
| created_at                |
| updated_at                |
+---------------------------+
        | 1
        |
        | N
+---------------------------+
|   TrainAvailability       |
+---------------------------+
| id (PK)                   |
| train_id (FK)             |
| date                      |
| available_seats           |
+---------------------------+
        | 1
        |
        | N
+---------------------------+
|     TrainPricing          |
+---------------------------+
| id (PK)                   |
| train_id (FK)             |
| date                      |
| price                     |
| currency                  |
| price_category            |
+---------------------------+

- Trains have many availability and pricing entries by date.
 (Consumer Only)

```
+-------------------------+
|        Trains           |
+-------------------------+
| id (PK)                 |
| name                    |
| origin                  |
| destination             |
| description             |
+-------------------------+
        | 1
        |
        | N
+-------------------------------+
|   TrainAvailability           |
+-------------------------------+
| id (PK)                       |
| train_id (FK)                 |
| date                          |
| available_seats               |
+-------------------------------+
        | 1
        |
        | N
+---------------------------+
|    TrainPricing           |
+---------------------------+
| id (PK)                   |
| train_id (FK)             |
| date                      |
| price                     |
| currency                  |
+---------------------------+
```

- A Train has many availability and pricing entries.

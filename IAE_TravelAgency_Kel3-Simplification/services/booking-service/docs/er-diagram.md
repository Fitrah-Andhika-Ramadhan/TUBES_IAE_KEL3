# ER Diagram: Booking Service (Consumer Only)

```
+---------------------------+
|         Bookings          |
+---------------------------+
| id (PK)                   |
| booking_code (U)          |
| user_id (FK)              |
| status                    |
| total_amount              |
| currency                  |
| payment_status            |
| special_requests          |
| created_at                |
| updated_at                |
+---------------------------+
        | 1
        |
        | N
+---------------------------+
|       BookingItems        |
+---------------------------+
| id (PK)                   |
| booking_id (FK)           |
| type                      |
| ref_id                    |
| travel_date               |
| quantity                  |
| unit_price                |
| subtotal                  |
| origin_city               |
| destination_city          |
| origin_province           |
| destination_province      |
| service_class             |
| provider                  |
| details (JSON)            |
+---------------------------+
```

- A Booking belongs to a User (from Users Service)
- A Booking has many BookingItems (flight, hotel, train, local_travel)
- BookingItems reference external services via type/ref_id

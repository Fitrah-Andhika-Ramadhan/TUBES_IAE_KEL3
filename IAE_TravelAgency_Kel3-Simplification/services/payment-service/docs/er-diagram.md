# ER Diagram: Payment Service

```
+---------------------------+
|         Payments          |
+---------------------------+
| id (PK)                   |
| user_id (FK)              |
| booking_id (FK)           |
| amount                    |
| currency                  |
| payment_method_type       |
| payment_reference         |
| status                    |
| created_at                |
| updated_at                |
+---------------------------+
```

- Each Payment is linked to a User (user_id) and Booking (booking_id).
- Used for tracking and managing payment status per booking.
 (Consumer Only)

```
+-------------------+
|     Payments      |
+-------------------+
| id (PK)           |
| user_id           |
| booking_id        |
| amount            |
| method            |
| status            |
| created_at        |
+-------------------+
```

- Each payment is linked to a user and a booking (logical reference).

# Users Service Entity-Relationship Diagram (Simplified)

```
+---------------------------+
|          Users            |
+---------------------------+
| PK: id                    |
| email (U)                 |
| password                  |
| full_name                 |
| phone_number              |
| birth_date                |
| no_nik                    |
| address                   |
| kelurahan                 |
| kecamatan                 |
| kabupaten_kota            |
| province                  |
| postal_code               |
| created_at                |
+---------------------------+
| email             |
| password          |
| full_name         |
| phone_number      |
| birth_date        |
| no_nik            |
| created_at        |
+-------------------+
```

## Key Fields

### Users
- **id**: Auto-incrementing primary key
- **email**: Unique identifier for login
- **password**: Simple password storage (not hashed for simplicity)
- **full_name**: Basic user information
- **phone_number**: Contact information
- **birth_date**: User's birth date
- **no_nik**: User's national identity number
- **created_at**: Timestamps for record creation

## Notes

This is a simplified schema focusing only on the core user data needed for the travel agency system. In a production environment, you would want to implement proper password hashing, session management, and other security features.



# Booking Service API & GraphQL Specification

This service allows consumers to create and view bookings that aggregate data from Users, Flight, Hotel, Train, and Local Travel services.

## REST Endpoints

### List All Bookings
**GET /api/bookings?limit=&page=**
- Returns a paginated list of bookings.
- Response:
```json
{
  "status": "success",
  "data": [ {BookingObject...}, ... ],
  "pagination": { "page": 1, "limit": 10, "total": 100 }
}
```

### Filter Bookings
**GET /api/bookings/filter?user_id=&booking_code=&status=&payment_status=&item_type=&min_total=&max_total=&start_date=&end_date=&sort_by=&sort_order=&origin_city=&destination_city=&origin_province=&destination_province=&service_class=&provider=&travel_date_start=&travel_date_end=&page=&limit=**
- Returns bookings matching filter criteria.

### Get User Bookings
**GET /api/bookings/user/:userId**
- Returns all bookings for a user.
- Response:
```json
{
  "status": "success",
  "data": [ {BookingObject...}, ... ]
}
```

### Get Booking by ID
**GET /api/bookings/:id**
- Returns booking details and all associated items.
- Response:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "booking_code": "BOOK-ID-001",
    "user_id": 1,
    "status": "confirmed",
    "total_amount": 2500000.00,
    "currency": "IDR",
    "payment_status": "paid",
    "special_requests": null,
    "created_at": "2025-06-01T10:00:00Z",
    "updated_at": "2025-06-01T10:00:00Z",
    "items": [ {BookingItemObject...}, ... ]
  }
}
```

### Create Booking
**POST /api/bookings**
- Body:
```json
{
  "user_id": 1,
  "items": [
    { "type": "flight", "ref_id": 1, "travel_date": "2025-06-10", "quantity": 1, "unit_price": 1850000.00, "origin_city": "Jakarta", "destination_city": "Denpasar", "service_class": "Economy", "provider": "Garuda Indonesia", "details": {"flight_number": "GA100"} }
  ],
  "special_requests": "Vegetarian meal"
}
```
- Response: Same as "Get Booking by ID"

## Data Models

### Booking
- id (int)
- booking_code (string)
- user_id (int)
- status (enum: pending, confirmed, cancelled, completed)
- total_amount (decimal)
- currency (string)
- payment_status (enum: unpaid, partial, paid)
- special_requests (string)
- created_at (timestamp)
- updated_at (timestamp)
- items (array of BookingItem)

### BookingItem
- id (int)
- booking_id (int)
- type (enum: flight, hotel, train, local_travel)
- ref_id (int)
- travel_date (date)
- quantity (int)
- unit_price (decimal)
- subtotal (decimal)
- origin_city (string)
- destination_city (string)
- origin_province (string)
- destination_province (string)
- service_class (string)
- provider (string)
- details (JSON)

## GraphQL Schema (SDL)

```graphql
type Booking {
  id: ID!
  booking_code: String!
  user_id: Int!
  status: String!
  total_amount: Float!
  currency: String!
  payment_status: String!
  special_requests: String
  created_at: String!
  updated_at: String!
  items: [BookingItem!]!
}

type BookingItem {
  id: ID!
  booking_id: Int!
  type: String!
  ref_id: Int!
  travel_date: String
  quantity: Int
  unit_price: Float
  subtotal: Float
  origin_city: String
  destination_city: String
  origin_province: String
  destination_province: String
  service_class: String
  provider: String
  details: JSON
}

type Query {
  getBookingById(id: ID!): Booking
  getUserBookings(user_id: Int!): [Booking!]!
  listAllBookings(page: Int, limit: Int): [Booking!]!
  filterBookings(
    user_id: Int, booking_code: String, status: String, payment_status: String,
    min_total: Float, max_total: Float, start_date: String, end_date: String,
    item_type: String, origin_city: String, destination_city: String,
    origin_province: String, destination_province: String, service_class: String,
    provider: String, travel_date_start: String, travel_date_end: String,
    page: Int, limit: Int
  ): [Booking!]!
}

type Mutation {
  createBooking(

---

All endpoints return JSON. No authentication required for this demo version.

# Hotel Service API Specification

This service manages hotel search, details, room availability, and pricing.

## REST Endpoints

### List All Hotels
**GET /api/hotels?limit=&page=**
- Returns a paginated list of hotels.
- Response:
```json
{
  "status": "success",
  "data": [ {HotelObject...}, ... ],
  "pagination": { "page": 1, "limit": 10, "total": 100 }
}
```

### Filter Hotels
**GET /api/hotels/filter?city=&province=&property_type=&min_star_rating=&max_star_rating=&min_price=&max_price=&has_breakfast=&has_wifi=&room_size_min=&sort_by=&sort_order=&page=&limit=**
- Returns hotels matching filter criteria.

### Search Hotels
**GET /api/hotels/search?city=&province=**
- Returns hotels matching basic search criteria.

### Get Hotel Details
**GET /api/hotels/:id**
- Returns full details for a hotel by ID.

### Get Hotel Room Availability
**GET /api/hotels/:id/availability?check_in=**
- Returns room availability for a hotel on a specific check-in date.
- Response:

### Decrease Room Availability (Booking)
**POST /api/hotels/:id/availability/decrease**
- Decreases available rooms for a room type on a specific date (used when a booking is made).
- Request Body:
```json
{
  "room_type_id": 2,
  "date": "2025-06-10",
  "quantity": 1
}
```
- Response:
```json
{
  "status": "success",
  "message": "Availability decreased",
  "affectedRows": 1
}
```

### Increase Room Availability (Cancellation)
**POST /api/hotels/:id/availability/increase**
- Increases available rooms for a room type on a specific date (used when a booking is canceled).
- Request Body:
```json
{
  "room_type_id": 2,
  "date": "2025-06-10",
  "quantity": 1
}
```
- Response:
```json
{
  "status": "success",
  "message": "Availability increased",
  "affectedRows": 1
}
```

> **Note:** These endpoints are intended for backend-to-backend use (e.g., triggered by the booking service, not the front-end).
```json
{
  "status": "success",
  "hotel_id": 1,
  "check_in": "2025-06-10",
  "room_types": [
    {
      "room_type_id": 2,
      "name": "Deluxe",
      "available_rooms": 5,
      "capacity": 2
    },
    ...
  ]
}
```

### Get Hotel Room Pricing
**GET /api/hotels/:id/pricing?check_in=**
- Returns pricing for all room types for a hotel on a specific check-in date.
- Response:
```json
{
  "status": "success",
  "hotel_id": 1,
  "check_in": "2025-06-10",
  "room_types": [
    {
      "room_type_id": 2,
      "name": "Deluxe",
      "price": 800000.00,
      "currency": "IDR",
      "includes_breakfast": true
    },
    ...
  ]
}
```

## Data Models

### Hotel
- id (int)
- name (string)
- property_type (string)
- city (string)
- province (string)
- address (string)
- star_rating (float)
- description (string)
- created_at (timestamp)
- updated_at (timestamp)

### RoomType
- id (int)
- hotel_id (int)
- name (string)
- size (float)
- features (string)
- capacity (int)

### RoomAvailability
- id (int)
- room_type_id (int)
- date (date)
- available_rooms (int)

### RoomPricing
- id (int)
- room_type_id (int)
- date (date)
- price (decimal)
- currency (string)
- includes_breakfast (boolean)

## GraphQL Schema (optional, if implemented)

```graphql
type Hotel {
  id: ID!
  name: String!
  property_type: String!
  city: String!
  province: String!
  address: String
  star_rating: Float
  description: String
  created_at: String!
  updated_at: String!
}

type RoomType {
  id: ID!
  hotel_id: Int!
  name: String!
  size: Float
  features: String
  capacity: Int
}

type RoomAvailability {
  id: ID!
  room_type_id: Int!
  date: String!
  available_rooms: Int!
}

type RoomPricing {
  id: ID!
  room_type_id: Int!
  date: String!
  price: Float!
  currency: String!
  includes_breakfast: Boolean
}

type Query {
  getHotelById(id: ID!): Hotel
  searchHotels(city: String!, province: String): [Hotel!]!
  filterHotels(
    city: String, province: String, property_type: String, min_star_rating: Float, max_star_rating: Float,
    min_price: Float, max_price: Float, has_breakfast: Boolean, has_wifi: Boolean, room_size_min: Float,
    sort_by: String, sort_order: String, page: Int, limit: Int
  ): [Hotel!]!
  getRoomAvailability(hotel_id: Int!, check_in: String!): [RoomAvailability]
  getRoomPricing(hotel_id: Int!, check_in: String!): [RoomPricing]
}
```
 (Consumer Only)

This API allows consumers to search for hotels, check room availability, view pricing, and get hotel details. All endpoints are public for demo/sample use. No admin or inventory management endpoints are included.

## Endpoints

### Search Hotels
**GET /api/hotels/search**
- Query Params: location, check_in, check_out, guests
- Returns a list of matching hotels with summary info.

### Get Hotel Details
**GET /api/hotels/:id**
- Returns detailed info for a single hotel.

### Check Room Availability
**GET /api/hotels/:id/availability**
- Query Params: check_in, check_out
- Returns available room types and counts for a hotel in the given date range.

### Get Pricing
**GET /api/hotels/:id/pricing**
- Query Params: check_in, check_out
- Returns pricing info for available room types in the given date range.

---

All endpoints return JSON. No authentication required for this demo version.

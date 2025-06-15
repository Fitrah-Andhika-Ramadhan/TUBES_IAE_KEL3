# Local Travel Service API Specification

This service manages local travel search, details, availability, and pricing.

## REST Endpoints

### List All Local Travel Options
**GET /api/local-travel?limit=&page=**
- Returns a paginated list of local travel options.
- Response:
```json
{
  "status": "success",
  "data": [ {LocalTravelObject...}, ... ],
  "pagination": { "page": 1, "limit": 10, "total": 100 }
}
```

### Filter Local Travel Options
**GET /api/local-travel/filter?origin_city=&destination_city=&origin_province=&destination_province=&origin_kabupaten=&destination_kabupaten=&type=&operator_name=&provider=&route=&min_capacity=&max_capacity=&class_type=&has_ac=&has_wifi=&min_price=&max_price=&sort_by=&sort_order=&page=&limit=**
- Returns local travel options matching filter criteria.

### Search Local Travel Options
**GET /api/local-travel/search?origin_city=&destination_city=&route=**
- Returns local travel options matching basic search criteria.

### Get Local Travel Details
**GET /api/local-travel/:id**
- Returns full details for a local travel option by ID.

### Get Local Travel Availability
**GET /api/local-travel/:id/availability?date=**
- Returns unit availability for a local travel option on a specific date.
- Response:
```json
{
  "status": "success",
  "local_travel_id": 1,
  "date": "2025-06-10",
  "available_units": 5
}
```

### Decrease Local Travel Unit Availability (Booking)
**POST /api/local-travel/:id/availability/decrease**
- Decreases available units for a local travel option on a specific date (used when a booking is made).
- Request Body:
```json
{
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

### Increase Local Travel Unit Availability (Cancellation)
**POST /api/local-travel/:id/availability/increase**
- Increases available units for a local travel option on a specific date (used when a booking is canceled).
- Request Body:
```json
{
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

### Get Local Travel Pricing
**GET /api/local-travel/:id/pricing?date=**
- Returns pricing for a local travel option on a specific date.
- Response:
```json
{
  "status": "success",
  "local_travel_id": 1,
  "date": "2025-06-10",
  "price": 120000.00,
  "currency": "IDR",
  "class_type": "Ekonomi"
}
```

## Data Models

### LocalTravel
- id (int)
- provider (string)
- operator_name (string)
- type (string)
- origin_city (string)
- destination_city (string)
- origin_kabupaten (string)
- destination_kabupaten (string)
- origin_province (string)
- destination_province (string)
- route (string)
- capacity (int)
- features (string)
- description (string)
- created_at (timestamp)
- updated_at (timestamp)

### LocalTravelAvailability
- id (int)
- local_travel_id (int)
- date (date)
- available_units (int)

### LocalTravelPricing
- id (int)
- local_travel_id (int)
- date (date)
- price (decimal)
- currency (string)
- class_type (string)

## GraphQL Schema (optional, if implemented)

```graphql
type LocalTravel {
  id: ID!
  provider: String!
  operator_name: String!
  type: String!
  origin_city: String!
  destination_city: String!
  origin_kabupaten: String
  destination_kabupaten: String
  origin_province: String!
  destination_province: String!
  route: String
  capacity: Int
  features: String
  description: String
  created_at: String!
  updated_at: String!
}

type LocalTravelAvailability {
  id: ID!
  local_travel_id: Int!
  date: String!
  available_units: Int!
}

type LocalTravelPricing {
  id: ID!
  local_travel_id: Int!
  date: String!
  price: Float!
  currency: String!
  class_type: String
}

type Query {
  getLocalTravelById(id: ID!): LocalTravel
  searchLocalTravel(origin_city: String!, destination_city: String, route: String): [LocalTravel!]!
  filterLocalTravel(
    origin_city: String, destination_city: String, origin_province: String, destination_province: String,
    origin_kabupaten: String, destination_kabupaten: String, type: String, operator_name: String, provider: String,
    route: String, min_capacity: Int, max_capacity: Int, class_type: String, has_ac: Boolean, has_wifi: Boolean,
    min_price: Float, max_price: Float, sort_by: String, sort_order: String, page: Int, limit: Int
  ): [LocalTravel!]!
  getLocalTravelAvailability(local_travel_id: Int!, date: String!): LocalTravelAvailability
  getLocalTravelPricing(local_travel_id: Int!, date: String!): LocalTravelPricing
}
```
 (Consumer Only)

This service allows consumers to search for, view, and book local travel options (e.g., taxi, shuttle, ride-share).

## REST Endpoints

### Search Local Travel Options
**GET /api/local-travel/search?location=...&date=...**
- Returns available local travel options for a given location and date.

### Get Local Travel Details
**GET /api/local-travel/:id**
- Returns details for a specific local travel option.

### Get Availability
**GET /api/local-travel/:id/availability?date=...**
- Returns availability for a local travel option on a specific date.

### Get Pricing
**GET /api/local-travel/:id/pricing?date=...**
- Returns pricing for a local travel option on a specific date.

---

All endpoints return JSON. No authentication required for this demo version.

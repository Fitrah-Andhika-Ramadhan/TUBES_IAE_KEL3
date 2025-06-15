# Flight Service API Specification

This service manages flight search, details, availability, and pricing.

## REST Endpoints

### List All Flights
**GET /api/flights?limit=&page=**
- Returns a paginated list of flights.
- Response:
```json
{
  "status": "success",
  "data": [ {FlightObject...}, ... ],
  "pagination": { "page": 1, "limit": 10, "total": 100 }
}
```

### Filter Flights
**GET /api/flights/filter?origin_city=&destination_city=&origin_code=&destination_code=&airline_code=&airline_name=&flight_class=&departure_date=&min_price=&max_price=&sort_by=&sort_order=&page=&limit=**
- Returns flights matching filter criteria.

### Search Flights
**GET /api/flights/search?origin_city=&destination_city=&date=**
- Returns flights matching basic search criteria.

### Get Flight Details
**GET /api/flights/:id**
- Returns full details for a flight by ID.

### Get Flight Availability
**GET /api/flights/:id/availability?date=**
- Returns seat availability for a flight on a specific date.
- Response:
```json
{
  "status": "success",
  "flight_id": 1,
  "date": "2025-06-10",
  "available_seats": 120
}
```

### Decrease Flight Seat Availability (Booking)
**POST /api/flights/:id/availability/decrease**
- Decreases available seats for a flight on a specific date (used when a booking is made).
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

### Increase Flight Seat Availability (Cancellation)
**POST /api/flights/:id/availability/increase**
- Increases available seats for a flight on a specific date (used when a booking is canceled).
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

### Get Flight Pricing
**GET /api/flights/:id/pricing?date=**
- Returns pricing for a flight on a specific date.
- Response:
```json
{
  "status": "success",
  "flight_id": 1,
  "date": "2025-06-10",
  "price": 1850000.00,
  "currency": "IDR"
}
```

## Data Models

### Flight
- id (int)
- flight_number (string)
- origin_code (string)
- origin_name (string)
- origin_city (string)
- destination_code (string)
- destination_name (string)
- destination_city (string)
- departure_time (datetime)
- arrival_time (datetime)
- airline_code (string)
- airline_name (string)
- flight_class (string)
- created_at (timestamp)
- updated_at (timestamp)

### FlightAvailability
- id (int)
- flight_id (int)
- travel_date (date)
- available_seats (int)

### FlightPricing
- id (int)
- flight_id (int)
- travel_date (date)
- price (decimal)
- currency (string)

## GraphQL Schema (optional, if implemented)

```graphql
type Flight {
  id: ID!
  flight_number: String!
  origin_code: String!
  origin_name: String!
  origin_city: String!
  destination_code: String!
  destination_name: String!
  destination_city: String!
  departure_time: String!
  arrival_time: String!
  airline_code: String!
  airline_name: String!
  flight_class: String!
  created_at: String!
  updated_at: String!
}

type FlightAvailability {
  id: ID!
  flight_id: Int!
  travel_date: String!
  available_seats: Int!
}

type FlightPricing {
  id: ID!
  flight_id: Int!
  travel_date: String!
  price: Float!
  currency: String!
}

type Query {
  getFlightById(id: ID!): Flight
  searchFlights(origin_city: String!, destination_city: String!, date: String!): [Flight!]!
  filterFlights(
    origin_city: String, destination_city: String, origin_code: String, destination_code: String,
    airline_code: String, airline_name: String, flight_class: String, departure_date: String,
    min_price: Float, max_price: Float, sort_by: String, sort_order: String, page: Int, limit: Int
  ): [Flight!]!
  getFlightAvailability(flight_id: Int!, date: String!): FlightAvailability
  getFlightPricing(flight_id: Int!, date: String!): FlightPricing
}
```
 (Consumer Only)

This API allows consumers to search for flights, check availability, view pricing, and get flight details. All endpoints are public for demo/sample use. No admin or inventory management endpoints are included.

## Endpoints

### Search Flights
**GET /api/flights/search**
- Query Params: origin, destination, date, passengers
- Returns a list of matching flights with summary info.

### Get Flight Details
**GET /api/flights/:id**
- Returns detailed info for a single flight.

### Check Availability
**GET /api/flights/:id/availability**
- Returns seat availability for a flight.

### Get Pricing
**GET /api/flights/:id/pricing**
- Returns pricing info for a flight.

---

All endpoints return JSON. No authentication required for this demo version.

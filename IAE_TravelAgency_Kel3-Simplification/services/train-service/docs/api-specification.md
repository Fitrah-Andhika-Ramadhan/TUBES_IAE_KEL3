# Train Service API Specification

This service manages train search, details, availability, and pricing.

## REST Endpoints

### List All Trains
**GET /api/trains?limit=&page=**
- Returns a paginated list of trains.
- Response:
```json
{
  "status": "success",
  "data": [ {TrainObject...}, ... ],
  "pagination": { "page": 1, "limit": 10, "total": 100 }
}
```

### Filter Trains
**GET /api/trains/filter?origin_station_code=&destination_station_code=&origin_city=&destination_city=&origin_province=&destination_province=&train_class=&subclass=&train_type=&operator=&min_duration=&max_duration=&price_category=&min_price=&max_price=&departure_date=&sort_by=&sort_order=&page=&limit=**
- Returns trains matching filter criteria.

### Search Trains
**GET /api/trains/search?origin_station_code=&destination_station_code=&origin_city=&destination_city=&origin_province=&destination_province=**
- Returns trains matching basic search criteria.

### Get Train Details
**GET /api/trains/:id**
- Returns full details for a train by ID.

### Get Train Availability
**GET /api/trains/:id/availability?date=**
- Returns seat availability for a train on a specific date.
- Response:
```json
{
  "status": "success",
  "train_id": 1,
  "date": "2025-06-10",
  "available_seats": 120
}
```

### Decrease Train Seat Availability (Booking)
**POST /api/trains/:id/availability/decrease**
- Decreases available seats for a train on a specific date (used when a booking is made).
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

### Increase Train Seat Availability (Cancellation)
**POST /api/trains/:id/availability/increase**
- Increases available seats for a train on a specific date (used when a booking is canceled).
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

### Get Train Pricing
**GET /api/trains/:id/pricing?date=**
- Returns pricing for a train on a specific date.
- Response:
```json
{
  "status": "success",
  "train_id": 1,
  "date": "2025-06-10",
  "price": 350000.00,
  "currency": "IDR",
  "subclass": "Eksekutif",
  "price_category": "Promo"
}
```

## Data Models

### Train
- id (int)
- train_number (string)
- train_name (string)
- train_type (string)
- operator (string)
- origin_station_code (string)
- origin_station_name (string)
- origin_city (string)
- origin_province (string)
- destination_station_code (string)
- destination_station_name (string)
- destination_city (string)
- destination_province (string)
- departure_time (datetime)
- arrival_time (datetime)
- duration (int, minutes)
- train_class (string)
- subclass (string)
- price_category (string)
- created_at (timestamp)
- updated_at (timestamp)

### TrainAvailability
- id (int)
- train_id (int)
- travel_date (date)
- available_seats (int)

### TrainPricing
- id (int)
- train_id (int)
- travel_date (date)
- price (decimal)
- currency (string)
- subclass (string)
- price_category (string)

## GraphQL Schema (optional, if implemented)

```graphql
type Train {
  id: ID!
  train_number: String!
  train_name: String!
  train_type: String!
  operator: String!
  origin_station_code: String!
  origin_station_name: String!
  origin_city: String!
  origin_province: String!
  destination_station_code: String!
  destination_station_name: String!
  destination_city: String!
  destination_province: String!
  departure_time: String!
  arrival_time: String!
  duration: Int
  train_class: String
  subclass: String
  price_category: String
  created_at: String!
  updated_at: String!
}

type TrainAvailability {
  id: ID!
  train_id: Int!
  travel_date: String!
  available_seats: Int!
}

type TrainPricing {
  id: ID!
  train_id: Int!
  travel_date: String!
  price: Float!
  currency: String!
  subclass: String
  price_category: String
}

type Query {
  getTrainById(id: ID!): Train
  searchTrains(origin_station_code: String, destination_station_code: String, origin_city: String, destination_city: String, origin_province: String, destination_province: String): [Train!]!
  filterTrains(
    origin_station_code: String, destination_station_code: String, origin_city: String, destination_city: String,
    origin_province: String, destination_province: String, train_class: String, subclass: String, train_type: String,
    operator: String, min_duration: Int, max_duration: Int, price_category: String, min_price: Float, max_price: Float,
    departure_date: String, sort_by: String, sort_order: String, page: Int, limit: Int
  ): [Train!]!
  getTrainAvailability(train_id: Int!, date: String!): TrainAvailability
  getTrainPricing(train_id: Int!, date: String!): TrainPricing
}
```
 (Consumer Only)

This service allows consumers to search for, view, and book train journeys.

## REST Endpoints

### Search Trains
**GET /api/trains/search?origin=...&destination=...&date=...**
- Returns available trains for a given route and date.

### Get Train Details
**GET /api/trains/:id**
- Returns details for a specific train.

### Get Availability
**GET /api/trains/:id/availability?date=...**
- Returns seat availability for a train on a specific date.

### Get Pricing
**GET /api/trains/:id/pricing?date=...**
- Returns pricing for a train on a specific date.

---

All endpoints return JSON. No authentication required for this demo version.

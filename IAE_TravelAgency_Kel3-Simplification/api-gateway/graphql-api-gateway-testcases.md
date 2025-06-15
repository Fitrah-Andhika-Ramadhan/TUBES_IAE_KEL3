# Train Service GraphQL Test Cases

## 1. Filter Trains (with Pagination & Filters)
```graphql
query {
  filterTrains(
    filters: {
      origin_station_code: "GMR"
      destination_station_code: "BD"
      departure_date: "2025-06-15"
      train_class: "Eksekutif"
      min_price: 100000
      max_price: 500000
    }
    sort: { sortBy: "price", sortOrder: ASC }
    pagination: { page: 1, limit: 5 }
  ) {
    trains {
      id
      train_number
      origin_station_name
      destination_station_name
      origin_city
      destination_city
      departure_time
      arrival_time
      price
      seats_available
      train_class
      subclass
      train_type
      operator
      duration
    }
    pagination {
      totalItems
      totalPages
      currentPage
      pageSize
      hasNextPage
      hasPrevPage
    }
  }
}
```

## 2. Get Train by ID
```graphql
query {
  train(id: "TRAIN_ID_HERE") {
    id
    train_number
    origin_station_name
    destination_station_name
    origin_city
    destination_city
    departure_time
    arrival_time
    price
    seats_available
    train_class
    subclass
    train_type
    operator
    duration
  }
}
```

## 3. List Trains (Basic Query)
```graphql
query {
  trains(origin: "GMR", destination: "BD", date: "2025-06-15") {
    id
    train_number
    origin_station_name
    destination_station_name
    departure_time
    arrival_time
    price
    seats_available
    train_class
    operator
  }
}
```

## 4. Search Trains (Simple Search)
```graphql
query {
  searchTrains(origin: "GMR", destination: "BD", date: "2025-06-15") {
    id
    train_number
    origin_station_name
    destination_station_name
    departure_time
    arrival_time
    price
    seats_available
    train_class
    operator
  }
}
```

## 5. Get Train Pricing
```graphql
query {
  trainPricing(id: "TRAIN_ID_HERE", date: "2025-06-15") {
    basePrice
    taxes
    total
    currency
    discounts
  }
}
```

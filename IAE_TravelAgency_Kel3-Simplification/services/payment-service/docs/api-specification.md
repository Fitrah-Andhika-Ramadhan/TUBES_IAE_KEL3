# Payment Service API Specification

This service manages payment initiation, status tracking, and payment history for bookings.

## REST Endpoints

### Initiate Payment
**POST /api/payments/**
- Body:
```json
{
  "userId": 1,
  "bookingId": 1,
  "amount": 3500000.00,
  "method": "virtual_account_bca"
}
```
- Response:
```json
{
  "status": "success",
  "paymentId": 10,
  "status": "pending"
}
```

### Get Payment Status
**GET /api/payments/:id/status**
- Returns the status of a specific payment.
- Response:
```json
{
  "status": "success",
  "paymentId": 10,
  "status": "completed"
}
```

### Get User Payment History
**GET /api/payments/user/:userId**
- Returns all payments for a user.
- Response:
```json
{
  "status": "success",
  "data": [ {PaymentObject...}, ... ]
}
```

## Data Model

### Payment
- id (int)
- user_id (int)
- booking_id (int)
- amount (decimal)
- currency (string, default: 'IDR')
- payment_method_type (string)
- payment_reference (string)
- status (enum: pending, completed, failed, expired)
- created_at (timestamp)
- updated_at (timestamp)

## GraphQL Schema (optional, if implemented)

```graphql
type Payment {
  id: ID!
  user_id: Int!
  booking_id: Int!
  amount: Float!
  currency: String!
  payment_method_type: String!
  payment_reference: String
  status: String!
  created_at: String!
  updated_at: String!
}

type Query {
  getPaymentById(id: ID!): Payment
  getUserPayments(user_id: Int!): [Payment!]!
}

type Mutation {
  initiatePayment(
    user_id: Int!,
    booking_id: Int!,
    amount: Float!,
    payment_method_type: String!
  ): Payment
}
```
 (Consumer Only)

This service allows consumers to initiate payments for bookings and view payment status/history.

## REST Endpoints

### Initiate Payment
**POST /api/payments**
- Body: { userId, bookingId, amount, method }
- Returns payment initiation status and payment ID.

### Get Payment Status
**GET /api/payments/:id/status**
- Returns current payment status for a payment ID.

### Get User Payment History
**GET /api/payments/user/:userId**
- Returns all payments for a user.

---

All endpoints return JSON. No authentication required for this demo version.

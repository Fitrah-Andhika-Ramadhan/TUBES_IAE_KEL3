# Users Service API Specification

This service manages user registration, authentication, and profile management.

## REST Endpoints

### List All Users
**GET /api/users?limit=&page=**
- Returns a paginated list of users.
- Response:
```json
{
  "status": "success",
  "data": [ {UserObject...}, ... ],
  "pagination": { "page": 1, "limit": 10, "total": 100 }
}
```

### Filter Users
**GET /api/users/filter?email=&full_name=&phone_number=&min_age=&max_age=&start_date=&end_date=&kabupaten_kota=&province=&postal_code=&sort_by=&sort_order=&page=&limit=**
- Returns users matching filter criteria.

### Register
**POST /api/users/register**
- Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "User Name",
  "phone_number": "+6281234567890",
  "birth_date": "1990-01-01",
  "no_nik": "3173082501900001",
  "address": "Jl. Example No. 1",
  "kelurahan": "Kelurahan",
  "kecamatan": "Kecamatan",
  "kabupaten_kota": "Kabupaten/Kota",
  "province": "DKI Jakarta",
  "postal_code": "10250"
}
```
- Response: User object (without password)

### Login
**POST /api/users/login**
- Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- Response: User object (without password) if successful

### Get Profile
**GET /api/users/:id**
- Returns user profile by ID.

### Update Profile
**PUT /api/users/:id**
- Body: Same as registration (all fields optional except email)
- Response: Updated user object

### Delete User
**DELETE /api/users/:id**
- Deletes the user by ID.
- Response: { status: 'success', message: 'User deleted' }

## Data Model

### User
- id (int)
- email (string, unique)
- password (string, not returned in API)
- full_name (string)
- phone_number (string)
- birth_date (date)
- no_nik (string)
- address (string)
- kelurahan (string)
- kecamatan (string)
- kabupaten_kota (string)
- province (string)
- postal_code (string)
- created_at (timestamp)

## GraphQL Schema (optional, if implemented)

```graphql
type User {
  id: ID!
  email: String!
  full_name: String!
  phone_number: String
  birth_date: String!
  no_nik: String!
  address: String
  kelurahan: String
  kecamatan: String
  kabupaten_kota: String
  province: String
  postal_code: String
  created_at: String!
}

type Query {
  getUserById(id: ID!): User
  listAllUsers(page: Int, limit: Int): [User!]!
  filterUsers(
    email: String, full_name: String, phone_number: String,
    min_age: Int, max_age: Int, start_date: String, end_date: String,
    kabupaten_kota: String, province: String, postal_code: String,
    sort_by: String, sort_order: String, page: Int, limit: Int
  ): [User!]!
}

type Mutation {
  register(
    email: String!,
    password: String!,
    full_name: String!,
    phone_number: String,
    birth_date: String!,
    no_nik: String!,
    address: String,
    kelurahan: String,
    kecamatan: String,
    kabupaten_kota: String,
    province: String,
    postal_code: String
  ): User
  login(email: String!, password: String!): User
  updateProfile(
    id: ID!,
    full_name: String,
    phone_number: String,
    birth_date: String,
    no_nik: String,
    address: String,
    kelurahan: String,
    kecamatan: String,
    kabupaten_kota: String,
    province: String,
    postal_code: String
  ): User
  deleteUser(id: ID!): Boolean
}
```
 (Simplified)

## Overview
The Users Service manages user accounts and profile information for the Travel Agency System. It provides basic endpoints for user registration, login, and profile management.

## Base URL
```
/api/users
```

## Endpoints

### User Registration
**Endpoint:** `POST /register`  
**Description:** Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2025-06-07T08:00:00Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Email is already registered"
}
```

### User Login
**Endpoint:** `POST /login`  
**Description:** Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

### Get User Profile
**Endpoint:** `GET /users/{id}`  
**Description:** Retrieve a user's profile information.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "preferences": {
      "currency": "USD",
      "language": "en"
    },
    "createdAt": "2025-06-01T08:00:00Z",
    "updatedAt": "2025-06-07T08:00:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "User not found"
}
```

### Update User Profile
**Endpoint:** `PUT /users/{id}`  
**Description:** Update a user's profile information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1987654321",
  "preferences": {
    "currency": "EUR",
    "language": "fr"
  }
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "+1987654321",
    "preferences": {
      "currency": "EUR",
      "language": "fr"
    },
    "updatedAt": "2025-06-07T09:00:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "User not found"
}
```


### Delete User
**Endpoint:** `DELETE /users/{id}`  
**Description:** Delete a user account.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "User not found"
}
```

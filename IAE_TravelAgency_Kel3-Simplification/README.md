# Travel Agency Microservices System

## 1. Overview

This project demonstrates a modern, scalable travel agency platform using a microservices architecture. The system consists of seven independently deployed services (Users, Payment, Booking, Flight, Local Travel, Hotel, Train), an API Gateway with GraphQL aggregation, and a React-based frontend using Apollo Client. The architecture supports robust travel management, including user authentication, booking, payments, and travel inventory, with a focus on modularity and extensibility.

For a detailed, phase-by-phase development plan, see [`project_task.md`](./project_task.md).

## 2. System Architecture

The architecture is composed of the following microservices and components:

- **Users Service:** Handles user registration, authentication, and profile management.
- **Payment Service:** Processes and records payments for bookings (integrated via GraphQL mutations).
- **Booking Service:** Manages travel bookings, including creation, updates, cancellations, and inventory coordination.
- **Flight Service:** Manages flight schedules, availability, and pricing.
- **Hotel Service:** Manages hotel listings, room availability, and pricing.
- **Train Service:** Manages train schedules, seat availability, and pricing.
- **Local Travel Service:** Handles local transportation options (e.g., car rentals, transfers).
- **API Gateway:** Serves as the single entry point for frontend clients. Aggregates all microservices via GraphQL, providing a unified schema and endpoint. Handles authentication, routing, and data federation.
- **Frontend (React):** User interface built with React and Material-UI, using Apollo Client for GraphQL communication.

### 2.1. Communication & Patterns

- **Internal Service-to-Service:** RESTful APIs using HTTP/JSON for inter-service communication (future: event-driven enhancements possible).
- **API Gateway:** All client requests go through the API Gateway, which exposes a GraphQL schema federating all microservices.
- **Frontend:** Connects to the API Gateway via Apollo Client, using GraphQL queries and mutations for all data operations (including payments).

#### Architecture Diagram (Textual)

```
[Client (React/Apollo)]
        |
        v
   [API Gateway (GraphQL)]
    |    |    |    |    |    |    |
    v    v    v    v    v    v    v
[Users][Payment][Booking][Flight][Hotel][Train][LocalTravel]
```

- All microservices are independently deployable and scalable.
- The API Gateway centralizes authentication, request routing, and data aggregation.
- The frontend is fully migrated to GraphQL (REST endpoints are being deprecated).

## 3. Microservices Overview

See [`project_guide/api_spec.md`](./project_guide/api_spec.md) for detailed API and GraphQL schema documentation.

**Users Service**
- User registration, login, JWT authentication, profiles.

**Payment Service**
- Payment processing, transaction history, integration with Booking and GraphQL mutations.

**Booking Service**
- Booking CRUD, inventory management (calls Flight, Hotel, Train, Local Travel services as needed).

**Flight Service**
- Flight schedules, seat inventory, pricing.

**Hotel Service**
- Hotel listings, room inventory, pricing.

**Train Service**
- Train schedules, seat inventory, pricing.

**Local Travel Service**
- Local transportation options, availability, and pricing.

**API Gateway**
- GraphQL endpoint federating all services, central authentication, request aggregation.

**Frontend**
- React + Material-UI, Apollo Client for GraphQL, fully decoupled from backend implementation details.

### 3.2. Flight Service

*   **Base URL:** `/flights`
*   **Description:** Manages flight data, availability, and inventory.
*   **Key Endpoints:**
    *   `GET /flights`: List all flights.
    *   `GET /flights/search`: Search for flights.
    *   `GET /flights/{id}`: Retrieve a specific flight.
    *   `GET /flights/{id}/availability`: Check seat availability.
    *   `POST /flights/decrement-seat`: Internal endpoint called by Booking Service.
    *   `POST /flights/increment-seat`: Internal endpoint called by Booking Service.
    *   `GET /bookings/by-flight/{flightId}`: Get bookings for a specific flight.

### 3.3. Hotel Service

*   **Base URL:** `/hotels`
*   **Description:** Manages hotel data, room availability, and inventory.
*   **Key Endpoints:**
    *   `GET /hotels`: List all hotels.
    *   `GET /hotels/{id}`: Retrieve a specific hotel.
    *   `GET /hotels/{id}/availability`: Check room availability.
    *   `POST /hotels/decrement-room`: Internal endpoint called by Booking Service.
    *   `POST /hotels/increment-room`: Internal endpoint called by Booking Service.
    *   `GET /bookings/by-hotel/{hotelId}`: Get bookings for a specific hotel.

### 3.4. Consumer Interface Backend

*   **Base URL:** `/` (relative to its own deployment)
*   **Description:** Acts as the primary entry point for client applications, aggregating data from other services.
*   **Key Endpoints:**
    *   `GET /`: Health check.
    *   `GET /bookings`: List all bookings (proxies to Booking Service).
    *   `POST /bookings`: Create a new booking (proxies to Booking Service).
    *   `GET /flights`: List all flights (proxies to Flight Service).
    *   `GET /hotels`: List all hotels (proxies to Hotel Service).

## 4. Technology Stack

*   **Backend:** Node.js
*   **Database:** MySQL (per service, as implied by microservice architecture)
*   **Communication:** HTTP, JSON
*   **Architecture:** RESTful Microservices

## 5. Setup and Running

## 4. Development & Deployment

See [`project_task.md`](./project_task.md) for the current phased plan and setup instructions.

- Each microservice runs independently (see individual service README or package.json for scripts).
- API Gateway must be started before the frontend.
- Frontend: install dependencies and run using standard React scripts.
- Environment configuration (ports, DB URLs, secrets) is managed via `.env` files in each service.

## 5. Technology Stack

- **Backend:** Node.js, Express, Apollo Server (GraphQL), REST (internal)
- **Frontend:** React, Material-UI, Apollo Client
- **Database:** Each service manages its own DB (MongoDB, PostgreSQL, or SQLite as appropriate)
- **Authentication:** JWT (handled by Users Service and API Gateway)

---

For the complete list of actionable tasks, see [`project_task.md`](./project_task.md).
For API details, see [`project_guide/api_spec.md`](./project_guide/api_spec.md).

A modern, scalable travel agency platform built with Node.js microservices, an API Gateway, and a React/Material-UI frontend. Supports booking, payments, user management, and travel search (flights, hotels, trains, local travel).

## Features
- User registration, authentication, and profile management
- Search and book flights, hotels, trains, and local travel
- Booking management (create, modify, cancel)
- Integrated payment workflows
- Responsive React/Material-UI frontend
- API Gateway for unified access and orchestration
- Structured logging, monitoring, and error handling

## Architecture
```
Frontend (React) ⇄ API Gateway ⇄ [Users | Booking | Payment | Flight | Hotel | Train | Local Travel]
```
- All cross-service and frontend-service communication is routed through the API Gateway for security, aggregation, and monitoring.
- Each microservice is independently deployable and exposes REST (OpenAPI) or GraphQL (SDL) APIs.

## Tech Stack
- **Frontend:** React 19, Material-UI, React Router
- **API Gateway:** Node.js, Express, Apollo Server (GraphQL), REST Proxy
- **Microservices:** Node.js, Express, MySQL, REST/GraphQL
- **Database:** MySQL (per service)
- **Other:** Winston (logging), Docker (recommended for deployment)

## Directory Structure
```
services/
  users-service/
  booking-service/
  payment-service/
  flight-service/
  hotel-service/
  train-service/
  local-travel-service/
frontend/
project_guide/
  api_docs/
  user_guide.md
  communication-flow.md
  logging_monitoring_error_handling.md
```

## Getting Started
### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MySQL server

### Configure Environment
- Each service has a `.env.example`. Copy to `.env` and set DB credentials, ports, etc.
- Example:
  ```bash
  cd services/users-service
  cp .env.example .env
  # Edit .env as needed
  ```

### Install Dependencies
```bash
cd services/<service-name>
npm install
# or yarn install
```
Repeat for all services and `frontend/`.

### Set Up Databases
- Ensure MySQL is running.
- Create databases and tables as per each service's docs or migration scripts.

### Run Services
```bash
cd services/<service-name>
npm start
```
Repeat for all services. Start the API Gateway and then the frontend:
```bash
cd frontend
npm start
```

## API Documentation
- All REST APIs: OpenAPI/Swagger specs in each service's `docs/` folder
- Booking GraphQL API: SDL schema in `booking-service/docs/schema.graphql`
- Central index: [`project_guide/api_docs/README.md`](./project_guide/api_docs/README.md)

## User Guide & Communication Flow
- [User Guide](./project_guide/user_guide.md): End-user workflows and UI navigation
- [Communication Flow](./project_guide/communication-flow.md): Service interaction and architecture

## API Documentation

For detailed API specifications, including request/response examples for all endpoints, please refer to the [API Specification Document](./project_guide/api_spec.md).

## Project Guide

Further details about the project plan, communication flows, and tasks can be found in the `project_guide` directory.

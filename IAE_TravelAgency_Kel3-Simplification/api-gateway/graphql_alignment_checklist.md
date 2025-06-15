# API Gateway & Microservice Alignment Checklist

This document provides a comprehensive, step-by-step procedure to verify and ensure complete alignment between the API Gateway's GraphQL schema/resolvers, the underlying microservice REST endpoints, the corresponding controller logic, and the database schema/data. Use this as an instruction prompt for automated or manual audits, and update progress as you go.

---

## 1. GraphQL Schema & Resolver Mapping

- [ ] **List all GraphQL queries and mutations** in the API Gateway for each domain (Train, Flight, Hotel, Local Travel, Booking, Payment, Users).
    - File(s) to check:
        - `api-gateway/graphql/train.js`
        <!-- 
        Train Domain (2025-06-10):
        GraphQL Operations (from api-gateway/graphql/train.js):
          Queries:
            - trains(args...): Dynamically calls GET http://localhost:3001/api/trains?args... (Controller for this route, `listAllTrains`, only uses `page` & `limit` from args, ignoring others. MISALIGNED.)
            - train(id): Calls GET http://localhost:3001/api/trains/:id
            - searchTrains(origin, destination, date): Calls GET http://localhost:3001/api/trains/search?params...
            - trainPricing(id, date): Calls GET http://localhost:3001/api/trains/:id/pricing?date=...
            - filterTrains(filters, sort, pagination): Calls GET http://localhost:3001/api/trains/filter?params...
          Mutations:
            - createTrain(name, origin, destination, etc.): Attempts POST http://localhost:3001/api/trains (REST endpoint & controller logic missing)

        REST Endpoints & Controller Logic (from services/train-service/.../trainRoutes.js & .../trainController.js - Reviewed 2025-06-10):
          - GET / (trainController.listAllTrains - Supports `page`, `limit`. Ignores other query params.)
          - GET /filter (trainController.filterTrains - Supports comprehensive filters, sort, pagination. Seems robust.)
          - GET /search (trainController.searchTrains - Supports location-based filters: `origin_station_code`, `destination_station_code`, `origin_city`, `destination_city`, `origin_province`, `destination_province`.)
          - GET /:id (trainController.getTrainDetails - Fetches by ID.)
          - GET /:id/availability (trainController.getAvailability - Takes `date` query param. Returns `available_seats`.)
          - GET /:id/pricing (trainController.getPricing - Takes `date` query param. Returns `price`, `currency`.)
          - POST /:id/availability/decrease (trainController.decreaseAvailability - Takes `date`, `quantity` from body. Seems suitable for GQL mutation.)
          - POST /:id/availability/increase (trainController.increaseAvailability - Takes `date`, `quantity` from body. Seems suitable for GQL mutation.)
          - OMISSION: No POST / route or `createTrain` controller logic for creating trains.

        Alignment Issues & Notes for Train Domain (Updated 2025-06-10 after GQL resolver & controller review):
        1.  **CRITICAL MISALIGNMENT (Missing REST Endpoint & Controller Logic for `createTrain`)**: The `createTrain` GraphQL mutation resolves to `POST http://localhost:3001/api/trains`. However, `trainRoutes.js` does not define this route, and `trainController.js` has no corresponding `createTrain` function.
            - *Action*: Add `router.post('/', trainController.createTrain);` to `trainRoutes.js` and implement `createTrain` in `trainController.js` (including model interaction for creating a new train record).

        2.  **GraphQL Mutations for Core Functionality (Controller Ready) [COMPLETED 2025-06-10]:** REST endpoints `POST /:id/availability/decrease` and `increase` exist, and `trainController.js` has `decreaseAvailability` and `increaseAvailability` functions. Corresponding GraphQL mutations `decreaseTrainAvailability` and `increaseTrainAvailability` are now implemented in `api-gateway/graphql/train.js` and correctly mapped to these REST endpoints.

        3.  **CRITICAL MISALIGNMENT & REDUNDANCY (`Query.trains` vs. `Query.filterTrains`)**:
            - The `Query.trains` GraphQL resolver dynamically appends all `args` as query parameters to `GET http://localhost:3001/api/trains`.
            - However, `trainController.listAllTrains` (handling `GET /api/trains`) *only* processes `page` and `limit` for pagination and ignores all other filter parameters sent by the GraphQL resolver.
            - This makes `Query.trains` behave merely as a paginated list of *all* trains, regardless of other filters passed to it from GraphQL. It misleadingly appears to support filtering it doesn't actually perform at the controller level.
            - `Query.filterTrains` correctly calls `GET /api/trains/filter`, which is handled by `trainController.filterTrains` supporting comprehensive filtering, sorting, and pagination.
            - `Query.searchTrains` calls `GET /api/trains/search` (handled by `trainController.searchTrains`) for basic location searches.
            - *Action*: 
                a. **Recommended:** Modify the `Query.trains` GraphQL resolver to *only* accept and pass `page` and `limit` arguments to `GET /api/trains`. Rename it to something like `listAllTrainsPaginated` for clarity if needed. This makes its behavior explicit.
                b. Deprecate `Query.searchTrains` if its functionality is fully covered by `Query.filterTrains` (e.g., `filterTrains(filters: { origin_city: "A", destination_city: "B" })`).
                c. Ensure frontend uses `Query.filterTrains` for all detailed filtering needs.

        4.  **Consideration (GraphQL Query for Availability - Controller Ready)**: `trainController.getAvailability` exists and functions as expected. A dedicated GraphQL query like `trainAvailability(id: ID!, date: String)` could be useful.
            - *Action*: Evaluate need based on frontend requirements. Controller logic is present and supports this.
        -->
        - `api-gateway/graphql/flight.js`
        <!-- 
        Flight Domain (2025-06-10):
        GraphQL Operations (from api-gateway/graphql/flight.js):
          Queries:
            - flights(args...): If origin/dest/date args present, calls GET /api/flights/filter with ONLY those args. Otherwise calls GET /api/flights. (PARTIALLY MISALIGNED - doesn't pass other potential filters to /filter)
            - flight(id): Calls GET /api/flights/:id
            - searchFlights(origin, destination, date): Calls GET /api/flights/search?params... (Likely redundant with improved flights/filterFlights)
            - flightPricing(id, date): Calls GET /api/flights/:id/pricing?date=...
            - filterFlights(filters, sort, pagination): Calls GET /api/flights/filter?params... (Most comprehensive)
          Mutations:
            - createFlight(airline, flight_number, etc.): Attempts POST /api/flights (REST endpoint & controller logic missing)

        REST Endpoints & Controller Logic (from services/flight-service/.../flightRoutes.js & .../flightController.js - Reviewed 2025-06-10):
          - GET / (flightController.listAllFlights - Supports `page`, `limit`. Ignores other query params.)
          - GET /filter (flightController.filterFlights - Supports comprehensive filters including origin/dest/date, airline, class, price, sort, pagination. Seems robust.)
          - GET /search (flightController.searchFlights - Supports `origin_city`, `destination_city`, `date`.)
          - GET /:id (flightController.getFlightDetails - Fetches by ID.)
          - GET /:id/availability (flightController.getAvailability - Takes `date` query param.)
          - GET /:id/pricing (flightController.getPricing - Takes `date` query param.)
          - POST /:id/availability/decrease (flightController.decreaseAvailability - Takes `date`, `quantity` from body. Suitable for GQL.)
          - POST /:id/availability/increase (flightController.increaseAvailability - Takes `date`, `quantity` from body. Suitable for GQL.)
          - OMISSION: No POST / route or `createFlight` controller logic for creating flights.

        Alignment Issues & Notes for Flight Domain (Updated 2025-06-10 after GQL resolver & controller review):
        1.  **CRITICAL MISALIGNMENT (Missing REST Endpoint & Controller Logic for `createFlight`)**: The `createFlight` GraphQL mutation resolves to `POST http://localhost:3003/api/flights`. However, `flightRoutes.js` does not define this route, and `flightController.js` has no corresponding `createFlight` function.
            - *Action*: Add `router.post('/', flightController.createFlight);` to `flightRoutes.js` and implement `createFlight` in `flightController.js` (including model interaction).

        2.  **GraphQL Mutations for Core Functionality (Controller Ready) [COMPLETED 2025-06-10]:** REST endpoints `POST /:id/availability/decrease` and `increase` exist, and `flightController.js` has `decreaseAvailability` and `increaseAvailability` functions. Corresponding GraphQL mutations `decreaseFlightAvailability` and `increaseFlightAvailability` are now implemented in `api-gateway/graphql/flight.js` and correctly mapped to these REST endpoints.

        3.  **PARTIAL MISALIGNMENT & REDUNDANCY (`Query.flights` vs. `Query.filterFlights` vs. `Query.searchFlights`)**:
            - `Query.flights` resolver behavior:
                - If `origin`, `destination`, or `date` GraphQL arguments are present, it calls `GET /api/flights/filter` but *only passes these three arguments* to the REST endpoint.
                - If `origin`, `destination`, or `date` GraphQL arguments are NOT present, it calls `GET /api/flights` (which `flightController.listAllFlights` handles, supporting only pagination).
            - `flightController.filterFlights` (which backs `GET /api/flights/filter`) can actually handle many more filter parameters (e.g., `airline_code`, `flight_class`, `min_price`, `max_price`) than the `Query.flights` resolver currently forwards to it.
            - `Query.searchFlights` calls `GET /api/flights/search` (handled by `flightController.searchFlights`) for `origin_city`, `destination_city`, `date`. This functionality is already covered by `Query.flights` (when it calls `/filter`) and `Query.filterFlights`.
            - *Consequence*: `Query.flights` is not as powerful as it could be, as it doesn't utilize the full filtering capability of the `/filter` REST endpoint. Users might expect `flights(airline_code: "XY")` to work, but the `airline_code` would be dropped by the resolver.
            - *Action*:
                a. **Recommended**: Modify the `Query.flights` GraphQL resolver to pass *all* its relevant filter arguments (not just origin/destination/date) to the `GET /api/flights/filter` endpoint if any filter argument is present. If no filter arguments are provided at all, it can then call `GET /api/flights` for a simple paginated list of all flights.
                b. Deprecate `Query.searchFlights` as its functionality is a subset of what an improved `Query.flights` or the existing `Query.filterFlights` can provide.
                c. Guide frontend to use `Query.filterFlights` for any complex filtering needs, or the improved `Query.flights` once its resolver is enhanced.

            - *Action*: Evaluate need based on frontend requirements. Controller logic is present and supports this.
        -->
        - `api-gateway/graphql/hotel.js`
        <!-- 
        Hotel Domain (2025-06-10):
        GraphQL Operations (from api-gateway/graphql/hotel.js):
          Queries:
            - hotels(limit, page): Calls GET http://localhost:3002/api/hotels?params... (Controller supports pagination. ALIGNED)
            - hotel(id): Calls GET http://localhost:3002/api/hotels/:id
            - searchHotels(city, province): Calls GET http://localhost:3002/api/hotels/search?params...
            - filterHotels(filters, sort, pagination): Calls GET http://localhost:3002/api/hotels/filter?params...
            - hotelAvailability(id, date): Calls GET http://localhost:3002/api/hotels/:id/availability?date=...
            - hotelPricing(id, date): Calls GET http://localhost:3002/api/hotels/:id/pricing?date=...
          Mutations:
            - decreaseRoomAvailability(hotelId, roomTypeId, date, quantity): Calls POST http://localhost:3002/api/hotels/:hotelId/availability/decrease (Passes roomTypeId in body)
            - increaseRoomAvailability(hotelId, roomTypeId, date, quantity): Calls POST http://localhost:3002/api/hotels/:hotelId/availability/increase (Passes roomTypeId in body)
            - OMISSION: No createHotel mutation.

        REST Endpoints & Controller Logic (from services/hotel-service/.../hotelRoutes.js & .../hotelController.js - Reviewed 2025-06-10):
          - GET / (hotelController.listAllHotels - Supports `page`, `limit`. Ignores other query params. ALIGNED with GQL `Query.hotels`.)
          - GET /filter (hotelController.filterHotels - Supports comprehensive filters including `name`, `city`, `property_type`, star_rating, price, amenities, sort, pagination. Seems robust. ALIGNED with GQL `Query.filterHotels`.)
          - GET /search (hotelController.searchHotels - Supports `city`, `province`. ALIGNED with GQL `Query.searchHotels`.)
          - GET /:id (hotelController.getHotelDetails - Fetches by ID.)
          - GET /:id/availability (hotelController.getAvailability - Takes `check_in` date. Iterates room types, calls model `Hotel.getAvailability(rt.id, check_in, ...)` for each. ALIGNED with GQL `Query.hotelAvailability`.)
          - GET /:id/pricing (hotelController.getPricing - Takes `check_in` date. Iterates room types, calls model `Hotel.getPricing(rt.id, check_in, ...)` for each. ALIGNED with GQL `Query.hotelPricing`.)
          - POST /:id/availability/decrease (hotelController.decreaseAvailability - Expects `room_type_id`, `date`, `quantity` in body. Calls model `Hotel.decreaseAvailability(room_type_id, ...)`. ALIGNED with GQL `Mutation.decreaseRoomAvailability`.)
          - POST /:id/availability/increase (hotelController.increaseAvailability - Expects `room_type_id`, `date`, `quantity` in body. Calls model `Hotel.increaseAvailability(room_type_id, ...)`. ALIGNED with GQL `Mutation.increaseRoomAvailability`.)
          - OMISSION: No POST / route or `createHotel` controller logic for creating hotels.

        Alignment Issues & Notes for Hotel Domain (Updated 2025-06-10 after GQL resolver & controller review):
        1.  **CRITICAL OMISSION (Missing `createHotel` Functionality)**: No `createHotel` GraphQL mutation, no `POST /api/hotels` REST endpoint, and no `createHotel` function in `hotelController.js`.
            - *Action*: Design and implement hotel creation feature across GQL, REST, controller, and model layers. This is a major feature gap.

        2.  **Room-Level Availability Mutations (ALIGNED)**: GQL mutations `decreaseRoomAvailability` and `increaseRoomAvailability` pass `roomTypeId` in the body to hotel-level REST endpoints. The `hotelController.decreaseAvailability` and `increaseAvailability` methods correctly expect and use `room_type_id` from `req.body` to affect specific room types. This is well-aligned.
            - *Action*: None needed here; alignment confirmed.

        3.  **GraphQL Hotel Queries & Controller Alignment (ALIGNED)**:
            - `Query.hotels` resolver correctly calls `GET /api/hotels` with only `limit` and `page` arguments, aligning perfectly with `hotelController.listAllHotels` (which only handles pagination).
            - `Query.filterHotels` calls `GET /api/hotels/filter`, backed by `hotelController.filterHotels` which supports comprehensive filtering (including `name`) and pagination.
            - `Query.searchHotels` calls `GET /api/hotels/search`, backed by `hotelController.searchHotels` (filters by `city`, `province`).
            - The roles of these GraphQL queries are distinct and well-supported by their respective controller methods and GQL resolvers. No misalignments found here.
            - *Action*: Consider deprecating `Query.searchHotels` if `Query.filterHotels` (e.g., `filterHotels(filters: { city: "C"})`) fully covers its use cases for API simplification.

        4.  **`hotelAvailability` & `hotelPricing` Queries (ALIGNED)**: These GQL queries map to `hotelController.getAvailability` and `hotelController.getPricing` respectively. The controller methods correctly fetch details per room type for a given hotel and date. Controller logic appears sound and aligned with GraphQL expectations.
            - *Action*: None needed here; alignment confirmed.
        -->
        - `api-gateway/graphql/localTravel.js`
        <!-- 
        Local Travel Domain (2025-06-10):
        GraphQL Operations (from api-gateway/graphql/localTravel.js):
          Queries:
            - localTravels(args...): Calls GET http://localhost:3006/api/local-travel?args... (MISALIGNED for filtering)
            - localTravel(id): Calls GET http://localhost:3006/api/local-travel/:id
            - filterLocalTravels(filters, sort, pagination): Calls GET http://localhost:3006/api/local-travel/filter?params... (ALIGNED)
            - localTravelAvailability(id, date): Calls GET http://localhost:3006/api/local-travel/:id/availability?date=...
            - localTravelPricing(id, date): Calls GET http://localhost:3006/api/local-travel/:id/pricing?date=...
          Mutations:
            - OMISSION: No createLocalTravel mutation (Schema review confirmed this; Memory `f6a498e8-ebaf-46d1-a3a1-15fd64695571` was slightly off).
            - OMISSION: No GQL mutations for availability decrease/increase.

        REST Endpoints & Controller Logic (from services/local-travel-service/.../localTravelRoutes.js & .../localTravelController.js - Reviewed 2025-06-10):
          - GET / (localTravelController.listAllLocalTravel - Supports `page`, `limit`. Ignores other query params.)
          - GET /filter (localTravelController.filterLocalTravel - Supports comprehensive filters, sort, pagination. Seems robust.)
          - GET /search (localTravelController.searchLocalTravel - Supports `origin_city`, `destination_city`, `route`.)
          - GET /:id (localTravelController.getLocalTravelDetails - Fetches by ID.)
          - GET /:id/availability (localTravelController.getAvailability - Takes `date`. Calls model `LocalTravel.getAvailability(id, date, ...)`.)
          - GET /:id/pricing (localTravelController.getPricing - Takes `date`. Calls model `LocalTravel.getPricing(id, date, ...)`.)
          - POST /:id/availability/decrease (localTravelController.decreaseAvailability - Expects `date`, `quantity` in body. Calls model `LocalTravel.decreaseAvailability(id, date, quantity, ...)`.)
          - POST /:id/availability/increase (localTravelController.increaseAvailability - Expects `date`, `quantity` in body. Calls model `LocalTravel.increaseAvailability(id, date, quantity, ...)`.)
          - OMISSION: No POST / route or `createLocalTravel` controller logic for creating local travel options.

        Alignment Issues & Notes for Local Travel Domain (Updated 2025-06-10 after GQL resolver & controller review):
        1.  **CRITICAL OMISSION (Missing `createLocalTravel` Functionality)**: No `createLocalTravel` GraphQL mutation defined. No `POST /api/local-travel` REST endpoint in `localTravelRoutes.js`. No `createLocalTravel` method in `localTravelController.js`.
            - *Action*: Design and implement this feature: Define GQL mutation, add REST route, implement controller logic and model method.

        2.  **MISSING GraphQL Mutations for Availability**: Controller methods (`decreaseAvailability`, `increaseAvailability`) and REST endpoints (`POST /:id/availability/decrease` and `increase`) exist and are functional. However, there are no corresponding GraphQL mutations defined in `localTravel.js`.
            - *Action*: Define `decreaseLocalTravelAvailability` and `increaseLocalTravelAvailability` GQL mutations and their resolvers to call the existing REST endpoints.

        3.  **`Query.localTravels` vs `Query.filterLocalTravels` (MISALIGNMENT & ALIGNMENT)**: 
            - `Query.localTravels` resolver passes all arguments to `GET /api/local-travel`. However, `localTravelController.listAllLocalTravel` only processes `page` and `limit`, ignoring other filter arguments. This makes `Query.localTravels` unsuitable for filtering.
            - `Query.filterLocalTravels` resolver correctly targets `GET /api/local-travel/filter` and passes filter, sort, and pagination parameters. This aligns well with `localTravelController.filterLocalTravel` which is comprehensive.
            - *Action*: Modify `Query.localTravels` resolver to ONLY pass `page` and `limit` to `GET /api/local-travel`. Guide users to `Query.filterLocalTravels` for any filtering needs. Alternatively, enhance `Query.localTravels` to intelligently call `/filter` if filter arguments are provided (similar to the pattern in `Query.flights`), but this might be redundant given `Query.filterLocalTravels`.

        4.  **`filterLocalTravels` Controller Support (CONFIRMED ALIGNED)**: `localTravelController.filterLocalTravel` is comprehensive and supports a wide range of filters, sorting, and pagination, aligning with the GQL `Query.filterLocalTravels` and requirements from memory `a5df7c4d-e484-48df-a1d7-18508d78cc3a`.
            - *Action*: None needed here; alignment confirmed.

        5.  **Dedicated Availability/Pricing Queries (ALIGNED)**: GQL queries `localTravelAvailability(id, date)` and `localTravelPricing(id, date)` exist. `localTravelController.getAvailability` and `getPricing` methods also exist and support these queries by fetching data for a specific ID and date.
            - *Action*: None needed here; alignment confirmed.
        -->
        - `api-gateway/graphql/booking.js`
        <!-- 
        Booking Domain (2025-06-10):
{{ ... }}
          Queries:
            - getBookingById(id): Calls GET http://localhost:3004/api/bookings/:id
            - getUserBookings(userId): Calls GET http://localhost:3004/api/bookings/user/:userId
          Mutations:
            - createBooking(userId, items): 
                1. Calls POST http://localhost:3004/api/bookings (to create booking record)
                2. Calls POST http://<SERVICE_URL>/:refId/availability/decrease for each item (Hotel:3002, Train:3007, Flight:3005, LocalTravel:3008) - Ports need verification.
            - cancelBooking(bookingId):
                1. Calls GET http://localhost:3004/api/bookings/:bookingId (to get items)
                2. Calls POST http://<SERVICE_URL>/:ref_id/availability/increase for each item.
                3. Calls POST http://localhost:3004/api/bookings/:bookingId/cancel (REST endpoint missing in booking service)
            - modifyBooking(bookingId, items): Placeholder, not implemented.

        REST Endpoints & Controller Logic (from services/booking-service/.../bookingRoutes.js & .../bookingController.js - Reviewed 2025-06-10):
          - GET / (bookingController.listAllBookings)
          - GET /filter (bookingController.filterBookings)
          - GET /user/:userId (bookingController.getUserBookings)
          - GET /:id (bookingController.getBookingById)
          - POST / (bookingController.createBooking)
          - OMISSION: No route for POST /:id/cancel.
          - OMISSION: No route for PUT /:id or similar for modify.

        Alignment Issues & Notes for Booking Domain (Updated 2025-06-10):
        0.  **CRITICAL (Incorrect Service Ports in `createBooking`/`cancelBooking` Resolvers for Availability Updates)**:
            - The GraphQL resolvers `Mutation.createBooking` and `Mutation.cancelBooking` in `api-gateway/graphql/booking.js` make direct calls to Train, Flight, and Local Travel services to update availability. These resolvers use hardcoded URLs with incorrect ports:
                - **Train Service**: Uses port `3007`. Expected: `3001` (based on typical Train service port).
                - **Flight Service**: Uses port `3005`. Expected: `3003` (based on typical Flight service port).
                - **Local Travel Service**: Uses port `3008`. Expected: `3006` (based on typical Local Travel service port).
                - **Hotel Service**: Uses port `3002`. Expected: `3002` (This appears correct).
            - *Impact*: Availability updates for Train, Flight, and Local Travel services during booking creation and cancellation will **FAIL** because they target the wrong service instances.
            - *Action*: URGENTLY change the hardcoded URLs in `SERVICE_ENDPOINTS` within `api-gateway/graphql/booking.js` for `train`, `flight`, and `local_travel` to use their correct ports (assumed 3001, 3003, 3006 respectively). Ideally, these should use environment variables or a centralized configuration rather than being hardcoded.

        1.  **CRITICAL MISALIGNMENT (Missing REST Endpoint for `cancelBooking`)**: The `cancelBooking` GraphQL mutation, after handling item availability, attempts `POST http://localhost:3004/api/bookings/:bookingId/cancel`. This route is NOT defined in `services/booking-service/src/routes/bookingRoutes.js`.
            - *Action*: Add `router.post('/:id/cancel', bookingController.cancelBooking);` to `bookingRoutes.js` and implement `cancelBooking` in `bookingController.js`.

        2.  **CRITICAL MISALIGNMENT (Missing Functionality for `modifyBooking`)**: The `modifyBooking` GraphQL mutation is a placeholder. The Booking microservice also lacks a REST endpoint for modifications.
            - *Action*: Define and implement `modifyBooking` in GraphQL resolvers. Add a corresponding REST endpoint (e.g., `router.put('/:id', bookingController.modifyBooking);`) and controller logic in the Booking service.

        3.  **POTENTIAL CRITICAL ISSUE (Incorrect Service URLs/Ports in Resolvers)**: The `createBooking` and `cancelBooking` GraphQL resolvers use hardcoded URLs for other microservices. The ports for Train (3007), Flight (3005), and Local Travel (3008) seem incorrect and deviate from standard assignments (Train:3001, Flight:3003, Local Travel:3006). Hotel (3002) seems correct. If these ports are wrong, availability updates will fail.
            - *Action*: URGENT - Verify and correct all microservice endpoint URLs and ports within the `createBooking` and `cancelBooking` resolvers in `api-gateway/graphql/booking.js`. This should be a top priority for Step 3 (Controller Logic / Cross-Service Comm Review).

        4.  **Missing GraphQL Query for Admin Operations**: The GraphQL schema does not expose queries for listing all bookings or filtering bookings (e.g., for an admin panel), though the Booking microservice provides `GET /` and `GET /filter` REST endpoints.
            - *Action*: Evaluate if admin-level GraphQL queries for bookings are needed. If so, add them to `api-gateway/graphql/booking.js`.

        5.  **Controller Logic Review Findings**:
            - `bookingController.createBooking` only handles local database operations for creating a booking record. It does not make cross-service calls to update availability in other services.
            - The `createBooking` GraphQL resolver is responsible for these critical cross-service calls.
            - Missing `cancelBooking` and `modifyBooking` controller logic needs to be implemented.
            - *Action*: Implement missing controller logic and ensure correct cross-service communication.
        -->
        - `api-gateway/graphql/payment.js`
        <!-- 
        Payment Domain (2025-06-10):
        GraphQL Operations (from api-gateway/graphql/payment.js):
          Queries:
            - payments(userId, bookingId): Calls GET http://localhost:3005/api/payments?params... (SEVERELY MISALIGNED)
            - payment(id): Calls GET http://localhost:3005/api/payments/:id (MISALIGNED - REST supports /:id/status only)
            - OMISSION: No GQL query for payment status.
          Mutations:
            - createPayment(input): Calls POST http://localhost:3005/api/payments (Functionally ALIGNED with controller `initiatePayment`)

        REST Endpoints & Controller Logic (from services/payment-service/.../paymentRoutes.js & .../paymentController.js - Reviewed 2025-06-10):
          - GET /user/:userId (paymentController.getUserPayments - Fetches payments by user ID. This is the ONLY supported GET collection endpoint.)
          - GET /:id/status (paymentController.getPaymentStatus - Fetches status by payment ID. `Payment.getById` is used internally.)
          - POST / (paymentController.initiatePayment - Creates payment record with `userId`, `bookingId`, `amount`, `method`. Returns `paymentId` and `status: 'pending'`.)
          - OMISSION: No GET / route for listing all payments or filtering by anything other than `/user/:userId`.
          - OMISSION: No GET /:id route for full payment details (only `/status`).

        Alignment Issues & Notes for Payment Domain (Updated 2025-06-10 after GQL resolver & controller review):
        1.  **CRITICAL MISALIGNMENT (`Query.payments` Resolver & Controller Capabilities)**: 
            - GQL `payments` query resolver passes all arguments (`userId`, `bookingId`, or none) as query parameters to `GET /api/payments?params...`.
            - The Payment service controller (`paymentController.js`) ONLY has `getUserPayments` which handles `GET /api/payments/user/:userId`.
            - There is NO controller logic or REST route for `GET /api/payments` (list all) or `GET /api/payments?bookingId=...`.
            - *Result*: The GQL `payments` query will **always fail** as implemented because its resolver targets non-existent or incorrectly parameterized REST endpoints.
            - *Action*: Major rework for `Query.payments` resolver. It should ONLY accept `userId` (as a non-nullable argument) and its resolver must construct the URL `GET /api/payments/user/:userId`. If broader filtering (e.g., by `bookingId` or list all) is a requirement, the REST API and controller must be significantly extended first.

        2.  **CRITICAL MISALIGNMENT (`Query.payment(id)` vs. Controller Capabilities)**: 
            - GQL `payment(id)` query resolver calls `GET /api/payments/:id` expecting full payment details.
            - The Payment service REST API only has `GET /api/payments/:id/status` (handled by `paymentController.getPaymentStatus`).
            - `paymentController.js` has no method to return *full* payment details for a generic `GET /api/payments/:id` route.
            - *Result*: The GQL `payment(id)` query will fail as it targets a non-existent REST endpoint for full details.
            - *Action*: Either change GQL `payment(id)` to `paymentStatus(id: ID!): String` (or a `PaymentStatus` type) and have its resolver call `GET /api/payments/:id/status`. Alternatively, if full payment details are needed via GQL `payment(id)`, then a new REST endpoint `GET /api/payments/:id` and corresponding controller logic must be created in the Payment service.

        3.  **`createPayment` Mutation & `initiatePayment` Controller (Functionally ALIGNED)**: GQL mutation `createPayment` maps to REST `POST /api/payments`, which is handled by `paymentController.initiatePayment`. This is functionally aligned, though names differ slightly.
            - *Action*: None needed for functionality. Consider renaming for consistency if desired, but not critical.

        4.  **MISSING GraphQL Query for Payment Status**: REST endpoint `GET /api/payments/:id/status` and `paymentController.getPaymentStatus` exist and are functional. No GQL query directly maps to this useful operation.
            - *Action*: Add a `getPaymentStatus(id: ID!): String` (or a `PaymentStatus` type) GQL query and resolver that correctly calls `GET /api/payments/:id/status`.

        5.  **`processPayment` vs `createPayment` (Clarified)**: Memory `2b9576c2-b9e1-4876-880c-15a95267a514` mentioned `processPayment` GQL mutation; current schema has `createPayment`. `createPayment` aligns with `paymentController.initiatePayment`'s role.
            - *Action*: No issue here; `createPayment` is the correct current GQL mutation for initiating a payment record.
        -->
    - [ ] Note any missing or extra fields compared to frontend requirements.

## Critical Cross-Cutting Issues (Identified during Audit)

1.  **CRITICAL (`FLIGHT_SERVICE_URL` in `api-gateway/graphql/flight.js` Misconfigured)**:
    - The `FLIGHT_SERVICE_URL` constant in `api-gateway/graphql/flight.js` is defined as `http://localhost:3002/api/flights` (port 3002).
    - Port 3002 is the Hotel service.
    - *Impact*: All GraphQL operations for Flights defined in `flight.js` (e.g., `Query.flights`, `Query.flight`, `Mutation.createFlight`) are incorrectly attempting to communicate with the Hotel service instead of the actual Flight service (expected at port 3003).
    - *Action*: URGENTLY correct `FLIGHT_SERVICE_URL` in `api-gateway/graphql/flight.js` to point to the correct Flight service port (e.g., `http://localhost:3003/api/flights`).

2.  **CRITICAL (Users Service GraphQL Resolvers Misconfigured - `USER_SERVICE_URL`)**:
    - The `USER_SERVICE_URL` constant in `api-gateway/graphql/users.js` (as per checkpoint summary for `Query.users` and `Query.user`) points to `http://localhost:3002/api/users` (port 3002).
    - Port 3002 is the Hotel service.
    - *Impact*: All GraphQL operations for Users defined in `users.js` are incorrectly attempting to communicate with the Hotel service instead of the actual Users service (expected at port e.g. 3000 or 3001).
    - *Action*: URGENTLY correct `USER_SERVICE_URL` in `api-gateway/graphql/users.js` to point to the correct Users service port.

## 2. REST Endpoint Verification

- [ ] **Enumerate all REST endpoints** exposed by each microservice.
    - File(s) to check:
        - `services/train-service/src/routes/trainRoutes.js`
        - `services/flight-service/src/routes/flightRoutes.js`
        - `services/hotel-service/src/routes/hotelRoutes.js`
        - `services/local-travel-service/src/routes/localTravelRoutes.js`
        - `services/booking-service/src/routes/bookingRoutes.js`
        - `services/payment-service/src/routes/paymentRoutes.js`
        - `services/users-service/src/routes/usersRoutes.js`
- [ ] For each endpoint:
    - [ ] Confirm it matches the route, method, and parameter structure expected by the API Gateway.
    - [ ] Check for consistency in naming, HTTP verbs, and path parameters.
    - [ ] Ensure all required endpoints for GraphQL operations are present and reachable.

## 3. Controller Logic Review

- [ ] **Trace each REST endpoint** to its controller function in the microservice codebase.
- [ ] For each controller:
    - [ ] Verify correct extraction and validation of parameters.
    - [ ] Ensure correct business logic, including joins, filters, and error handling.
    - [ ] Confirm the controller returns all fields expected by the API Gateway and frontend.
    - [ ] Check for defensive programming (null checks, error propagation).

## 4. Database Schema & Data Alignment

- [ ] **Map each controller's queries** to the underlying database tables and fields.
- [ ] For each relevant table/field:
    - [ ] Confirm schema matches what the controller expects (types, nullability, relations).
    - [ ] Ensure sample data exists for all required scenarios (pricing, availability, etc).
    - [ ] Check for missing or extra columns that could cause mapping errors.
    - [ ] Validate foreign key relationships and join conditions.

## 5. End-to-End Field Mapping Table

- [ ] **Create a mapping table** for each domain:
    - | GraphQL Field | REST JSON Field | Controller Variable | DB Column |
    - |---------------|----------------|--------------------|-----------|
    - Populate for all fields exposed to frontend.
    - Mark any mismatches or transformation logic.

## 6. Automated & Manual Testing

- [ ] **Write and run test cases** for each GraphQL operation:
    - [ ] Validate response completeness, types, and values.
    - [ ] Test error cases and edge conditions.
    - [ ] Confirm changes in DB are reflected in API responses.
- [ ] **Update checklist** as items are verified.

## 7. Progress Tracking & Reporting

- [ ] **Update this checklist** with dates, responsible persons, and status for each step.
- [ ] Use comments or a progress log section to note issues, fixes, and pending items.

---

> Repeat this process for every domain (Train, Flight, Hotel, Local Travel, Booking, Payment, Users). This checklist is designed to be actionable for both automated scripts and manual audits, ensuring full-stack alignment and minimizing integration bugs.

---

## Overall Audit Summary & Key Recommendations

This audit aimed to thoroughly analyze and document the alignment between the API Gateway's GraphQL schema/resolvers and the underlying microservice REST endpoints across all travel agency domains (Users, Train, Flight, Hotel, Local Travel, Booking, Payment). The goal was to identify misalignments, omissions, and inconsistencies to ensure a fully synchronized and maintainable API surface before implementing fixes.

**Key Findings Summary:**

The audit has revealed several critical and major misalignments:

1.  **Service URL Misconfigurations (CRITICAL):**
    *   The `FLIGHT_SERVICE_URL` in `api-gateway/graphql/flight.js` incorrectly points to the Hotel service (port 3002 instead of e.g., 3003).
    *   The `USER_SERVICE_URL` in `api-gateway/graphql/users.js` incorrectly points to the Hotel service (port 3002 instead of e.g., 3000/3001).
    *   The `createBooking` and `cancelBooking` resolvers in `api-gateway/graphql/booking.js` use hardcoded and incorrect ports for Train (3007 instead of 3001), Flight (3005 instead of 3003), and Local Travel (3008 instead of 3006) services for availability updates.

2.  **Authentication Flow (CRITICAL):**
    *   The Users service (`users-service`) `register` and `login` controllers do not generate or return JWT tokens.
    *   The GraphQL `AuthPayload` type is missing the `token` field, making it impossible for clients to receive authentication tokens.

3.  **Missing REST Endpoints & Controller Logic:**
    *   **Booking Service:** Missing REST endpoints and controller logic for `cancelBooking` (POST `/api/bookings/:id/cancel`) and `modifyBooking`.
    *   **Payment Service:** Missing REST endpoint for `GET /api/payments/:id` (full payment details), only `/status` is available. No generic listing/filtering for payments beyond by `userId`.
    *   **Users Service:** Missing generic `POST /api/users` REST endpoint for `createUser` (only `/register` exists).

4.  **GraphQL Resolver Misalignments:**
    *   **Payment Service:** `Query.payments` resolver attempts to call unsupported REST endpoints for general listing/filtering. `Query.payment(id)` attempts to get full details from a non-existent REST endpoint.
    *   **Train/Flight Services:** Redundancy and partial misalignments between generic list queries (e.g., `Query.trains`) and specific filter queries (e.g., `Query.filterTrains`), where generic queries often don't support the full range of filters their resolvers imply.

5.  **Missing GraphQL Operations:**
    *   Missing GraphQL queries for `getPaymentStatus` (Payment), and potentially for admin-level booking listings/filters.
    *   Missing GraphQL mutations for availability updates in Flight & Train services, though controllers exist.

**Key Recommendations:**

1.  **Address Critical Issues Immediately:**
    *   Correct all `XXX_SERVICE_URL` constants in GraphQL resolver files (`flight.js`, `users.js`) to point to the correct service ports.
    *   Fix hardcoded incorrect ports in `api-gateway/graphql/booking.js` resolvers.
    *   Implement JWT token generation in the Users service and update the GraphQL `AuthPayload` to include the token.

2.  **Implement Missing REST Endpoints & Controller Logic:**
    *   Add required REST endpoints and corresponding controller methods for `cancelBooking`, `modifyBooking` (Booking), full payment details (Payment), and generic `createUser` (Users).

3.  **Align GraphQL Resolvers:**
    *   Rework GraphQL resolvers (especially for Payment, Train, Flight queries) to accurately reflect the capabilities of the underlying REST APIs or extend REST APIs first.
    *   Remove or refactor redundant GraphQL queries.

4.  **Add Missing GraphQL Operations:**
    *   Implement necessary GraphQL queries and mutations (e.g., `getPaymentStatus`, admin booking queries, availability mutations) where underlying REST functionality exists or is added.

5.  **Standardize Configuration (IMPORTANT):**
    *   **Eliminate hardcoded service URLs and ports.** Transition to using environment variables or a centralized configuration management system for all service endpoint URLs across all GraphQL resolvers and microservices. This is crucial for maintainability, deployment flexibility, and reducing errors.

6.  **Continuous Review:** Regularly review and update this alignment checklist as the system evolves.

This audit provides a solid foundation for the subsequent phase of implementing fixes and enhancements to achieve a robust and synchronized API Gateway and microservice architecture.


## Progress Log

| Date       | Domain      | Aspect       | Status    | Notes                 |
|------------|-----------|--------------|-----------|-----------------------|
| 2025-06-10 | Train     | GQL→REST Map | In Progress | Initial mapping done. Identified missing REST endpoint for `createTrain` GQL Mutation and missing GQL mutations for train availability updates (decrease/increase). |
| 2025-06-10 | Flight    | GQL→REST Map | In Progress | Initial mapping done. Identified missing REST endpoint for `createFlight` GQL Mutation and missing GQL mutations for flight availability updates (decrease/increase). Potential overlap in `Query.flights` and `Query.filterFlights`. |
| 2025-06-10 | Hotel     | GQL→REST Map | In Progress | Initial mapping done. Critical omission of hotel creation functionality (GQL & REST). Availability mutations (GQL) target rooms, but REST endpoints are hotel-level; needs controller review. `filterHotels` seems aligned with memory requirements. |
| 2025-06-10 | LocalTravel | GQL→REST Map | In Progress | Initial mapping done. Critical missing REST endpoint for GQL `createLocalTravel` & missing GQL mutations for availability. `filterLocalTravels` GQL query aligns well with memory `a5df7c4d-e484-48df-a1d7-18508d78cc3a` requirements. |
| 2025-06-10 | Booking     | GQL→REST Map | In Progress | Initial mapping done. Critical missing REST endpoint for `cancelBooking` GQL mutation. `modifyBooking` GQL mutation is a placeholder & REST endpoint missing. Potential critical issue with incorrect hardcoded service ports in GQL resolvers for Train, Flight, Local Travel. |
| 2025-06-10 | Payment     | GQL→REST Map | In Progress | Initial mapping done. GQL `payments` query has broader filter capabilities (bookingId, no-args) than REST (`/user/:userId` only). GQL `payment(id)` query targets non-existent REST endpoint (`/:id` vs `/id:/status`). Missing GQL query for payment status. Naming inconsistency (`createPayment` vs `initiatePayment`). |
| 2025-06-10 | Users       | GQL→REST Map | In Progress | Initial mapping done. GQL `createUser` targets `POST /api/users`, but REST only has `POST /api/users/register`. Missing GQL query for `GET /api/users/filter`. CRITICAL: `AuthPayload` GQL type is missing the `token` field, making auth tokens inaccessible. |
| YYYY-MM-DD | ...       | ...          | ...       | ...                   |

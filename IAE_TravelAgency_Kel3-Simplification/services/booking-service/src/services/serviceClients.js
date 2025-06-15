const axios = require('axios');

// Define base URLs for the microservices. In a real-world scenario,
// these would come from environment variables.
const SERVICE_URLS = {
  FLIGHTS: 'http://localhost:3002',
  HOTELS: 'http://localhost:3003',
  TRAINS: 'http://localhost:3007',
  LOCAL_TRAVEL: 'http://localhost:3006',
  PAYMENTS: 'http://localhost:3005',
};

/**
 * Checks flight availability and price.
 * @param {string} flightId - The ID of the flight.
 * @param {string} date - The travel date in 'YYYY-MM-DD' format.
 * @returns {Promise<object>} The daily status data from the flight service.
 */
const checkFlightAvailability = async (flightId, date) => {
  try {
    const response = await axios.get(`${SERVICE_URLS.FLIGHTS}/api/flights/${flightId}/daily-status`, {
      params: { date }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error checking flight availability for flight ${flightId}:`, error.response ? error.response.data : error.message);
    throw new Error('Failed to check flight availability.');
  }
};

/**
 * Decreases the seat count for a flight.
 * @param {string} flightId - The ID of the flight.
 * @param {string} date - The travel date in 'YYYY-MM-DD' format.
 * @param {number} quantity - The number of seats to decrease.
 * @returns {Promise<object>} The response from the flight service.
 */
const reserveFlightSeat = async (flightId, date, quantity) => {
  console.log(`[ServiceClients] reserveFlightSeat received: flightId=${flightId}, date=${date}, quantity=${quantity}`);
  try {
    const response = await axios.post(`${SERVICE_URLS.FLIGHTS}/api/flights/${flightId}/availability/decrease`, { date, quantity });
    return response.data;
  } catch (error) {
    console.error(`Error reserving seat for flight ${flightId}:`, error.response ? error.response.data : error.message);
    throw new Error('Failed to reserve flight seat.');
  }
};

// Hotel Service
const checkHotelAvailability = async (hotelId, date) => {
  try {
    const response = await axios.get(`${SERVICE_URLS.HOTELS}/api/hotels/${hotelId}/daily-status`, { params: { date } });
    return response.data.data;
  } catch (error) {
    console.error(`Error checking availability for hotel ${hotelId}:`, error.response ? error.response.data : error.message);
    throw new Error('Failed to check hotel availability.');
  }
};

const reserveHotelRoom = async (hotelId, quantity) => {
  try {
    const response = await axios.post(`${SERVICE_URLS.HOTELS}/api/hotels/${hotelId}/availability/decrease`, { quantity });
    return response.data;
  } catch (error) {
    console.error(`Error reserving room for hotel ${hotelId}:`, error.response ? error.response.data : error.message);
    throw new Error('Failed to reserve hotel room.');
  }
};

// Train Service
const checkTrainAvailability = async (trainId, date) => {
  try {
    const response = await axios.get(`${SERVICE_URLS.TRAINS}/api/trains/${trainId}/daily-status`, { params: { date } });
    return response.data.data;
  } catch (error) {
    console.error(`Error checking availability for train ${trainId}:`, error.response ? error.response.data : error.message);
    throw new Error('Failed to check train availability.');
  }
};

const reserveTrainSeat = async (trainId, quantity) => {
  try {
    const response = await axios.post(`${SERVICE_URLS.TRAINS}/api/trains/${trainId}/availability/decrease`, { quantity });
    return response.data;
  } catch (error) {
    console.error(`Error reserving seat for train ${trainId}:`, error.response ? error.response.data : error.message);
    throw new Error('Failed to reserve train seat.');
  }
};

// Local Travel Service
const checkLocalTravelAvailability = async (travelId, date) => {
  try {
    const response = await axios.get(`${SERVICE_URLS.LOCAL_TRAVEL}/api/local-travel/${travelId}/daily-status`, { params: { date } });
    return response.data.data;
  } catch (error) {
    console.error(`Error checking availability for local travel ${travelId}:`, error.response ? error.response.data : error.message);
    throw new Error('Failed to check local travel availability.');
  }
};

const reserveLocalTravel = async (travelId, quantity) => {
  try {
    const response = await axios.post(`${SERVICE_URLS.LOCAL_TRAVEL}/api/local-travel/${travelId}/availability/decrease`, { quantity });
    return response.data;
  } catch (error) {
    console.error(`Error reserving for local travel ${travelId}:`, error.response ? error.response.data : error.message);
    throw new Error('Failed to reserve local travel.');
  }
};

// Payment Service
const initiatePayment = async (bookingId, userId, amount, method) => {
  try {
    console.log('[ServiceClients] Initiating payment with:', { bookingId, userId, amount, payment_method_type: method });
    const response = await axios.post(`${SERVICE_URLS.PAYMENTS}/api/payments`, {
      bookingId: bookingId, // Corrected to camelCase
      userId: userId,       // Corrected to camelCase
      amount: amount,
      payment_method_type: method,
    });
    console.log('[ServiceClients] Payment initiation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error initiating payment:', error.response ? error.response.data : error.message);
    throw new Error('Failed to initiate payment.');
  }
};

const releaseFlightSeat = async (flightId, date, quantity) => {
  try {
    const response = await axios.post(`${SERVICE_URLS.FLIGHTS}/api/flights/${flightId}/availability/increase`, { date, quantity });
    return response.data;
  } catch (error) {
    console.error(`Error releasing seat for flight ${flightId}:`, error.response ? error.response.data : error.message);
    throw new Error('Failed to release flight seat.');
  }
};

const releaseHotelRoom = async (hotelId, quantity) => {
  try {
    const response = await axios.post(`${SERVICE_URLS.HOTELS}/api/hotels/${hotelId}/availability/increase`, { quantity });
    return response.data;
  } catch (error) {
    console.error(`Error releasing room for hotel ${hotelId}:`, error.response ? error.response.data : error.message);
    throw new Error('Failed to release hotel room.');
  }
};

const releaseTrainSeat = async (trainId, quantity) => {
  try {
    const response = await axios.post(`${SERVICE_URLS.TRAINS}/api/trains/${trainId}/availability/increase`, { quantity });
    return response.data;
  } catch (error) {
    console.error(`Error releasing seat for train ${trainId}:`, error.response ? error.response.data : error.message);
    throw new Error('Failed to release train seat.');
  }
};

const releaseLocalTravel = async (travelId, quantity) => {
  try {
    const response = await axios.post(`${SERVICE_URLS.LOCAL_TRAVEL}/api/local-travel/${travelId}/availability/increase`, { quantity });
    return response.data;
  } catch (error) {
    console.error(`Error releasing for local travel ${travelId}:`, error.response ? error.response.data : error.message);
    throw new Error('Failed to release local travel.');
  }
};

module.exports = {
  checkFlightAvailability,
  reserveFlightSeat,
  releaseFlightSeat,
  checkHotelAvailability,
  reserveHotelRoom,
  releaseHotelRoom,
  checkTrainAvailability,
  reserveTrainSeat,
  releaseTrainSeat,
  checkLocalTravelAvailability,
  reserveLocalTravel,
  releaseLocalTravel,
  initiatePayment,
};

const Booking = require('../models/Booking');
const serviceClients = require('../services/serviceClients');

exports.getBookingById = async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.getById(id);
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }
    res.status(200).json({ status: 'success', data: booking });
  } catch (err) {
    console.error('Error in getBookingById:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve booking', details: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookings = await Booking.getUserBookings(userId);
    res.json({ status: 'success', data: bookings });
  } catch (err) {
    console.error('Error in getUserBookings:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch bookings', details: err.message });
  }
};

exports.listAllBookings = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await Booking.listAll({ page, limit });
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    console.error('Error in listAllBookings:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve bookings', details: err.message });
  }
};

exports.filterBookings = async (req, res) => {
  try {
    const { 
      user_id, booking_code, status, payment_status, item_type,
      min_total, max_total, start_date, end_date, sort_by, sort_order,
      origin_city, destination_city, origin_province, destination_province,
      service_class, provider, travel_date_start, travel_date_end,
      page, limit 
    } = req.query;

    const params = {
      user_id,
      booking_code,
      status,
      payment_status,
      item_type,
      min_total: min_total ? parseFloat(min_total) : undefined,
      max_total: max_total ? parseFloat(max_total) : undefined,
      start_date,
      end_date,
      sort_by,
      sort_order,
      origin_city,
      destination_city,
      origin_province,
      destination_province,
      service_class,
      provider,
      travel_date_start,
      travel_date_end,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10
    };

    const result = await Booking.filter(params);
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    console.error('Error in filterBookings:', err);
    res.status(500).json({ status: 'error', message: 'Filter failed', details: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ status: 'error', message: 'Missing booking id' });
    }
    const result = await Booking.cancel(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Booking not found or not cancelled' });
    }
    res.json({ status: 'success', message: 'Booking cancelled' });
  } catch (err) {
    console.error('Error in cancelBooking:', err);
    res.status(500).json({ status: 'error', message: 'Failed to cancel booking', details: err.message });
  }
};

exports.createBooking = async (req, res) => {
  const {
    user_id,
    type,
    ref_id,
    travel_date,
    quantity,
    special_requests,
    details
  } = req.body;

  if (!user_id || !type || !ref_id || !travel_date || !quantity) {
    return res.status(400).json({ status: 'error', message: 'Missing required booking information.' });
  }

  let reservationMade = false;
  try {
    // 1. Check availability and get price
    let availabilityData;
    let availabilityMessage = '';
    switch (type) {
      case 'flight':
        availabilityData = await serviceClients.checkFlightAvailability(ref_id, travel_date);
        if (!availabilityData || availabilityData.available_seats < quantity) {
          availabilityMessage = `Flight ${ref_id} does not have enough available seats.`;
        }
        break;
      case 'hotel':
        availabilityData = await serviceClients.checkHotelAvailability(ref_id, travel_date);
        if (!availabilityData || availabilityData.available_rooms < quantity) {
          availabilityMessage = `Hotel ${ref_id} does not have enough available rooms.`;
        }
        break;
      case 'train':
        availabilityData = await serviceClients.checkTrainAvailability(ref_id, travel_date);
        if (!availabilityData || availabilityData.available_seats < quantity) {
          availabilityMessage = `Train ${ref_id} does not have enough available seats.`;
        }
        break;
      case 'local_travel':
        availabilityData = await serviceClients.checkLocalTravelAvailability(ref_id, travel_date);
        if (!availabilityData || availabilityData.available_units < quantity) {
          availabilityMessage = `Local travel option ${ref_id} is no longer available.`;
        }
        break;
      default:
        return res.status(400).json({ status: 'error', message: `Unsupported booking type: ${type}` });
    }

    if (availabilityMessage) {
      return res.status(409).json({ status: 'error', message: availabilityMessage });
    }

    const unit_price = availabilityData.price;
    const total_amount = unit_price * quantity;

    // 2. Reserve the item
    switch (type) {
      case 'flight':
        console.log(`[BookingController] Calling reserveFlightSeat with: ref_id=${ref_id}, travel_date=${travel_date}, quantity=${quantity}`);
        reservationDetails = await serviceClients.reserveFlightSeat(ref_id, travel_date, quantity);
        break;
      case 'hotel':
        await serviceClients.reserveHotelRoom(ref_id, quantity);
        break;
      case 'train':
        await serviceClients.reserveTrainSeat(ref_id, quantity);
        break;
      case 'local_travel':
        await serviceClients.reserveLocalTravel(ref_id, quantity);
        break;
    }

    reservationMade = true; // Mark reservation as successful

    // 3. Create the booking record
    const bookingResult = await Booking.create({
      user_id,
      type,
      ref_id,
      travel_date,
      quantity,
      unit_price,
      details: details ? JSON.stringify(details) : null,
      status: 'confirmed',
      total_amount,
      currency: 'IDR',
      payment_status: 'pending',
      special_requests,
    });

    const bookingId = bookingResult.insertId;
    if (!bookingId) {
      throw new Error('Failed to create booking record.');
    }

    // 4. Initiate Payment
    const paymentMethodType = req.body.payment_method || 'credit_card'; // Use payment method from request or default
    const paymentResult = await serviceClients.initiatePayment(
      bookingId,
      user_id,
      total_amount,
      paymentMethodType
    );

    // 5. Fetch the newly created booking
    const newBooking = await Booking.getById(bookingId);

    // 6. Respond with booking and payment details
    res.status(201).json({
      status: 'success',
      message: 'Booking created and payment initiated successfully.',
      data: {
        booking_details: newBooking,
        payment_details: paymentResult,
      },
    });

  } catch (err) {
    console.error('Error in createBooking:', err);

    // Compensating transaction: If a reservation was made, release it.
    if (reservationMade) {
      console.log(`[BookingController] Error after reservation. Initiating rollback for ${type} ${ref_id}...`);
      try {
        switch (type) {
          case 'flight':
            await serviceClients.releaseFlightSeat(ref_id, travel_date, quantity);
            break;
          case 'hotel':
            await serviceClients.releaseHotelRoom(ref_id, quantity);
            break;
          case 'train':
            await serviceClients.releaseTrainSeat(ref_id, quantity);
            break;
          case 'local_travel':
            await serviceClients.releaseLocalTravel(ref_id, quantity);
            break;
        }
        console.log(`[BookingController] Rollback successful for ${type} ${ref_id}.`);
      } catch (releaseError) {
        // If the rollback fails, log a critical error. This requires manual intervention.
        console.error(`[CRITICAL] Failed to release reservation for ${type} ${ref_id}. Manual cleanup required.`, releaseError);
      }
    }

    res.status(500).json({ status: 'error', message: 'Failed to create booking', details: err.message });
  }
};

exports.modifyBooking = async (req, res) => {
  try {
    // const bookingId = req.params.id;
    // const updates = req.body;
    // TODO: Implement logic to fetch the booking, validate changes, update service (e.g., flight change), and then update booking record.
    // For now, this is a placeholder.
    res.status(501).json({ status: 'error', message: 'Modify booking functionality not yet implemented.' });
  } catch (err) {
    console.error('Error in modifyBooking:', err);
    res.status(500).json({ status: 'error', message: 'Failed to modify booking', details: err.message });
  }
};

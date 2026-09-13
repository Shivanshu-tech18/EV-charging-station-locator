import Booking from '../models/Booking.js';
import Station from '../models/Station.js';

// @desc    Create a new booking with overbooking prevention
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const {
      stationId,
      date,
      timeSlot,
      chargerType,
      amount,
      vehicleNumber,
      orderId,
      paymentId,
      paymentStatus,
    } = req.body;

    if (!stationId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide stationId, date, and timeSlot',
      });
    }

    // 1. Verify station exists
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found',
      });
    }

    // 2. Check for overbooking: count existing active bookings for this slot
    const existingBookingsCount = await Booking.countDocuments({
      stationId,
      date,
      timeSlot,
      bookingStatus: { $ne: 'Cancelled' },
    });

    const totalSlots = station.totalSlots || 4;
    if (existingBookingsCount >= totalSlots) {
      return res.status(400).json({
        success: false,
        message: `Sorry, this time slot (${timeSlot}) on ${date} is completely booked! Please select another time slot.`,
      });
    }

    // 3. Create the booking
    const booking = await Booking.create({
      userId: req.user._id,
      stationId,
      date,
      timeSlot,
      chargerType: chargerType || station.chargerTypes[0] || 'Fast',
      amount: amount || station.price * 15 || 250, // default 15 kWh estimate or base fee
      vehicleNumber: vehicleNumber || '',
      paymentStatus: paymentStatus || 'Pending',
      bookingStatus: 'Confirmed',
      orderId: orderId || '',
      paymentId: paymentId || '',
    });

    // Populate station and user details before returning
    const populatedBooking = await Booking.findById(booking._id)
      .populate('stationId', 'name address price chargerTypes openingTime closingTime')
      .populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking,
    });
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('stationId', 'name address price chargerTypes')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('getMyBookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/all
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('stationId', 'name address price')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership if not admin
    if (
      booking.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    booking.bookingStatus = 'Cancelled';
    const updatedBooking = await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('cancelBooking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

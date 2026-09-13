import Station from '../models/Station.js';
import Booking from '../models/Booking.js';

// @desc    Get all stations (with search and charger filter support)
// @route   GET /api/stations
// @access  Public
export const getStations = async (req, res) => {
  try {
    const { search, chargerType } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    if (chargerType && chargerType !== 'All') {
      query.chargerTypes = { $in: [chargerType] };
    }

    const stations = await Station.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: stations.length,
      data: stations,
    });
  } catch (error) {
    console.error('getStations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single station
// @route   GET /api/stations/:id
// @access  Public
export const getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.json({ success: true, data: station });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check slot availability for a station on specific date and time slot
// @route   POST /api/stations/check-availability
// @access  Public
export const checkAvailability = async (req, res) => {
  try {
    const { stationId, date, timeSlot } = req.body;

    if (!stationId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide stationId, date, and timeSlot',
      });
    }

    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    // Count existing active bookings for this station, date, and timeSlot
    // Ignore cancelled bookings
    const bookedCount = await Booking.countDocuments({
      stationId,
      date,
      timeSlot,
      bookingStatus: { $ne: 'Cancelled' },
    });

    const totalSlots = station.totalSlots || 4;
    const availableSlots = Math.max(0, totalSlots - bookedCount);
    const isAvailable = availableSlots > 0;

    res.json({
      success: true,
      data: {
        stationId,
        stationName: station.name,
        date,
        timeSlot,
        totalSlots,
        bookedSlots: bookedCount,
        availableSlots,
        isAvailable,
      },
    });
  } catch (error) {
    console.error('checkAvailability error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new station (Admin only)
// @route   POST /api/stations
// @access  Private/Admin
export const createStation = async (req, res) => {
  try {
    const {
      name,
      address,
      latitude,
      longitude,
      chargerTypes,
      price,
      totalSlots,
      availableSlots,
      openingTime,
      closingTime,
      status,
    } = req.body;

    if (!name || !address || latitude === undefined || longitude === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, latitude, longitude, and price are required',
      });
    }

    const parsedChargerTypes = Array.isArray(chargerTypes)
      ? chargerTypes
      : typeof chargerTypes === 'string'
      ? chargerTypes.split(',').map((t) => t.trim()).filter(Boolean)
      : ['Fast', 'CCS', 'Type-2'];

    const station = await Station.create({
      name,
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      chargerTypes: parsedChargerTypes,
      price: Number(price),
      totalSlots: Number(totalSlots) || 4,
      availableSlots: availableSlots !== undefined ? Number(availableSlots) : Number(totalSlots) || 4,
      openingTime: openingTime || '06:00',
      closingTime: closingTime || '23:00',
      status: status || 'Active',
    });

    res.status(201).json({
      success: true,
      message: 'Station created successfully',
      data: station,
    });
  } catch (error) {
    console.error('createStation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update station (Admin only)
// @route   PUT /api/stations/:id
// @access  Private/Admin
export const updateStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    const {
      name,
      address,
      latitude,
      longitude,
      chargerTypes,
      price,
      totalSlots,
      availableSlots,
      openingTime,
      closingTime,
      status,
    } = req.body;

    if (name) station.name = name;
    if (address) station.address = address;
    if (latitude !== undefined) station.latitude = Number(latitude);
    if (longitude !== undefined) station.longitude = Number(longitude);
    if (chargerTypes) {
      station.chargerTypes = Array.isArray(chargerTypes)
        ? chargerTypes
        : chargerTypes.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (price !== undefined) station.price = Number(price);
    if (totalSlots !== undefined) station.totalSlots = Number(totalSlots);
    if (availableSlots !== undefined) station.availableSlots = Number(availableSlots);
    if (openingTime) station.openingTime = openingTime;
    if (closingTime) station.closingTime = closingTime;
    if (status) station.status = status;

    const updatedStation = await station.save();

    res.json({
      success: true,
      message: 'Station updated successfully',
      data: updatedStation,
    });
  } catch (error) {
    console.error('updateStation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete station (Admin only)
// @route   DELETE /api/stations/:id
// @access  Private/Admin
export const deleteStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    await Station.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Station deleted successfully',
    });
  } catch (error) {
    console.error('deleteStation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

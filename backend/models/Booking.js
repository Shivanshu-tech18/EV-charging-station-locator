import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    date: {
      type: String, // format YYYY-MM-DD
      required: [true, 'Please select booking date'],
    },
    timeSlot: {
      type: String, // format e.g. "10:00 - 11:00"
      required: [true, 'Please select time slot'],
    },
    chargerType: {
      type: String,
      default: 'Fast',
    },
    amount: {
      type: Number,
      required: true,
      default: 200,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    bookingStatus: {
      type: String,
      enum: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
      default: 'Confirmed',
    },
    orderId: {
      type: String,
      default: '',
    },
    paymentId: {
      type: String,
      default: '',
    },
    signature: {
      type: String,
      default: '',
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;

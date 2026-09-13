import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide station name'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide station address'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Please provide latitude coordinate'],
    },
    longitude: {
      type: Number,
      required: [true, 'Please provide longitude coordinate'],
    },
    chargerTypes: {
      type: [String],
      required: [true, 'Please specify at least one charger type'],
      default: ['Fast', 'CCS', 'Type-2'],
    },
    price: {
      type: Number,
      required: [true, 'Please specify price per kWh'],
      min: 0,
    },
    totalSlots: {
      type: Number,
      required: [true, 'Please provide total number of charging slots'],
      min: 1,
      default: 4,
    },
    availableSlots: {
      type: Number,
      required: [true, 'Please provide available slots'],
      min: 0,
      default: 4,
    },
    openingTime: {
      type: String,
      required: [true, 'Please provide opening time (e.g. 06:00)'],
      default: '06:00',
    },
    closingTime: {
      type: String,
      required: [true, 'Please provide closing time (e.g. 23:00)'],
      default: '23:00',
    },
    status: {
      type: String,
      enum: ['Active', 'Under Maintenance', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Station = mongoose.model('Station', stationSchema);
export default Station;

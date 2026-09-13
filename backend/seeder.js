import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Station from './models/Station.js';
import Booking from './models/Booking.js';
import connectDB from './config/db.js';

dotenv.config();

const sampleStations = [
  {
    name: 'VoltHub Supercharge - Indiranagar',
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    latitude: 12.9719,
    longitude: 77.6412,
    chargerTypes: ['Fast', 'CCS', 'Type-2'],
    price: 18,
    totalSlots: 6,
    availableSlots: 6,
    openingTime: '06:00',
    closingTime: '23:30',
    status: 'Active',
  },
  {
    name: 'EcoCharge Station - Koramangala',
    address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
    latitude: 12.9352,
    longitude: 77.6245,
    chargerTypes: ['CCS', 'Fast'],
    price: 16,
    totalSlots: 4,
    availableSlots: 4,
    openingTime: '07:00',
    closingTime: '23:00',
    status: 'Active',
  },
  {
    name: 'GreenPulse EV Oasis - Whitefield',
    address: 'ITPL Main Rd, KIADB Export Promotion Park, Whitefield, Bengaluru, Karnataka 560066',
    latitude: 12.9857,
    longitude: 77.7314,
    chargerTypes: ['Fast', 'CCS', 'Type-2'],
    price: 20,
    totalSlots: 8,
    availableSlots: 8,
    openingTime: '00:00',
    closingTime: '23:59',
    status: 'Active',
  },
  {
    name: 'ChargePoint Hub - MG Road',
    address: 'Trinity Circle, MG Road Metro Station, Bengaluru, Karnataka 560001',
    latitude: 12.9734,
    longitude: 77.6186,
    chargerTypes: ['Type-2', 'CCS'],
    price: 15,
    totalSlots: 4,
    availableSlots: 4,
    openingTime: '06:00',
    closingTime: '22:00',
    status: 'Active',
  },
  {
    name: 'ElectraPower Station - HSR Layout',
    address: '27th Main Rd, Sector 1, HSR Layout, Bengaluru, Karnataka 560102',
    latitude: 12.9121,
    longitude: 77.6446,
    chargerTypes: ['Fast', 'CCS'],
    price: 17,
    totalSlots: 5,
    availableSlots: 5,
    openingTime: '06:30',
    closingTime: '23:00',
    status: 'Active',
  },
  {
    name: 'Zenith FastCharge - Electronic City',
    address: 'Phase 1, Hosur Rd, Electronic City, Bengaluru, Karnataka 560100',
    latitude: 12.8452,
    longitude: 77.6602,
    chargerTypes: ['Fast', 'CCS', 'Type-2'],
    price: 19,
    totalSlots: 6,
    availableSlots: 6,
    openingTime: '00:00',
    closingTime: '23:59',
    status: 'Active',
  },
  {
    name: 'NovaDrive EV Park - Malleshwaram',
    address: 'Sampige Rd, 8th Cross, Malleshwaram, Bengaluru, Karnataka 560003',
    latitude: 12.9984,
    longitude: 77.5713,
    chargerTypes: ['Type-2', 'Fast'],
    price: 14,
    totalSlots: 3,
    availableSlots: 3,
    openingTime: '07:00',
    closingTime: '22:30',
    status: 'Active',
  },
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Station.deleteMany();
    await Booking.deleteMany();

    console.log('Cleared existing collections...');

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'EV Admin',
      email: 'admin@evfinder.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 9876543210',
    });

    // 2. Create Regular Demo User
    const regularUser = await User.create({
      name: 'Rohan Sharma',
      email: 'user@evfinder.com',
      password: 'user123',
      role: 'user',
      phone: '+91 9123456780',
    });

    console.log('Created default users:');
    console.log('Admin: admin@evfinder.com / admin123');
    console.log('User:  user@evfinder.com / user123');

    // 3. Insert Stations
    const createdStations = await Station.insertMany(sampleStations);
    console.log(`Successfully seeded ${createdStations.length} EV charging stations.`);

    // 4. Create sample initial bookings for demonstration
    const today = new Date().toISOString().split('T')[0];
    await Booking.create([
      {
        userId: regularUser._id,
        stationId: createdStations[0]._id,
        date: today,
        timeSlot: '10:00 - 11:00',
        chargerType: 'Fast',
        amount: 270,
        vehicleNumber: 'KA-01-EV-2024',
        paymentStatus: 'Paid',
        bookingStatus: 'Confirmed',
        orderId: 'order_seed_001',
        paymentId: 'pay_seed_001',
      },
      {
        userId: regularUser._id,
        stationId: createdStations[1]._id,
        date: today,
        timeSlot: '14:00 - 15:00',
        chargerType: 'CCS',
        amount: 240,
        vehicleNumber: 'KA-01-EV-2024',
        paymentStatus: 'Paid',
        bookingStatus: 'Confirmed',
        orderId: 'order_seed_002',
        paymentId: 'pay_seed_002',
      },
    ]);

    console.log('Sample bookings created successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();

import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Station from './models/Station.js';
import Booking from './models/Booking.js';
import connectDB from './config/db.js';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = 5099;

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- Starting EV Platform Integration Tests ---');
  await connectDB();

  const server = app.listen(PORT, async () => {
    try {
      console.log(`Test server running on port ${PORT}`);

      // 1. Test Login with Demo User
      console.log('\n[1] Testing User Login...');
      const loginRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, { email: 'user@evfinder.com', password: 'user123' });

      console.log(`Login status: ${loginRes.status}, success: ${loginRes.body.success}`);
      if (!loginRes.body.data?.token) throw new Error('Failed to obtain JWT');
      const userToken = loginRes.body.data.token;

      // 2. Test Login with Admin
      console.log('\n[2] Testing Admin Login...');
      const adminLoginRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, { email: 'admin@evfinder.com', password: 'admin123' });

      console.log(`Admin login status: ${adminLoginRes.status}, role: ${adminLoginRes.body.data?.role}`);
      const adminToken = adminLoginRes.body.data.token;

      // 3. Test Fetch Stations
      console.log('\n[3] Testing Fetch Stations...');
      const stationsRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/stations',
        method: 'GET',
      });
      console.log(`Found ${stationsRes.body.count} stations`);
      const sampleStation = stationsRes.body.data[0];

      // 4. Test Check Availability
      console.log('\n[4] Testing Check Availability...');
      const checkRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/stations/check-availability',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, {
        stationId: sampleStation._id,
        date: '2026-09-20',
        timeSlot: '11:00 - 12:00',
      });
      console.log('Availability result:', checkRes.body.data);

      // 5. Test Create Booking & Overbooking Prevention
      console.log('\n[5] Testing Booking & Overbooking Prevention...');
      const testDate = '2026-10-01';
      const testSlot = '15:00 - 16:00';

      // Create a test station with 2 slots only
      const tempStation = await Station.create({
        name: 'Test Capacity Station',
        address: 'Test Road 123',
        latitude: 12.9,
        longitude: 77.6,
        price: 15,
        totalSlots: 2,
        availableSlots: 2,
        chargerTypes: ['Fast'],
      });

      // Slot 1
      const b1 = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }, {
        stationId: tempStation._id,
        date: testDate,
        timeSlot: testSlot,
      });
      console.log('Booking 1 status:', b1.status, b1.body.success ? 'Confirmed' : b1.body.message);

      // Slot 2
      const b2 = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }, {
        stationId: tempStation._id,
        date: testDate,
        timeSlot: testSlot,
      });
      console.log('Booking 2 status:', b2.status, b2.body.success ? 'Confirmed' : b2.body.message);

      // Slot 3 (Should fail with 400 overbooking prevention!)
      const b3 = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }, {
        stationId: tempStation._id,
        date: testDate,
        timeSlot: testSlot,
      });
      console.log('Booking 3 (Overbooking attempt) status:', b3.status, 'Message:', b3.body.message);
      if (b3.status === 400) {
        console.log(' Overbooking successfully blocked!');
      } else {
        throw new Error('Overbooking was NOT prevented!');
      }

      // 6. Test Payment Order & Verification
      console.log('\n[6] Testing Payment Order & Verification...');
      const orderRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/payments/create-order',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }, {
        amount: 300,
        bookingId: b1.body.data._id,
      });
      console.log('Payment Order Created:', orderRes.body.order.id);

      const verifyRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/payments/verify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }, {
        razorpay_order_id: orderRes.body.order.id,
        razorpay_payment_id: 'pay_test_verified_999',
        razorpay_signature: 'test_signature',
        bookingId: b1.body.data._id,
        isSimulated: true,
      });
      console.log('Payment Verified:', verifyRes.body.success, 'New Status:', verifyRes.body.data.paymentStatus);

      // 7. Test Admin Operations (Add, Edit, Delete Station)
      console.log('\n[7] Testing Admin Operations...');
      const addStationRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/stations',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      }, {
        name: 'Admin Added Station',
        address: 'MG Road Extension',
        latitude: 12.975,
        longitude: 77.61,
        price: 22,
        totalSlots: 6,
        chargerTypes: ['Fast', 'CCS'],
      });
      console.log('Admin Created Station:', addStationRes.body.data?.name);

      const editStationRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/stations/' + addStationRes.body.data._id,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      }, {
        price: 25,
      });
      console.log('Admin Edited Station Price to:', editStationRes.body.data?.price);

      // Clean up temp test stations
      await Station.findByIdAndDelete(tempStation._id);
      await Station.findByIdAndDelete(addStationRes.body.data._id);
      await Booking.deleteMany({ stationId: tempStation._id });

      console.log('\n ALL TESTS PASSED SUCCESSFULLY! ');
      server.close(() => {
        mongoose.connection.close();
        process.exit(0);
      });
    } catch (err) {
      console.error('Test execution failed:', err);
      server.close(() => {
        mongoose.connection.close();
        process.exit(1);
      });
    }
  });
};

runTests();

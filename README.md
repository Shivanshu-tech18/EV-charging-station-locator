# EV Charging Station Finder & Booking Platform

A full-stack EV charging station finder and slot booking web application built with **React**, **Node.js + Express**, **MongoDB**, and **Pure CSS (No Tailwind)**. Features interactive **OpenStreetMap via React Leaflet**, slot availability checking with overbooking prevention, and **Razorpay Test Mode** payment integration.

---

##  Key Features

- **Authentication & Security**:
  - JWT (JSON Web Token) authentication with bearer tokens.
  - Password hashing with bcrypt.
  - Role-based authorization (`user` and `admin`).
  - Protected Dashboard and Admin routes.

- **Interactive Map & Station Finder**:
  - React Leaflet + OpenStreetMap integration with custom EV pin markers.
  - Dynamic sidebar search by station name or location.
  - Filter by charger type: `Fast`, `CCS`, `Type-2`, and `All`.
  - Rich interactive Marker Popup:
    - Station name and address
    - Supported charger type tags
    - Price per kWh
    - Live available slots counter
    - Date picker & Time slot dropdown
    - Real-time **"Check Availability"** button
    - **"Pay & Book"** button

- **Booking System & Overbooking Prevention**:
  - Real-time slot availability calculation per station, date, and time slot.
  - Hard constraint against overbooking beyond station capacity.
  - Tracks user ID, station ID, date, time slot, charger type, amount, payment status, and booking status.

- **Razorpay Payment Integration**:
  - Razorpay Test Mode integration.
  - Server-side order creation (`/api/payments/create-order`).
  - Browser Razorpay popup checkout (`checkout.js`).
  - Cryptographic HMAC SHA256 signature verification (`/api/payments/verify`).
  - Seamless simulated test fallback for instantaneous out-of-the-box evaluation.

- **User Dashboard**:
  - Summary metrics: Total Bookings, Confirmed Bookings, and Total Paid.
  - Responsive cards displaying station name, location, date, time slot, charger type, payment status badge, and booking status badge.
  - Cancel booking functionality.

- **Admin Management Portal**:
  - Add new EV station (name, address, lat/lng, charger types, price, slots, hours).
  - Edit existing stations.
  - Delete stations.
  - View all user bookings across the platform.

- **Clean UI & Styling**:
  - Electric Blue (`#0284c7`) + Eco Green (`#10b981`) theme.
  - Modern cards with hover elevation and subtle shadows.
  - Rounded pills and buttons (`border-radius: 9999px`).
  - Sticky shadowed navbar with role badges.
  - Pure CSS only (**No Tailwind**).

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`

### 1. Start the Backend

```bash
cd backend
npm install
npm run seed     # Seeds sample stations, users, and bookings
npm start        # Starts server on http://localhost:5000
```

### 2. Start the Frontend

In a separate terminal:
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
```

Open your browser at `http://localhost:3000`.

---

##  Demo Credentials

For convenience, 1-click quick login buttons are provided on the Login page:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Demo User** | `user@evfinder.com` | `user123` | Map search, book slots, Razorpay payment, User Dashboard |
| **Admin** | `admin@evfinder.com` | `admin123` | All user features + Add/Edit/Delete stations + View all bookings |

---

## 📁 Project Architecture

```
Projec_EV/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile
│   │   ├── stationController.js  # Station CRUD & check-availability
│   │   ├── bookingController.js  # Booking creation & slot validation
│   │   └── paymentController.js  # Razorpay order & HMAC verification
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT & Admin protection middlewares
│   │   └── errorHandler.js       # 404 & global error handler
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt hash hook
│   │   ├── Station.js            # Station schema with coordinates & slots
│   │   └── Booking.js            # Booking schema with payment fields
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── stationRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── paymentRoutes.js
│   ├── seeder.js                 # Seed script with realistic stations
│   ├── test_api.js               # Automated integration test suite
│   ├── server.js                 # Express server entry point
│   └── package.json
└── frontend/
    ├── public/
    │   └── bolt.svg
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Shadowed navbar with role badges
    │   │   ├── ProtectedRoute.jsx# Auth and Admin route guards
    │   │   ├── StationMap.jsx    # React Leaflet + OpenStreetMap
    │   │   └── StationPopup.jsx  # Interactive booking & Razorpay popup
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global user auth state
    │   ├── pages/
    │   │   ├── HomePage.jsx      # Map explorer & sidebar search/filters
    │   │   ├── DashboardPage.jsx # User booking cards & cancellation
    │   │   ├── AdminPage.jsx     # Station CRUD modals & all bookings
    │   │   ├── LoginPage.jsx     # Login with 1-click demo buttons
    │   │   └── RegisterPage.jsx  # New user registration
    │   ├── services/
    │   │   └── api.js            # Fetch wrapper with JWT headers
    │   ├── App.jsx               # React Router config
    │   ├── index.css             # Pure CSS styling (Blue + Green EV theme)
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

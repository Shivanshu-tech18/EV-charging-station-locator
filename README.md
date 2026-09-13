# ⚡ EV Charging Station Locator

A full-stack EV Charging Station Locator and Slot Booking platform built with **React, Node.js, Express, MongoDB, React Leaflet, and Razorpay**. Users can find nearby charging stations, check slot availability, book charging sessions, and manage their bookings through a personal dashboard.

## 🚀 Features

### User Features

* User Registration & Login (JWT Authentication)
* Interactive OpenStreetMap with multiple charging stations
* View station details (price, charger type, location)
* Select date & time slot
* Check slot availability
* Book charging slot
* Razorpay test payment integration
* User dashboard with booking history

### Admin Features

* Add charging stations
* Edit station information
* Delete stations
* Manage bookings

---

## 🛠️ Tech Stack

| Technology    | Purpose        |
| ------------- | -------------- |
| React.js      | Frontend       |
| Node.js       | Runtime        |
| Express.js    | Backend API    |
| MongoDB       | Database       |
| Mongoose      | ODM            |
| JWT           | Authentication |
| React Leaflet | Maps           |
| OpenStreetMap | Map Tiles      |
| Razorpay      | Test Payments  |
| CSS           | Styling        |

---

## 📂 Project Structure

```text
Project_EV/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── App.css
│   │   └── components/
│   └── package.json
│
└── backend/
    ├── models/
    │   ├── User.js
    │   ├── Station.js
    │   └── Booking.js
    ├── routes/
    ├── controllers/
    ├── middleware/
    ├── server.js
    ├── .env
    └── package.json
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/Shivanshu-tech18/EV-charging-station-locator.git
cd EV-charging-station-locator
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a **.env** file:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/evdb
JWT_SECRET=your_secret_key

RAZORPAY_KEY_ID=your_test_key
RAZORPAY_SECRET=your_test_secret
```

Run backend:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

Backend runs on:

```text
http://localhost:5000
```

---

## 🗺️ Application Workflow

```text
Register / Login
        │
        ▼
View Charging Stations
        │
        ▼
Select Date & Time
        │
        ▼
Check Availability
        │
        ▼
Pay with Razorpay
        │
        ▼
Booking Confirmed
        │
        ▼
Dashboard
```

---

## 📸 Screenshots

Add screenshots here after completing the project.

* Login Page
* Map View
* Charging Station Popup
* Dashboard
* Payment Screen

---

## 🔒 Environment Variables

| Variable        | Description          |
| --------------- | -------------------- |
| PORT            | Backend Port         |
| MONGO_URI       | MongoDB Connection   |
| JWT_SECRET      | JWT Secret Key       |
| RAZORPAY_KEY_ID | Razorpay Test Key    |
| RAZORPAY_SECRET | Razorpay Test Secret |

---

## 🌟 Future Improvements

* Live GPS location
* Nearest charging station detection
* Email booking confirmation
* QR Code for booking
* Real-time slot updates
* Admin analytics dashboard

---

## 👨‍💻 Author

**Shivanshu Tripathi**

* GitHub: https://github.com/Shivanshu-tech18
* LinkedIn: https://linkedin.com/in/shivanshu-tripathi21

---

## 📄 License

This project is created for educational and portfolio purposes.

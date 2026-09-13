import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Zap, Calendar, Clock, CheckCircle2, AlertCircle, CreditCard, ShieldCheck } from 'lucide-react';

const timeSlotsList = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
];

export const StationPopup = ({ station, onBookingSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlotsList[1]); // default 09:00 - 10:00
  const [selectedCharger, setSelectedCharger] = useState(station.chargerTypes?.[0] || 'Fast');

  const [checking, setChecking] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);

  // Check Availability
  const handleCheckAvailability = async () => {
    try {
      setChecking(true);
      setAvailabilityResult(null);
      setBookingMessage(null);

      const res = await api.post('/stations/check-availability', {
        stationId: station._id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
      });

      if (res.success && res.data) {
        setAvailabilityResult(res.data);
      }
    } catch (error) {
      setBookingMessage({
        type: 'error',
        text: error.message || 'Failed to check slot availability',
      });
    } finally {
      setChecking(false);
    }
  };

  // Pay & Book with Razorpay
  const handlePayAndBook = async () => {
    if (!isAuthenticated) {
      alert('Please log in to book a charging slot.');
      navigate('/login');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingMessage(null);

      // Estimated amount: 15 kWh session x price per kWh
      const sessionUnits = 15;
      const amount = Math.round(station.price * sessionUnits);

      // 1. Create initial booking (checks availability on backend)
      const bookingRes = await api.post('/bookings', {
        stationId: station._id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        chargerType: selectedCharger,
        amount,
        paymentStatus: 'Pending',
      });

      const booking = bookingRes.data;

      // 2. Create Razorpay Payment Order
      const orderRes = await api.post('/payments/create-order', {
        amount,
        bookingId: booking._id,
        currency: 'INR',
      });

      const orderData = orderRes.order;
      const isSimulated = orderRes.isSimulated;

      // Check if Razorpay script is loaded in browser
      if (window.Razorpay && !isSimulated) {
        const options = {
          key: process.env.VITE_RAZORPAY_KEY || 'rzp_test_sample_key123',
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'VoltFinder EV Charging',
          description: `Slot Booking: ${station.name}`,
          order_id: orderData.id,
          handler: async function (response) {
            // Verify payment
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
              isSimulated: false,
            });

            if (onBookingSuccess) onBookingSuccess();
            navigate('/dashboard');
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || '9999999999',
          },
          theme: {
            color: '#0284c7',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          alert(`Payment failed: ${response.error.description}`);
          setBookingLoading(false);
        });
        rzp.open();
      } else {
        // Simulated / Test Mode fallback
        const confirmPay = window.confirm(
          `[Razorpay Test Mode]\n\nStation: ${station.name}\nDate: ${selectedDate}\nTime: ${selectedTimeSlot}\nAmount: ₹${amount}\n\nConfirm test payment of ₹${amount}?`
        );

        if (confirmPay) {
          const mockPaymentId = `pay_test_${Date.now()}`;
          await api.post('/payments/verify', {
            razorpay_order_id: orderData.id,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: 'test_mode_signature',
            bookingId: booking._id,
            isSimulated: true,
          });

          if (onBookingSuccess) onBookingSuccess();
          navigate('/dashboard');
        } else {
          setBookingLoading(false);
        }
      }
    } catch (error) {
      console.error('Booking/Payment Error:', error);
      setBookingMessage({
        type: 'error',
        text: error.message || 'Booking or Payment initiation failed',
      });
      setBookingLoading(false);
    }
  };

  const getBadgeClass = (type) => {
    switch (type.toLowerCase()) {
      case 'fast':
        return 'badge-fast';
      case 'ccs':
        return 'badge-ccs';
      case 'type-2':
      case 'type2':
        return 'badge-type2';
      default:
        return 'badge-chademo';
    }
  };

  return (
    <div className="station-popup-card">
      {/* Banner */}
      <div className="popup-banner">
        <h4 className="popup-station-name">{station.name}</h4>
        <p className="popup-station-addr">
          <span>{station.address}</span>
        </p>
      </div>

      {/* Body */}
      <div className="popup-body">
        {/* Info Grid */}
        <div className="popup-info-grid">
          <div>
            <div className="info-item-label">Price per kWh</div>
            <div className="info-item-val" style={{ color: 'var(--primary)' }}>
              ₹{station.price}
            </div>
          </div>
          <div>
            <div className="info-item-label">Available Slots</div>
            <div className="info-item-val" style={{ color: 'var(--secondary)' }}>
              {station.availableSlots} / {station.totalSlots}
            </div>
          </div>
        </div>

        {/* Charger Types */}
        <div>
          <div className="info-item-label" style={{ marginBottom: '0.3rem' }}>
            Charger Types
          </div>
          <div className="popup-chargers-row">
            {station.chargerTypes?.map((t) => (
              <span
                key={t}
                onClick={() => setSelectedCharger(t)}
                className={`badge ${getBadgeClass(t)}`}
                style={{
                  cursor: 'pointer',
                  border: selectedCharger === t ? '1.5px solid var(--primary)' : '1px solid transparent',
                }}
              >
                <Zap size={11} />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Date and Time Picker Form */}
        <div className="booking-controls-box">
          <div className="form-group-compact">
            <label className="form-label-compact">
              <Calendar size={13} color="var(--primary)" />
              Select Date
            </label>
            <input
              type="date"
              className="input-compact"
              value={selectedDate}
              min={today}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setAvailabilityResult(null);
              }}
            />
          </div>

          <div className="form-group-compact">
            <label className="form-label-compact">
              <Clock size={13} color="var(--secondary)" />
              Time Slot
            </label>
            <select
              className="select-compact"
              value={selectedTimeSlot}
              onChange={(e) => {
                setSelectedTimeSlot(e.target.value);
                setAvailabilityResult(null);
              }}
            >
              {timeSlotsList.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Status Feedback */}
          {availabilityResult && (
            <div
              className={`availability-alert ${
                availabilityResult.isAvailable ? 'available' : 'unavailable'
              }`}
            >
              {availabilityResult.isAvailable ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>
                    Available: {availabilityResult.availableSlots} of{' '}
                    {availabilityResult.totalSlots} slots free
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={15} />
                  <span>Slot Full: 0 remaining for this time</span>
                </>
              )}
            </div>
          )}

          {bookingMessage && (
            <div className="availability-alert unavailable">
              <AlertCircle size={15} />
              <span>{bookingMessage.text}</span>
            </div>
          )}

          {/* Buttons: Check Availability + Pay & Book */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ flex: 1 }}
              onClick={handleCheckAvailability}
              disabled={checking}
            >
              {checking ? 'Checking...' : 'Check Availability'}
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ flex: 1.2 }}
              onClick={handlePayAndBook}
              disabled={
                bookingLoading ||
                (availabilityResult && !availabilityResult.isAvailable)
              }
            >
              <CreditCard size={14} />
              <span>{bookingLoading ? 'Processing...' : 'Pay & Book'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationPopup;

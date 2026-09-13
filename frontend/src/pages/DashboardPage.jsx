import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Clock, MapPin, Zap, CheckCircle2, XCircle, CreditCard, ArrowRight, ShieldCheck } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings');
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (error) {
      setErrorMsg(error.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setCancellingId(bookingId);
      const res = await api.put(`/bookings/${bookingId}/cancel`, {});
      if (res.success) {
        // Refresh bookings list
        fetchUserBookings();
      }
    } catch (error) {
      alert(error.message || 'Cancellation failed');
    } finally {
      setCancellingId(null);
    }
  };

  // Stats calculation
  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + (b.amount || 0), 0);
  const activeBookings = bookings.filter((b) => b.bookingStatus === 'Confirmed').length;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user?.name}</h1>
        <p className="dashboard-subtitle">
          Manage your EV charging sessions, reservation slots, and payment receipts.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-val">{bookings.length}</div>
            <div className="stat-label">Total Reservations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Zap size={24} />
          </div>
          <div>
            <div className="stat-val">{activeBookings}</div>
            <div className="stat-label">Confirmed Bookings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="stat-val">₹{totalSpent}</div>
            <div className="stat-label">Total Paid</div>
          </div>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="section-heading-row">
        <h2 className="section-title">Your Charging Bookings</h2>
        <Link to="/" className="btn btn-primary btn-sm">
          <Zap size={15} />
          <span>Book New Slot</span>
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading your reservations...
        </div>
      ) : bookings.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '3rem 2rem',
            textAlign: 'center',
          }}
        >
          <Zap size={44} style={{ margin: '0 auto 1rem', color: 'var(--primary)', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            No Bookings Found
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            You haven't reserved any charging slots yet. Explore the live interactive map to find stations near you!
          </p>
          <Link to="/" className="btn btn-primary">
            <span>Find Stations on Map</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => {
            const isConfirmed = booking.bookingStatus === 'Confirmed';
            const isPaid = booking.paymentStatus === 'Paid';

            return (
              <div key={booking._id} className="booking-card">
                <div className="booking-card-top">
                  <div>
                    <h3 className="booking-card-title">
                      {booking.stationId?.name || 'EV Charging Station'}
                    </h3>
                    <p className="booking-card-address">
                      <MapPin size={13} style={{ display: 'inline', marginRight: '3px' }} />
                      {booking.stationId?.address || 'Location details'}
                    </p>
                  </div>

                  <span
                    className={`badge ${
                      isConfirmed ? 'badge-success' : 'badge-danger'
                    }`}
                  >
                    {booking.bookingStatus}
                  </span>
                </div>

                <div className="booking-card-body">
                  <div className="booking-detail-row">
                    <span className="booking-detail-label">
                      <Calendar size={15} />
                      Date
                    </span>
                    <span className="booking-detail-value">{booking.date}</span>
                  </div>

                  <div className="booking-detail-row">
                    <span className="booking-detail-label">
                      <Clock size={15} />
                      Time Slot
                    </span>
                    <span className="booking-detail-value">{booking.timeSlot}</span>
                  </div>

                  <div className="booking-detail-row">
                    <span className="booking-detail-label">
                      <Zap size={15} />
                      Charger Type
                    </span>
                    <span className="badge badge-fast">{booking.chargerType}</span>
                  </div>

                  <div className="booking-detail-row">
                    <span className="booking-detail-label">
                      <CreditCard size={15} />
                      Payment Status
                    </span>
                    <span
                      className={`badge ${
                        isPaid ? 'badge-success' : 'badge-warning'
                      }`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </div>

                  {booking.paymentId && (
                    <div className="booking-detail-row">
                      <span className="booking-detail-label">Payment ID</span>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontFamily: 'monospace',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {booking.paymentId}
                      </span>
                    </div>
                  )}

                  <div className="booking-detail-row" style={{ marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
                    <span style={{ fontWeight: 700 }}>Total Amount</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{booking.amount}
                    </span>
                  </div>
                </div>

                {isConfirmed && (
                  <div className="booking-card-footer">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Booking ID: {booking._id.slice(-6).toUpperCase()}
                    </span>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancellingId === booking._id}
                    >
                      {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, Zap, CheckCircle2, ShieldAlert, X } from 'lucide-react';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('stations'); // 'stations' | 'bookings'
  const [stations, setStations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    chargerTypes: ['Fast', 'CCS'],
    price: '',
    totalSlots: 4,
    availableSlots: 4,
    openingTime: '06:00',
    closingTime: '23:00',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch stations and bookings
  const fetchData = async () => {
    try {
      setLoading(true);
      const [stationRes, bookingRes] = await Promise.all([
        api.get('/stations'),
        api.get('/bookings/all'),
      ]);
      if (stationRes.success) setStations(stationRes.data);
      if (bookingRes.success) setBookings(bookingRes.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingStation(null);
    setFormData({
      name: '',
      address: '',
      latitude: '12.9716',
      longitude: '77.5946',
      chargerTypes: ['Fast', 'CCS', 'Type-2'],
      price: '18',
      totalSlots: 4,
      availableSlots: 4,
      openingTime: '06:00',
      closingTime: '23:00',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (station) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      address: station.address,
      latitude: station.latitude,
      longitude: station.longitude,
      chargerTypes: station.chargerTypes || ['Fast'],
      price: station.price,
      totalSlots: station.totalSlots,
      availableSlots: station.availableSlots,
      openingTime: station.openingTime,
      closingTime: station.closingTime,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteStation = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await api.delete(`/stations/${id}`);
      if (res.success) {
        setStations(stations.filter((s) => s._id !== id));
      }
    } catch (error) {
      alert(error.message || 'Failed to delete station');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude || !formData.price) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingStation) {
        // Edit station
        const res = await api.put(`/stations/${editingStation._id}`, formData);
        if (res.success) {
          setStations(
            stations.map((s) => (s._id === editingStation._id ? res.data : s))
          );
          setIsModalOpen(false);
        }
      } else {
        // Add new station
        const res = await api.post('/stations', formData);
        if (res.success) {
          setStations([res.data, ...stations]);
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      setFormError(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChargerCheckbox = (type) => {
    setFormData((prev) => {
      const exists = prev.chargerTypes.includes(type);
      return {
        ...prev,
        chargerTypes: exists
          ? prev.chargerTypes.filter((t) => t !== type)
          : [...prev.chargerTypes, type],
      };
    });
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="dashboard-title">Admin Management Portal</h1>
          <p className="dashboard-subtitle">
            Configure stations, adjust slot capacities, and oversee system bookings.
          </p>
        </div>
        {activeTab === 'stations' && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            <span>Add New Station</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'stations' ? 'active' : ''}`}
          onClick={() => setActiveTab('stations')}
        >
          Charging Stations ({stations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          All System Bookings ({bookings.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading admin records...
        </div>
      ) : activeTab === 'stations' ? (
        /* Stations Table */
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Station Details</th>
                <th>Coordinates</th>
                <th>Chargers</th>
                <th>Price / kWh</th>
                <th>Slots</th>
                <th>Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((st) => (
                <tr key={st._id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{st.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{st.address}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>
                    {st.latitude.toFixed(4)}, {st.longitude.toFixed(4)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {st.chargerTypes?.map((t) => (
                        <span key={t} className="badge badge-fast" style={{ fontSize: '0.7rem' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{st.price}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{st.availableSlots}</span> / {st.totalSlots}
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {st.openingTime} - {st.closingTime}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(st)}
                        title="Edit Station"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteStation(st._id, st.name)}
                        title="Delete Station"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* All Bookings Table */
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Station</th>
                <th>Date & Slot</th>
                <th>Charger</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Booking Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{b.userId?.name || 'Customer'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {b.userId?.email || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.stationId?.name || 'Station'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {b.stationId?.address}
                    </div>
                  </td>
                  <td>
                    <div>{b.date}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.timeSlot}</div>
                  </td>
                  <td>
                    <span className="badge badge-fast">{b.chargerType || 'Fast'}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{b.amount}</td>
                  <td>
                    <span
                      className={`badge ${
                        b.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'
                      }`}
                    >
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        b.bookingStatus === 'Confirmed' ? 'badge-success' : 'badge-danger'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Station Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingStation ? 'Edit Charging Station' : 'Add New EV Station'}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formError && (
                  <div
                    style={{
                      padding: '0.75rem',
                      background: 'var(--danger-light)',
                      color: 'var(--danger)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Station Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. VoltHub Supercharge - Whitefield"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Full street address, area, city"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="e.g. 12.9716"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="e.g. 77.5946"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Supported Chargers</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                    {['Fast', 'CCS', 'Type-2', 'CHAdeMO'].map((t) => (
                      <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.chargerTypes.includes(t)}
                          onChange={() => handleChargerCheckbox(t)}
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Price / kWh (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Slots</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.totalSlots}
                      onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Available Slots</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.availableSlots}
                      onChange={(e) => setFormData({ ...formData, availableSlots: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Opening Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.openingTime}
                      onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Closing Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.closingTime}
                      onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingStation ? 'Save Changes' : 'Create Station'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

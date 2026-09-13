import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StationMap from '../components/StationMap';
import { Search, Zap, MapPin, Clock, Filter, Navigation } from 'lucide-react';

export const HomePage = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChargerType, setActiveChargerType] = useState('All');
  const [selectedStation, setSelectedStation] = useState(null);

  const chargerFilterOptions = ['All', 'Fast', 'CCS', 'Type-2'];

  const fetchStations = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (activeChargerType !== 'All') queryParams.append('chargerType', activeChargerType);

      const res = await api.get(`/stations?${queryParams.toString()}`);
      if (res.success && res.data) {
        setStations(res.data);
        if (res.data.length > 0 && !selectedStation) {
          setSelectedStation(res.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load stations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [activeChargerType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStations();
  };

  return (
    <div className="map-page-container">
      {/* Left Sidebar: Filter, Search & Station list */}
      <aside className="sidebar-panel">
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span>Charging Stations</span>
            <span className="station-count-pill">{stations.length} Available</span>
          </div>

          <div className="search-filter-box">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by station or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Filter Chips */}
            <div className="filter-chips">
              {chargerFilterOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`filter-chip ${activeChargerType === type ? 'active' : ''}`}
                  onClick={() => setActiveChargerType(type)}
                >
                  {type === 'All' ? 'All Chargers' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Station List */}
        <div className="station-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading nearby stations...
            </div>
          ) : stations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <Zap size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
              <p>No EV stations found matching your criteria.</p>
            </div>
          ) : (
            stations.map((station) => (
              <div
                key={station._id}
                className={`station-item-card ${
                  selectedStation?._id === station._id ? 'selected' : ''
                }`}
                onClick={() => setSelectedStation(station)}
              >
                <div className="card-header-row">
                  <h3 className="station-title">{station.name}</h3>
                  <span className="station-price-tag">₹{station.price}/kWh</span>
                </div>

                <p className="station-address-text">{station.address}</p>

                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.6rem' }}>
                  {station.chargerTypes?.map((t) => (
                    <span
                      key={t}
                      className="badge badge-fast"
                      style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="station-meta-row">
                  <div className="slot-indicator">
                    <span
                      className={`dot ${
                        station.availableSlots > 0 ? 'dot-green' : 'dot-red'
                      }`}
                    />
                    <span style={{ color: station.availableSlots > 0 ? 'var(--secondary)' : 'var(--danger)' }}>
                      {station.availableSlots} of {station.totalSlots} Slots Free
                    </span>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                    {station.openingTime} - {station.closingTime}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Right Canvas: OpenStreetMap with Markers & Popups */}
      <StationMap
        stations={stations}
        selectedStation={selectedStation}
        onSelectStation={(st) => setSelectedStation(st)}
        onBookingSuccess={fetchStations}
      />
    </div>
  );
};

export default HomePage;

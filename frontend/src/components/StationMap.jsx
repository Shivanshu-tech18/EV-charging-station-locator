import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StationPopup from './StationPopup';

// Create custom EV Pin HTML Leaflet Icon
const createCustomIcon = (price) => {
  return L.divIcon({
    className: 'custom-leaflet-marker-wrapper',
    html: `
      <div class="custom-ev-marker">
        <div class="custom-ev-marker-inner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -42],
  });
};

// Component to handle map view movements when a station is selected
const MapViewController = ({ selectedStation }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedStation && selectedStation.latitude && selectedStation.longitude) {
      map.flyTo([selectedStation.latitude, selectedStation.longitude], 14, {
        duration: 1.2,
      });
    }
  }, [selectedStation, map]);

  return null;
};

export const StationMap = ({ stations = [], selectedStation, onSelectStation, onBookingSuccess }) => {
  // Center default (Bengaluru)
  const defaultCenter = [12.9716, 77.5946];
  const markerRefs = useRef({});

  // Open popup when selectedStation changes
  useEffect(() => {
    if (selectedStation && markerRefs.current[selectedStation._id]) {
      markerRefs.current[selectedStation._id].openPopup();
    }
  }, [selectedStation]);

  return (
    <div className="map-canvas-container">
      <MapContainer
        center={
          stations.length > 0
            ? [stations[0].latitude, stations[0].longitude]
            : defaultCenter
        }
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController selectedStation={selectedStation} />

        {/* Station Markers */}
        {stations.map((station) => (
          <Marker
            key={station._id}
            position={[station.latitude, station.longitude]}
            icon={createCustomIcon(station.price)}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[station._id] = ref;
              }
            }}
            eventHandlers={{
              click: () => {
                if (onSelectStation) {
                  onSelectStation(station);
                }
              },
            }}
          >
            <Popup minWidth={320} maxWidth={320} closeButton={true}>
              <StationPopup
                station={station}
                onBookingSuccess={onBookingSuccess}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default StationMap;

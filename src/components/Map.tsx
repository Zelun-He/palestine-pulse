'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map() {
  const center: LatLngTuple = [31.9522, 35.2332];

  return (
    <MapContainer
      center={center}
      zoom={8}
      scrollWheelZoom={true}
      className="w-full h-full"
      style={{ height: '100vh', width: '100%' }} // REQUIRED!
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}

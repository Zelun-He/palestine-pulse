'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { LatLngTuple, LatLngBounds, Icon, DivIcon } from 'leaflet';
import { GeoJSONCollection, GeoJSONFeature, EventFilters, MapViewState } from '@/types';
import 'leaflet/dist/leaflet.css';

// Custom marker icons for different categories
const createCategoryIcon = (category: string, severity: string) => {
  const size = severity === 'critical' ? 32 : severity === 'high' ? 28 : severity === 'medium' ? 24 : 20;
  
  const colors: Record<string, string> = {
    military: '#dc2626',
    humanitarian: '#2563eb',
    political: '#9333ea',
    economic: '#16a34a',
    social: '#ca8a04',
    other: '#6b7280'
  };
  
  const color = colors[category] || '#6b7280';
  
  return new DivIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size * 0.4}px;
      ">
        ${severity.charAt(0).toUpperCase()}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// Map bounds change handler
function MapBoundsHandler({ onBoundsChange }: { onBoundsChange: (bounds: LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    }
  });
  
  return null;
}

// Event markers component
function EventMarkers({ 
  events, 
  onEventClick, 
  currentTime 
}: { 
  events: GeoJSONFeature[];
  onEventClick: (event: GeoJSONFeature) => void;
  currentTime: Date;
}) {
  return (
    <>
      {events.map((event) => {
        const eventTime = new Date(event.properties.occurred_at);
        const isVisible = !currentTime || eventTime <= currentTime;
        
        if (!isVisible) return null;
        
        const coordinates = event.geometry.coordinates as [number, number];
        const icon = createCategoryIcon(event.properties.category, event.properties.severity);
        
        return (
          <Marker
            key={event.properties.id}
            position={[coordinates[1], coordinates[0]]}
            icon={icon}
            eventHandlers={{
              click: () => onEventClick(event)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-gray-900 mb-2">{event.properties.title}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      event.properties.category === 'military' ? 'bg-red-500' :
                      event.properties.category === 'humanitarian' ? 'bg-blue-500' :
                      event.properties.category === 'political' ? 'bg-purple-500' :
                      event.properties.category === 'economic' ? 'bg-green-500' :
                      event.properties.category === 'social' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></span>
                    <span className="capitalize">{event.properties.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      event.properties.severity === 'critical' ? 'bg-red-600' :
                      event.properties.severity === 'high' ? 'bg-orange-500' :
                      event.properties.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></span>
                    <span className="capitalize">{event.properties.severity}</span>
                  </div>
                  <div className="text-gray-500">
                    {new Date(event.properties.occurred_at).toLocaleDateString()}
                  </div>
                  <div className="text-gray-500">
                    {event.properties.location_text}
                  </div>
                  <div className="text-gray-500">
                    {event.properties.article_count} article{event.properties.article_count !== 1 ? 's' : ''}
                  </div>
                </div>
                <button
                  onClick={() => onEventClick(event)}
                  className="mt-3 w-full px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

interface MapProps {
  events: GeoJSONCollection;
  filters: EventFilters;
  currentTime?: Date;
  onEventClick: (event: GeoJSONFeature) => void;
  onBoundsChange: (bounds: LatLngBounds) => void;
  className?: string;
}

export default function Map({ 
  events, 
  filters, 
  currentTime, 
  onEventClick, 
  onBoundsChange,
  className = '' 
}: MapProps) {
  const center: LatLngTuple = [31.9522, 35.2332]; // Palestine center
  const [mapKey, setMapKey] = useState(0);
  
  // Reset map when filters change significantly
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [filters.category, filters.start_date, filters.end_date]);

  return (
    <div className={`w-full h-full ${className}`}>
      <MapContainer
        key={mapKey}
        center={center}
        zoom={8}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100vh', width: '100%' }}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsHandler onBoundsChange={onBoundsChange} />
        
        <EventMarkers 
          events={events.features} 
          onEventClick={onEventClick}
          currentTime={currentTime || new Date()}
        />
      </MapContainer>
    </div>
  );
}

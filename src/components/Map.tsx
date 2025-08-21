'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLngTuple, LatLngBounds, DivIcon } from 'leaflet';
import { GeoJSONCollection, GeoJSONFeature, EventFilters } from '@/types';

// Only import Leaflet CSS on client side
if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css');
}

// Modern, soft activity indicators
const createActivityIcon = (category: string, severity: string, articleCount: number) => {
  // Base size varies by activity level (article count)
  const baseSize = Math.max(24, Math.min(48, articleCount * 6));
  const glowSize = baseSize + 16;
  
  // Soft, modern color palette
  const severityColors = {
    critical: '#ef4444', // Modern red
    high: '#f97316',    // Modern orange
    medium: '#06b6d4',  // Modern cyan
    low: '#10b981'      // Modern emerald
  };
  
  const categoryEmojis = {
    military: '🛡️',
    humanitarian: '❤️',
    political: '🏛️',
    economic: '📊',
    social: '👥',
    other: '📍'
  };
  
  const bgColor = severityColors[severity as keyof typeof severityColors] || '#06b6d4';
  const emoji = categoryEmojis[category as keyof typeof categoryEmojis] || '📍';
  
  return new DivIcon({
    html: `
      <div style="position: relative; width: ${glowSize}px; height: ${glowSize}px;">
        <!-- Subtle glow ring -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${glowSize}px;
          height: ${glowSize}px;
          background: radial-gradient(circle, ${bgColor}20 0%, transparent 70%);
          border-radius: 50%;
          animation: gentlePulse 3s ease-in-out infinite;
        "></div>
        
        <!-- Main modern marker -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${baseSize}px;
          height: ${baseSize}px;
          background: linear-gradient(135deg, ${bgColor}f0 0%, ${bgColor} 100%);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 8px 32px ${bgColor}40, 0 4px 16px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: ${Math.max(10, baseSize * 0.25)}px;
          z-index: 2;
          backdrop-filter: blur(8px);
        ">
          ${articleCount}
        </div>
        
        <!-- Floating category indicator -->
        <div style="
          position: absolute;
          top: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          z-index: 3;
        ">
          ${emoji}
        </div>
        
        <!-- Activity count badge -->
        <div style="
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          font-size: 8px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 8px;
          border: 1px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 3;
          min-width: 16px;
          text-align: center;
        ">
          ${articleCount > 9 ? '9+' : articleCount}
        </div>
      </div>
      
      <style>
        @keyframes gentlePulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.3;
          }
        }
      </style>
    `,
    className: 'modern-activity-marker',
    iconSize: [glowSize, glowSize],
    iconAnchor: [glowSize / 2, glowSize / 2]
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

// Event markers component with clustering-like behavior
function EventMarkers({ 
  events, 
  onEventClick, 
  currentTime 
}: { 
  events: GeoJSONFeature[];
  onEventClick: (event: GeoJSONFeature) => void;
  currentTime: Date;
}) {
  // Group events by proximity for clustering effect
  const groupedEvents = events.reduce((groups, event) => {
    const eventTime = new Date(event.properties.occurred_at);
    const isVisible = !currentTime || eventTime <= currentTime;
    
    if (!isVisible) return groups;
    
    const coordinates = event.geometry.coordinates as [number, number];
    const key = `${Math.round(coordinates[0] * 100) / 100},${Math.round(coordinates[1] * 100) / 100}`;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(event);
    return groups;
  }, {} as Record<string, GeoJSONFeature[]>);

  return (
    <>
      {Object.entries(groupedEvents).map(([key, groupEvents]) => {
        if (groupEvents.length === 1) {
          // Single event - show individual heatmap marker
          const event = groupEvents[0];
          const coordinates = event.geometry.coordinates as [number, number];
          const icon = createActivityIcon(event.properties.category, event.properties.severity, event.properties.article_count);
          
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
                <div className="bg-white/95 backdrop-blur-lg text-slate-900 p-5 min-w-[280px] rounded-3xl border border-white/30 shadow-xl">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <span className="text-lg">
                        {event.properties.category === 'military' ? '🛡️' : 
                         event.properties.category === 'humanitarian' ? '❤️' : 
                         event.properties.category === 'political' ? '🏛️' : 
                         event.properties.category === 'economic' ? '📊' : '📍'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1">{event.properties.title}</h3>
                      <p className="text-xs text-slate-500 font-medium">{event.properties.location_text}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full shadow-sm ${
                        event.properties.severity === 'critical' ? 'bg-red-500' :
                        event.properties.severity === 'high' ? 'bg-orange-500' :
                        event.properties.severity === 'medium' ? 'bg-cyan-500' : 'bg-emerald-500'
                      }`}></div>
                      <span className="text-xs text-slate-600 font-semibold capitalize">{event.properties.severity} Priority</span>
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                      {new Date(event.properties.occurred_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {event.properties.article_count}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">News Reports</div>
                    </div>
                    <button
                      onClick={() => onEventClick(event)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-2xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        } else {
          // Multiple events - show large activity cluster
          const firstEvent = groupEvents[0];
          const coordinates = firstEvent.geometry.coordinates as [number, number];
          const totalArticles = groupEvents.reduce((sum, e) => sum + e.properties.article_count, 0);
          const highestSeverity = groupEvents.reduce((max, e) => {
            const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
            const currentLevel = severityLevels[e.properties.severity as keyof typeof severityLevels] || 1;
            const maxLevel = severityLevels[max as keyof typeof severityLevels] || 1;
            return currentLevel > maxLevel ? e.properties.severity : max;
          }, 'low');
          
          const clusterIcon = createActivityIcon('other', highestSeverity, totalArticles);
          
          return (
            <Marker
              key={key}
              position={[coordinates[1], coordinates[0]]}
              icon={clusterIcon}
              eventHandlers={{
                click: () => {
                  onEventClick(firstEvent);
                }
              }}
            >
              <Popup>
                <div className="bg-white/95 backdrop-blur-lg text-slate-900 p-5 min-w-[320px] rounded-3xl border border-white/30 shadow-xl">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🌐</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Activity Cluster</h3>
                      <p className="text-sm text-slate-600">{groupEvents.length} events in this area</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-3 border border-blue-100">
                      <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {totalArticles}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">Total Reports</div>
                    </div>
                    <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-3 border border-purple-100">
                      <div className={`text-xl font-black capitalize ${
                        highestSeverity === 'critical' ? 'text-red-600' : 
                        highestSeverity === 'high' ? 'text-orange-600' : 
                        highestSeverity === 'medium' ? 'text-cyan-600' : 'text-emerald-600'
                      }`}>{highestSeverity}</div>
                      <div className="text-xs text-slate-600 font-medium">Priority Level</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="text-sm text-slate-700 font-semibold flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                      Active Events:
                    </div>
                    {groupEvents.slice(0, 3).map(event => (
                      <div key={event.properties.id} className="flex items-center space-x-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <span className="text-sm">
                            {event.properties.category === 'military' ? '🛡️' : 
                             event.properties.category === 'humanitarian' ? '❤️' : 
                             event.properties.category === 'political' ? '🏛️' :
                             event.properties.category === 'economic' ? '📊' : '📍'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800 truncate">
                            {event.properties.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {event.properties.article_count} reports
                          </div>
                        </div>
                      </div>
                    ))}
                    {groupEvents.length > 3 && (
                      <div className="text-xs text-slate-500 text-center bg-slate-50 py-2 px-3 rounded-xl border border-slate-100">
                        +{groupEvents.length - 3} more events in this cluster
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onEventClick(firstEvent)}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-2xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Explore This Area →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        }
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
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
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

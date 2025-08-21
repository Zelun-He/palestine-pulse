'use client';

import { GeoJSONCollection, GeoJSONFeature, EventFilters } from '@/types';

interface SimpleMapProps {
  events: GeoJSONCollection;
  filters: EventFilters;
  currentTime?: Date;
  onEventClick: (event: GeoJSONFeature) => void;
  onBoundsChange: (bounds: any) => void;
  className?: string;
}

export default function SimpleMap({ 
  events, 
  onEventClick,
  className = '' 
}: SimpleMapProps) {
  return (
    <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
      <div className="text-center p-8">
        <div className="text-4xl mb-4">🗺️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Map</h3>
        <p className="text-gray-600 mb-4">Map component is loading...</p>
        
        {/* Simple event list as fallback */}
        <div className="max-w-md mx-auto">
          <h4 className="font-medium text-gray-900 mb-3">Events ({events.features.length})</h4>
          <div className="space-y-2">
            {events.features.map((event) => (
              <div 
                key={event.properties.id}
                className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onEventClick(event)}
              >
                <div className="font-medium text-gray-900">{event.properties.title}</div>
                <div className="text-sm text-gray-500">{event.properties.location_text}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    event.properties.category === 'military' ? 'bg-red-500' :
                    event.properties.category === 'humanitarian' ? 'bg-blue-500' :
                    event.properties.category === 'political' ? 'bg-purple-500' :
                    event.properties.category === 'economic' ? 'bg-green-500' :
                    event.properties.category === 'social' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></span>
                  <span className="text-xs text-gray-600 capitalize">{event.properties.category}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-600 capitalize">{event.properties.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          Click on any event to view details
        </div>
      </div>
    </div>
  );
}


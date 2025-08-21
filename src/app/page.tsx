'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import Map from '@/components/Map';
import SearchPanel from '@/components/SearchPanel';
import TimelineScrubber from '@/components/TimelineScrubber';
import { EventFilters, GeoJSONCollection, GeoJSONFeature, MapViewState } from '@/types';

// Mock data for immediate UI testing
const mockEvents: GeoJSONCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [35.2332, 31.9522] // Jerusalem
      },
      properties: {
        id: '1',
        title: 'Humanitarian Aid Distribution in Jerusalem',
        category: 'humanitarian',
        severity: 'high',
        occurred_at: '2024-01-15T10:00:00Z',
        location_text: 'Jerusalem, Old City',
        article_count: 3
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [34.7818, 32.0853] // Tel Aviv
      },
      properties: {
        id: '2',
        title: 'Political Rally for Peace Talks',
        category: 'political',
        severity: 'medium',
        occurred_at: '2024-01-14T15:30:00Z',
        location_text: 'Tel Aviv, Rabin Square',
        article_count: 5
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [34.4667, 31.5017] // Gaza
      },
      properties: {
        id: '3',
        title: 'Emergency Medical Response in Gaza',
        category: 'humanitarian',
        severity: 'critical',
        occurred_at: '2024-01-15T08:15:00Z',
        location_text: 'Gaza City, Al-Shifa Hospital',
        article_count: 7
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [35.2950, 32.7253] // Haifa
      },
      properties: {
        id: '4',
        title: 'Economic Development Meeting',
        category: 'economic',
        severity: 'low',
        occurred_at: '2024-01-13T14:00:00Z',
        location_text: 'Haifa, Port Area',
        article_count: 2
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [34.8500, 31.2500] // Ashkelon
      },
      properties: {
        id: '5',
        title: 'Security Incident Near Border',
        category: 'military',
        severity: 'high',
        occurred_at: '2024-01-15T06:45:00Z',
        location_text: 'Ashkelon, Southern Border',
        article_count: 4
      }
    }
  ]
};

export default function Dashboard() {
  const [events, setEvents] = useState<GeoJSONCollection>(mockEvents); // Use mock data
  const [filters, setFilters] = useState<EventFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GeoJSONFeature | null>(null);

  // Mock fetch events function (no database needed)
  const fetchEvents = useCallback(async () => {
    // For now, just use the mock data
    setEvents(mockEvents);
    setLoading(false);
  }, []);

  // Handle map bounds change
  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    setMapBounds(bounds);
  }, []);

  // Handle event click
  const handleEventClick = useCallback((event: GeoJSONFeature) => {
    setSelectedEvent(event);
  }, []);

  // Handle time change from timeline
  const handleTimeChange = useCallback((time: Date) => {
    setCurrentTime(time);
  }, []);

  // Handle playback change
  const handlePlaybackChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  // Get date range for timeline (last 30 days by default)
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Palestine Pulse</h1>
                <p className="text-sm text-gray-500">Real-time incident mapping & analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span>{events.features.length} events (Mock Data)</span>
              </div>
              
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                Submit Report
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Search & Filters */}
          <div className="lg:col-span-1 space-y-6">
            <SearchPanel
              onFiltersChange={setFilters}
              onSearch={setSearchQuery}
            />
            
            <TimelineScrubber
              startDate={startDate}
              endDate={endDate}
              onTimeChange={handleTimeChange}
              onPlaybackChange={handlePlaybackChange}
            />
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="h-[600px] lg:h-[700px]">
                <Map
                  events={events}
                  filters={filters}
                  currentTime={currentTime}
                  onEventClick={handleEventClick}
                  onBoundsChange={handleBoundsChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Event Details Panel */}
        {selectedEvent && (
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedEvent.properties.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span className="capitalize">{selectedEvent.properties.category}</span>
                    <span className="capitalize">{selectedEvent.properties.severity}</span>
                    <span>{new Date(selectedEvent.properties.occurred_at).toLocaleDateString()}</span>
                    <span>{selectedEvent.properties.location_text}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Source Articles</h3>
                      <p className="text-2xl font-bold text-blue-600">{selectedEvent.properties.article_count}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        selectedEvent.properties.category === 'military' ? 'bg-red-100 text-red-800' :
                        selectedEvent.properties.category === 'humanitarian' ? 'bg-blue-100 text-blue-800' :
                        selectedEvent.properties.category === 'political' ? 'bg-purple-100 text-purple-800' :
                        selectedEvent.properties.category === 'economic' ? 'bg-green-100 text-green-800' :
                        selectedEvent.properties.category === 'social' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedEvent.properties.category}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Severity</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        selectedEvent.properties.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        selectedEvent.properties.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        selectedEvent.properties.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedEvent.properties.severity}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mock Data Notice */}
        <div className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
                <p className="text-sm text-blue-700">
                  This is a demonstration with sample data. The full application includes real-time data ingestion, 
                  advanced analytics, and live incident reporting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

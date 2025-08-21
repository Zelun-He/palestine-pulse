'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Search, 
  Bell, 
  Activity, 
  TrendingUp, 
  Globe, 
  Calendar, 
  Clock, 
  AlertTriangle,
  Heart,
  Shield,
  Building,
  Users,
  Filter,
  Zap,
  Eye,
  Share,
  Settings
} from 'lucide-react';
import { GeoJSONCollection, GeoJSONFeature } from '@/types';

// Dynamically import components
const MapComponent = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full animate-pulse">
    <div className="text-center">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-2 animate-spin"></div>
      <p className="text-slate-500">Loading interactive map...</p>
    </div>
  </div>
});

const EventDrawer = dynamic(() => import('@/components/EventDrawer'), { 
  ssr: false 
});

const RSSManagement = dynamic(() => import('@/components/RSSManagement'), { 
  ssr: false 
});

// Enhanced mock data
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
        title: 'Medical Response Coordination',
        category: 'humanitarian',
        severity: 'critical',
        occurred_at: '2024-01-15T08:15:00Z',
        location_text: 'Gaza City',
        article_count: 12
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
        title: 'Economic Development Summit',
        category: 'economic',
        severity: 'low',
        occurred_at: '2024-01-13T14:00:00Z',
        location_text: 'Haifa Port Area',
        article_count: 2
      }
    }
  ]
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GeoJSONFeature | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEventClick = useCallback((event: GeoJSONFeature) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleBoundsChange = useCallback((bounds: any) => {
    // Handle bounds change
  }, []);

  // Stats calculations
  const totalEvents = mockEvents.features.length;
  const criticalEvents = mockEvents.features.filter(e => e.properties.severity === 'critical').length;
  const totalArticles = mockEvents.features.reduce((sum, e) => sum + e.properties.article_count, 0);
  const recentEvents = mockEvents.features.filter(e => {
    const eventTime = new Date(e.properties.occurred_at);
    const now = new Date();
    return (now.getTime() - eventTime.getTime()) < 24 * 60 * 60 * 1000; // Last 24 hours
  }).length;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Palestine Pulse
          </div>
          <div className="text-slate-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Palestine Pulse
                </h1>
                <p className="text-sm text-slate-500 font-medium">News Intelligence Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-xl">
                  <Activity className="w-4 h-4" />
                  <span className="font-semibold">{totalEvents} Active</span>
                </div>
                <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-2 rounded-xl">
                  <Zap className="w-4 h-4" />
                  <span className="font-semibold">Live</span>
                </div>
              </div>
              
              <button className="p-2 hover:bg-blue-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-200">
                <Share className="w-4 h-4 inline mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Events</p>
                <p className="text-3xl font-bold text-slate-900">{totalEvents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-slate-500 ml-1">vs last week</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Critical Alerts</p>
                <p className="text-3xl font-bold text-slate-900">{criticalEvents}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <span className="text-red-600 font-medium">High Priority</span>
              <span className="text-slate-500 ml-1">requiring attention</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">News Coverage</p>
                <p className="text-3xl font-bold text-slate-900">{totalArticles}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <span className="text-purple-600 font-medium">Articles</span>
              <span className="text-slate-500 ml-1">tracked today</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Last 24hrs</p>
                <p className="text-3xl font-bold text-slate-900">{recentEvents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <span className="text-green-600 font-medium">Recent</span>
              <span className="text-slate-500 ml-1">developments</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search & Filters Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <Search className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">Search & Filter</h3>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search events, locations..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'All', icon: Globe, color: 'blue' },
                      { name: 'Humanitarian', icon: Heart, color: 'green' },
                      { name: 'Political', icon: Building, color: 'purple' },
                      { name: 'Military', icon: Shield, color: 'red' },
                      { name: 'Economic', icon: TrendingUp, color: 'yellow' },
                    ].map(category => (
                      <button 
                        key={category.name}
                        onClick={() => setActiveFilter(category.name)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          activeFilter === category.name
                            ? `bg-${category.color}-500 text-white shadow-md`
                            : `bg-slate-100 text-slate-600 hover:bg-slate-200`
                        }`}
                      >
                        <category.icon className="w-4 h-4" />
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

                         {/* Quick Stats */}
             <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm">
               <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                 <Activity className="w-5 h-5 mr-2" />
                 Live Activity
               </h3>
               <div className="space-y-4">
                 {[
                   { location: 'Jerusalem', count: 3, trend: '+2' },
                   { location: 'Gaza Strip', count: 12, trend: '+8' },
                   { location: 'West Bank', count: 1, trend: '0' },
                   { location: 'Tel Aviv', count: 5, trend: '+1' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                       <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                       <span className="text-sm font-medium text-slate-700">{item.location}</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <span className="text-sm font-bold text-slate-900">{item.count}</span>
                       <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                         {item.trend}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* RSS Management */}
             <RSSManagement />
           </div>

          {/* Interactive Map */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Interactive News Map
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live Updates</span>
                    </div>
                    <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                      <Settings className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="h-[600px] lg:h-[700px] relative">
                <MapComponent
                  events={mockEvents}
                                     filters={{ category: activeFilter !== 'All' ? (activeFilter.toLowerCase() as 'military' | 'humanitarian' | 'political' | 'economic' | 'social' | 'other') : undefined }}
                  currentTime={new Date()}
                  onEventClick={handleEventClick}
                  onBoundsChange={handleBoundsChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Drawer */}
      <EventDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
      />
    </div>
  );
}
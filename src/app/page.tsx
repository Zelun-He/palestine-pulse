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
  Filter,
  Zap,
  Eye,
  Share,
  Settings
} from 'lucide-react';
import { GeoJSONCollection, GeoJSONFeature } from '@/types';

// Add debug logging
console.log('Page component loading...');

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

// Temporarily comment out dynamic imports to test
// const MapComponent = dynamic(() => import('@/components/Map'), { 
//   ssr: false,
//   loading: () => <div className="flex items-center justify-center h-full animate-pulse">
//     <div className="text-center">
//       <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-2 animate-spin"></div>
//       <p className="text-slate-500">Loading interactive map...</p>
//     </div>
//   </div>
// });

// const EventDrawer = dynamic(() => import('@/components/EventDrawer'), { 
//   ssr: false 
// });

// const RSSManagement = dynamic(() => import('@/components/RSSManagement'), { 
//   ssr: false 
// });

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
    console.log('useEffect running, setting mounted to true');
    setMounted(true);
    console.log('mounted state set to true');
  }, []);

  console.log('Component render - mounted state:', mounted);

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
    <div className="min-h-screen animated-gradient">
      {/* Ultra-modern Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 via-red-600 to-black rounded-3xl flex items-center justify-center shadow-2xl float pulse-glow">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black gradient-text tracking-tight">
                  Palestine Pulse
                </h1>
                <p className="text-sm text-slate-600 font-semibold mt-1 tracking-wide">🌍 Real-time Intelligence • 🚀 AI-Powered Insights</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-3 text-sm">
                <div className="glass flex items-center space-x-2 text-green-800 px-4 py-3 rounded-2xl card-modern">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <Activity className="w-4 h-4" />
                  <span className="font-bold">{totalEvents} Active</span>
                </div>
                <div className="glass flex items-center space-x-2 text-red-800 px-4 py-3 rounded-2xl card-modern">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  <Zap className="w-4 h-4" />
                  <span className="font-bold">Live</span>
                </div>
              </div>
              
              <a
                href="/search"
                className="btn-modern glass px-6 py-3 text-white text-sm font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3 bg-gradient-to-r from-green-600 to-green-700"
              >
                <Search className="w-5 h-5" />
                <span>Advanced Search</span>
              </a>
              <a
                href="/demo"
                className="btn-modern glass px-6 py-3 text-white text-sm font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3 bg-gradient-to-r from-red-600 to-red-700"
              >
                <Filter className="w-5 h-5" />
                <span>Interactive Demo</span>
              </a>
              <button className="glass p-4 hover:bg-white/20 rounded-2xl transition-all duration-300 card-modern">
                <Bell className="w-6 h-6 text-slate-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ultra-modern Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="glass card-modern rounded-3xl p-8 border border-white/10 group">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Global Events</p>
                <p className="text-4xl font-black text-slate-900 mt-2">{totalEvents}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 pulse-glow">
                <Globe className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex items-center text-sm bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 rounded-2xl border border-green-200">
              <TrendingUp className="w-5 h-5 text-green-700 mr-2" />
              <span className="text-green-800 font-black">+12%</span>
              <span className="text-slate-700 ml-2 font-semibold">vs last week</span>
            </div>
          </div>

          <div className="glass card-modern rounded-3xl p-8 border border-white/10 group">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Critical Alerts</p>
                <p className="text-4xl font-black text-slate-900 mt-2">{criticalEvents}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 pulse-glow-red">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex items-center text-sm bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 rounded-2xl border border-red-200">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-3"></div>
              <span className="text-red-800 font-black">Urgent Action</span>
              <span className="text-slate-700 ml-2 font-semibold">required</span>
            </div>
          </div>

          <div className="glass card-modern rounded-3xl p-8 border border-white/10 group">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">News Coverage</p>
                <p className="text-4xl font-black text-slate-900 mt-2">{totalArticles}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-black rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex items-center text-sm bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 rounded-2xl border border-slate-200">
              <div className="w-2 h-2 bg-slate-700 rounded-full animate-pulse mr-3"></div>
              <span className="text-slate-800 font-black">Articles</span>
              <span className="text-slate-700 ml-2 font-semibold">tracked today</span>
            </div>
          </div>

          <div className="glass card-modern rounded-3xl p-8 border border-white/10 group">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Real-Time</p>
                <p className="text-4xl font-black text-slate-900 mt-2">{recentEvents}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-red-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 pulse-glow">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex items-center text-sm bg-gradient-to-r from-green-50 to-red-50 px-4 py-3 rounded-2xl border border-green-200">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-3"></div>
              <span className="text-green-800 font-black">Last 24hrs</span>
              <span className="text-slate-700 ml-2 font-semibold">updates</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Advanced Control Panel */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass card-modern rounded-3xl p-8 border border-green-200/30">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg pulse-glow">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900">🔍 Smart Search & Filters</h3>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <Search className="w-5 h-5 text-green-600" />
                    <div className="w-1 h-1 bg-green-600 rounded-full animate-pulse"></div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="🤖 AI-powered search: events, locations, keywords..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 glass border border-white/20 rounded-2xl focus-modern transition-all text-slate-800 placeholder-slate-500 font-medium"
                  />
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
                    <Filter className="w-5 h-5 mr-3 text-green-700" />
                    🎯 Smart Categories
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'All', icon: Globe, gradient: 'from-slate-700 to-black' },
                      { name: 'Humanitarian', icon: Heart, gradient: 'from-green-600 to-green-700' },
                      { name: 'Political', icon: Building, gradient: 'from-red-600 to-red-700' },
                      { name: 'Military', icon: Shield, gradient: 'from-black to-slate-800' },
                      { name: 'Economic', icon: TrendingUp, gradient: 'from-green-700 to-red-700' },
                    ].map(category => (
                      <button 
                        key={category.name}
                        onClick={() => setActiveFilter(category.name)}
                        className={`btn-modern flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                          activeFilter === category.name
                            ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg scale-105`
                            : `glass text-slate-700 hover:scale-105`
                        }`}
                      >
                        <category.icon className="w-5 h-5" />
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

                         {/* Real-time Activity Monitor */}
             <div className="glass card-modern rounded-3xl p-8 border border-red-200/30">
               <div className="flex items-center space-x-4 mb-6">
                 <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg pulse-glow-red">
                   <Activity className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900">📡 Live Activity Monitor</h3>
               </div>
               <div className="space-y-6">
                 {[
                   { location: 'Jerusalem', count: 3, trend: '+2', status: 'moderate', color: 'from-green-600 to-green-700' },
                   { location: 'Gaza Strip', count: 12, trend: '+8', status: 'high', color: 'from-red-600 to-red-700' },
                   { location: 'West Bank', count: 1, trend: '0', status: 'low', color: 'from-green-500 to-green-600' },
                   { location: 'Tel Aviv', count: 5, trend: '+1', status: 'moderate', color: 'from-black to-slate-800' }
                 ].map((item, i) => (
                   <div key={i} className="glass rounded-2xl p-4 border border-white/10 hover:scale-105 transition-all duration-300">
                     <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center space-x-3">
                         <div className={`w-3 h-3 bg-gradient-to-r ${item.color} rounded-full animate-pulse shadow-lg`}></div>
                         <span className="text-sm font-black text-slate-800">{item.location}</span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className="text-lg font-black text-slate-900">{item.count}</span>
                         <span className={`text-xs font-bold px-3 py-1 rounded-xl ${
                           item.trend.startsWith('+') ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' :
                           item.trend === '0' ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700' :
                           'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                         }`}>
                           {item.trend}
                         </span>
                       </div>
                     </div>
                     <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                       {item.status} Activity Level
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* RSS Management */}
             {/* <RSSManagement /> */}
           </div>

          {/* Next-Gen Interactive Intelligence Map */}
          <div className="lg:col-span-3">
            <div className="glass card-modern rounded-3xl border border-green-200/30 overflow-hidden">
              <div className="p-8 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-600 via-red-600 to-black rounded-3xl flex items-center justify-center shadow-xl pulse-glow">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">🗺️ Palestine Intelligence Map</h3>
                      <p className="text-sm font-semibold text-slate-700 mt-1">🔍 Real-time Monitoring • 📊 Live Analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="glass flex items-center space-x-3 text-sm text-green-800 px-4 py-3 rounded-2xl border border-green-300">
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse shadow-lg"></div>
                      <span className="font-black">Live Intelligence</span>
                    </div>
                    <button className="glass p-3 hover:bg-white/20 rounded-2xl transition-all duration-300 card-modern">
                      <Settings className="w-6 h-6 text-slate-800" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="h-[600px] lg:h-[800px] relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                {/* <MapComponent
                  events={mockEvents}
                                     filters={{ category: activeFilter !== 'All' ? (activeFilter.toLowerCase() as 'military' | 'humanitarian' | 'political' | 'economic' | 'social' | 'other') : undefined }}
                  currentTime={new Date()}
                  onEventClick={handleEventClick}
                  onBoundsChange={handleBoundsChange}
                /> */}
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-600 via-red-600 to-black rounded-full flex items-center justify-center mx-auto shadow-2xl float pulse-glow">
                      <MapPin className="w-16 h-16 text-white" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-slate-900">🗺️ Palestine Intelligence Map</h3>
                      <p className="text-slate-700 font-semibold max-w-md mx-auto leading-relaxed">
                        Real-time monitoring of Palestine region with advanced geospatial intelligence and news analysis
                      </p>
                      <div className="glass px-6 py-3 rounded-2xl text-sm font-bold text-green-800 border border-green-300 inline-block">
                        🔧 Interactive visualization loading - System optimization in progress
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Drawer */}
      {/* <EventDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
      /> */}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Eye, 
  TrendingUp, 
  Share, 
  AlertCircle,
  Clock,
  Heart,
  Shield,
  Building,
  BarChart,
  Users,
  ExternalLink
} from 'lucide-react';
import { GeoJSONFeature } from '@/types';

interface EventDrawerProps {
  event: GeoJSONFeature | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDrawer({ event, isOpen, onClose }: EventDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'articles' | 'timeline'>('details');

  if (!event || !isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      military: 'bg-red-500',
      humanitarian: 'bg-blue-500',
      political: 'bg-purple-500',
      economic: 'bg-green-500',
      social: 'bg-yellow-500',
      other: 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-600',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out z-50 border-l border-white/20">
      {/* Modern Header */}
      <div className="p-6 bg-white/70 backdrop-blur-lg border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Event Details
              </h2>
              <p className="text-sm text-slate-500 font-medium">News Intelligence Report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-xl transition-colors group"
          >
            <X className="w-5 h-5 text-slate-600 group-hover:text-slate-800" />
          </button>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="p-6 bg-white/40 backdrop-blur-sm border-b border-white/20">
        <div className="flex space-x-2 bg-white/60 backdrop-blur-sm p-1 rounded-2xl border border-white/30">
          {[
            { id: 'details', label: 'Overview', icon: Eye },
            { id: 'articles', label: 'Coverage', icon: BarChart },
            { id: 'timeline', label: 'Timeline', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-xl ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-white/50 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modern Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Event Header Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/30 shadow-sm">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                  {event.properties.category === 'military' ? <Shield className="w-8 h-8 text-white" /> : 
                   event.properties.category === 'humanitarian' ? <Heart className="w-8 h-8 text-white" /> : 
                   event.properties.category === 'political' ? <Building className="w-8 h-8 text-white" /> : 
                   event.properties.category === 'economic' ? <TrendingUp className="w-8 h-8 text-white" /> : 
                   <MapPin className="w-8 h-8 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">
                    {event.properties.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.properties.occurred_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category & Priority Tags */}
            <div className="flex flex-wrap gap-3">
              <div className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold border-2 ${
                event.properties.category === 'military' ? 'bg-red-100 text-red-700 border-red-200' :
                event.properties.category === 'humanitarian' ? 'bg-green-100 text-green-700 border-green-200' :
                event.properties.category === 'political' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                event.properties.category === 'economic' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {event.properties.category === 'military' ? <Shield className="w-4 h-4 mr-2" /> : 
                 event.properties.category === 'humanitarian' ? <Heart className="w-4 h-4 mr-2" /> : 
                 event.properties.category === 'political' ? <Building className="w-4 h-4 mr-2" /> : 
                 event.properties.category === 'economic' ? <TrendingUp className="w-4 h-4 mr-2" /> :
                 <Users className="w-4 h-4 mr-2" />}
                {event.properties.category}
              </div>
              <div className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold border-2 ${
                event.properties.severity === 'critical' ? 'bg-red-100 text-red-700 border-red-200' :
                event.properties.severity === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                event.properties.severity === 'medium' ? 'bg-cyan-100 text-cyan-700 border-cyan-200' : 
                'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}>
                <AlertCircle className="w-4 h-4 mr-2" />
                {event.properties.severity} priority
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/30 shadow-sm">
              <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Location Details
              </h4>
              <p className="text-slate-700 mb-3">{event.properties.location_text}</p>
              <div className="text-sm text-slate-500 font-mono bg-slate-100 px-3 py-2 rounded-xl">
                {event.geometry.coordinates[1].toFixed(4)}, {event.geometry.coordinates[0].toFixed(4)}
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 text-center">
                <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {event.properties.article_count}
                </div>
                <div className="text-sm text-blue-700 font-semibold mt-1">News Articles</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-3xl border border-purple-100 text-center">
                <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {event.properties.credibility_avg ? Math.round(event.properties.credibility_avg * 100) + '%' : 'NEW'}
                </div>
                <div className="text-sm text-purple-700 font-semibold mt-1">
                  {event.properties.credibility_avg ? 'Credibility' : 'Status'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-2xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <MapPin className="w-4 h-4 inline mr-2" />
                Focus on Map
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button className="px-6 py-3 bg-white text-slate-700 text-sm font-semibold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors">
                  <Share className="w-4 h-4 inline mr-2" />
                  Share
                </button>
                <button className="px-6 py-3 bg-slate-100 text-slate-700 text-sm font-semibold rounded-2xl hover:bg-slate-200 transition-colors">
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                  Source
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="space-y-6">
            {/* Coverage Header */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/30 shadow-sm text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">News Coverage</h3>
              <p className="text-slate-600">
                {event.properties.article_count} articles covering this event
              </p>
            </div>
            
            {/* Article Cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/30 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">#{i}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">LIVE</span>
                      <span className="text-sm text-slate-500">Al Jazeera</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base mb-3 leading-tight">
                      Breaking: {event.properties.title} - Latest Developments #{i}
                    </h4>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      Latest developments from {event.properties.location_text}. Multiple verified sources reporting ongoing situation with comprehensive coverage and analysis from field reporters...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        {new Date(Date.now() - i * 3600000).toLocaleTimeString()} • {Math.floor(Math.random() * 5) + 3} min read
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-500">{(i * 234 + 1200).toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-2xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                    <ExternalLink className="w-4 h-4 inline mr-2" />
                    Read Full Article
                  </button>
                </div>
              </div>
            ))}
            
            {/* Load More */}
            <div className="text-center pt-4">
              <button className="px-8 py-4 bg-white text-slate-700 text-sm font-semibold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                Load More Articles
              </button>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {/* Timeline Header */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/30 shadow-sm text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Event Timeline</h3>
              <p className="text-slate-600">
                Real-time development updates
              </p>
            </div>
            
            {/* Timeline Items */}
            <div className="space-y-4">
              {[
                { time: '2h ago', event: 'First reports emerged', type: 'report', icon: AlertCircle },
                { time: '1h ago', event: 'Official confirmation received', type: 'confirmation', icon: Shield },
                { time: '30m ago', event: 'Response teams deployed', type: 'action', icon: Users },
                { time: 'Now', event: 'Situation developing', type: 'current', icon: Eye }
              ].map((item, i) => (
                <div key={i} className="bg-white/70 backdrop-blur-sm rounded-3xl p-5 border border-white/30 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                        item.type === 'report' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                        item.type === 'confirmation' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                        item.type === 'action' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 
                        'bg-gradient-to-br from-purple-500 to-purple-600'
                      }`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold text-slate-900 mb-1">{item.event}</div>
                      <div className="text-sm text-slate-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {item.time}
                      </div>
                    </div>
                    {item.type === 'current' && (
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  {i === 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600">
                        Multiple verified sources reporting developments in {event.properties.location_text}. 
                        Field teams are providing continuous updates on the situation.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Live Status */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span>Live Updates Active</span>
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Footer */}
      <div className="p-6 bg-white/70 backdrop-blur-lg border-t border-white/20">
        <div className="text-sm text-slate-500 text-center">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>Event #{event.properties.id}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Updated {formatDate(event.properties.occurred_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Clock, 
  Database, 
  Globe, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause
} from 'lucide-react';

interface RSSSource {
  name: string;
  type: string;
  credibility_score: number;
  last_fetch: string;
}

interface RSSStatus {
  status: string;
  sources: RSSSource[];
  schedule: {
    fetch_interval: string;
    backfill_time: string;
  };
}

export default function RSSManagement() {
  const [status, setStatus] = useState<RSSStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/rss/process');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching RSS status:', error);
    }
  };

  const triggerAction = async (action: 'fetch' | 'backfill') => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/rss/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      
      if (data.success) {
        setLastAction(`${action === 'fetch' ? 'RSS Fetch' : 'Backfill'} completed successfully`);
        fetchStatus(); // Refresh status
      } else {
        setError(data.error || 'Action failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!status) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">RSS Management</h3>
            <p className="text-sm text-slate-500">News feed processing & monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            status.status === 'active' ? 'bg-green-500' : 'bg-red-500'
          } animate-pulse`}></div>
          <span className="text-sm font-medium text-slate-600 capitalize">{status.status}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => triggerAction('fetch')}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-2xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Fetch RSS Now</span>
        </button>
        
        <button
          onClick={() => triggerAction('backfill')}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-2xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          <Database className="w-4 h-4" />
          <span>Run Backfill</span>
        </button>
      </div>

      {/* Status Messages */}
      {lastAction && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-xl">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">{lastAction}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Schedule Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Fetch Interval</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{status.schedule.fetch_interval}</p>
        </div>
        
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Backfill Time</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{status.schedule.backfill_time}</p>
        </div>
      </div>

      {/* RSS Sources */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-700 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          RSS Sources ({status.sources.length})
        </h4>
        
        {status.sources.map((source, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                source.type === 'international_media' ? 'bg-blue-500' :
                source.type === 'local_media' ? 'bg-green-500' : 'bg-purple-500'
              }`}></div>
              <div>
                <div className="font-medium text-slate-900">{source.name}</div>
                <div className="text-xs text-slate-500 capitalize">{source.type.replace('_', ' ')}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900">Credibility</div>
                <div className="text-xs text-slate-500">{source.credibility_score}/10</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900">Last Fetch</div>
                <div className="text-xs text-slate-500">
                  {new Date(source.last_fetch).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <button
          onClick={fetchStatus}
          className="w-full px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Refresh Status
        </button>
      </div>
    </div>
  );
}

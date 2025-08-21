'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Calendar, MapPin, Shield } from 'lucide-react';
import { EventFilters, Event } from '@/types';

interface EnhancedSearchPanelProps {
  onFiltersChange: (filters: EventFilters) => void;
  onSearch: (query: string) => void;
  onViewChange: (view: 'map' | 'list') => void;
  currentView: 'map' | 'list';
  className?: string;
}

export default function EnhancedSearchPanel({ 
  onFiltersChange, 
  onSearch, 
  onViewChange,
  currentView,
  className = '' 
}: EnhancedSearchPanelProps) {
  const [filters, setFilters] = useState<EventFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [minCredibility, setMinCredibility] = useState(0);
  const [locationFilter, setLocationFilter] = useState('');

  const categories = [
    { value: 'military', label: 'Military', color: 'bg-red-500', icon: '⚔️' },
    { value: 'humanitarian', label: 'Humanitarian', color: 'bg-blue-500', icon: '🕊️' },
    { value: 'political', label: 'Political', color: 'bg-purple-500', icon: '🏛️' },
    { value: 'economic', label: 'Economic', color: 'bg-green-500', icon: '💰' },
    { value: 'social', label: 'Social', color: 'bg-yellow-500', icon: '👥' },
    { value: 'other', label: 'Other', color: 'bg-gray-500', icon: '📌' }
  ];

  const severities = [
    { value: 'critical', label: 'Critical', color: 'bg-red-600', icon: '🚨' },
    { value: 'high', label: 'High', color: 'bg-orange-500', icon: '⚠️' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500', icon: '⚡' },
    { value: 'low', label: 'Low', color: 'bg-green-500', icon: '✅' }
  ];

  const sources = [
    { value: 'international_media', label: 'International Media', color: 'bg-blue-500' },
    { value: 'local_media', label: 'Local Media', color: 'bg-green-500' },
    { value: 'ngo', label: 'NGO Reports', color: 'bg-purple-500' },
    { value: 'government', label: 'Government', color: 'bg-gray-500' }
  ];

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        onSearch(searchQuery.trim());
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  // Update filters when local state changes
  useEffect(() => {
    const newFilters: EventFilters = {};
    
    if (selectedCategory) newFilters.category = selectedCategory as Event['category'];
    if (selectedSeverity) newFilters.severity = selectedSeverity as Event['severity'];
    if (selectedSource) newFilters.source_type = selectedSource;
    if (dateRange.start) newFilters.start_date = new Date(dateRange.start);
    if (dateRange.end) newFilters.end_date = new Date(dateRange.end);
    if (minCredibility > 0) newFilters.min_credibility = minCredibility;
    if (locationFilter) newFilters.location = locationFilter;
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [selectedCategory, selectedSeverity, selectedSource, dateRange, minCredibility, locationFilter, onFiltersChange]);

  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSelectedSeverity('');
    setSelectedSource('');
    setDateRange({ start: '', end: '' });
    setMinCredibility(0);
    setSearchQuery('');
    setLocationFilter('');
    setFilters({});
    onFiltersChange({});
  }, [onFiltersChange]);

  const hasActiveFilters = selectedCategory || selectedSeverity || selectedSource || dateRange.start || dateRange.end || minCredibility > 0 || locationFilter;

  const activeFilterCount = [
    selectedCategory, 
    selectedSeverity, 
    selectedSource, 
    dateRange.start, 
    dateRange.end, 
    minCredibility > 0, 
    locationFilter
  ].filter(Boolean).length;

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg ${className}`}>
      {/* Header with View Toggle */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Search & Filters</h3>
              <p className="text-sm text-slate-500">Find events and articles</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-2xl p-1">
              <button
                onClick={() => onViewChange('map')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  currentView === 'map' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Map View
              </button>
              <button
                onClick={() => onViewChange('list')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  currentView === 'list' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                List View
              </button>
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, locations, organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center space-x-1 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Event Categories
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(selectedCategory === category.value ? '' : category.value)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === category.value
                      ? `${category.color} text-white shadow-sm`
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Severity Level
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {severities.map((severity) => (
                <button
                  key={severity.value}
                  onClick={() => setSelectedSeverity(selectedSeverity === severity.value ? '' : severity.value)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedSeverity === severity.value
                      ? `${severity.color} text-white shadow-sm`
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{severity.icon}</span>
                  <span>{severity.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Source Types */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Source Types
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {sources.map((source) => (
                <button
                  key={source.value}
                  onClick={() => setSelectedSource(selectedSource === source.value ? '' : source.value)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedSource === source.value
                      ? `${source.color} text-white shadow-sm`
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{source.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Location
            </h4>
            <input
              type="text"
              placeholder="Enter city, region, or coordinates..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Credibility Threshold */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Minimum Credibility Score
            </h4>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={minCredibility}
                onChange={(e) => setMinCredibility(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>0 (Any)</span>
                <span className="font-medium">{minCredibility}/10</span>
                <span>10 (Highest)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

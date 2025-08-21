'use client';

import { useState, useEffect, useCallback } from 'react';
import { EventFilters, Event } from '@/types';

interface SearchPanelProps {
  onFiltersChange: (filters: EventFilters) => void;
  onSearch: (query: string) => void;
  className?: string;
}

export default function SearchPanel({ onFiltersChange, onSearch, className = '' }: SearchPanelProps) {
  const [filters, setFilters] = useState<EventFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [minCredibility, setMinCredibility] = useState(0);

  const categories = [
    { value: 'military', label: 'Military', color: 'bg-red-500' },
    { value: 'humanitarian', label: 'Humanitarian', color: 'bg-blue-500' },
    { value: 'political', label: 'Political', color: 'bg-purple-500' },
    { value: 'economic', label: 'Economic', color: 'bg-green-500' },
    { value: 'social', label: 'Social', color: 'bg-yellow-500' },
    { value: 'other', label: 'Other', color: 'bg-gray-500' }
  ];

  const severities = [
    { value: 'critical', label: 'Critical', color: 'bg-red-600' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'low', label: 'Low', color: 'bg-green-500' }
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
    if (dateRange.start) newFilters.start_date = new Date(dateRange.start);
    if (dateRange.end) newFilters.end_date = new Date(dateRange.end);
    if (minCredibility > 0) newFilters.min_credibility = minCredibility;
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [selectedCategory, dateRange, minCredibility, onFiltersChange]);

  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSelectedSeverity('');
    setDateRange({ start: '', end: '' });
    setMinCredibility(0);
    setSearchQuery('');
    setFilters({});
    onFiltersChange({});
  }, [onFiltersChange]);

  const hasActiveFilters = selectedCategory || dateRange.start || dateRange.end || minCredibility > 0 || searchQuery;

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Search & Filters</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Search Input */}
        <div className="mt-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events, locations, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(selectedCategory === category.value ? '' : category.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedCategory === category.value
                      ? `${category.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
            <div className="grid grid-cols-2 gap-2">
              {severities.map((severity) => (
                <button
                  key={severity.value}
                  onClick={() => setSelectedSeverity(selectedSeverity === severity.value ? '' : severity.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedSeverity === severity.value
                      ? `${severity.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {severity.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Credibility Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Source Credibility: {minCredibility.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={minCredibility}
              onChange={(e) => setMinCredibility(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Any source</span>
              <span>High credibility only</span>
            </div>
          </div>

          {/* Quick Date Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Date Ranges</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Last 24h', days: 1 },
                { label: 'Last 7 days', days: 7 },
                { label: 'Last 30 days', days: 30 },
                { label: 'Last 90 days', days: 90 }
              ].map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date(end.getTime() - preset.days * 24 * 60 * 60 * 1000);
                    setDateRange({
                      start: start.toISOString().split('T')[0],
                      end: end.toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer with Clear Button */}
      {hasActiveFilters && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

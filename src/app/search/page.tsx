'use client';

import { useState, useCallback } from 'react';
import { MapPin, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import { EventFilters, Article } from '@/types';
import EnhancedSearchPanel from '@/components/EnhancedSearchPanel';
import ArticleListView from '@/components/ArticleListView';

// Dynamically import components to prevent SSR issues
const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full animate-pulse">
    <div className="text-center">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-2 animate-spin"></div>
      <p className="text-slate-500">Loading map...</p>
    </div>
  </div>
});

export default function SearchPage() {
  const [currentView, setCurrentView] = useState<'map' | 'list'>('list');
  const [filters, setFilters] = useState<EventFilters>({});

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleFiltersChange = useCallback((newFilters: EventFilters) => {
    setFilters(newFilters);
    // Here you would typically fetch new data based on filters
    console.log('Filters changed:', newFilters);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Here you would typically perform search
    console.log('Search query:', query);
  }, []);

  const handleViewChange = useCallback((view: 'map' | 'list') => {
    setCurrentView(view);
  }, []);

  const handleArticleClick = useCallback((article: Article) => {
    console.log('Article clicked:', article);
    // Here you would typically open article details or navigate to article page
  }, []);

  const handleLoadMore = useCallback(() => {
    setLoading(true);
    // Simulate loading more data
    setTimeout(() => {
      setLoading(false);
      setHasMore(false); // For demo purposes, set to false after first load
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Search & Explore
                </h1>
                <p className="text-slate-600 text-sm">Find events, articles, and insights</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Current View</div>
                <div className="text-lg font-semibold text-slate-900 capitalize">{currentView}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search & Filters Panel */}
          <div className="lg:col-span-1">
            <EnhancedSearchPanel
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
              onViewChange={handleViewChange}
              currentView={currentView}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {currentView === 'map' ? (
              /* Map View */
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Interactive Map View
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Live Updates</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-[600px] lg:h-[700px] relative">
                  <MapComponent
                    events={{ type: 'FeatureCollection', features: [] }}
                    filters={filters}
                    currentTime={new Date()}
                    onEventClick={() => {}}
                    onBoundsChange={() => {}}
                  />
                </div>
              </div>
            ) : (
              /* List View */
              <ArticleListView
                articles={[]}
                sources={[]}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onArticleClick={handleArticleClick}
                loading={loading}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

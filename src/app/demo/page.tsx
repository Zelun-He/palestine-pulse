'use client';

import { useState, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react';
import EnhancedSearchPanel from '@/components/EnhancedSearchPanel';
import ArticleListView from '@/components/ArticleListView';
import ArticleCard from '@/components/ArticleCard';
import { EventFilters, Article } from '@/types';

export default function DemoPage() {
  const [currentView, setCurrentView] = useState<'map' | 'list'>('list');
  const [filters, setFilters] = useState<EventFilters>({});


  const handleFiltersChange = useCallback((newFilters: EventFilters) => {
    setFilters(newFilters);
    console.log('Filters changed:', newFilters);
  }, []);

  const handleSearch = useCallback((query: string) => {
    console.log('Search query:', query);
  }, []);

  const handleViewChange = useCallback((view: 'map' | 'list') => {
    setCurrentView(view);
  }, []);

  const handleArticleClick = useCallback((article: Article) => {
    console.log('Article clicked:', article);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Search & Cards Demo
          </h1>
          <p className="text-xl text-slate-600">
            Explore the enhanced search system with faceted filters and article cards
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <EnhancedSearchPanel
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
              onViewChange={handleViewChange}
              currentView={currentView}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentView === 'list' ? (
              <ArticleListView
                articles={[]}
                sources={[]}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onArticleClick={handleArticleClick}
                loading={false}
                hasMore={true}
                onLoadMore={() => {}}
              />
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-sm p-8 text-center">
                <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Map View</h3>
                <p className="text-slate-600">
                  Switch to list view to see the article cards and search functionality
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Component Showcase */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Component Showcase</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Individual Article Card Demo */}
            <div className="col-span-full lg:col-span-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Single Article Card</h3>
                             <ArticleCard
                 article={{
                   id: 'demo1',
                   title: 'Sample Article Title for Demonstration',
                   url: 'https://example.com',
                   published_at: new Date(),
                   fetched_at: new Date(),
                   language: 'en',
                   raw_text: 'This is a sample article text to demonstrate the article card component with all its features including credibility badges, source information, and interactive elements.',
                   hash: 'demo-hash',
                   source_id: 'demo-source',
                   status: 'processed',
                   tags: ['demo', 'sample', 'test'],
                   created_at: new Date(),
                   updated_at: new Date()
                 }}
                source={{
                  id: 'demo-source',
                  name: 'Demo News Source',
                  url: 'https://example.com',
                  type: 'international_media',
                  credibility_score: 8,
                  created_at: new Date(),
                  updated_at: new Date()
                }}
                onArticleClick={handleArticleClick}
              />
            </div>

            {/* Search Panel Demo */}
            <div className="col-span-full lg:col-span-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Search Panel</h3>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Enhanced Search</h4>
                    <p className="text-sm text-slate-500">Faceted filters & advanced search</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  The enhanced search panel includes category filters, severity levels, source types, date ranges, location filters, and credibility thresholds.
                </p>
              </div>
            </div>

            {/* List View Demo */}
                         <div className="col-span-full lg:col-span-1">
               <h3 className="text-lg font-semibold text-slate-900 mb-4">List View</h3>
               <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-sm p-6">
                 <div className="flex items-center space-x-3 mb-4">
                   <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                     <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                     </svg>
                   </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Article List</h4>
                    <p className="text-sm text-slate-500">Grid & list views with sorting</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  The list view supports both grid and list layouts, infinite scroll, sorting options, and real-time filtering.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

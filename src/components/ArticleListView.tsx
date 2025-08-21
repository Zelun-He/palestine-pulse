'use client';

import { useState, useCallback, useRef } from 'react';
import { 
  List, 
  Grid3X3, 
  SortAsc, 
  SortDesc, 
  Filter,
  Loader2,
  RefreshCw,
  TrendingUp,
  Clock,
  Eye
} from 'lucide-react';
import { Article, Source, EventFilters } from '@/types';
import ArticleCard from './ArticleCard';

interface ArticleListViewProps {
  articles: Article[];
  sources: Source[];
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  onArticleClick: (article: Article) => void;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'credibility' | 'relevance';
type ViewMode = 'list' | 'grid';

export default function ArticleListView({
  articles,
  sources,
  filters,
  onFiltersChange,
  onArticleClick,
  loading = false,
  hasMore = false,
  onLoadMore,
  className = ''
}: ArticleListViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  const mockArticles: Article[] = [
    {
      id: '1',
      title: 'Recent Developments in Gaza Strip Humanitarian Crisis',
      url: 'https://example.com/article1',
      published_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      fetched_at: new Date(),
      language: 'en',
      raw_text: 'The humanitarian situation in Gaza continues to deteriorate as international aid organizations struggle to provide essential services to the population. Recent reports indicate...',
      hash: 'hash1',
      source_id: '1',
      status: 'processed',
      tags: ['humanitarian', 'gaza', 'crisis']
    },
    {
      id: '2',
      title: 'Political Negotiations Resume in Jerusalem',
      url: 'https://example.com/article2',
      published_at: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      fetched_at: new Date(),
      language: 'en',
      raw_text: 'High-level political discussions have resumed in Jerusalem as representatives from various parties attempt to find common ground on key issues affecting the region...',
      hash: 'hash2',
      source_id: '2',
      status: 'processed',
      tags: ['political', 'jerusalem', 'negotiations']
    },
    {
      id: '3',
      title: 'Economic Impact of Recent Events on Local Businesses',
      url: 'https://example.com/article3',
      published_at: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      fetched_at: new Date(),
      language: 'en',
      raw_text: 'Local business owners in the West Bank are reporting significant economic challenges following recent developments. Many have seen a decline in customer traffic...',
      hash: 'hash3',
      source_id: '3',
      status: 'processed',
      tags: ['economic', 'west-bank', 'business']
    },
    {
      id: '4',
      title: 'Military Operations Update in Northern Regions',
      url: 'https://example.com/article4',
      published_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      fetched_at: new Date(),
      language: 'en',
      raw_text: 'Military operations in the northern regions have intensified over the past 24 hours. Security forces report increased activity in several key areas...',
      hash: 'hash4',
      source_id: '1',
      status: 'processed',
      tags: ['military', 'northern-regions', 'security']
    },
    {
      id: '5',
      title: 'Social Services Expand in Refugee Camps',
      url: 'https://example.com/article5',
      published_at: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
      fetched_at: new Date(),
      language: 'en',
      raw_text: 'International organizations have expanded social services in refugee camps across the region. New programs include educational support, healthcare access...',
      hash: 'hash5',
      source_id: '4',
      status: 'processed',
      tags: ['social', 'refugee-camps', 'education']
    }
  ];

  const mockSources: Source[] = [
    { id: '1', name: 'Al Jazeera Palestine', url: 'https://aljazeera.com', type: 'international_media', credibility_score: 8 },
    { id: '2', name: 'Reuters Middle East', url: 'https://reuters.com', type: 'international_media', credibility_score: 9 },
    { id: '3', name: 'Haaretz', url: 'https://haaretz.com', type: 'local_media', credibility_score: 7 },
    { id: '4', name: 'UNRWA', url: 'https://unrwa.org', type: 'ngo', credibility_score: 9 }
  ];

  // Use mock data for now
  const displayArticles = mockArticles;
  const displaySources = mockSources;

  // Sort articles based on selected option
  const sortedArticles = [...displayArticles].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      case 'oldest':
        return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      case 'credibility':
        const sourceA = displaySources.find(s => s.id === a.source_id);
        const sourceB = displaySources.find(s => s.id === b.source_id);
        return (sourceB?.credibility_score || 0) - (sourceA?.credibility_score || 0);
      case 'relevance':
        // Mock relevance score based on recency and source credibility
        const sourceA_rel = displaySources.find(s => s.id === a.source_id);
        const sourceB_rel = displaySources.find(s => s.id === b.source_id);
        const timeA = Date.now() - new Date(a.published_at).getTime();
        const timeB = Date.now() - new Date(b.published_at).getTime();
        const scoreA = (sourceA_rel?.credibility_score || 5) * (1 / (1 + timeA / (24 * 60 * 60 * 1000)));
        const scoreB = (sourceB_rel?.credibility_score || 5) * (1 / (1 + timeB / (24 * 60 * 60 * 1000)));
        return scoreB - scoreA;
      default:
        return 0;
    }
  });

  // Intersection Observer for infinite scroll
  const lastElementCallback = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && onLoadMore) {
        onLoadMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, onLoadMore]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  // Get source for article
  const getSourceForArticle = (article: Article) => {
    return displaySources.find(source => source.id === article.source_id);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Clock },
    { value: 'oldest', label: 'Oldest First', icon: Clock },
    { value: 'credibility', label: 'Highest Credibility', icon: TrendingUp },
    { value: 'relevance', label: 'Most Relevant', icon: Eye }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Articles & News</h2>
            <p className="text-slate-600 mt-1">
              {sortedArticles.length} articles found
              {filters.category && ` in ${filters.category} category`}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium transition-colors"
              >
                {sortBy === 'newest' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                <span>Sort</span>
              </button>
              
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-slate-200 py-2 z-10">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value as SortOption);
                          setShowSortMenu(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                          sortBy === option.value ? 'text-blue-600 bg-blue-50' : 'text-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {Object.keys(filters).length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Filter className="w-4 h-4" />
            <span>Active filters:</span>
            {filters.category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                {filters.category}
              </span>
            )}
            {filters.severity && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs">
                {filters.severity}
              </span>
            )}
            {filters.min_credibility && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                Credibility ≥ {filters.min_credibility}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Articles Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {sortedArticles.map((article, index) => {
          const source = getSourceForArticle(article);
          const isLast = index === sortedArticles.length - 1;
          
          return (
            <div
              key={article.id}
              ref={isLast ? lastElementCallback : undefined}
              className={viewMode === 'list' ? 'w-full' : ''}
            >
              <ArticleCard
                article={article}
                source={source}
                onArticleClick={onArticleClick}
                className={viewMode === 'list' ? 'w-full' : ''}
              />
            </div>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3 text-slate-600">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading more articles...</span>
          </div>
        </div>
      )}

      {/* No More Articles */}
      {!hasMore && sortedArticles.length > 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>No more articles to load</p>
        </div>
      )}

      {/* Empty State */}
      {sortedArticles.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <List className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No articles found</h3>
          <p className="text-slate-600">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  );
}

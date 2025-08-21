'use client';

import { useState } from 'react';
import { 
  ExternalLink, 
  MapPin, 
  Clock, 
  User, 
  Building, 
  Shield, 
  Eye, 
  Share2,
  Bookmark,
  MessageCircle
} from 'lucide-react';
import { Article, Source } from '@/types';

interface ArticleCardProps {
  article: Article;
  source?: Source;
  onArticleClick?: (article: Article) => void;
  className?: string;
}

export default function ArticleCard({ 
  article, 
  source, 
  onArticleClick,
  className = '' 
}: ArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const getCredibilityColor = (score: number) => {
    if (score >= 8) return 'bg-green-500 text-white';
    if (score >= 6) return 'bg-blue-500 text-white';
    if (score >= 4) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getCredibilityLabel = (score: number) => {
    if (score >= 8) return 'High';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Low';
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'international_media':
        return <Building className="w-4 h-4" />;
      case 'local_media':
        return <MapPin className="w-4 h-4" />;
      case 'ngo':
        return <Shield className="w-4 h-4" />;
      case 'government':
        return <Building className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'international_media':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'local_media':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'ngo':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'government':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-sm hover:shadow-lg transition-all duration-200 group ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {article.title}
            </h3>
            <p className="text-slate-600 text-sm line-clamp-2">
              {truncateText(article.raw_text || '')}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-xl transition-colors ${
                isBookmarked 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Source and Credibility */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Source Type Badge */}
            {source && (
              <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getSourceTypeColor(source.type)}`}>
                {getSourceTypeIcon(source.type)}
                <span>{source.type.replace('_', ' ')}</span>
              </div>
            )}
            
            {/* Source Name */}
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span className="font-medium">{source?.name || 'Unknown Source'}</span>
            </div>
          </div>

          {/* Credibility Badge */}
          {source && (
            <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getCredibilityColor(source.credibility_score)}`}>
              <Shield className="w-4 h-4" />
              <span>{getCredibilityLabel(source.credibility_score)}</span>
              <span className="font-bold">({source.credibility_score}/10)</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(article.published_at)}</span>
            </div>
            {article.language && (
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="uppercase">{article.language}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>View</span>
          </div>
        </div>

        {/* Tags/Categories */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-medium"
              >
                {tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-lg">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isLiked 
                  ? 'bg-red-100 text-red-600' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
              <span>Like</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>Comment</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onArticleClick?.(article)}
              className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-sm font-medium transition-colors"
            >
              Read More
            </button>
            
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Visit Source</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

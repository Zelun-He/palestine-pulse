export interface Source {
  id: string;
  name: string;
  url: string;
  type: 'primary_ngo' | 'international_media' | 'local_media' | 'government' | 'ngo' | 'other';
  credibility_score: number;
  created_at: Date;
  updated_at: Date;
}

export interface Article {
  id: string;
  source_id: string;
  url: string;
  title: string;
  published_at: Date;
  fetched_at: Date;
  language: string;
  raw_text: string;
  hash: string;
  status: 'pending' | 'processed' | 'error' | 'archived';
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Event {
  id: string;
  canonical_title: string;
  occurred_at: Date;
  category: 'military' | 'humanitarian' | 'political' | 'economic' | 'social' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  geom: string; // PostGIS Point/Polygon as WKT
  location_text: string;
  admin1?: string; // Governorate
  admin2?: string; // District
  admin3?: string; // Sub-district
  privacy_obfuscation_m: number;
  created_at: Date;
  updated_at: Date;
}

export interface EventArticle {
  event_id: string;
  article_id: string;
  similarity: number;
  is_primary: boolean;
  created_at: Date;
}

export interface Tag {
  id: string;
  name: string;
  created_at: Date;
}

export interface EventTag {
  event_id: string;
  tag_id: string;
  created_at: Date;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface EventFilters {
  bbox?: MapBounds;
  start_date?: Date;
  end_date?: Date;
  category?: Event['category'];
  severity?: Event['severity'];
  source_type?: string;
  location?: string;
  min_credibility?: number;
  zoom?: number;
  search?: string;
}

// Mapbox-compatible GeoJSON types
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONPoint;
  properties: {
    id: string;
    title: string;
    category: Event['category'];
    severity: Event['severity'];
    occurred_at: string;
    location_text: string;
    article_count: number;
    credibility_avg?: number;
    [key: string]: any;
  };
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
  bounds?: MapBounds;
}

export interface TimelineState {
  start_date: Date;
  end_date: Date;
  current_time: Date;
  is_playing: boolean;
  playback_speed: number;
}

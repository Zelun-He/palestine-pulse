-- Additional schema updates for RSS fetcher system

-- Create article_locations table for extracted location data
CREATE TABLE IF NOT EXISTS article_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  coordinates GEOGRAPHY(POINT, 4326),
  confidence_score DECIMAL(3,2) DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create article_entities table for extracted NER data
CREATE TABLE IF NOT EXISTS article_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('location', 'organization', 'person')),
  entity_name TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create geocoding_cache table for persistent caching
CREATE TABLE IF NOT EXISTS geocoding_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_query TEXT NOT NULL UNIQUE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  country_code TEXT,
  admin_level_1 TEXT,
  admin_level_2 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_article_locations_article_id ON article_locations(article_id);
CREATE INDEX IF NOT EXISTS idx_article_locations_coordinates ON article_locations USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_article_entities_article_id ON article_entities(article_id);
CREATE INDEX IF NOT EXISTS idx_article_entities_type ON article_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_geocoding_cache_query ON geocoding_cache(location_query);
CREATE INDEX IF NOT EXISTS idx_geocoding_cache_expires ON geocoding_cache(expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for article_locations
CREATE TRIGGER update_article_locations_updated_at 
  BEFORE UPDATE ON article_locations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default sources if they don't exist
INSERT INTO sources (name, url, type, credibility_score) 
VALUES 
  ('Al Jazeera Palestine', 'https://www.aljazeera.com/tag/palestine/', 'international_media', 8),
  ('Reuters Middle East', 'https://www.reuters.com/world/middle-east/', 'international_media', 9),
  ('Haaretz', 'https://www.haaretz.com/news/middle-east', 'local_media', 7)
ON CONFLICT (name) DO NOTHING;

-- Create view for articles with extracted entities
CREATE OR REPLACE VIEW articles_with_entities AS
SELECT 
  a.*,
  s.name as source_name,
  s.type as source_type,
  s.credibility_score as source_credibility,
  array_agg(DISTINCT al.location_name) FILTER (WHERE al.location_name IS NOT NULL) as locations,
  array_agg(DISTINCT ae.entity_name) FILTER (WHERE ae.entity_type = 'organization') as organizations,
  array_agg(DISTINCT ae.entity_name) FILTER (WHERE ae.entity_type = 'person') as people
FROM articles a
LEFT JOIN sources s ON a.source_id = s.id
LEFT JOIN article_locations al ON a.id = al.article_id
LEFT JOIN article_entities ae ON a.id = ae.article_id
GROUP BY a.id, s.name, s.type, s.credibility_score;

-- Create function to clean expired geocoding cache
CREATE OR REPLACE FUNCTION clean_expired_geocoding_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM geocoding_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get articles by location proximity
CREATE OR REPLACE FUNCTION get_articles_near_location(
  target_lat DECIMAL(10, 8),
  target_lon DECIMAL(11, 8),
  radius_km INTEGER DEFAULT 50
)
RETURNS TABLE (
  article_id UUID,
  title TEXT,
  distance_meters DECIMAL(10, 2),
  location_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.article_id,
    a.title,
    ST_Distance(
      al.coordinates::geography,
      ST_SetSRID(ST_MakePoint(target_lon, target_lat), 4326)::geography
    ) as distance_meters,
    al.location_name
  FROM article_locations al
  JOIN articles a ON al.article_id = a.id
  WHERE al.coordinates IS NOT NULL
    AND ST_DWithin(
      al.coordinates::geography,
      ST_SetSRID(ST_MakePoint(target_lon, target_lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;


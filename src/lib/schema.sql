-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Sources table
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('primary_ngo', 'international_media', 'local_media', 'government', 'other')),
    credibility_score DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (credibility_score >= 0 AND credibility_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lang VARCHAR(10) NOT NULL DEFAULT 'en',
    raw_text TEXT NOT NULL,
    hash VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'error', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table with PostGIS geometry
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_title TEXT NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('military', 'humanitarian', 'political', 'economic', 'social', 'other')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    summary TEXT NOT NULL,
    geom GEOGRAPHY(POINT, 4326), -- WGS84 coordinates
    location_text VARCHAR(500) NOT NULL,
    admin1 VARCHAR(100), -- Governorate
    admin2 VARCHAR(100), -- District
    admin3 VARCHAR(100), -- Sub-district
    privacy_obfuscation_m INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event-Article relationships
CREATE TABLE event_articles (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    similarity DECIMAL(3,2) NOT NULL CHECK (similarity >= 0 AND similarity <= 1),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (event_id, article_id)
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event-Tag relationships
CREATE TABLE event_tags (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (event_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_source_id ON articles(source_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_hash ON articles(hash);

CREATE INDEX idx_events_occurred_at ON events(occurred_at);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_severity ON events(severity);
CREATE INDEX idx_events_admin1 ON events(admin1);
CREATE INDEX idx_events_admin2 ON events(admin2);

-- PostGIS spatial indexes
CREATE INDEX idx_events_geom ON events USING GIST(geom);

-- Full-text search indexes
CREATE INDEX idx_articles_fts ON articles USING GIN(to_tsvector('simple', title || ' ' || raw_text));
CREATE INDEX idx_events_fts ON events USING GIN(to_tsvector('simple', canonical_title || ' ' || summary));

-- Composite indexes for common queries
CREATE INDEX idx_events_category_severity ON events(category, severity);
CREATE INDEX idx_events_time_category ON events(occurred_at, category);

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get events within bounds with clustering
CREATE OR REPLACE FUNCTION get_events_in_bounds(
    bbox_north DOUBLE PRECISION,
    bbox_south DOUBLE PRECISION,
    bbox_east DOUBLE PRECISION,
    bbox_west DOUBLE PRECISION,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    category_filter VARCHAR(20) DEFAULT NULL,
    min_credibility DECIMAL(3,2) DEFAULT 0.0,
    zoom_level INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    category VARCHAR(20),
    severity VARCHAR(20),
    occurred_at TIMESTAMP WITH TIME ZONE,
    location_text VARCHAR(500),
    geom TEXT,
    article_count BIGINT,
    credibility_avg DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.canonical_title as title,
        e.category,
        e.severity,
        e.occurred_at,
        e.location_text,
        ST_AsText(e.geom::geometry) as geom,
        COUNT(DISTINCT ea.article_id) as article_count,
        AVG(s.credibility_score) as credibility_avg
    FROM events e
    LEFT JOIN event_articles ea ON e.id = ea.event_id
    LEFT JOIN articles a ON ea.article_id = a.id
    LEFT JOIN sources s ON a.source_id = s.id
    WHERE e.geom && ST_MakeEnvelope(bbox_west, bbox_south, bbox_east, bbox_north, 4326)::geography
        AND (start_date IS NULL OR e.occurred_at >= start_date)
        AND (end_date IS NULL OR e.occurred_at <= end_date)
        AND (category_filter IS NULL OR e.category = category_filter)
        AND (s.credibility_score IS NULL OR s.credibility_score >= min_credibility)
    GROUP BY e.id, e.canonical_title, e.category, e.severity, e.occurred_at, e.location_text, e.geom
    ORDER BY e.occurred_at DESC;
END;
$$ LANGUAGE plpgsql;

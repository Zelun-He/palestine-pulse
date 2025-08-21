import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { EventFilters, GeoJSONCollection, GeoJSONFeature } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const bbox = searchParams.get('bbox');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const category = searchParams.get('category');
    const minCred = searchParams.get('minCred');
    const zoom = searchParams.get('zoom');
    const search = searchParams.get('search');
    
    // Validate and parse bbox (format: "west,south,east,north")
    let bounds: { west: number; south: number; east: number; north: number } | null = null;
    if (bbox) {
      const [west, south, east, north] = bbox.split(',').map(Number);
      if (west && south && east && north && west < east && south < north) {
        bounds = { west, south, east, north };
      }
    }
    
    // Parse dates
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    
    // Validate category
    const validCategories = ['military', 'humanitarian', 'political', 'economic', 'social', 'other'];
    const categoryFilter = category && validCategories.includes(category) ? category : null;
    
    // Parse credibility threshold
    const minCredibility = minCred ? parseFloat(minCred) : 0.0;
    
    // Parse zoom level
    const zoomLevel = zoom ? parseInt(zoom) : 10;
    
    // Build query based on parameters
    let sql = `
      SELECT 
        e.id,
        e.canonical_title as title,
        e.category,
        e.severity,
        e.occurred_at,
        e.location_text,
        ST_AsText(e.geom::geometry) as geom,
        COUNT(DISTINCT ea.article_id) as article_count,
        COALESCE(AVG(s.credibility_score), 0.5) as credibility_avg
      FROM events e
      LEFT JOIN event_articles ea ON e.id = ea.event_id
      LEFT JOIN articles a ON ea.article_id = a.id
      LEFT JOIN sources s ON a.source_id = s.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    // Add bounding box filter
    if (bounds) {
      sql += ` AND e.geom && ST_MakeEnvelope($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, 4326)::geography`;
      params.push(bounds.west, bounds.south, bounds.east, bounds.north);
      paramIndex += 4;
    }
    
    // Add date filters
    if (startDate) {
      sql += ` AND e.occurred_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      sql += ` AND e.occurred_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    // Add category filter
    if (categoryFilter) {
      sql += ` AND e.category = $${paramIndex}`;
      params.push(categoryFilter);
      paramIndex++;
    }
    
    // Add credibility filter
    if (minCredibility > 0) {
      sql += ` AND (s.credibility_score IS NULL OR s.credibility_score >= $${paramIndex})`;
      params.push(minCredibility);
      paramIndex++;
    }
    
    // Add text search
    if (search && search.trim()) {
      sql += ` AND (
        e.canonical_title ILIKE $${paramIndex} 
        OR e.summary ILIKE $${paramIndex}
        OR e.location_text ILIKE $${paramIndex}
      )`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }
    
    // Group and order
    sql += `
      GROUP BY e.id, e.canonical_title, e.category, e.severity, e.occurred_at, e.location_text, e.geom
      ORDER BY e.occurred_at DESC
      LIMIT 1000
    `;
    
    // Execute query
    const rows = await query(sql, params);
    
    // Convert to GeoJSON
    const features: GeoJSONFeature[] = rows.map(row => {
      // Parse WKT geometry to coordinates
      let coordinates: number[] | number[][] = [];
      if (row.geom && row.geom.startsWith('POINT')) {
        const match = row.geom.match(/POINT\(([^)]+)\)/);
        if (match) {
          coordinates = match[1].split(' ').map(Number);
        }
      }
      
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        properties: {
          id: row.id,
          title: row.title,
          category: row.category,
          severity: row.severity,
          occurred_at: row.occurred_at.toISOString(),
          location_text: row.location_text,
          article_count: parseInt(row.article_count),
          credibility_avg: parseFloat(row.credibility_score)
        }
      };
    });
    
    const geojson: GeoJSONCollection = {
      type: 'FeatureCollection',
      features: features
    };
    
    return NextResponse.json(geojson, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Content-Type': 'application/geo+json'
      }
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

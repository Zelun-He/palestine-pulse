import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch event details
    const eventSql = `
      SELECT 
        e.id,
        e.canonical_title,
        e.occurred_at,
        e.category,
        e.severity,
        e.summary,
        ST_AsText(e.geom::geometry) as geom,
        e.location_text,
        e.admin1,
        e.admin2,
        e.admin3,
        e.privacy_obfuscation_m,
        e.created_at,
        e.updated_at
      FROM events e
      WHERE e.id = $1
    `;
    
    const event = await queryOne(eventSql, [eventId]);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Fetch linked articles with source information
    const articlesSql = `
      SELECT 
        a.id,
        a.title,
        a.url,
        a.published_at,
        a.lang,
        a.raw_text,
        a.status,
        ea.similarity,
        ea.is_primary,
        s.name as source_name,
        s.url as source_url,
        s.type as source_type,
        s.credibility_score
      FROM event_articles ea
      JOIN articles a ON ea.article_id = a.id
      JOIN sources s ON a.source_id = s.id
      WHERE ea.event_id = $1
      ORDER BY ea.is_primary DESC, ea.similarity DESC, a.published_at DESC
    `;
    
    const articles = await query(articlesSql, [eventId]);
    
    // Fetch tags
    const tagsSql = `
      SELECT t.name
      FROM event_tags et
      JOIN tags t ON et.tag_id = t.id
      WHERE et.event_id = $1
      ORDER BY t.name
    `;
    
    const tags = await query(tagsSql, [eventId]);
    
    // Parse geometry coordinates
    let coordinates: [number, number] | null = null;
    if (event.geom && event.geom.startsWith('POINT')) {
      const match = event.geom.match(/POINT\(([^)]+)\)/);
      if (match) {
        const [lng, lat] = match[1].split(' ').map(Number);
        coordinates = [lng, lat];
      }
    }
    
    // Build response
    const response = {
      id: event.id,
      title: event.canonical_title,
      occurred_at: event.occurred_at.toISOString(),
      category: event.category,
      severity: event.severity,
      summary: event.summary,
      coordinates: coordinates,
      location_text: event.location_text,
      administrative: {
        admin1: event.admin1,
        admin2: event.admin2,
        admin3: event.admin3
      },
      privacy_obfuscation_m: event.privacy_obfuscation_m,
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        url: article.url,
        published_at: article.published_at.toISOString(),
        lang: article.lang,
        summary: article.raw_text.substring(0, 200) + (article.raw_text.length > 200 ? '...' : ''),
        similarity: parseFloat(article.similarity),
        is_primary: article.is_primary,
        source: {
          name: article.source_name,
          url: article.source_url,
          type: article.source_type,
          credibility_score: parseFloat(article.credibility_score)
        }
      })),
      tags: tags.map(tag => tag.name),
      metadata: {
        created_at: event.created_at.toISOString(),
        updated_at: event.updated_at.toISOString(),
        article_count: articles.length
      }
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=600', // Cache for 10 minutes
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

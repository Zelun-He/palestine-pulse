import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Fetch event details
    const eventQuery = `
      SELECT 
        e.id,
        e.canonical_title,
        e.occurred_at,
        e.category,
        e.severity,
        e.summary,
        e.location_text,
        e.admin1,
        e.admin2,
        e.admin3,
        ST_AsText(e.geom::geometry) as geom
      FROM events e
      WHERE e.id = $1
    `;
    
    const eventRows = await query(eventQuery, [id]);
    
    if (eventRows.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    const event = eventRows[0];
    
    // Fetch linked articles
    const articlesQuery = `
      SELECT 
        a.id,
        a.title,
        a.url,
        a.published_at,
        a.raw_text,
        s.name as source_name,
        s.credibility_score,
        ea.similarity,
        ea.is_primary
      FROM event_articles ea
      JOIN articles a ON ea.article_id = a.id
      JOIN sources s ON a.source_id = s.id
      WHERE ea.event_id = $1
      ORDER BY ea.is_primary DESC, ea.similarity DESC
    `;
    
    const articles = await query(articlesQuery, [id]);
    
    // Fetch tags
    const tagsQuery = `
      SELECT t.name
      FROM event_tags et
      JOIN tags t ON et.tag_id = t.id
      WHERE et.event_id = $1
    `;
    
    const tags = await query(tagsQuery, [id]);
    
    // Parse geometry
    let coordinates: number[] | number[][] = [];
    if (event.geom && event.geom.startsWith('POINT')) {
      const match = event.geom.match(/POINT\(([^)]+)\)/);
      if (match) {
        coordinates = match[1].split(' ').map(Number);
      }
    }
    
    const eventData = {
      id: event.id,
      title: event.canonical_title,
      occurred_at: event.occurred_at.toISOString(),
      category: event.category,
      severity: event.severity,
      summary: event.summary,
      location_text: event.location_text,
      admin1: event.admin1,
      admin2: event.admin2,
      admin3: event.admin3,
      geometry: {
        type: 'Point',
        coordinates: coordinates
      },
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        url: article.url,
        published_at: article.published_at.toISOString(),
        source_name: article.source_name,
        credibility_score: article.credibility_score,
        similarity: article.similarity,
        is_primary: article.is_primary
      })),
      tags: tags.map(tag => tag.name)
    };
    
    return NextResponse.json(eventData);
    
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

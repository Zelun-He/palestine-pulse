import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query_text = searchParams.get('query');
    const source = searchParams.get('source');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const category = searchParams.get('category');
    const lang = searchParams.get('lang');
    
    // Parse pagination
    const limitNum = limit ? Math.min(parseInt(limit), 100) : 20; // Max 100 per page
    const offsetNum = offset ? parseInt(offset) : 0;
    
    // Parse dates
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    
    // Build base query
    let sql = `
      SELECT 
        a.id,
        a.title,
        a.url,
        a.published_at,
        a.lang,
        a.raw_text,
        a.status,
        a.created_at,
        s.name as source_name,
        s.url as source_url,
        s.type as source_type,
        s.credibility_score,
        COUNT(DISTINCT ea.event_id) as event_count
      FROM articles a
      JOIN sources s ON a.source_id = s.id
      LEFT JOIN event_articles ea ON a.id = ea.article_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    // Add text search
    if (query_text && query_text.trim()) {
      sql += ` AND (
        a.title ILIKE $${paramIndex} 
        OR a.raw_text ILIKE $${paramIndex}
        OR to_tsvector('simple', a.title || ' ' || a.raw_text) @@ plainto_tsquery('simple', $${paramIndex})
      )`;
      params.push(`%${query_text.trim()}%`);
      paramIndex++;
    }
    
    // Add source filter
    if (source) {
      sql += ` AND s.id = $${paramIndex}`;
      params.push(source);
      paramIndex++;
    }
    
    // Add date filters
    if (startDate) {
      sql += ` AND a.published_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      sql += ` AND a.published_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    // Add language filter
    if (lang) {
      sql += ` AND a.lang = $${paramIndex}`;
      params.push(lang);
      paramIndex++;
    }
    
    // Add category filter (through events)
    if (category) {
      sql += ` AND EXISTS (
        SELECT 1 FROM event_articles ea2
        JOIN events e ON ea2.event_id = e.id
        WHERE ea2.article_id = a.id AND e.category = $${paramIndex}
      )`;
      params.push(category);
      paramIndex++;
    }
    
    // Group and order
    sql += `
      GROUP BY a.id, a.title, a.url, a.published_at, a.lang, a.raw_text, a.status, a.created_at,
               s.name, s.url, s.type, s.credibility_score
      ORDER BY a.published_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limitNum, offsetNum);
    
    // Execute query
    const articles = await query(sql, params);
    
    // Get total count for pagination
    let countSql = `
      SELECT COUNT(DISTINCT a.id) as total
      FROM articles a
      JOIN sources s ON a.source_id = s.id
      WHERE 1=1
    `;
    
    const countParams: any[] = [];
    let countParamIndex = 1;
    
    // Add same filters for count query
    if (query_text && query_text.trim()) {
      countSql += ` AND (
        a.title ILIKE $${countParamIndex} 
        OR a.raw_text ILIKE $${countParamIndex}
        OR to_tsvector('simple', a.title || ' ' || a.raw_text) @@ plainto_tsquery('simple', $${countParamIndex})
      )`;
      countParams.push(`%${query_text.trim()}%`);
      countParamIndex++;
    }
    
    if (source) {
      countSql += ` AND s.id = $${countParamIndex}`;
      countParams.push(source);
      countParamIndex++;
    }
    
    if (startDate) {
      countSql += ` AND a.published_at >= $${countParamIndex}`;
      countParams.push(startDate);
      countParamIndex++;
    }
    
    if (endDate) {
      countSql += ` AND a.published_at <= $${countParamIndex}`;
      countParams.push(endDate);
      countParamIndex++;
    }
    
    if (lang) {
      countSql += ` AND a.lang = $${countParamIndex}`;
      countParams.push(lang);
      countParamIndex++;
    }
    
    if (category) {
      countSql += ` AND EXISTS (
        SELECT 1 FROM event_articles ea2
        JOIN events e ON ea2.event_id = e.id
        WHERE ea2.article_id = a.id AND e.category = $${countParamIndex}
      )`;
      countParams.push(category);
      countParamIndex++;
    }
    
    const countResult = await query(countSql, countParams);
    const total = countResult[0]?.total || 0;
    
    // Build response
    const response = {
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        url: article.url,
        published_at: article.published_at.toISOString(),
        lang: article.lang,
        summary: article.raw_text.substring(0, 300) + (article.raw_text.length > 300 ? '...' : ''),
        status: article.status,
        source: {
          name: article.source_name,
          url: article.source_url,
          type: article.source_type,
          credibility_score: parseFloat(article.credibility_score)
        },
        event_count: parseInt(article.event_count),
        created_at: article.created_at.toISOString()
      })),
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        has_more: offsetNum + limitNum < total
      }
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

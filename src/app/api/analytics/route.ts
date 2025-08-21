import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const category = searchParams.get('category');
    
    // Parse dates (default to last 30 days)
    const endDate = end ? new Date(end) : new Date();
    const startDate = start ? new Date(start) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Build base WHERE clause
    let whereClause = 'WHERE e.occurred_at >= $1 AND e.occurred_at <= $2';
    const params: any[] = [startDate, endDate];
    let paramIndex = 3;
    
    if (category) {
      whereClause += ` AND e.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    // 1. Weekly incident counts
    const weeklySql = `
      SELECT 
        DATE_TRUNC('week', e.occurred_at) as week_start,
        COUNT(*) as incident_count,
        COUNT(DISTINCT e.category) as category_count
      FROM events e
      ${whereClause}
      GROUP BY DATE_TRUNC('week', e.occurred_at)
      ORDER BY week_start DESC
      LIMIT 12
    `;
    
    const weeklyData = await query(weeklySql, params);
    
    // 2. Category distribution
    const categorySql = `
      SELECT 
        e.category,
        COUNT(*) as count,
        COUNT(DISTINCT e.id) as unique_events
      FROM events e
      ${whereClause}
      GROUP BY e.category
      ORDER BY count DESC
    `;
    
    const categoryData = await query(categorySql, params);
    
    // 3. Severity distribution
    const severitySql = `
      SELECT 
        e.severity,
        COUNT(*) as count
      FROM events e
      ${whereClause}
      GROUP BY e.severity
      ORDER BY 
        CASE e.severity 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END
    `;
    
    const severityData = await query(severitySql, params);
    
    // 4. Top locations (by incident count)
    const locationSql = `
      SELECT 
        COALESCE(e.admin1, 'Unknown') as location,
        COUNT(*) as incident_count,
        COUNT(DISTINCT e.category) as category_count
      FROM events e
      ${whereClause}
      GROUP BY COALESCE(e.admin1, 'Unknown')
      ORDER BY incident_count DESC
      LIMIT 10
    `;
    
    const locationData = await query(locationSql, params);
    
    // 5. Source credibility analysis
    const credibilitySql = `
      SELECT 
        s.type as source_type,
        COUNT(DISTINCT e.id) as event_count,
        AVG(s.credibility_score) as avg_credibility,
        COUNT(DISTINCT s.id) as source_count
      FROM events e
      JOIN event_articles ea ON e.id = ea.event_id
      JOIN articles a ON ea.article_id = a.id
      JOIN sources s ON a.source_id = s.id
      ${whereClause}
      GROUP BY s.type
      ORDER BY event_count DESC
    `;
    
    const credibilityData = await query(credibilitySql, params);
    
    // 6. Recent activity (last 7 days)
    const recentSql = `
      SELECT 
        DATE_TRUNC('day', e.occurred_at) as day,
        COUNT(*) as incident_count,
        COUNT(DISTINCT e.category) as category_count
      FROM events e
      WHERE e.occurred_at >= $1 AND e.occurred_at <= $2
      GROUP BY DATE_TRUNC('day', e.occurred_at)
      ORDER BY day DESC
      LIMIT 7
    `;
    
    const recentData = await query(recentSql, [startDate, endDate]);
    
    // 7. Total counts for the period
    const totalSql = `
      SELECT 
        COUNT(DISTINCT e.id) as total_events,
        COUNT(DISTINCT e.category) as total_categories,
        COUNT(DISTINCT COALESCE(e.admin1, 'Unknown')) as total_locations,
        COUNT(DISTINCT a.id) as total_articles,
        COUNT(DISTINCT s.id) as total_sources
      FROM events e
      LEFT JOIN event_articles ea ON e.id = ea.event_id
      LEFT JOIN articles a ON ea.article_id = a.id
      LEFT JOIN sources s ON a.source_id = s.id
      ${whereClause}
    `;
    
    const totalData = await query(totalSql, params);
    const totals = totalData[0] || {};
    
    // Build response
    const response = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      },
      totals: {
        events: parseInt(totals.total_events || '0'),
        categories: parseInt(totals.total_categories || '0'),
        locations: parseInt(totals.total_locations || '0'),
        articles: parseInt(totals.total_articles || '0'),
        sources: parseInt(totals.total_sources || '0')
      },
      weekly_trends: weeklyData.map(row => ({
        week_start: row.week_start.toISOString(),
        incident_count: parseInt(row.incident_count),
        category_count: parseInt(row.category_count)
      })),
      category_distribution: categoryData.map(row => ({
        category: row.category,
        count: parseInt(row.count),
        unique_events: parseInt(row.unique_events)
      })),
      severity_distribution: severityData.map(row => ({
        severity: row.severity,
        count: parseInt(row.count)
      })),
      top_locations: locationData.map(row => ({
        location: row.location,
        incident_count: parseInt(row.incident_count),
        category_count: parseInt(row.category_count)
      })),
      source_analysis: credibilityData.map(row => ({
        source_type: row.source_type,
        event_count: parseInt(row.event_count),
        avg_credibility: parseFloat(row.avg_credibility),
        source_count: parseInt(row.source_count)
      })),
      recent_activity: recentData.map(row => ({
        day: row.day.toISOString(),
        incident_count: parseInt(row.incident_count),
        category_count: parseInt(row.category_count)
      }))
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=600', // Cache for 10 minutes
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

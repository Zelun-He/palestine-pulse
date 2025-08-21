import { NextRequest, NextResponse } from 'next/server';
import { RSSFetcher } from '@/lib/rss-fetcher';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'fetch') {
      const fetcher = new RSSFetcher();
      await fetcher.processArticles();
      
      return NextResponse.json({ 
        success: true, 
        message: 'RSS processing completed successfully' 
      });
    }
    
    if (action === 'backfill') {
      const fetcher = new RSSFetcher();
      await fetcher.backfillLastWeek();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Backfill completed successfully' 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action. Use "fetch" or "backfill"' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('RSS processing error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return RSS system status
    return NextResponse.json({
      success: true,
      status: 'active',
      sources: [
        {
          name: 'Al Jazeera Palestine',
          type: 'international_media',
          credibility_score: 8,
          last_fetch: new Date().toISOString()
        },
        {
          name: 'Reuters Middle East',
          type: 'international_media',
          credibility_score: 9,
          last_fetch: new Date().toISOString()
        },
        {
          name: 'Haaretz',
          type: 'local_media',
          credibility_score: 7,
          last_fetch: new Date().toISOString()
        }
      ],
      schedule: {
        fetch_interval: '30 minutes',
        backfill_time: '2:00 AM daily'
      }
    });
    
  } catch (error) {
    console.error('Error getting RSS status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

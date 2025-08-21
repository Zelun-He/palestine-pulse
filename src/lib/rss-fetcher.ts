import FeedParser from 'feedparser';
import { Readable } from 'stream';
import * as cheerio from 'cheerio';
import { Pool } from 'pg';
import { db } from './db';

// RSS Sources for Palestine-related news
const RSS_SOURCES = [
  {
    name: 'Al Jazeera Palestine',
    url: 'https://www.aljazeera.com/tag/palestine/feed/',
    type: 'international_media',
    credibility_score: 8
  },
  {
    name: 'Reuters Middle East',
    url: 'https://feeds.reuters.com/Reuters/worldNews',
    type: 'international_media',
    credibility_score: 9
  },
  {
    name: 'Haaretz',
    url: 'https://www.haaretz.com/news/middle-east/feed',
    type: 'local_media',
    credibility_score: 7
  }
];

// Simple NER patterns for Palestine context
const NER_PATTERNS = {
  locations: [
    // Cities and regions
    /(?:in|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
    // Administrative divisions
    /(?:Gaza|West Bank|Jerusalem|Tel Aviv|Haifa|Nablus|Ramallah|Bethlehem|Hebron|Jenin|Tulkarm|Qalqilya|Salfit|Tubas|Jericho)/gi,
    // Countries
    /(?:Palestine|Israel|Jordan|Egypt|Lebanon|Syria)/gi
  ],
  organizations: [
    /(?:UN|UNRWA|UNICEF|WHO|ICRC|Red Cross|Red Crescent|Hamas|Fatah|PLO|PA|Palestinian Authority|Israeli Government|IDF|Israeli Defense Forces)/gi,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Ministry|Department|Agency|Committee|Council|Foundation|Institute))/gi
  ],
  people: [
    /(?:President|Prime Minister|Minister|Spokesperson|Official)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
  ]
};

// Geocoding cache
const geocodeCache = new Map<string, { lat: number; lon: number; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  author?: string;
  categories?: string[];
  content?: string;
  hash: string;
}

interface ProcessedArticle {
  title: string;
  url: string;
  published_at: Date;
  fetched_at: Date;
  language: string;
  raw_text: string;
  hash: string;
  source_id: string;
  extracted_locations: string[];
  extracted_organizations: string[];
  extracted_people: string[];
  status: 'pending' | 'processed' | 'failed';
}

export class RSSFetcher {
  private pool: Pool;

  constructor() {
    this.pool = db;
  }

  // Fetch RSS feeds
  async fetchFeeds(): Promise<RSSItem[]> {
    const allItems: RSSItem[] = [];

    for (const source of RSS_SOURCES) {
      try {
        console.log(`Fetching RSS from: ${source.name}`);
        const items = await this.fetchSingleFeed(source.url);
        allItems.push(...items);
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
      }
    }

    return allItems;
  }

  // Fetch single RSS feed
  private async fetchSingleFeed(url: string): Promise<RSSItem[]> {
    return new Promise((resolve, reject) => {
      const items: RSSItem[] = [];
      
      const parser = new FeedParser({});
      
      parser.on('readable', function() {
        let item;
        while (item = this.read()) {
          const rssItem: RSSItem = {
            title: item.title || '',
            description: item.description || '',
            link: item.link || '',
            pubDate: item.pubDate || new Date(),
            author: item.author,
            categories: item.categories,
            content: item.content,
            hash: this.generateHash(item.title + item.description + item.link)
          };
          items.push(rssItem);
        }
      });

      parser.on('end', () => resolve(items));
      parser.on('error', reject);

      // Fetch the RSS feed
      fetch(url)
        .then(response => response.text())
        .then(body => {
          const stream = new Readable();
          stream.push(body);
          stream.push(null);
          stream.pipe(parser);
        })
        .catch(reject);
    });
  }

  // Generate hash for deduplication
  private generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  // Extract entities using simple NER patterns
  private extractEntities(text: string): {
    locations: string[];
    organizations: string[];
    people: string[];
  } {
    const locations = new Set<string>();
    const organizations = new Set<string>();
    const people = new Set<string>();

    // Extract locations
    NER_PATTERNS.locations.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanMatch = match.replace(/(?:in|at|near|around)\s+/i, '').trim();
          if (cleanMatch.length > 2) {
            locations.add(cleanMatch);
          }
        });
      }
    });

    // Extract organizations
    NER_PATTERNS.organizations.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length > 3) {
            organizations.add(match);
          }
        });
      }
    });

    // Extract people
    NER_PATTERNS.people.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanMatch = match.replace(/(?:President|Prime Minister|Minister|Spokesperson|Official)\s+/i, '').trim();
          if (cleanMatch.length > 2) {
            people.add(cleanMatch);
          }
        });
      }
    });

    return {
      locations: Array.from(locations),
      organizations: Array.from(organizations),
      people: Array.from(people)
    };
  }

  // Geocode location using Nominatim with caching
  async geocodeLocation(location: string): Promise<{ lat: number; lon: number } | null> {
    // Check cache first
    const cached = geocodeCache.get(location);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return { lat: cached.lat, lon: cached.lon };
    }

    try {
      // Add Palestine context to improve geocoding accuracy
      const searchQuery = `${location}, Palestine`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=ps,il,jo,eg,lb,sy`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const coords = {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon)
        };

        // Cache the result
        geocodeCache.set(location, {
          ...coords,
          timestamp: Date.now()
        });

        return coords;
      }
    } catch (error) {
      console.error(`Geocoding error for ${location}:`, error);
    }

    return null;
  }

  // Process and store articles
  async processArticles(): Promise<void> {
    try {
      console.log('Starting RSS processing...');
      
      // Fetch RSS feeds
      const rssItems = await this.fetchFeeds();
      console.log(`Fetched ${rssItems.length} RSS items`);

      // Deduplicate based on hash
      const uniqueItems = this.deduplicateItems(rssItems);
      console.log(`After deduplication: ${uniqueItems.length} unique items`);

      // Process each unique item
      for (const item of uniqueItems) {
        await this.processSingleArticle(item);
      }

      console.log('RSS processing completed');
    } catch (error) {
      console.error('Error in RSS processing:', error);
    }
  }

  // Deduplicate articles
  private deduplicateItems(items: RSSItem[]): RSSItem[] {
    const seen = new Set<string>();
    return items.filter(item => {
      if (seen.has(item.hash)) {
        return false;
      }
      seen.add(item.hash);
      return true;
    });
  }

  // Process single article
  private async processSingleArticle(item: RSSItem): Promise<void> {
    try {
      // Check if article already exists
      const existing = await this.pool.query(
        'SELECT id FROM articles WHERE hash = $1',
        [item.hash]
      );

      if (existing.rows.length > 0) {
        console.log(`Article already exists: ${item.title}`);
        return;
      }

      // Extract entities
      const text = item.description + ' ' + (item.content || '');
      const entities = this.extractEntities(text);

      // Try to geocode the first location
      let coordinates: [number, number] | null = null;
      if (entities.locations.length > 0) {
        const coords = await this.geocodeLocation(entities.locations[0]);
        if (coords) {
          coordinates = [coords.lon, coords.lat]; // GeoJSON format: [longitude, latitude]
        }
      }

      // Insert article
      const articleResult = await this.pool.query(
        `INSERT INTO articles (source_id, url, title, published_at, fetched_at, language, raw_text, hash, status)
         VALUES (
           (SELECT id FROM sources WHERE name = $1 LIMIT 1),
           $2, $3, $4, $5, 'en', $6, $7, 'pending'
         ) RETURNING id`,
        ['Al Jazeera Palestine', item.link, item.title, item.pubDate, new Date(), text, item.hash]
      );

      const articleId = articleResult.rows[0].id;

      // Insert extracted entities
      if (entities.locations.length > 0) {
        await this.pool.query(
          'INSERT INTO article_locations (article_id, location_name, coordinates) VALUES ($1, $2, $3)',
          [articleId, entities.locations[0], coordinates ? `POINT(${coordinates[0]} ${coordinates[1]})` : null]
        );
      }

      // Update article status
      await this.pool.query(
        'UPDATE articles SET status = $1 WHERE id = $2',
        ['processed', articleId]
      );

      console.log(`Processed article: ${item.title}`);
    } catch (error) {
      console.error(`Error processing article ${item.title}:`, error);
    }
  }

  // Backfill last 7 days (simulated for RSS)
  async backfillLastWeek(): Promise<void> {
    console.log('Starting backfill for last 7 days...');
    
    // For RSS feeds, we can only fetch current content
    // In a real implementation, you might have archive APIs
    await this.processArticles();
    
    console.log('Backfill completed');
  }
}

// Cron job setup
export function setupCronJobs(): void {
  const cron = require('node-cron');
  
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('Running scheduled RSS fetch...');
    const fetcher = new RSSFetcher();
    await fetcher.processArticles();
  });

  // Run backfill daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running daily backfill...');
    const fetcher = new RSSFetcher();
    await fetcher.backfillLastWeek();
  });

  console.log('Cron jobs configured');
}

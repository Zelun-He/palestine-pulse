# RSS Fetcher System for Palestine Pulse

## Overview

The RSS Fetcher System automatically ingests news from multiple sources, processes them using Natural Language Processing (NER), geocodes locations, and stores everything in the PostgreSQL database with PostGIS spatial support.

## Features

- **Multi-source RSS ingestion**: Al Jazeera Palestine, Reuters Middle East, Haaretz
- **Automatic deduplication**: Content-based hashing to prevent duplicate articles
- **Simple NER processing**: Extracts locations, organizations, and people using regex patterns
- **Geocoding with caching**: Uses OpenStreetMap Nominatim with local caching
- **Scheduled processing**: Runs every 30 minutes automatically
- **Daily backfill**: Attempts to fill in missing data from the past week

## Architecture

```
RSS Sources → RSS Fetcher → NER Processing → Geocoding → Database Storage
     ↓              ↓            ↓            ↓            ↓
  Al Jazeera   FeedParser   Regex NER   Nominatim   PostgreSQL
  Reuters      Cheerio      Patterns    Cache       PostGIS
  Haaretz     Dedupe       Entities    TTL 24h     Spatial
```

## RSS Sources

| Source | Type | Credibility | URL |
|--------|------|-------------|-----|
| Al Jazeera Palestine | International Media | 8/10 | Palestine tag feed |
| Reuters Middle East | International Media | 9/10 | World news feed |
| Haaretz | Local Media | 7/10 | Middle East feed |

## NER Patterns

### Locations
- Administrative divisions: Gaza, West Bank, Jerusalem, Tel Aviv, etc.
- Geographic patterns: "in [City]", "at [Location]", "near [Place]"
- Country names: Palestine, Israel, Jordan, Egypt, Lebanon, Syria

### Organizations
- International bodies: UN, UNRWA, UNICEF, WHO, ICRC
- Local entities: Hamas, Fatah, PLO, Palestinian Authority
- Government bodies: "Ministry of...", "Department of...", "Agency for..."

### People
- Titles: "President [Name]", "Prime Minister [Name]", "Minister [Name]"
- Officials: "Spokesperson [Name]", "Official [Name]"

## Geocoding

- **Service**: OpenStreetMap Nominatim
- **Caching**: 24-hour TTL with local memory cache
- **Context**: Automatically appends "Palestine" to improve accuracy
- **Fallback**: Gracefully handles geocoding failures

## Database Schema

### New Tables
- `article_locations`: Stores extracted locations with coordinates
- `article_entities`: Stores extracted NER entities
- `geocoding_cache`: Persistent geocoding cache

### Views
- `articles_with_entities`: Combines articles with extracted data

### Functions
- `get_articles_near_location()`: Spatial queries by proximity
- `clean_expired_geocoding_cache()`: Cache maintenance

## API Endpoints

### GET /api/rss/process
Returns RSS system status and configuration.

### POST /api/rss/process
Triggers RSS processing actions:
- `{ "action": "fetch" }` - Run RSS fetch now
- `{ "action": "backfill" }` - Run backfill process

## Cron Jobs

- **RSS Fetch**: Every 30 minutes (`*/30 * * * *`)
- **Daily Backfill**: 2:00 AM daily (`0 2 * * *`)

## Usage

### Manual Trigger
```bash
# Trigger RSS fetch
curl -X POST http://localhost:3002/api/rss/process \
  -H "Content-Type: application/json" \
  -d '{"action": "fetch"}'

# Check status
curl http://localhost:3002/api/rss/process
```

### Web Interface
The RSS Management component in the dashboard provides:
- Real-time status monitoring
- Manual trigger buttons
- Source information
- Schedule display

## Configuration

### Environment Variables
```bash
# Database connection
DATABASE_URL=postgresql://user:pass@localhost:5432/palestine_pulse

# Optional: Custom RSS sources
RSS_SOURCES_JSON=[{"name": "...", "url": "...", "type": "...", "credibility_score": 8}]
```

### RSS Sources
Add new sources in `src/lib/rss-fetcher.ts`:
```typescript
const RSS_SOURCES = [
  // ... existing sources
  {
    name: 'New Source',
    url: 'https://example.com/feed',
    type: 'international_media',
    credibility_score: 8
  }
];
```

## Monitoring

### Logs
- RSS fetch operations
- Geocoding results
- Database operations
- Error handling

### Metrics
- Articles processed per run
- Geocoding success rate
- Processing time
- Cache hit rate

## Error Handling

- **Network failures**: Graceful degradation, retry logic
- **Geocoding failures**: Fallback to text-only storage
- **Database errors**: Transaction rollback, error logging
- **Rate limiting**: Respects Nominatim usage policies

## Performance

- **Deduplication**: O(n) hash-based filtering
- **Geocoding**: Cached results, batch processing
- **Database**: Spatial indexes, efficient queries
- **Memory**: Configurable cache TTL, cleanup jobs

## Security

- **Input validation**: Sanitized RSS content
- **SQL injection**: Parameterized queries
- **Rate limiting**: Respectful API usage
- **Error exposure**: Limited error details in production

## Future Enhancements

- **Advanced NER**: spaCy integration for better entity extraction
- **Machine learning**: Category classification, sentiment analysis
- **More sources**: Additional RSS feeds, social media APIs
- **Real-time processing**: WebSocket updates, live feeds
- **Analytics**: Processing metrics, source performance tracking

## Troubleshooting

### Common Issues

1. **RSS feeds not updating**
   - Check network connectivity
   - Verify RSS URLs are accessible
   - Review cron job logs

2. **Geocoding failures**
   - Check Nominatim service status
   - Verify location names in content
   - Review cache expiration settings

3. **Database errors**
   - Check PostgreSQL connection
   - Verify schema exists
   - Review transaction logs

### Debug Mode
Enable detailed logging by setting:
```typescript
const DEBUG_MODE = true; // In rss-fetcher.ts
```

## Contributing

When adding new features:
1. Update RSS sources array
2. Add new NER patterns if needed
3. Extend database schema if required
4. Update API endpoints
5. Add tests for new functionality
6. Update documentation

## License

This RSS system is part of Palestine Pulse and follows the same license terms.

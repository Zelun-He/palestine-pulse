# Palestine Pulse 🌍

A real-time incident mapping and analysis platform for Palestine, providing interactive visualizations of events, news, and developments across the region with automated RSS intelligence and advanced spatial analytics.

## 🚀 Features

### Core Platform (Current)
- **Interactive Map**: Real-time incident mapping with clustering and category-based visualization
- **Advanced Search**: Faceted search with filters for category, severity, date range, and source credibility
- **Timeline Scrubber**: Time-based playback controls to see events unfold over time
- **Event Details**: Comprehensive event information with linked articles and source analysis
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS

### RSS Intelligence System (New!)
- **Multi-source Ingestion**: Al Jazeera Palestine, Reuters Middle East, Haaretz
- **Automatic Deduplication**: Content-based hashing to prevent duplicate articles
- **NER Processing**: Location, organization, and person extraction using regex patterns
- **Geocoding**: Automatic coordinate mapping with Nominatim and Palestine context
- **Automated Scheduling**: RSS fetching every 30 minutes with daily backfill
- **Caching System**: Local memory cache with 24-hour TTL for geocoding results

### Enhanced UI Components (New!)
- **Modern Dashboard**: Stats cards, live activity monitoring, and real-time updates
- **Event Drawer**: Detailed event information with tabs and rich content
- **RSS Management**: Real-time monitoring and manual control of the RSS system
- **Glassmorphism Design**: Modern UI with backdrop blur and gradient effects
- **Interactive Elements**: Hover states, animations, and smooth transitions

### Planned Features
- **Heatmap Visualization**: Density-based clustering and choropleth maps by administrative regions
- **Advanced Analytics**: Weekly trends, category distribution, and source credibility analysis
- **Moderation Tools**: Event merging, duplicate detection, and editorial oversight
- **API Integration**: RESTful APIs for third-party integrations and data export

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router for server-side rendering and API routes
- **TypeScript** for type safety and developer experience
- **Tailwind CSS** for modern, responsive styling with glassmorphism effects
- **Leaflet** with React-Leaflet for interactive mapping and clustering
- **React 19** with modern hooks and state management
- **Lucide React** for modern iconography

### Backend
- **Next.js API Routes** for RESTful endpoints
- **PostgreSQL** with PostGIS extension for spatial data
- **Connection Pooling** with optimized query performance
- **Full-text Search** with PostgreSQL's built-in search capabilities
- **Cron Jobs** for automated RSS processing and data ingestion

### Data Processing
- **RSS Parsing**: Feedparser integration with error handling
- **NER Extraction**: Regex-based entity recognition for Palestine context
- **Geocoding**: Nominatim integration with intelligent caching
- **Deduplication**: Content-based hash filtering and similarity detection

### Data Model
- **Sources**: News outlets, NGOs, and government sources with credibility scoring
- **Articles**: Raw content with metadata, language detection, and deduplication
- **Events**: Geospatial incidents with categorization, severity, and privacy controls
- **Relationships**: Many-to-many connections between events and articles
- **RSS Data**: Extracted locations, entities, and geocoding cache

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 14+ with PostGIS extension
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/palestine-pulse.git
cd palestine-pulse
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Database Setup
```bash
# Create a PostgreSQL database
createdb palestine_pulse

# Enable PostGIS extension
psql -d palestine_pulse -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Run the core schema
psql -d palestine_pulse -f src/lib/schema.sql

# Run the RSS system schema updates
psql -d palestine_pulse -f src/lib/schema-updates.sql
```

### 4. Environment Configuration
Create a `.env.local` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/palestine_pulse
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### 5. Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄️ Database Schema

### Core Tables
- **sources**: News sources with credibility scoring
- **articles**: Raw content and metadata
- **events**: Geospatial incidents with categorization
- **event_articles**: Many-to-many relationships
- **tags**: Event categorization and labeling

### RSS System Tables (New!)
- **article_locations**: Extracted location data with coordinates
- **article_entities**: NER extraction results
- **geocoding_cache**: Persistent geocoding cache with expiration

### Spatial Features
- **PostGIS Integration**: Native support for geographic data types
- **Spatial Indexing**: Optimized queries for bounding box operations
- **Coordinate Privacy**: Built-in support for location obfuscation
- **Proximity Search**: Distance-based queries and spatial analysis

### Performance Optimizations
- **Composite Indexes**: Multi-column indexing for common query patterns
- **Full-text Search**: PostgreSQL text search with relevance scoring
- **Connection Pooling**: Efficient database connection management
- **Spatial Indexes**: GIST indexes for geographic queries

## 🔌 API Endpoints

### Core APIs
- `GET /api/events` - Fetch events with filtering and spatial queries
- `GET /api/events/[id]` - Get detailed event information
- `GET /api/articles` - Search and filter articles
- `GET /api/analytics` - Dashboard metrics and trends

### RSS System APIs (New!)
- `GET /api/rss/process` - RSS system status and configuration
- `POST /api/rss/process` - Trigger RSS operations (fetch/backfill)

### Query Parameters
- **bbox**: Bounding box for spatial filtering (west,south,east,north)
- **category**: Event category filter
- **start/end**: Date range filtering
- **minCred**: Minimum source credibility threshold
- **search**: Full-text search across titles and content

## 📡 RSS Intelligence System

### RSS Sources
| Source | Type | Credibility | URL |
|--------|------|-------------|-----|
| Al Jazeera Palestine | International Media | 8/10 | Palestine tag feed |
| Reuters Middle East | International Media | 9/10 | World news feed |
| Haaretz | Local Media | 7/10 | Middle East feed |

### NER Extraction Patterns
- **Locations**: Cities, administrative divisions, countries
- **Organizations**: International bodies, local entities, government bodies
- **People**: Titles, officials, spokespersons

### Automated Features
- **Scheduled Processing**: Every 30 minutes with cron jobs
- **Daily Backfill**: Attempts to fill missing data from the past week
- **Geocoding**: Nominatim integration with Palestine context
- **Caching**: 24-hour TTL for geocoding results
- **Error Handling**: Graceful degradation and retry logic

## 🎨 UI Components

### Core Components
- **Map**: Interactive Leaflet map with custom markers and clustering
- **SearchPanel**: Advanced filtering with expandable options
- **TimelineScrubber**: Time-based playback controls
- **EventDetails**: Comprehensive event information display

### New Components
- **RSSManagement**: Real-time RSS system monitoring and control
- **EventDrawer**: Modern event details with tabs and rich content
- **ModernDashboard**: Stats cards and live activity monitoring
- **SimpleMap**: Fallback map component for SSR compatibility

### Design System
- **Color Coding**: Category and severity-based visual indicators
- **Responsive Layout**: Mobile-first design with sidebar navigation
- **Interactive Elements**: Hover states, animations, and smooth transitions
- **Glassmorphism**: Modern backdrop blur and gradient effects

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Environment Variables
Set the following environment variables in your deployment platform:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL`: Public application URL
- `NEXT_PUBLIC_MAPBOX_TOKEN`: Mapbox API token (optional)

### Database Requirements
- **PostgreSQL 14+** with PostGIS extension
- **Connection Pooling** enabled
- **SSL** connections for production environments
- **Spatial Indexes** for geographic query performance

## 🔒 Security & Privacy

### Data Protection
- **Coordinate Privacy**: Automatic obfuscation for sensitive locations
- **Source Attribution**: Immutable source references and credibility scoring
- **Rate Limiting**: API endpoint protection against abuse
- **Input Validation**: Sanitized RSS content and SQL injection prevention

### Ethical Considerations
- **Content Disclaimer**: Clear labeling of source types and credibility
- **Privacy Controls**: User-configurable location precision
- **Transparency**: Open source with clear data handling policies
- **Respectful API Usage**: Nominatim rate limiting compliance

## 🧪 Development & Testing

### Running Locally
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
```

### RSS System Testing
```bash
# Check RSS system status
curl http://localhost:3000/api/rss/process

# Trigger RSS fetch
curl -X POST http://localhost:3000/api/rss/process \
  -H "Content-Type: application/json" \
  -d '{"action": "fetch"}'

# Run backfill
curl -X POST http://localhost:3000/api/rss/process \
  -H "Content-Type: application/json" \
  -d '{"action": "backfill"}'
```

### Database Operations
```bash
# Apply schema updates
psql -d palestine_pulse -f src/lib/schema-updates.sql

# Check RSS system tables
psql -d palestine_pulse -c "\dt article_*"
psql -d palestine_pulse -c "\dt geocoding_cache"
```

## 🤝 Contributing

### Development Guidelines
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code formatting and quality
- **Prettier**: Automated code formatting
- **Testing**: Unit tests for critical components
- **Documentation**: Update README and component docs

## 📊 Roadmap

### Phase 1: Core Platform (✅ Complete)
- [x] Interactive map with event markers
- [x] Search and filtering system
- [x] Timeline playback controls
- [x] Basic event details

### Phase 2: RSS Intelligence (✅ Complete)
- [x] RSS feed integration
- [x] Automated geocoding
- [x] Content deduplication
- [x] Source credibility scoring
- [x] NER processing
- [x] Automated scheduling

### Phase 3: Enhanced UI (✅ Complete)
- [x] Modern dashboard design
- [x] Event drawer component
- [x] RSS management interface
- [x] Glassmorphism design system
- [x] Responsive components

### Phase 4: Advanced Analytics (Next)
- [ ] Heatmap visualizations
- [ ] Trend analysis
- [ ] Export capabilities
- [ ] API documentation
- [ ] Machine learning insights

### Phase 5: Community Features (Future)
- [ ] User submissions
- [ ] Moderation tools
- [ ] Community feedback
- [ ] Mobile applications

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenStreetMap** for base map data and Nominatim geocoding
- **Leaflet** for interactive mapping capabilities
- **PostGIS** for spatial database capabilities
- **Next.js** for the modern React framework
- **Tailwind CSS** for the design system
- **Lucide** for modern iconography

## 📞 Support

For questions, issues, or contributions:
- **Issues**: [GitHub Issues](https://github.com/your-username/palestine-pulse/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/palestine-pulse/discussions)
- **Email**: support@palestine-pulse.org

## 📚 Additional Documentation

- [RSS System Documentation](RSS_SYSTEM.md) - Complete RSS fetcher system guide
- [API Reference](docs/API.md) - Detailed API documentation
- [Database Schema](docs/DATABASE.md) - Complete database documentation
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions

---

**Palestine Pulse** - Empowering transparency and understanding through real-time incident mapping, RSS intelligence, and advanced spatial analysis. 🗺️📰🌍

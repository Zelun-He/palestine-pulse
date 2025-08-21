working-layout
# Palestine Pulse 🌍

A real-time incident mapping and analysis platform for Palestine, providing interactive visualizations of events, news, and developments across the region.

## 🚀 Features

### MVP Features (Current)
- **Interactive Map**: Real-time incident mapping with clustering and category-based visualization
- **Advanced Search**: Faceted search with filters for category, severity, date range, and source credibility
- **Timeline Scrubber**: Time-based playback controls to see events unfold over time
- **Event Details**: Comprehensive event information with linked articles and source analysis
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS

### Planned Features
- **Heatmap Visualization**: Density-based clustering and choropleth maps by administrative regions
- **Article Management**: RSS ingestion pipeline with deduplication and geocoding
- **Analytics Dashboard**: Weekly trends, category distribution, and source credibility analysis
- **Moderation Tools**: Event merging, duplicate detection, and editorial oversight
- **API Integration**: RESTful APIs for third-party integrations and data export

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router for server-side rendering and API routes
- **TypeScript** for type safety and developer experience
- **Tailwind CSS** for modern, responsive styling
- **Leaflet** with React-Leaflet for interactive mapping
- **React 19** with modern hooks and state management

### Backend
- **Next.js API Routes** for RESTful endpoints
- **PostgreSQL** with PostGIS extension for spatial data
- **Connection Pooling** with optimized query performance
- **Full-text Search** with PostgreSQL's built-in search capabilities

### Data Model
- **Sources**: News outlets, NGOs, and government sources with credibility scoring
- **Articles**: Raw content with metadata, language detection, and deduplication
- **Events**: Geospatial incidents with categorization, severity, and privacy controls
- **Relationships**: Many-to-many connections between events and articles

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

# Run the schema
psql -d palestine_pulse -f src/lib/schema.sql
```

### 4. Environment Configuration
Create a `.env.local` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/palestine_pulse
NEXT_PUBLIC_APP_URL=http://localhost:3000
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

### Spatial Features
- **PostGIS Integration**: Native support for geographic data types
- **Spatial Indexing**: Optimized queries for bounding box operations
- **Coordinate Privacy**: Built-in support for location obfuscation

### Performance Optimizations
- **Composite Indexes**: Multi-column indexing for common query patterns
- **Full-text Search**: PostgreSQL text search with relevance scoring
- **Connection Pooling**: Efficient database connection management

## 🔌 API Endpoints

### Events
- `GET /api/events` - Fetch events with filtering and spatial queries
- `GET /api/events/[id]` - Get detailed event information
- `GET /api/articles` - Search and filter articles
- `GET /api/analytics` - Dashboard metrics and trends

### Query Parameters
- **bbox**: Bounding box for spatial filtering (west,south,east,north)
- **category**: Event category filter
- **start/end**: Date range filtering
- **minCred**: Minimum source credibility threshold
- **search**: Full-text search across titles and content

## 🎨 UI Components

### Core Components
- **Map**: Interactive Leaflet map with custom markers and clustering
- **SearchPanel**: Advanced filtering with expandable options
- **TimelineScrubber**: Time-based playback controls
- **EventDetails**: Comprehensive event information display

### Design System
- **Color Coding**: Category and severity-based visual indicators
- **Responsive Layout**: Mobile-first design with sidebar navigation
- **Interactive Elements**: Hover states, animations, and smooth transitions

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

### Database Requirements
- **PostgreSQL 14+** with PostGIS extension
- **Connection Pooling** enabled
- **SSL** connections for production environments

## 🔒 Security & Privacy

### Data Protection
- **Coordinate Privacy**: Automatic obfuscation for sensitive locations
- **Source Attribution**: Immutable source references and credibility scoring
- **Rate Limiting**: API endpoint protection against abuse

### Ethical Considerations
- **Content Disclaimer**: Clear labeling of source types and credibility
- **Privacy Controls**: User-configurable location precision
- **Transparency**: Open source with clear data handling policies

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

## 📊 Roadmap

### Phase 1: Core Platform (Current)
- [x] Interactive map with event markers
- [x] Search and filtering system
- [x] Timeline playback controls
- [x] Basic event details

### Phase 2: Data Ingestion
- [ ] RSS feed integration
- [ ] Automated geocoding
- [ ] Content deduplication
- [ ] Source credibility scoring

### Phase 3: Advanced Analytics
- [ ] Heatmap visualizations
- [ ] Trend analysis
- [ ] Export capabilities
- [ ] API documentation

### Phase 4: Community Features
- [ ] User submissions
- [ ] Moderation tools
- [ ] Community feedback
- [ ] Mobile applications

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenStreetMap** for base map data
- **Leaflet** for interactive mapping
- **PostGIS** for spatial database capabilities
- **Next.js** for the modern React framework

## 📞 Support

For questions, issues, or contributions:
- **Issues**: [GitHub Issues](https://github.com/zelun-he/palestine-pulse/issues)
- **Discussions**: [GitHub Discussions](https://github.com/zelun-he/palestine-pulse/discussions)
- **Email**: support@palestine-pulse.org

---

**Palestine Pulse** - Empowering transparency and understanding through real-time incident mapping and analysis.
=======
# 🌍 Palestine Pulse

**Palestine Pulse** is a full-stack interactive web application that visualizes location-based news activity in Palestine using a heatmap interface. Built with **Next.js**, **TailwindCSS**, **PostgreSQL + PostGIS**, and **Leaflet.js**, the platform enables users to explore stories, media, and updates geographically across the region.

---

## 🚀 Features

- 🗺️ Interactive Leaflet map centered on Palestine
- 🔥 Heatmap to visualize news/story density
- 📍 Clickable regions to view local stories
- 📝 User-generated story submission interface
- 🧾 PostgreSQL + PostGIS for spatial data and queries
- 💨 Responsive design using TailwindCSS
- 🌐 RESTful API endpoints using Next.js App Router

---

## 🛠️ Tech Stack

| Layer       | Tech                     |
|-------------|--------------------------|
| Frontend    | Next.js, TypeScript, TailwindCSS |
| Backend     | Next.js API Routes       |
| Database    | PostgreSQL with PostGIS  |
| Map Engine  | Leaflet.js + OpenStreetMap tiles |
| Deployment  | Vercel (Frontend) + Railway/Supabase (DB) |



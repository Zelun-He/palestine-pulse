# 🚀 Palestine-Pulse Setup Guide

## 📋 **Prerequisites**

- Node.js 18+ 
- PostgreSQL with PostGIS extension
- Mapbox account (free tier available)

## 🔧 **Environment Setup**

Create a `.env.local` file in the root directory:

```bash
# Mapbox Access Token (get one at https://account.mapbox.com/)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# Database Configuration
DATABASE_URL=postgresql://zelunhe:Wujiuxiang2!@localhost:5432/palestine_pulse
```

## 🗺️ **Mapbox Setup**

1. Go to [Mapbox](https://account.mapbox.com/)
2. Create a free account
3. Generate an access token
4. Add it to your `.env.local` file

## 🗄️ **Database Setup**

### Option 1: Use Existing User (zelunhe)
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE palestine_pulse;

# Connect to the new database
\c palestine_pulse

# Enable PostGIS extension
CREATE EXTENSION postgis;

# Run the schema
\i src/lib/schema.sql

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE palestine_pulse TO zelunhe;
```

### Option 2: Create New User
```bash
# Connect to PostgreSQL as postgres
psql -U postgres

# Create user
CREATE USER your_username WITH PASSWORD 'your_password';

# Create database
CREATE DATABASE palestine_pulse OWNER your_username;

# Connect to database
\c palestine_pulse

# Enable PostGIS
CREATE EXTENSION postgis;

# Run schema
\i src/lib/schema.sql
```

## 🚀 **Run the Application**

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🌐 **Access the Application**

Open your browser and go to: **http://localhost:3000**

## ✨ **Features Implemented**

- ✅ **Interactive Map** with Leaflet + clustering
- ✅ **Event Drawer** with tabs (Details, Articles, Timeline)
- ✅ **Time Range Filtering** with URL state management
- ✅ **Search & Category Filters**
- ✅ **Timeline Scrubber** with playback controls
- ✅ **Mock Data** for immediate testing
- ✅ **API Endpoints** ready for database integration

## 🔄 **Next Steps**

1. **Connect to Database**: Update `.env.local` with your database credentials
2. **Add Real Data**: Replace mock data with database queries
3. **Enable Real-time Updates**: Implement WebSocket connections
4. **Add Authentication**: Implement user login system
5. **Deploy**: Deploy to Vercel or your preferred platform

## 🐛 **Troubleshooting**

### Map Not Loading
- Check your Mapbox token in `.env.local`
- Ensure the token has the correct permissions

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials
- Ensure PostGIS extension is enabled

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`


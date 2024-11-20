# Tautulli Custom API for Homepage

A custom API proxy service designed to work with [Homepage](https://github.com/gethomepage/homepage) to display recent media from Tautulli in a formatted way. This service provides endpoints for recently added TV shows and movies from your Plex server via Tautulli.


![Tautulli-API-Manager-11-20-2024_10_29_AM](https://github.com/user-attachments/assets/4db2fcc6-d083-4344-8f89-284f08e80d4e)

## Features

- Dedicated endpoints for TV shows and movies
- Dynamic section ID management through web UI
- Customizable number of items returned
- Relative timestamps (e.g., "2 hours ago")
- Formatted media information:
  - Shows: "Show Name - S01E01 - Episode Title"
  - Movies: "Movie Title - Year"
- Docker support with persistent configuration

## Prerequisites

- Tautulli server running and accessible
- Tautulli API key
- Docker (for containerized deployment)

## Quick Start

1. Pull the image:
```bash
docker pull ghcr.io/10mfox/gethomepage-tautulli-custom-api:latest
```

2. Create a docker-compose.yml:
```yaml
version: '3'
services:
  tautulli-api:
    image: ghcr.io/10mfox/gethomepage-tautulli-custom-api:latest
    container_name: tautulli-custom-api
    environment:
      - TAUTULLI_API_PORT=3008
      - TAUTULLI_BASE_URL=http://your-tautulli-host:8181/api/v2
      - TAUTULLI_API_KEY=your_tautulli_api_key
    ports:
      - "3008:3008"
    volumes:
      - ./config:/app/config
    restart: unless-stopped
```

3. Start the service:
```bash
docker-compose up -d
```

4. Access the web UI at `http://localhost:3008` to manage your section IDs.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| TAUTULLI_API_PORT | Port for the API service | 3008 |
| TAUTULLI_BASE_URL | URL of your Tautulli server | - |
| TAUTULLI_API_KEY | Your Tautulli API key | - |

## API Endpoints

### Configuration
```
GET /api/sections
POST /api/sections
```
Manage section IDs through the web interface or API directly.

### Media Endpoints
```
GET /api/recent/{sectionType}?count=5
```
Returns recent media items for the specified section type with formatted titles and relative timestamps.

### Response Format

#### TV Shows
```json
{
  "response": {
    "data": [
      {
        "added": "2 hours ago",
        "combined_title": "Show Name - S01E01 - Episode Title"
      }
    ]
  }
}
```

#### Movies
```json
{
  "response": {
    "data": [
      {
        "added": "5 days ago",
        "combined_title": "Movie Title - 2023"
      }
    ]
  }
}
```

### Time Formats
The `added` field uses relative time formatting:
- "Just now" - for very recent additions
- "X minutes ago" - for < 1 hour
- "X hours ago" - for < 1 day
- "X days ago" - for < 1 week
- "X weeks ago" - for < 1 month
- "X months ago" - for < 1 year
- "X years ago" - for >= 1 year

## Configuration Persistence
Section configurations are stored in `/app/config/config.json` and persist across container restarts.

## Contributing

Feel free to submit issues and pull requests.

## License

MIT License

## Note

This project is not affiliated with Tautulli or Plex Inc.
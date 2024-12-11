# Tautulli Custom API for Homepage

A custom API proxy service designed to work with [Homepage](https://github.com/gethomepage/homepage) to display recent media from Tautulli in a formatted way. This service provides endpoints for recently added TV shows and movies from your Plex server via Tautulli.

![Tautulli-API-Manager-11-20-2024_11_17_AM](https://github.com/user-attachments/assets/45281f36-8894-4add-b47c-d32a41d1b58e)

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
- logged in to github

#### How to login to github
I'll help you with logging into GitHub from Docker. Here's how to do it using personal access tokens (PATs), which is the recommended authentication method:

First, create a GitHub Personal Access Token:

Go to GitHub.com → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
Click "Generate new token"
Give it appropriate permissions (at minimum, read:packages and write:packages)
Copy the generated token immediately (you won't be able to see it again)


Log in to Docker using your GitHub credentials:

```docker login ghcr.io -u YOUR_GITHUB_USERNAME```
When prompted for password, enter your Personal Access Token (not your GitHub passwor


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

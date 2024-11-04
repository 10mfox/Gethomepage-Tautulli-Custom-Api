# Tautulli API Proxy

A custom API proxy service for Tautulli that provides simplified endpoints for recently added content.

## Features

- Simplified endpoints for recently added content
- Separate endpoints for TV shows and movies
- Combined endpoint for all content types
- Configurable through environment variables
- Docker support

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| TAUTULLI_BASE_URL | Your Tautulli server URL | Yes |
| TAUTULLI_API_KEY | Your Tautulli API key | Yes |
| TAUTULLI_API_PORT | Port for the proxy service (default: 3008) | No |

## API Endpoints

- `/api/recent/shows` - Get recently added TV shows
- `/api/recent/movies` - Get recently added movies
- `/api/recent/all` - Get all recently added content

Query Parameters:
- `count` - Number of items to return (default: 20)

## Docker Usage

### Using Pre-built Image

```bash
docker pull ghcr.io/YOUR_GITHUB_USERNAME/tautulli-api-proxy:latest

docker run -d \
  -e TAUTULLI_BASE_URL=http://your-tautulli-server:8181/api/v2 \
  -e TAUTULLI_API_KEY=your_api_key \
  -e TAUTULLI_API_PORT=3008 \
  -p 3008:3008 \
  ghcr.io/YOUR_GITHUB_USERNAME/tautulli-api-proxy:latest
```

### Building Locally

```bash
docker build -t tautulli-api-proxy .

docker run -d \
  -e TAUTULLI_BASE_URL=http://your-tautulli-server:8181/api/v2 \
  -e TAUTULLI_API_KEY=your_api_key \
  -e TAUTULLI_API_PORT=3008 \
  -p 3008:3008 \
  tautulli-api-proxy
```

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/tautulli-api-proxy.git
cd tautulli-api-proxy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
export TAUTULLI_BASE_URL=http://your-tautulli-server:8181/api/v2
export TAUTULLI_API_KEY=your_api_key
export TAUTULLI_API_PORT=3008
```

4. Start the service:
```bash
npm start
```

## GitHub Actions

This repository includes GitHub Actions workflows for:
- Automated Docker image builds
- Publishing to GitHub Container Registry (ghcr.io)

To use the GitHub Container Registry:
1. Ensure your repository has access to GitHub Packages
2. The workflow will automatically build and push on commits to main branch
3. Images will be available at: `ghcr.io/YOUR_GITHUB_USERNAME/tautulli-api-proxy`

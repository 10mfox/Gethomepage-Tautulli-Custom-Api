const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.TAUTULLI_API_PORT;
const { logServerStart, logError, colors } = require('./logger');

// Configuration
const config = {
  baseUrl: process.env.TAUTULLI_BASE_URL,
  apiKey: process.env.TAUTULLI_API_KEY,
  sections: {
    shows: 3
  }
};

// Middleware to parse JSON
app.use(express.json());

// Function to format date to relative time
function getRelativeTime(timestamp) {
  if (!timestamp) return '';
  
  const now = new Date().getTime() / 1000; // Convert to seconds
  const time = parseInt(timestamp);
  const diff = now - time;
  
  // Define time intervals in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  // Find the appropriate interval
  for (let [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diff / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'Just now';
}

// Function to format the show title with all components
function formatShowTitle(item) {
  if (item.grandparent_title && item.parent_media_index && item.media_index && item.title) {
    return `${item.grandparent_title} - S${item.parent_media_index}E${item.media_index} - ${item.title}`;
  }
  return item.title || '';
}

// Function to transform show data
function transformShowData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // If it's an array, map over it
  if (Array.isArray(data)) {
    return data.map(item => ({
      added: getRelativeTime(item.added_at),
      combined_title: formatShowTitle(item)
    }));
  }

  // If it's an object with a data property, process it
  const transformed = {};
  for (const key in data) {
    if (Array.isArray(data[key])) {
      transformed[key] = data[key].map(item => ({
        added: getRelativeTime(item.added_at),
        combined_title: formatShowTitle(item)
      }));
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      transformed[key] = transformShowData(data[key]);
    } else {
      transformed[key] = data[key];
    }
  }
  return transformed;
}

// Function to transform movie data
function transformMovieData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // If it's an array, map over it
  if (Array.isArray(data)) {
    return data.map(item => ({
      added: getRelativeTime(item.added_at),
      combined_title: `${item.title || ''} - ${item.year || ''}`
    }));
  }

  // If it's an object with a data property, process it
  const transformed = {};
  for (const key in data) {
    if (Array.isArray(data[key])) {
      transformed[key] = data[key].map(item => ({
        added: getRelativeTime(item.added_at),
        combined_title: `${item.title || ''} - ${item.year || ''}`
      }));
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      transformed[key] = transformMovieData(data[key]);
    } else {
      transformed[key] = data[key];
    }
  }
  return transformed;
}

// Shows endpoint
app.get('/api/recent/shows', async (req, res) => {
  try {
    const count = req.query.count || 5;

    const response = await axios.get(config.baseUrl, {
      params: {
        apikey: config.apiKey,
        cmd: 'get_recently_added',
        count: count,
        section_id: config.sections.shows
      }
    });

    const modifiedData = transformShowData(response.data);
    console.log(`${colors.green}✓${colors.reset} ${colors.dim}Successfully fetched ${count} shows${colors.reset}`);
    res.json(modifiedData);
  } catch (error) {
    logError('Shows API', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

// Movies endpoint
app.get('/api/recent/movies', async (req, res) => {
  try {
    const count = req.query.count || 5;

    const response = await axios.get(config.baseUrl, {
      params: {
        apikey: config.apiKey,
        cmd: 'get_recently_added',
        count: count,
        media_type: 'movie'
      }
    });

    const modifiedData = transformMovieData(response.data);
    console.log(`${colors.green}✓${colors.reset} ${colors.dim}Successfully fetched ${count} movies${colors.reset}`);
    res.json(modifiedData);
  } catch (error) {
    logError('Movies API', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 500 ? colors.red : status >= 400 ? colors.yellow : colors.green;
    console.log(
      `${colors.dim}${req.method}${colors.reset} ${req.url} ${statusColor}${status}${colors.reset} ${colors.dim}${duration}ms${colors.reset}`
    );
  });
  next();
});

app.listen(PORT, () => {
  logServerStart(PORT);
});
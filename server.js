const express = require('express');
const axios = require('axios');
const path = require('path');
const { loadConfig, saveConfig } = require('./config');
const app = express();
const PORT = process.env.PORT || 3008;
const { logServerStart, logError, colors } = require('./logger');

// Global config object
let config = {
    baseUrl: process.env.TAUTULLI_BASE_URL,
    apiKey: process.env.TAUTULLI_API_KEY,
    sections: {}
};

// Initialize config
async function initializeConfig() {
    try {
        const savedConfig = await loadConfig();
        config.sections = savedConfig.sections;
        console.log(`${colors.green}✓${colors.reset} ${colors.dim}Loaded configuration${colors.reset}`);
    } catch (error) {
        console.error('Failed to load config:', error);
    }
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Function to format date to relative time
function getRelativeTime(timestamp) {
    if (!timestamp) return '';
    
    const now = new Date().getTime() / 1000;
    const time = parseInt(timestamp);
    const diff = now - time;
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };

    for (let [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(diff / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }
    
    return 'Just now';
}

// Function to format show title
function formatShowTitle(item) {
    if (item.grandparent_title && item.parent_media_index && item.media_index && item.title) {
        return `${item.grandparent_title} - S${String(item.parent_media_index).padStart(2, '0')}E${String(item.media_index).padStart(2, '0')} - ${item.title}`;
    }
    return item.title || '';
}

// Transform show data
function transformShowData(data) {
    if (!data || typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => ({
            added: getRelativeTime(item.added_at),
            combined_title: formatShowTitle(item)
        }));
    }

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

// Transform movie data
function transformMovieData(data) {
    if (!data || typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => ({
            added: getRelativeTime(item.added_at),
            combined_title: `${item.title || ''} - ${item.year || ''}`
        }));
    }

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

// API Routes
app.get('/api/sections', (req, res) => {
    res.json({ sections: config.sections });
});

app.post('/api/sections', async (req, res) => {
    try {
        const { sections } = req.body;
        config.sections = sections;
        await saveConfig({ sections });
        console.log(`${colors.green}✓${colors.reset} ${colors.dim}Updated sections configuration${colors.reset}`);
        logServerStart(PORT, config.sections);
        res.json({ success: true, sections: config.sections });
    } catch (error) {
        logError('Update Sections', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message 
        });
    }
});

// Dynamic section endpoint handler
app.get('/api/recent/:sectionType', async (req, res) => {
    try {
        const { sectionType } = req.params;
        const count = req.query.count || 5;
        const sectionId = config.sections[sectionType];

        if (!sectionId) {
            return res.status(404).json({ error: 'Section not found' });
        }

        const response = await axios.get(config.baseUrl, {
            params: {
                apikey: config.apiKey,
                cmd: 'get_recently_added',
                count: count,
                section_id: sectionId
            }
        });

        const transformFunction = sectionType.toLowerCase() === 'movies' ? 
                                transformMovieData : 
                                transformShowData;
        
        const modifiedData = transformFunction(response.data);
        console.log(`${colors.green}✓${colors.reset} ${colors.dim}Successfully fetched ${count} items from ${sectionType}${colors.reset}`);
        res.json(modifiedData);
    } catch (error) {
        logError(`${req.params.sectionType} API`, error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message 
        });
    }
});

// Request logging middleware
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

// Frontend catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Initialize and start server
initializeConfig().then(() => {
    app.listen(PORT, () => {
        logServerStart(PORT, config.sections);
    });
});
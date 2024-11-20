const fs = require('fs').promises;
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'config.json');

async function loadConfig() {
    try {
        const data = await fs.readFile(CONFIG_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return default config if file doesn't exist
        return {
            sections: {
                movies: 2,
				shows: 3
            }
        };
    }
}

async function saveConfig(config) {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

module.exports = {
    loadConfig,
    saveConfig
};
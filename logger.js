const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
};

const banner = `
${colors.cyan}${colors.bright}╔════════════════════════════════════════════╗
║            TAUTULLI CUSTOM API             ║
╚════════════════════════════════════════════╝${colors.reset}
`;

function formatEndpoint(baseUrl, endpoint, description) {
  return `${colors.green}▸ ${colors.bright}${baseUrl}${endpoint}${colors.reset}\n  ${colors.dim}${description}${colors.reset}`;
}

function logServerStart(port, sections = {}) {
  const baseUrl = `http://localhost:${port}`;
  
  console.log(banner);
  console.log(`${colors.cyan}${colors.bright}SERVER INFORMATION${colors.reset}`);
  console.log(`${colors.white}▸ Status: ${colors.green}Running${colors.reset}`);
  console.log(`${colors.white}▸ Port: ${colors.yellow}${port}${colors.reset}`);
  console.log(`${colors.white}▸ Environment: ${colors.yellow}${process.env.NODE_ENV || 'development'}${colors.reset}\n`);
  
  console.log(`${colors.cyan}${colors.bright}AVAILABLE ENDPOINTS${colors.reset}`);
  Object.keys(sections).forEach(section => {
    console.log(formatEndpoint(
      baseUrl,
      `/api/recent/${section}?count=5`,
      `Get recently added ${section} content`
    ));
  });
  
  if (Object.keys(sections).length === 0) {
    console.log(`${colors.dim}No sections configured. Configure sections at ${baseUrl}${colors.reset}`);
  }
  console.log();
}

function logError(context, error) {
  console.error(`${colors.red}${colors.bright}ERROR: ${context}${colors.reset}`);
  console.error(`${colors.dim}${error.message}${colors.reset}\n`);
}

module.exports = {
  logServerStart,
  logError,
  colors
};
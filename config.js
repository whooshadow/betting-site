/**
 * Application Configuration
 * Contains all global configuration settings for the betting application
 */
export const CONFIG = {
  // API endpoint for production environment
  API_BASE_URL: "https://api.the-odds-api.com/v4",

  // How often to refresh betting data (in milliseconds)
  REFRESH_INTERVAL: 30000,

  // API authentication key
  API_KEY: "Not real key", // Replace with your API key

  // Toggle between mock data and real API
  USE_MOCK_DATA: false, // Set to false when ready to use real API

  // Maximum time to wait for API response
  API_TIMEOUT: 5000,

  // Default regions for betting data
  DEFAULT_REGIONS: "eu", // us, uk, eu, au

  // Default markets for betting data
  DEFAULT_MARKETS: "h2h", // h2h, spreads, totals

  // Data source configuration
  OFFLINE_MODE: true,
  DATA_FILE_PATH: "./data/betting-data.json", // Fix the path
};

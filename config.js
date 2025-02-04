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
  API_KEY: "YOUR API KEY HERE", // Replace with your API key

  // Toggle between mock data and real API
  USE_MOCK_DATA: false, // Set to false when ready to use real API

  // Maximum time to wait for API response
  API_TIMEOUT: 10000, // Increased timeout for larger requests

  // Default regions for betting data
  DEFAULT_REGIONS: "us,uk,eu,au", // Include all regions

  // Default markets for betting data
  DEFAULT_MARKETS: "h2h,spreads,totals,outrights", // Include all markets

  // Data source configuration
  OFFLINE_MODE: true, // Temporarily set to false for fetching
  DATA_FILE_PATH: "./data/betting-data.json", // Fix the path

  // Delay between requests to avoid rate limiting
  REQUEST_DELAY: 1500,
};

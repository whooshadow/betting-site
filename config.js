/**
 * Application Configuration
 * Contains all global configuration settings for the betting application
 */
export const CONFIG = {
  // API endpoint for production environment
  API_BASE_URL: "https://your-api-endpoint.com",

  // How often to refresh betting data (in milliseconds)
  REFRESH_INTERVAL: 30000,

  // API authentication key
  API_KEY: "your-api-key",

  // Toggle between mock data and real API
  USE_MOCK_DATA: true,

  // Maximum time to wait for API response
  API_TIMEOUT: 5000,
};

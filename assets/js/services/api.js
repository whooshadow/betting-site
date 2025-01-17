import { CONFIG } from "../../../config.js"; // Changed this line to point to root config
import { MOCK_DATA } from "./mockData.js";

/**
 * API Service Layer
 * Handles all communication with the betting API or mock data
 */
export class BettingAPI {
  /**
   * Fetches available sports from the API or mock data
   * Falls back to mock data if API fails or mock mode is enabled
   */
  static async fetchSports() {
    if (CONFIG.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_DATA.sports;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CONFIG.API_TIMEOUT
      );

      const response = await fetch(`${CONFIG.API_BASE_URL}/sports`, {
        headers: { Authorization: `Bearer ${CONFIG.API_KEY}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("API request failed");
      return await response.json();
    } catch (error) {
      console.warn("Failed to fetch from API, using mock data:", error);
      return MOCK_DATA.sports;
    }
  }

  /**
   * Fetches matches for a specific sport
   * @param {number} sportId - The ID of the sport to fetch matches for
   * @returns {Array} Array of matches with normalized structure
   */
  static async fetchMatchesBySport(sportId) {
    if (CONFIG.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const sportData = MOCK_DATA.sportEvents[sportId];
      if (!sportData) return [];
      return this.transformSportData(sportData);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CONFIG.API_TIMEOUT
      );

      const response = await fetch(
        `${CONFIG.API_BASE_URL}/sports/${sportId}/matches`,
        {
          headers: { Authorization: `Bearer ${CONFIG.API_KEY}` },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      return this.transformSportData(data);
    } catch (error) {
      console.warn(
        `Failed to fetch matches for sport ${sportId}, using mock data:`,
        error
      );
      const sportData = MOCK_DATA.sportEvents[sportId];
      return sportData ? this.transformSportData(sportData) : [];
    }
  }

  /**
   * Transforms API sport data into a consistent format
   * @param {Object} sportData - Raw sport data from API
   * @returns {Array} Normalized array of matches
   */
  static transformSportData(sportData) {
    return sportData.league.flatMap((league) =>
      league.events.map((event) => ({
        id: event.id,
        teams: [event.home, event.away],
        startTime: event.starts,
        leagueName: league.name,
        status: event.status,
        odds: event.odds,
        rotNum: event.rotNum,
      }))
    );
  }
}

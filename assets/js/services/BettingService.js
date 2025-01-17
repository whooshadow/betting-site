import { BettingAPI } from "./api.js";
import { CONFIG } from "../../../config.js"; // Changed this line to point to root config

/**
 * Betting Service
 * Manages the state and business logic for sports betting data
 */
export class BettingService {
  /**
   * @param {Function} onDataUpdate - Callback function for when data changes
   */
  constructor(onDataUpdate) {
    this.sports = [];
    this.currentSport = null;
    this.onDataUpdate = onDataUpdate;
    this.intervalId = null;
  }

  /**
   * Initializes the service and starts data refresh cycle
   */
  async initialize() {
    await this.loadSports();
    this.startAutoRefresh();
  }

  /**
   * Loads available sports and their matches
   * Sets initial sport if none is selected
   */
  async loadSports() {
    this.sports = await BettingAPI.fetchSports();
    if (this.sports.length > 0 && !this.currentSport) {
      this.currentSport = this.sports[0].sportId; // Use sportId instead of id
    }
    await this.loadCurrentSportMatches();
  }

  /**
   * Fetches and updates matches for the currently selected sport
   */
  async loadCurrentSportMatches() {
    // Check if there is a current sport selected
    if (!this.currentSport) return;

    // Fetch matches for the current sport from the API
    const matches = await BettingAPI.fetchMatchesBySport(this.currentSport);

    // If there is a callback for data updates, call it with the updated data
    if (this.onDataUpdate) {
      this.onDataUpdate({
        sports: this.sports,
        currentSport: this.currentSport,
        matches: matches,
      });
    }
  }

  /**
   * Starts automatic refresh of match data
   * Uses interval defined in CONFIG
   */
  startAutoRefresh() {
    // Start an interval to refresh the matches data periodically
    this.intervalId = setInterval(() => {
      this.loadCurrentSportMatches();
    }, CONFIG.REFRESH_INTERVAL);
  }

  /**
   * Stops the automatic refresh cycle
   */
  stopAutoRefresh() {
    // Clear the interval if it exists to stop auto-refreshing
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Changes the current sport and loads its matches
   * @param {number} sportId - ID of the sport to change to
   */
  async changeSport(sportId) {
    // Change the current sport to the new sport ID
    this.currentSport = sportId;

    // Load matches for the new current sport
    await this.loadCurrentSportMatches();
  }
}

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
    console.log("BettingService created");
  }

  /**
   * Initializes the service and starts data refresh cycle
   */
  async initialize() {
    try {
      console.log("BettingService initializing...");
      await this.loadSports();
      this.startAutoRefresh();
      console.log(
        `Auto-refresh started. Will update every ${
          CONFIG.REFRESH_INTERVAL / 1000
        } seconds`
      );
    } catch (error) {
      console.error("Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Loads available sports and their matches
   * Sets initial sport if none is selected
   */
  async loadSports() {
    try {
      console.log("Loading sports...");
      const groupedSports = await BettingAPI.fetchSports();
      console.log("Grouped sports loaded:", groupedSports);

      // Get the first category's first sport as default
      const firstCategory = Object.values(groupedSports)[0];
      if (firstCategory?.length > 0 && !this.currentSport) {
        this.currentSport = firstCategory[0].sportId;
        console.log("Set initial sport:", this.currentSport);
      }

      this.sports = groupedSports; // Store the grouped sports
      await this.loadCurrentSportMatches();
    } catch (error) {
      console.error("Failed to load sports:", error);
      throw error;
    }
  }

  /**
   * Fetches and updates matches for the currently selected sport
   */
  async loadCurrentSportMatches() {
    if (!this.currentSport) {
      console.warn("No current sport selected");
      return;
    }

    try {
      console.log("Loading matches for sport:", this.currentSport);
      const matches = await BettingAPI.fetchMatchesBySport(this.currentSport);

      if (this.onDataUpdate) {
        const updateData = {
          sports: this.sports,
          currentSport: this.currentSport,
          matches: matches,
        };
        console.log("Updating UI with data:", updateData);
        this.onDataUpdate(updateData);
      }
    } catch (error) {
      console.error("Failed to load matches:", error);
      throw error;
    }
  }

  /**
   * Starts automatic refresh of match data
   * Uses interval defined in CONFIG
   */
  startAutoRefresh() {
    if (this.intervalId) {
      console.log("Clearing existing refresh interval");
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      console.log("Auto-refresh: Fetching new data...");
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

  /**
   * Cleanup method to stop auto-refresh
   */
  cleanup() {
    console.log("BettingService cleanup");
    this.stopAutoRefresh();
  }
}

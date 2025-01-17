import { BettingService } from "./services/BettingService.js";

/**
 * UI Controller
 * Handles all DOM manipulation and user interface logic
 */
class BettingUI {
  constructor() {
    this.sportsNav = document.getElementById("sports-nav");
    this.matchesContainer = document.getElementById("matches-container");
    this.bettingService = new BettingService(this.updateUI.bind(this));
  }

  async initialize() {
    await this.bettingService.initialize();
  }

  /**
   * Updates the entire UI with new sports and matches data
   * @param {Object} data - Contains sports list, current sport, and matches
   */
  updateUI(data) {
    this.renderSportsNav(data.sports, data.currentSport);
    this.renderMatches(data.matches);
  }

  /**
   * Renders the sports navigation tabs
   * @param {Array} sports - List of available sports
   * @param {number} currentSport - ID of the currently selected sport
   */
  renderSportsNav(sports, currentSport) {
    this.sportsNav.innerHTML = "";
    sports.forEach((sport) => {
      const sportTab = document.createElement("div");
      sportTab.className = `sport-tab ${
        sport.sportId === currentSport ? "active" : ""
      }`;
      sportTab.textContent = sport.name;
      sportTab.onclick = () => this.bettingService.changeSport(sport.sportId);
      this.sportsNav.appendChild(sportTab);
    });
  }

  /**
   * Renders the matches list
   * @param {Array} matches - List of matches to display
   * Includes match details, times, and betting odds
   */
  renderMatches(matches) {
    this.matchesContainer.innerHTML =
      matches.length === 0
        ? '<div class="no-matches">No matches available</div>'
        : "";

    matches.forEach((match) => {
      const matchCard = document.createElement("div");
      matchCard.className = "match-card";

      const matchDate = new Date(match.startTime);
      const formattedDateTime = matchDate.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      matchCard.innerHTML = `
        <div class="match-header">
            <div class="teams">${match.teams.join(" vs ")}</div>
            <div class="match-time">${formattedDateTime}</div>
        </div>
        <div class="odds-container">
            ${Object.entries(match.odds)
              .map(
                ([key, value]) => `
                    <button class="odds-button" data-bet-type="${key}" data-match-id="${match.id}">
                        ${key}: ${value}
                    </button>
                `
              )
              .join("")}
        </div>
    `;

      this.matchesContainer.appendChild(matchCard);
    });
  }
}

// Application entry point
document.addEventListener("DOMContentLoaded", () => {
  const bettingUI = new BettingUI();
  bettingUI.initialize();
});

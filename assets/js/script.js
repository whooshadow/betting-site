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
    this.currentCategory = null;
    console.log("BettingUI initialized with elements:", {
      sportsNav: this.sportsNav,
      matchesContainer: this.matchesContainer,
    });
  }

  async initialize() {
    try {
      console.log("Starting BettingUI initialization...");
      await this.bettingService.initialize();
      console.log("BettingUI initialization complete");
    } catch (error) {
      console.error("BettingUI initialization failed:", error);
      this.showError("Failed to load betting data. Please try again later.");
    }
  }

  cleanup() {
    console.log("BettingUI cleanup");
    this.bettingService.cleanup();
  }

  showError(message) {
    this.matchesContainer.innerHTML = `
      <div style="color: red; padding: 20px; text-align: center;">
        ${message}
      </div>
    `;
  }

  /**
   * Updates the entire UI with new sports and matches data
   * @param {Object} data - Contains sports list, current sport, and matches
   */
  updateUI(data) {
    console.log("Updating UI with data:", data);
    if (!data.sports) {
      console.error("No sports data available:", data);
      this.showError("No sports data available");
      return;
    }

    // Check if we have any sports categories
    const categories = Object.keys(data.sports);
    if (categories.length === 0) {
      console.error("No sports categories found");
      this.showError("No sports categories available");
      return;
    }

    // Set initial category if none selected
    if (!this.currentCategory) {
      this.currentCategory = categories[0];
    }

    this.renderSportsNav(data.sports, data.currentSport);

    if (Array.isArray(data.matches)) {
      this.renderMatches(data.matches);
    } else {
      console.error("Invalid matches data:", data.matches);
      this.matchesContainer.innerHTML =
        '<div class="no-matches">No matches available</div>';
    }
  }

  /**
   * Renders the sports navigation tabs
   * @param {Array} sports - List of available sports
   * @param {number} currentSport - ID of the currently selected sport
   */
  renderSportsNav(groupedSports, currentSport) {
    console.log("Rendering nav with:", { groupedSports, currentSport });
    this.sportsNav.innerHTML = "";

    const navContainer = document.createElement("div");
    navContainer.className = "sports-nav-container";

    // Create featured sports row
    const featuredNav = document.createElement("div");
    featuredNav.className = "featured-sports";

    // Create sidebar for all sports
    const sidebar = document.createElement("div");
    sidebar.className = "sports-sidebar";

    // Create content area
    const contentArea = document.createElement("div");
    contentArea.className = "content-area";

    // Create leagues container inside content area
    const leaguesNav = document.createElement("div");
    leaguesNav.className = "leagues-nav";

    // Get top 5 popular sports categories
    const featuredSports = [
      "Soccer",
      "Basketball",
      "American Football",
      "Baseball",
      "Ice Hockey",
    ];

    // Sort remaining categories alphabetically
    const allCategories = Object.entries(groupedSports).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    // Render featured sports
    featuredSports.forEach((category) => {
      if (groupedSports[category]) {
        this.createCategoryTab(
          category,
          groupedSports[category],
          featuredNav,
          leaguesNav
        );
      }
    });

    // Render all sports in sidebar
    allCategories.forEach(([category, sports]) => {
      this.createCategoryTab(category, sports, sidebar, leaguesNav);
    });

    // Assemble the layout
    contentArea.appendChild(leaguesNav);
    contentArea.appendChild(this.matchesContainer);

    navContainer.appendChild(featuredNav);
    navContainer.appendChild(sidebar);
    navContainer.appendChild(contentArea);

    // Add ads section
    const adsSection = document.createElement("div");
    adsSection.className = "ads-section";
    adsSection.innerHTML = `
        <div class="ad-placeholder">Advertisement Space 1</div>
        <div class="ad-placeholder">Advertisement Space 2</div>
    `;

    navContainer.appendChild(adsSection);
    this.sportsNav.appendChild(navContainer);
  }

  createCategoryTab(category, sports, container, leaguesNav) {
    const categoryTab = document.createElement("div");
    categoryTab.className = `category-tab ${
      this.currentCategory === category ? "active" : ""
    }`;
    categoryTab.textContent = category;
    categoryTab.onclick = () =>
      this.selectCategory(category, sports, leaguesNav);
    container.appendChild(categoryTab);

    if (
      this.currentCategory === category ||
      (!this.currentCategory && category === Object.keys(groupedSports)[0])
    ) {
      this.currentCategory = category;
      this.renderLeagues(sports, this.bettingService.currentSport, leaguesNav);
    }
  }

  selectCategory(category, sports, leaguesContainer) {
    this.currentCategory = category;

    // Update category tabs
    document.querySelectorAll(".category-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.textContent === category);
    });

    // Find first available league/sport in the category
    const firstSport = Array.isArray(sports)
      ? sports[0] // Regular sports
      : sports.find((s) => s.isCountryGroup)?.leagues?.[0] || sports[0]; // Football with country groups

    if (firstSport) {
      console.log("Auto-selecting first sport:", firstSport);
      this.bettingService.changeSport(firstSport.sportId);
    }

    // Update leagues display
    this.renderLeagues(sports, firstSport?.sportId, leaguesContainer);
  }

  renderLeagues(sports, currentSport, container) {
    container.innerHTML = "";

    if (!Array.isArray(sports)) return;

    // If no sport is currently selected, select the first one
    if (!currentSport && sports.length > 0) {
      const firstSport = sports[0].isCountryGroup
        ? sports[0].leagues[0]
        : sports[0];
      currentSport = firstSport.sportId;
      this.bettingService.changeSport(currentSport);
    }

    // Rest of the renderLeagues function...
    // ...existing code...
    sports.forEach((sport) => {
      const leagueTab = document.createElement("div");
      leagueTab.className = `league-tab ${
        sport.sportId === currentSport ? "active" : ""
      }`;
      leagueTab.textContent = this.formatLeagueName(sport.name);
      leagueTab.onclick = () => {
        document
          .querySelectorAll(".league-tab")
          .forEach((tab) => tab.classList.remove("active"));
        leagueTab.classList.add("active");
        this.bettingService.changeSport(sport.sportId);
      };
      container.appendChild(leagueTab);
    });
  }

  formatLeagueName(name) {
    // Remove common prefixes/suffixes for cleaner display
    return name
      .replace(/^(Basketball|Soccer|Football|Baseball)\s*/i, "")
      .replace(/\s*League$/i, "")
      .replace(/\s*Championship$/i, "");
  }

  /**
   * Renders the matches list
   * @param {Array} matches - List of matches to display
   * Includes match details, times, and betting odds
   */
  renderMatches(matches) {
    if (matches.length === 0) {
      this.matchesContainer.innerHTML =
        '<div class="no-matches">No matches available</div>';
      return;
    }

    this.matchesContainer.innerHTML = "";
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

      // Ensure consistent order of odds (1-X-2)
      const orderedOdds = [
        { label: "1", value: match.odds[match.teams[0]] || "-" },
        { label: "X", value: match.odds["Draw"] || "-" },
        { label: "2", value: match.odds[match.teams[1]] || "-" },
      ];

      matchCard.innerHTML = `
        <div class="match-info">
            <div class="teams-container">
                <div class="team">${match.teams[0]}</div>
                <div class="team">${match.teams[1]}</div>
            </div>
            <div class="match-time">${formattedDateTime}</div>
        </div>
        <div class="odds-section">
            <div class="odds-header">
                ${orderedOdds
                  .map((odd) => `<span class="odds-label">${odd.label}</span>`)
                  .join("")}
            </div>
            <div class="odds-container">
                ${orderedOdds
                  .map(
                    (odd) => `
                    <div class="odds-display">
                        <span class="odds-value">${odd.value}</span>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;

      this.matchesContainer.appendChild(matchCard);
    });
  }
}

// Application entry point
let bettingUI = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded, initializing BettingUI");
  bettingUI = new BettingUI();
  bettingUI.initialize();
});

// Add cleanup when page is closed/refreshed
window.addEventListener("beforeunload", () => {
  console.log("Page closing, cleaning up");
  if (bettingUI) {
    bettingUI.cleanup();
  }
});

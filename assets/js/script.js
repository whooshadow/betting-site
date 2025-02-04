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

    // Check if we're showing detailed view
    if (this.selectedMatchId) {
      const match = matches.find((m) => m.id === this.selectedMatchId);
      if (match) {
        this.renderDetailedMatch(match);
        return;
      }
    }

    // Otherwise show the list of matches
    matches.forEach((match) => {
      const matchCard = document.createElement("div");
      matchCard.className = "match-card";
      matchCard.innerHTML = this.createMainMatchContent(match);

      matchCard.addEventListener("click", () => {
        this.selectedMatchId = match.id;
        this.renderMatches(matches);
      });

      this.matchesContainer.appendChild(matchCard);
    });
  }

  renderDetailedMatch(match) {
    // Debug log to see what markets are available
    console.log("All markets for match:", match.allMarkets);

    const detailedView = document.createElement("div");
    detailedView.className = "detailed-match-view";

    // Add back button
    const backButton = document.createElement("button");
    backButton.className = "back-button";
    backButton.innerHTML = "← Back to matches";
    backButton.onclick = () => {
      this.selectedMatchId = null;
      this.bettingService.loadCurrentSportMatches();
    };

    // Create match header
    const matchHeader = `
        <div class="match-header">
            <h2>${match.homeTeam} vs ${match.awayTeam}</h2>
            <div class="match-time">${new Date(
              match.commenceTime
            ).toLocaleString()}</div>
        </div>
    `;

    // Create container for all betting markets
    const marketsContainer = document.createElement("div");
    marketsContainer.className = "betting-markets";

    // Group and display markets
    const marketGroups = {
      "Main Odds": ["h2h"],
      "Spreads & Totals": ["spreads", "totals"],
      "Half Markets": [
        "first_half_winner",
        "first_half_spread",
        "first_half_totals",
      ],
      "Special Markets": [
        "btts",
        "correct_score",
        "double_chance",
        "draw_no_bet",
      ],
    };

    for (const [groupTitle, marketKeys] of Object.entries(marketGroups)) {
      const marketsInGroup = match.allMarkets.filter((m) =>
        marketKeys.includes(m.key)
      );

      if (marketsInGroup.length > 0) {
        const groupElement = document.createElement("div");
        groupElement.className = "market-group";
        groupElement.innerHTML = `
                <h3 class="market-group-title">${groupTitle}</h3>
                <div class="markets-grid">
                    ${marketsInGroup
                      .map(
                        (market) => `
                        <div class="market-box">
                            <div class="market-name">${market.name}</div>
                            <div class="market-outcomes">
                                ${market.outcomes
                                  .map(
                                    (outcome) => `
                                    <div class="outcome">
                                        <span class="outcome-name">${
                                          outcome.name
                                        }</span>
                                        ${
                                          outcome.point
                                            ? `<span class="outcome-point">(${outcome.point})</span>`
                                            : ""
                                        }
                                        <span class="outcome-price">${
                                          outcome.price
                                        }</span>
                                    </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `;
        marketsContainer.appendChild(groupElement);
      }
    }

    // Assemble the view
    detailedView.innerHTML = matchHeader;
    detailedView.appendChild(marketsContainer);
    detailedView.insertBefore(backButton, detailedView.firstChild);

    // Clear and update the display
    this.matchesContainer.innerHTML = "";
    this.matchesContainer.appendChild(detailedView);
  }

  renderDetailedMatch(match) {
    const detailedView = document.createElement("div");
    detailedView.className = "detailed-match-view";

    // Simple arrow back button
    const backButton = document.createElement("button");
    backButton.className = "back-button";
    backButton.innerHTML = "←";
    backButton.onclick = () => {
      this.selectedMatchId = null;
      this.bettingService.loadCurrentSportMatches();
    };

    // Debug log to help understand what data we have
    console.log("Match details:", {
      id: match.id,
      teams: match.teams,
      markets: match.allMarkets,
      bookmakers: match.bookmakers,
    });

    // Match header
    const matchHeader = `
        <div class="match-header">
            <h2>${match.homeTeam} vs ${match.awayTeam}</h2>
            <div class="match-time">${new Date(
              match.commenceTime
            ).toLocaleString()}</div>
        </div>
    `;

    // Create markets container
    const marketsContainer = document.createElement("div");
    marketsContainer.className = "betting-markets";

    // Define market categories with all possible markets
    const marketCategories = {
      "Main Markets": ["h2h", "double_chance", "draw_no_bet"],
      "Handicap & Totals": [
        "spreads",
        "asian_handicap",
        "totals",
        "alternate_spreads",
        "alternate_totals",
        "team_totals",
      ],
      "Half Markets": [
        "first_half_winner",
        "first_half_spread",
        "first_half_totals",
        "second_half_winner",
      ],
      "Goals & Scores": ["btts", "correct_score", "winning_margin", "race_to"],
      "Player & Team": ["player_props", "team_props"],
      "Other Markets": [],
    };

    // Log available market keys
    const availableMarkets = match.allMarkets.map((m) => m.key);
    console.log("Available market keys:", availableMarkets);

    // Process each category
    Object.entries(marketCategories).forEach(([category, marketKeys]) => {
      const marketsInCategory = match.allMarkets.filter((market) =>
        marketKeys.includes(market.key)
      );

      if (marketsInCategory.length > 0) {
        const categorySection = document.createElement("div");
        categorySection.className = "market-category";
        categorySection.innerHTML = `<h3 class="category-title">${category}</h3>`;

        marketsInCategory.forEach((market) => {
          const marketBox = document.createElement("div");
          marketBox.className = "market-box";
          marketBox.innerHTML = `
                    <div class="market-name">${market.name}</div>
                    <div class="market-outcomes">
                        ${market.outcomes
                          .map(
                            (outcome) => `
                            <div class="outcome">
                                <span class="outcome-name">
                                    ${outcome.name}
                                    ${
                                      outcome.point
                                        ? `<span class="point">(${outcome.point})</span>`
                                        : ""
                                    }
                                </span>
                                <span class="outcome-price">${
                                  outcome.price
                                }</span>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `;
          categorySection.appendChild(marketBox);
        });

        marketsContainer.appendChild(categorySection);
      }
    });

    // Add uncategorized markets
    const uncategorizedMarkets = match.allMarkets.filter(
      (market) => !Object.values(marketCategories).flat().includes(market.key)
    );

    if (uncategorizedMarkets.length > 0) {
      const otherSection = document.createElement("div");
      otherSection.className = "market-category";
      otherSection.innerHTML = '<h3 class="category-title">Other Markets</h3>';

      uncategorizedMarkets.forEach((market) => {
        console.log("Uncategorized market:", market);
        otherSection.appendChild(this.createMarketGroup(market));
      });

      marketsContainer.appendChild(otherSection);
    }

    // Assemble the view
    detailedView.innerHTML = matchHeader;
    detailedView.appendChild(marketsContainer);
    detailedView.insertBefore(backButton, detailedView.firstChild);

    this.matchesContainer.innerHTML = "";
    this.matchesContainer.appendChild(detailedView);
  }

  createMarketGroup(market) {
    const group = document.createElement("div");
    group.className = "market-group";

    group.innerHTML = `
        <div class="market-title">${market.name}</div>
        <div class="market-odds">
            ${market.outcomes
              .map(
                (outcome) => `
                <div class="market-odd">
                    <div class="market-odd-name">
                        ${outcome.name}
                        ${outcome.point ? `(${outcome.point})` : ""}
                    </div>
                    <div class="market-odd-value">${outcome.price}</div>
                </div>
            `
              )
              .join("")}
        </div>
    `;

    return group;
  }

  createSeparator(title) {
    const separator = document.createElement("div");
    separator.className = "market-separator";
    separator.innerHTML = `<h3>${title}</h3>`;
    return separator;
  }

  createExtraMarketsContent(match) {
    const extraMarkets = document.createElement("div");
    extraMarkets.className = "extra-markets";

    // Get all available markets from the match data
    if (match.bookmakers?.[0]?.markets) {
      match.bookmakers[0].markets.forEach((market) => {
        if (market.key === "h2h") return; // Skip main odds as they're already shown

        const marketGroup = document.createElement("div");
        marketGroup.className = "market-group";
        marketGroup.innerHTML = `
                <div class="market-title">${this.formatMarketName(
                  market.key
                )}</div>
                <div class="market-odds">
                    ${market.outcomes
                      .map(
                        (outcome) => `
                        <div class="market-odd">
                            <div class="market-odd-name">${outcome.name}</div>
                            <div class="market-odd-value">${outcome.price}</div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `;
        extraMarkets.appendChild(marketGroup);
      });
    }

    // Prevent click event from bubbling when interacting with markets
    extraMarkets.addEventListener("click", (e) => e.stopPropagation());

    return extraMarkets;
  }

  formatMarketName(key) {
    const marketNames = {
      spreads: "Point Spread",
      totals: "Over/Under",
      h2h_lay: "Exchange Odds",
      alternate_spreads: "Alternative Spreads",
      alternate_totals: "Alternative Totals",
      // Add more market types as needed
    };
    return (
      marketNames[key] ||
      key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }

  createMainMatchContent(match) {
    const matchDate = new Date(match.startTime);
    const formattedDateTime = matchDate.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Create single row of odds with consistent labels
    const allOdds = [
      { team: match.teams[0], value: match.odds[match.teams[0]] || "-" },
      { team: "Draw", value: match.odds["Draw"] || "-" },
      { team: match.teams[1], value: match.odds[match.teams[1]] || "-" },
    ];

    // Filter out Draw if it's not a soccer match (no draw odds)
    const displayOdds = match.odds.hasOwnProperty("Draw")
      ? allOdds
      : allOdds.filter((odd) => odd.team !== "Draw");

    return `
        <div class="match-info">
            <div class="teams-container">
                <div class="team">${match.teams[0]}</div>
                <div class="team">${match.teams[1]}</div>
            </div>
            <div class="match-time">${formattedDateTime}</div>
        </div>
        <div class="odds-section">
            <div class="odds-container">
                ${displayOdds
                  .map(
                    (odd) => `
                    <div class="odds-display">
                        <span class="odds-label">${odd.team}</span>
                        <span class="odds-value">${odd.value}</span>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;
  }

  /* ...rest of existing code... */
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

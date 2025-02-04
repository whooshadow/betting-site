import { CONFIG } from "../../../config.js";
import { MOCK_DATA } from "./mockData.js";

export class BettingAPI {
  static async fetchSports() {
    try {
      if (CONFIG.OFFLINE_MODE) {
        console.log("Fetching sports from file...");
        const data = await this.#fetchFromFile();
        console.log("Raw sports data:", data.sports);
        const transformed = this.transformSportsData(data.sports);
        console.log("Transformed sports data:", transformed);
        return transformed;
      }

      const response = await fetch(
        `${CONFIG.API_BASE_URL}/sports?apiKey=${CONFIG.API_KEY}`
      );
      if (!response.ok) throw new Error("API request failed");
      return await response.json();
    } catch (error) {
      console.error("Sports fetch error:", error);
      throw error;
    }
  }

  static async fetchMatchesBySport(sportKey) {
    try {
      if (CONFIG.OFFLINE_MODE) {
        console.log(`Fetching matches for ${sportKey} from file...`);
        const data = await this.#fetchFromFile();
        const matches = data.matches[sportKey] || [];
        return this.transformOddsResponse(matches);
      }

      const url = `${CONFIG.API_BASE_URL}/sports/${sportKey}/odds`;
      const params = new URLSearchParams({
        apiKey: CONFIG.API_KEY,
        regions: CONFIG.DEFAULT_REGIONS,
        markets: CONFIG.DEFAULT_MARKETS,
      });

      const response = await fetch(`${url}?${params}`);
      if (!response.ok) throw new Error("API request failed");
      return await response.json();
    } catch (error) {
      console.error("Matches fetch error:", error);
      throw error;
    }
  }

  static async #fetchFromFile() {
    try {
      console.log("Attempting to fetch from:", CONFIG.DATA_FILE_PATH);
      const response = await fetch(CONFIG.DATA_FILE_PATH);
      if (!response.ok) {
        throw new Error(
          `Failed to load data file: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log("Successfully loaded data:", data);
      return data;
    } catch (error) {
      console.error("Error loading offline data:", error);
      throw error;
    }
  }

  static transformSportsData(sports) {
    if (!Array.isArray(sports)) {
      console.error("Invalid sports data:", sports);
      return {};
    }

    const grouped = sports.reduce((acc, sport) => {
      if (!sport.key || !sport.title) {
        console.warn("Invalid sport entry:", sport);
        return acc;
      }

      const category = sport.group || this.getMainCategory(sport.key);
      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push({
        sportId: sport.key,
        name: sport.title,
        key: sport.key,
        category: category,
      });
      return acc;
    }, {});

    console.log("Transformed sports data:", grouped);
    return grouped;
  }

  static getMainCategory(key) {
    const map = {
      soccer: "Soccer",
      basketball: "Basketball",
      baseball: "Baseball",
      americanfootball: "American Football",
      icehockey: "Ice Hockey",
    };
    const mainCategory = Object.keys(map).find((cat) => key.includes(cat));
    return map[mainCategory] || "Other";
  }

  static transformOddsResponse(events) {
    if (!Array.isArray(events)) return [];

    return events.map((event) => ({
      id: event.id,
      teams: [event.home_team, event.away_team],
      startTime: event.commence_time,
      bookmakers: event.bookmakers || [],
      odds: this.extractOdds(event.bookmakers || []),
      allMarkets: this.extractAllMarkets(event.bookmakers || []),
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      commenceTime: event.commence_time,
    }));
  }

  static extractAllMarkets(bookmakers) {
    if (!bookmakers?.length) return [];

    // Get all unique markets from all bookmakers
    const allMarkets = bookmakers.reduce((markets, bookmaker) => {
      bookmaker.markets?.forEach((market) => {
        const existingMarket = markets.find((m) => m.key === market.key);
        if (!existingMarket) {
          markets.push({
            key: market.key,
            name: this.formatMarketName(market.key),
            outcomes: market.outcomes.map((outcome) => ({
              name: outcome.name,
              price: outcome.price,
              point: outcome.point,
            })),
          });
        }
      });
      return markets;
    }, []);

    return allMarkets;
  }

  static formatMarketName(key) {
    const marketNames = {
      h2h: "Match Winner",
      spreads: "Point Spread",
      totals: "Total Points",
      h2h_lay: "Exchange Odds",
      alternate_spreads: "Alternative Spreads",
      alternate_totals: "Alternative Totals",
      btts: "Both Teams to Score",
      draw_no_bet: "Draw No Bet",
      double_chance: "Double Chance",
      first_half_winner: "First Half Winner",
      second_half_winner: "Second Half Winner",
      first_half_spread: "First Half Spread",
      first_half_totals: "First Half Totals",
      team_totals: "Team Totals",
      race_to: "Race To Points",
      correct_score: "Correct Score",
      winning_margin: "Winning Margin",
      player_props: "Player Props",
      team_props: "Team Props",
      asian_handicap: "Asian Handicap",
    };
    return (
      marketNames[key] ||
      key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }

  static extractOdds(bookmakers) {
    if (!bookmakers?.length) return {};

    // Find the h2h (1X2) market
    const h2hMarket = bookmakers[0]?.markets?.find((m) => m.key === "h2h");
    if (!h2hMarket?.outcomes) return {};

    // Map team names to their odds
    return h2hMarket.outcomes.reduce((acc, outcome) => {
      acc[outcome.name] = outcome.price;
      return acc;
    }, {});
  }
}

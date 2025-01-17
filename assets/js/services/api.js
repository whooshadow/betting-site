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
    return events.map((event) => ({
      id: event.id,
      teams: [event.home_team, event.away_team],
      startTime: event.commence_time,
      odds: this.extractOdds(event.bookmakers),
    }));
  }

  static extractOdds(bookmakers) {
    if (!bookmakers?.length) return {};
    const markets = bookmakers[0]?.markets?.[0];
    if (!markets?.outcomes) return {};

    return markets.outcomes.reduce((acc, outcome) => {
      acc[outcome.name] = outcome.price;
      return acc;
    }, {});
  }
}

import { CONFIG } from "../config.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fetchAndSaveData() {
  try {
    console.log("Starting data fetch...");
    const data = await fetchAllData();
    await saveData(data);
    console.log("Data fetch and save complete!");
  } catch (error) {
    console.error("Failed to fetch and save data:", error);
    process.exit(1);
  }
}

async function fetchAllData() {
  try {
    const sports = await fetchSports();
    const allData = {
      timestamp: new Date().toISOString(),
      sports: sports.filter(
        (sport) =>
          // Only include regular sports (no outrights/futures)
          !sport.has_outrights &&
          // Filter out specific sport types we don't want
          !sport.key.includes("winner") &&
          !sport.key.includes("specials")
      ),
      matches: {},
    };

    console.log(`Found ${allData.sports.length} valid sports to process...`);

    for (const sport of allData.sports) {
      try {
        console.log(`Fetching ${sport.title} (${sport.key})...`);
        const matches = await fetchMatchesForSport(sport.key);

        if (matches && matches.length > 0) {
          allData.matches[sport.key] = matches;
          console.log(
            `✓ Successfully fetched ${matches.length} matches for ${sport.title}`
          );
        } else {
          console.log(`✗ No matches found for ${sport.title}, skipping...`);
        }

        // Add delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1200));
      } catch (error) {
        console.warn(`✗ Error fetching ${sport.title}: ${error.message}`);
        continue;
      }
    }

    const sportCount = Object.keys(allData.matches).length;
    if (sportCount === 0) {
      throw new Error("No valid matches found for any sport");
    }

    console.log(`Successfully processed ${sportCount} sports`);
    return allData;
  } catch (error) {
    console.error("Error in fetchAllData:", error);
    throw error;
  }
}

async function saveData(data) {
  const dataPath = path.join(process.cwd(), "data", "betting-data.json");
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

async function fetchSports() {
  const response = await fetch(
    `${CONFIG.API_BASE_URL}/sports?apiKey=${CONFIG.API_KEY}`
  );
  if (!response.ok) throw new Error("Failed to fetch sports");
  return await response.json();
}

async function fetchMatchesForSport(sportKey) {
  try {
    const url = `${CONFIG.API_BASE_URL}/sports/${sportKey}/odds`;
    const params = new URLSearchParams({
      apiKey: CONFIG.API_KEY,
      regions: CONFIG.DEFAULT_REGIONS,
      markets: CONFIG.DEFAULT_MARKETS,
    });

    const response = await fetch(`${url}?${params}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(
        `API returned ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch matches: ${error.message}`);
  }
}

// Export a dummy object if in offline mode, otherwise export the real function
export const fetchUtils = CONFIG.OFFLINE_MODE ? {} : { fetchAndSaveData };

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
  const backupPath = path.join(
    process.cwd(),
    "data",
    `betting-data-${Date.now()}.json`
  );

  // Create backup of existing data
  if (fs.existsSync(dataPath)) {
    fs.copyFileSync(dataPath, backupPath);
    console.log("Created backup of existing data");
  }

  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log("Saved new data to file");
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
    const regions = CONFIG.DEFAULT_REGIONS.split(",");
    const markets = CONFIG.DEFAULT_MARKETS.split(",");
    let allMatches = [];

    console.log(`Fetching ${sportKey} data for:`, { regions, markets });

    for (const region of regions) {
      for (const market of markets) {
        try {
          const url = `${CONFIG.API_BASE_URL}/sports/${sportKey}/odds`;
          const params = new URLSearchParams({
            apiKey: CONFIG.API_KEY,
            regions: region,
            markets: market,
          });

          console.log(`Fetching ${region}/${market} for ${sportKey}...`);
          const response = await fetch(`${url}?${params}`);

          if (!response.ok) {
            console.warn(
              `Skipped ${region}/${market} for ${sportKey}: ${response.status}`
            );
            continue;
          }

          const data = await response.json();
          if (data && data.length > 0) {
            allMatches = [...allMatches, ...data];
            console.log(
              `✓ Found ${data.length} matches for ${sportKey} (${region}/${market})`
            );
          }

          // Add delay between requests
          await new Promise((resolve) =>
            setTimeout(resolve, CONFIG.REQUEST_DELAY)
          );
        } catch (error) {
          console.warn(
            `Failed to fetch ${region}/${market} for ${sportKey}:`,
            error.message
          );
          continue;
        }
      }
    }

    // Remove duplicates based on event ID
    const uniqueMatches = [
      ...new Map(allMatches.map((match) => [match.id, match])).values(),
    ];
    console.log(
      `Total unique matches for ${sportKey}: ${uniqueMatches.length}`
    );

    return uniqueMatches;
  } catch (error) {
    console.error(`Failed to fetch matches for ${sportKey}:`, error);
    return null;
  }
}

// Export a dummy object if in offline mode, otherwise export the real function
export const fetchUtils = CONFIG.OFFLINE_MODE ? {} : { fetchAndSaveData };

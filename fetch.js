import { CONFIG } from "./config.js";
import { fetchUtils } from "./utils/fetchData.js";

if (CONFIG.OFFLINE_MODE) {
  console.log("Running in offline mode. Data fetch disabled.");
  process.exit(0);
}

fetchUtils.fetchAndSaveData();

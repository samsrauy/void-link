/**
 * ==============================================================================
 * SYNC.JS - Multiplayer Bridge
 * * This script allows your Google Sites modules to talk to your Google Sheet.
 * * HOW TO USE:
 * When you embed a module in Google Sites, you must include your Google Apps 
 * Script Web App URL in the 'api' parameter of the link.
 * * EXAMPLE EMBED URL:
 * https://your-username.github.io/modules/oracle-roller/index.html?game=starforged&id=MyHero&api=https://script.google.com/macros/s/YOUR_API_ID/exec
 * * PARAMETERS:
 * - game: 'starforged' or 'ironsworn' (sets theme and data)
 * - id:   Your Character Name (identifies your row in the Google Sheet)
 * - api:  Your Google Apps Script Web App URL (identifies your Google Sheet)
 * ==============================================================================
 */

// Grab the API URL and Character ID from the browser's address bar
const syncParams = new URLSearchParams(window.location.search);
const GAS_URL = syncParams.get('api');
const charId = syncParams.get('id') || 'global_user';

/**
 * Sends data to the Google Sheet (POST)
 */
async function saveStat(id, statName, value) {
    if (!GAS_URL) {
        console.warn("No API URL detected. Stats will not be saved to Google Sheets.");
        return;
    }

    try {
        await fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors", // Required for Google Apps Script redirects
            cache: "no-cache",
            body: JSON.stringify({
                id: id,
                stat: statName,
                value: value
            })
        });
    } catch (error) {
        console.error("Sync failed:", error);
    }
}

/**
 * Retrieves data from the Google Sheet (GET)
 */
async function loadStats(id) {
    if (!GAS_URL) {
        console.warn("No API URL detected. Loading local defaults only.");
        return {};
    }

    try {
        const response = await fetch(`${GAS_URL}?id=${id}`);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Fetch failed:", error);
        return {};
    }
}

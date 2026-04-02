/**
 * PROJECT: Starforged Void-Link Sync (Client Side)
 * This file handles the communication between the UI and Google Sheets.
 */

const syncParams = new URLSearchParams(window.location.search);
const GAS_URL = syncParams.get('api');
const charId = syncParams.get('id') || 'global_user';

/**
 * Sends a single stat update to the Google Sheet.
 * We now let the server handle the "History" merging to prevent data loss.
 */
async function saveStat(id, statName, value) {
    if (!GAS_URL) return;

    try {
        // We send the specific stat and value. 
        // If statName is "history_entry", Code.gs will append it to the log.
        await fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors", // Required for Google Apps Script Web Apps
            cache: "no-cache",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                id: id, 
                stat: statName, 
                value: value 
            })
        });
        console.log(`Uplink: ${statName} updated.`);
    } catch (e) {
        console.error("Sync Write Error:", e);
    }
}

/**
 * Retrieves the full character object from the Google Sheet.
 * Matches the call used in map/index.html
 */
async function loadStats(id) {
    if (!GAS_URL) return null;

    try {
        const cacheBuster = new Date().getTime();
        const finalUrl = `${GAS_URL}?id=${id}&t=${cacheBuster}`;

        const response = await fetch(finalUrl, {
            method: "GET",
            redirect: "follow"
        });

        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Sync Read Error:", error);
        return null;
    }
}

/**
 * Heartbeat Engine
 * Periodically refreshes data to keep the UI in sync with the Sheet.
 */
function startHeartbeat(callback, interval = 30000) {
    if (typeof callback !== 'function') return;

    // Initial load
    callback();

    // Set interval for subsequent refreshes
    return setInterval(() => {
        console.log("Neural Link: Heartbeat pulse...");
        callback();
    }, interval);
}

// Global helper to get parameters if needed by other modules
function getUrlParam(name) {
    return syncParams.get(name);
}

/**
 * PROJECT: Starforged Void-Link Sync (Client Side)
 * This file handles the communication between the UI and Google Sheets.
 */

const syncParams = new URLSearchParams(window.location.search);
let GAS_URL = syncParams.get('api');
const charId = syncParams.get('id') || 'Evangeline';
const sheetId = syncParams.get('sheet');

/**
 * AUTO-DISCOVERY BOOTLOADER
 * Fetches the 'api_url' from the 'Settings' tab of the linked Google Sheet.
 */
async function initSync() {
    if (!GAS_URL && sheetId) {
        console.log("Neural Link: Attempting Auto-Discovery via Spreadsheet ID...");
        const discoveryUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Settings`;
        
        try {
            const res = await fetch(discoveryUrl);
            const csv = await res.text();
            const rows = csv.split('\n');
            const apiRow = rows.find(r => r.toLowerCase().includes('api_url'));
            
            if (apiRow) {
                // Split by comma and strip quotes/whitespace
                GAS_URL = apiRow.split(',')[1].replace(/"/g, '').trim();
                console.log("Neural Link: API Endpoint Synchronized.");
            } else {
                console.warn("Discovery Error: 'api_url' not found in Settings tab.");
            }
        } catch (e) {
            console.error("Discovery Error: Neural link remains dark.", e);
        }
    }
}

/**
 * Sends a single stat update to the Google Sheet.
 */
async function saveStat(id, statName, value) {
    if (!GAS_URL) {
        console.error("Sync Error: No API endpoint defined.");
        return;
    }

    try {
        await fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors", 
            cache: "no-cache",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id, stat: statName, value: value })
        });
        console.log(`Uplink: ${statName} updated.`);
    } catch (e) {
        console.error("Sync Write Error:", e);
    }
}

/**
 * Retrieves the full character object from the Google Sheet.
 */
async function loadStats(id) {
    // Safety: If discovery is still in progress, wait briefly
    if (!GAS_URL) {
        await new Promise(r => setTimeout(r, 500));
        if (!GAS_URL) return null;
    }

    try {
        const cacheBuster = new Date().getTime();
        const response = await fetch(`${GAS_URL}?id=${id}&t=${cacheBuster}`);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Sync Read Error:", error);
        return null;
    }
}

/**
 * Heartbeat Engine
 */
function startHeartbeat(callback, interval = 30000) {
    if (typeof callback !== 'function') return;
    callback();
    return setInterval(() => {
        console.log("Neural Link: Heartbeat pulse...");
        callback();
    }, interval);
}

// Auto-boot discovery
initSync();

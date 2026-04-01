/**
 * ==============================================================================
 * SYNC.JS - Multiplayer Bridge (v1.2 - Redirect & Cache Proof)
 * ==============================================================================
 * HOW TO CONSTRUCT YOUR EMBED URL:
 * 1. Start with the Module URL from this repo, for example: 
 * https://samsrauy.github.io/ironsworn-starforged-googlesites-modules/modules/stat-tracker/index.html
 * * 2. Add the Game (Theme/Rules):        ?game=starforged  (or ?game=ironsworn)
 * * 3. Add your unique Character ID:      &id=Valerius
 * * 4. Add your private Google API Key:   &api=https://script.google.com/macros/s/[YOUR_UNIQUE_ID]/exec (the URL that follows &api= is the URL you created when you Deployed the Google App Script.)
 *
 * FULL EXAMPLE:
 * https://samsrauy.github.io/ironsworn-starforged-googlesites-modules/modules/stat-tracker/index.html?game=starforged&id=Valerius&api=https://script.google.com/macros/s/AKfycb.../exec
 * * TIP: Users can run multiple separate campaigns by creating multiple Google Sheets.
 * Each sheet will provide a unique API URL per the instructions in the Google Apps Script.
 * ==============================================================================
 */

// Grab configuration from the browser's address bar
const syncParams = new URLSearchParams(window.location.search);
const GAS_URL = syncParams.get('api');
const charId = syncParams.get('id') || 'global_user';

/**
 * Sends data to the Google Sheet (POST)
 */
async function saveStat(id, statName, value) {
    if (!GAS_URL) return;

    // Special logic for History: We fetch current history, add new item, and save back
    if (statName === "history_entry") {
        const currentData = await loadStats(id);
        let history = [];
        try { history = JSON.parse(currentData.history || "[]"); } catch(e) {}
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        history.push({ time: timestamp, text: value });
        
        // Keep only the last 20 rolls
        if (history.length > 20) history.shift();
        
        statName = "history";
        value = JSON.stringify(history);
    }

    try {
        await fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors",
            cache: "no-cache",
            body: JSON.stringify({ id: id, stat: statName, value: value })
        });
    } catch (e) { console.error("Sync error:", e); }
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
        // Cache-busting: adds a unique timestamp so the browser doesn't serve old data
        const t = new Date().getTime();
        const finalUrl = `${GAS_URL}?id=${id}&t=${t}`;

        const response = await fetch(finalUrl, {
            method: "GET",
            redirect: "follow", // Crucial for Google Apps Script 302 redirects
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        return await response.json();
    } catch (error) {
        console.error("Fetch failed (Check your GAS Deployment settings):", error);
        return {};
    }
}

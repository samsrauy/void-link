// js/sync.js

const GAS_WEB_APP_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";

/**
 * Sends data to the Google Sheet
 * @param {string} characterId - Unique ID for the character/campaign
 * @param {object} data - The stats to update (e.g., { health: 4, momentum: 2 })
 */
async function updateSheetData(characterId, data) {
    const payload = {
        id: characterId,
        action: "UPDATE",
        ...data
    };

    try {
        // We use 'no-cors' for simple POSTs to GAS, 
        // or standard fetch if the GAS is set up for CORS.
        const response = await fetch(GAS_WEB_APP_URL, {
            method: "POST",
            mode: "no-cors", 
            cache: "no-cache",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        console.log("Data sent to sheet");
    } catch (err) {
        console.error("Sync Error:", err);
    }
}

/**
 * Fetches the current state from the Google Sheet
 */
async function getSheetData(characterId) {
    const url = `${GAS_WEB_APP_URL}?id=${characterId}`;
    const response = await fetch(url);
    return await response.json();
}

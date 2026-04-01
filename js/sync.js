// Replace this with your deployed Google Apps Script URL later
const GAS_URL = "https://script.google.com/macros/s/.../exec";

/**
 * Sends a stat update to Google Sheets
 */
async function saveStat(charId, statName, value) {
    const payload = {
        action: "UPDATE",
        id: charId,
        stat: statName,
        value: value
    };

    // Note: Google Apps Script requires 'no-cors' for simple POST redirects
    await fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload)
    });
}

/**
 * Gets all stats for a specific character
 */
async function loadStats(charId) {
    const response = await fetch(`${GAS_URL}?id=${charId}`);
    return await response.json();
}

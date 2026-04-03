/**
 * js/sync.js - THE CORE ENGINE (GDoc Integrated)
 */
const params = new URLSearchParams(window.location.search);
const charId = params.get('id');
// GAS_URL is set via Settings!B1 in your architecture
const GAS_URL = "YOUR_DEPLOYED_APP_SCRIPT_URL_HERE"; 

/**
 * Saves a stat to the Sheet and mirrors relevant entries to the GDoc Archive
 */
async function saveStat(id, field, value) {
    const url = `${GAS_URL}?id=${encodeURIComponent(id)}&field=${encodeURIComponent(field)}&val=${encodeURIComponent(value)}`;
    fetch(url, { mode: 'no-cors' });

    // Mirror Journal or History directly to the Archive Doc
    if (field === "history_entry" || field === "journal") {
        sendToArchive(value);
    }
}

/**
 * Pulls current character stats from the sheet
 */
async function loadStats(id) {
    try {
        const response = await fetch(`${GAS_URL}?id=${id}`);
        return await response.json();
    } catch (e) { return null; }
}

/**
 * Appends a custom message to the Shared Google Doc
 */
async function sendToArchive(message) {
    const logUrl = `${GAS_URL}?action=log&id=${encodeURIComponent(charId)}&message=${encodeURIComponent(message)}`;
    return fetch(logUrl, { mode: 'no-cors' });
}

/**
 * Standard Action Roll (1d6 + stat vs 2d10)
 * Automatically logs results to both Sheet History and GDoc Archive.
 */
async function triggerNeuralRoll(moveName, statValue = 0, adds = 0) {
    const d6 = Math.floor(Math.random() * 6) + 1;
    const challenge1 = Math.floor(Math.random() * 10) + 1;
    const challenge2 = Math.floor(Math.random() * 10) + 1;
    
    const actionScore = Math.min(10, d6 + statValue + adds);
    let result = "MISS";
    if (actionScore > challenge1 && actionScore > challenge2) result = "STRONG HIT";
    else if (actionScore > challenge1 || actionScore > challenge2) result = "WEAK HIT";

    const isMatch = (challenge1 === challenge2);
    const finalResult = result + (isMatch ? " (MATCH!)" : "");
    const details = `[${d6}] + ${statValue}${adds ? ' + '+adds : ''} vs [${challenge1}, ${challenge2}]`;
    
    const logEntry = `ROLL: ${moveName} | Result: ${finalResult} (${details})`;
    
    // Log to Sheet for the 'History' sidebar
    saveStat(charId, "history_entry", logEntry);

    return { result: finalResult, details: details };
}

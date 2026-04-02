/**
 * Fetches the massive Datasworn JSON bundle.
 * @param {string} game - 'starforged' or 'ironsworn'
 */
async function fetchDatasworn(game) {
    // UPDATED: Points to the verified distribution URL
    const url = `https://cdn.jsdelivr.net/gh/rsek/datasworn@main/pkg/nodejs/@datasworn/${game}/json/${game}.json`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load Datasworn for ${game}`);
        return await response.json();
    } catch (err) {
        console.error("Datasworn Fetch Error:", err);
        return null;
    }
}

/**
 * Finds the correct row in a Datasworn table based on a 1-100 roll.
 */
function getOracleResult(table, roll) {
    // Datasworn uses 'floor' and 'ceil' for ranges
    return table.find(row => roll >= row.floor && roll <= row.ceil);
}

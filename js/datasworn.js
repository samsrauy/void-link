/** * PROJECT: Starforged/Ironsworn Datasworn Utility & Data Loader
 * This file handles the fetching and global exposure of Starforged data.
 */

// 1. GLOBAL DATA OBJECT (What the modules are looking for)
let datasworn = null; 

const DATASWORN_CONFIG = {
    GAME_TYPE: 'starforged',
    
    get URL() {
        return `https://raw.githubusercontent.com/rsek/datasworn/master/datasworn/starforged/starforged.json`;
    },

    getResult: function(table, roll) {
        if (!table || !table.rows) return null;
        return table.rows.find(row => roll >= row.floor && roll <= row.ceiling);
    },

    /**
     * Internal bootstrapper to ensure data is available globally
     */
    init: async function() {
        console.log("Datasworn: Initializing Neural Link to GitHub...");
        try {
            const response = await fetch(this.URL);
            if (!response.ok) throw new Error(`Fetch Failed: ${response.status}`);
            
            // Assign to the global variable
            datasworn = await response.json();
            
            // Map to window for high-reliability in Google Sites IFrames
            window.datasworn = datasworn;
            
            console.log("Datasworn: Starforged Data Core Online.");
        } catch (err) {
            console.error("Datasworn: Critical Link Failure ->", err);
        }
    }
};

// 2. LEGACY SUPPORT FUNCTIONS
async function fetchDatasworn(game) {
    if (game) DATASWORN_CONFIG.GAME_TYPE = game;
    if (!datasworn) await DATASWORN_CONFIG.init();
    return datasworn;
}

function getOracleResult(table, roll) {
    return DATASWORN_CONFIG.getResult(table, roll);
}

// 3. AUTO-BOOT (This is what was missing)
// This runs as soon as the script is loaded by the browser.
DATASWORN_CONFIG.init();

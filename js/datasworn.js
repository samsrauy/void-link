/**
 * VOID-LINK // DATASWORN CORE MODULE
 * Upgraded to align with Datasworn V2 Schema & NPM Distribution
 */

window.dataswornCore = {
    data: null,

    init: async function() {
        console.log("Datasworn: Linking to Official Release via CDN...");
        
        // Fetching the compiled NPM release as recommended by the repository README
        const url = 'https://cdn.jsdelivr.net/npm/@datasworn/starforged/starforged.json';
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Data Core Fetch Failed: HTTP ${response.status}`);
            
            this.data = await response.json();
            
            // Keep the global pointer alive for older modules
            window.datasworn = this.data; 
            
            console.log("Datasworn: V2 Data Core Online.");
            return this.data;
        } catch (err) {
            console.error("Datasworn: Critical Link Failure ->", err);
            throw err;
        }
    },

    // Safely extract the asset library regardless of v1/v2 schema naming
    getAssets: function() {
        if (!this.data) return null;
        return this.data.assets || this.data.asset_collections || null;
    },

    // Recursive search that gracefully handles the V2 transition from _id to $id
    findNode: function(idSnippet) {
        let result = null;
        function search(obj) {
            if (!obj || typeof obj !== 'object' || result) return;
            
            // Checks for both legacy and modern ID tags
            const nodeId = obj._id || obj.$id || obj.id;
            if (nodeId && typeof nodeId === 'string' && nodeId.includes(idSnippet)) {
                result = obj;
                return;
            }
            for (let key in obj) search(obj[key]);
        }
        search(this.data);
        return result;
    },

    // Unified oracle roller
    rollOracle: function(idSnippet, fallback = "Unknown") {
        const table = this.findNode(idSnippet);
        let rows = null;
        
        if (table) {
            rows = table.rows || table.entries || table.table;
        }
        if (!rows || rows.length === 0) return fallback;

        const roll = Math.floor(Math.random() * 100) + 1;
        const row = rows.find(r => roll >= (r.floor || r.min || 1) && roll <= (r.ceiling || r.max || 100));
        return row ? (row.text || row.result || row.name || fallback) : fallback;
    }
};

// AUTO-BOOT
window.dataswornReady = window.dataswornCore.init();

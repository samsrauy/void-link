/**
 * VOID-LINK // SYNC MANAGER
 * Communicates with the Game Master's Google Apps Script API.
 */

window.gLink = {
    // Helper to get the server URL from local browser storage
    getServerUrl: function() {
        const url = localStorage.getItem('voidLinkServer');
        if (!url) {
            console.error("SYNC FATAL: No GM Server URL found. Please log out and provide a valid Web App URL.");
            return null;
        }
        return url;
    },

    // Standardized network request function (Bypasses CORS via text/plain)
    sendRequest: async function(payload) {
        const url = this.getServerUrl();
        if (!url) return null;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            console.error("SYNC NETWORK ERROR:", error);
            return null;
        }
    },

    saveStatServer: async function(id, field, val) {
        console.log(`Sync: Saving ${field} for ${id}...`);
        const result = await this.sendRequest({
            action: "saveStat",
            id: id,
            field: field,
            value: val
        });
        if (result && result.status === "SUCCESS") {
            console.log("Sync: Save successful.");
        } else {
            console.error("Sync: Save failed.", result);
        }
    },

    loadStatsServer: async function(id) {
        console.log(`Sync: Loading stats for ${id}...`);
        const result = await this.sendRequest({
            action: "loadStats",
            id: id
        });
        
        if (result && result.status === "success") {
            if (typeof window.onStatsLoaded === "function") {
                window.onStatsLoaded(JSON.stringify(result.data));
            }
            return result.data; 
        } else {
            console.error("Sync: Load failed.", result);
            return null;
        }
    },

    logServer: async function(id, msg) {
        console.log(`Sync: Writing log for ${id}...`);
        const result = await this.sendRequest({
            action: "logEntry",
            id: id,
            message: msg
        });
        if (result && result.status === "OK") {
            console.log("Sync: Log written successfully.");
        } else {
            console.error("Sync: Log failed.", result);
        }
    },

    // --- SECTOR ARCHIVE API ---

    saveSectorServer: async function(charId, sectorId, sectorName, dataString) {
        console.log(`Sync: Archiving sector ${sectorName} for ${charId}...`);
        const result = await this.sendRequest({
            action: "saveSector",
            id: charId,
            sectorId: sectorId,
            sectorName: sectorName,
            data: dataString
        });
        if (result && result.status === "SUCCESS") {
            console.log("Sync: Sector archived successfully.");
        } else {
            console.error("Sync: Sector archive failed.", result);
        }
    },

    getSectorListServer: async function(charId) {
        console.log(`Sync: Fetching sector archives for ${charId}...`);
        const result = await this.sendRequest({
            action: "getSectorList",
            id: charId
        });
        
        if (result && result.status === "success") {
            return result.data;
        } else {
            console.error("Sync: Failed to fetch archives.", result);
            return [];
        }
    },

    loadSectorServer: async function(charId, sectorId) {
        console.log(`Sync: Downloading sector data [${sectorId}]...`);
        const result = await this.sendRequest({
            action: "loadSector",
            id: charId,
            sectorId: sectorId
        });
        
        if (result && result.status === "success" && result.data) {
            try {
                // The DB returns a stringified JSON object, parse it for the map module
                return typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
            } catch(e) {
                console.error("Sync: Failed to parse sector JSON", e);
                return null;
            }
        } else {
            console.error("Sync: Sector download failed.", result);
            return null;
        }
    }
};

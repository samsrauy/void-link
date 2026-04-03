/**
 * js/sync.js - NEURAL LINK ADAPTER
 */
// 1. Establish Identity
const params = new URLSearchParams(window.location.search);
window.charId = window.charId || params.get('id') || "Unknown_Pilot";

// 2. Identify the Google Bridge
// This check works whether we are in the App Script environment or the GitHub host
const gLink = (typeof google !== 'undefined') ? google.script.run : null;

function saveStat(id, field, value) {
    if (!gLink) {
        console.warn(`[OFFLINE] Save: ${field} = ${value}`);
        return;
    }
    
    gLink.withFailureHandler(err => console.error("Neural Link Save Failure:", err))
         .saveStatServer(id, field, value);

    if (field === "history_entry" || field === "journal") {
        sendToArchive(value);
    }
}

async function loadStats(id) {
    return new Promise((resolve) => {
        if (!gLink) {
            console.warn("[OFFLINE] Loading Local Template");
            return resolve({ id: id, edge:3, heart:2, iron:2, shadow:1, wits:1 });
        }

        gLink.withSuccessHandler(data => resolve(JSON.parse(data)))
             .withFailureHandler(err => {
                console.warn("Initializing New Character Template...");
                resolve({ id: id });
             })
             .loadStatsServer(id);
    });
}

function sendToArchive(message) {
    if (gLink) gLink.logServer(window.charId, message);
}

async function triggerNeuralRoll(moveName, stat = 0, adds = 0) {
    const d6 = Math.floor(Math.random() * 6) + 1;
    const c1 = Math.floor(Math.random() * 10) + 1;
    const c2 = Math.floor(Math.random() * 10) + 1;
    const score = Math.min(10, d6 + stat + adds);
    
    let res = (score > c1 && score > c2) ? "STRONG HIT" : (score > c1 || score > c2) ? "WEAK HIT" : "MISS";
    if (c1 === c2) res += " (MATCH)";
    
    const details = `[D6: ${d6}] vs [C1: ${c1}, C2: ${c2}]`;
    sendToArchive(`Rolled ${moveName}: ${res} ${details}`);
    
    return { result: res, details: details, score: score };
}

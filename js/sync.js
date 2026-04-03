/**
 * js/sync.js - NEURAL LINK ADAPTER (CORS-AWARE)
 */
const params = new URLSearchParams(window.location.search);
const charId = params.get('id');
const sheetID = params.get('sheet'); 
let GAS_URL = ""; 

async function bootstrap() {
    if (!sheetID) return;
    try {
        const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv&sheet=Settings&range=B1`;
        const response = await fetch(url);
        const text = await response.text();
        GAS_URL = text.replace(/"/g, "").trim();
    } catch (e) { console.error("Link Failure", e); }
}

async function saveStat(id, field, value) {
    if (!GAS_URL) await bootstrap();
    const url = `${GAS_URL}?id=${encodeURIComponent(id)}&field=${encodeURIComponent(field)}&val=${encodeURIComponent(value)}`;
    fetch(url, { mode: 'no-cors' }); 
    if (field === "history_entry" || field === "journal") sendToArchive(value);
}

async function loadStats(id) {
    if (!GAS_URL) await bootstrap();
    try {
        // CRITICAL FIX: redirect: 'follow'
        const response = await fetch(`${GAS_URL}?id=${encodeURIComponent(id)}`, {
            method: 'GET',
            redirect: 'follow' 
        });
        return await response.json();
    } catch (e) {
        console.warn("Initializing New Character Template...");
        return { id: id }; 
    }
}

async function sendToArchive(message) {
    if (!GAS_URL) return;
    const logUrl = `${GAS_URL}?action=log&id=${encodeURIComponent(charId)}&message=${encodeURIComponent(message)}`;
    fetch(logUrl, { mode: 'no-cors' });
}

bootstrap();

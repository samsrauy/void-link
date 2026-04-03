/**
 * js/sync.js - THE CORE ENGINE
 */
const params = new URLSearchParams(window.location.search);
const sheetId = params.get('sheet');
const charId = params.get('id');
const GAS_URL = "https://script.google.com/macros/s/AKfycbwN24ooemboCTKWLdL4KxDyb7pyh4JCZgkfTglICcHVfq6FQVE7Cp6JcOF5KSZ_Maj2Kw/exec"; 

// THE DICE ENGINE: Action Roll (1d6 + stat + adds vs 2d10)
function rollDice(statValue = 0, adds = 0) {
    const actionDie = Math.floor(Math.random() * 6) + 1;
    const challenge1 = Math.floor(Math.random() * 10) + 1;
    const challenge2 = Math.floor(Math.random() * 10) + 1;
    
    const actionScore = Math.min(10, actionDie + statValue + adds);
    
    let result = "MISS";
    if (actionScore > challenge1 && actionScore > challenge2) result = "STRONG HIT";
    else if (actionScore > challenge1 || actionScore > challenge2) result = "WEAK HIT";
    
    const isMatch = (challenge1 === challenge2);
    
    return {
        result: result + (isMatch ? " (MATCH!)" : ""),
        score: actionScore,
        details: `[${actionDie}] + ${statValue}${adds ? ' + '+adds : ''} vs [${challenge1}, ${challenge2}]`,
        isMatch: isMatch
    };
}

// THE PROGRESS ROLL: (Progress Score vs 2d10)
function rollProgress(progressScore) {
    const challenge1 = Math.floor(Math.random() * 10) + 1;
    const challenge2 = Math.floor(Math.random() * 10) + 1;
    
    let result = "MISS";
    if (progressScore > challenge1 && progressScore > challenge2) result = "STRONG HIT";
    else if (progressScore > challenge1 || progressScore > challenge2) result = "WEAK HIT";
    
    return {
        result: result + (challenge1 === challenge2 ? " (MATCH!)" : ""),
        details: `Progress [${progressScore}] vs [${challenge1}, ${challenge2}]`
    };
}

// PERSISTENCE LAYER
async function saveStat(id, stat, value) {
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ id, stat, value })
        });
        console.log(`Uplink: ${stat} synchronized.`);
    } catch (e) { console.error("Link Severed:", e); }
}

async function loadStats(id) {
    try {
        const response = await fetch(`${GAS_URL}?id=${id}`);
        return await response.json();
    } catch (e) { return null; }
}

// Triggers a 2d10 + 1d6 + Stat roll and logs it to the sheet.
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
    
    console.log(`Sync: Logging ${logEntry}`);
    
    // 1. Trigger the background uplink to Google Sheets
    // We don't 'return' this because saveStat doesn't return the roll data
    await saveStat(charId, "history_entry", logEntry);

    // 2. Return the data object so the UI (Character Sheet/Asset Browser) can display it
    return {
        result: finalResult,
        details: details,
        score: actionScore
    };
}

/**
 * ==============================================================================
 * PROJECT: Ironsworn/Starforged Google Sites Sync
 * SETTING UP YOUR GOOGLE SHEET:
 * 1. Create a new Google Sheet.
 * 2. Rename the first tab (sheet) to "Stats".
 * (The Sheet Tab Name is also case sensitive. It MUST be Stats for the script to work.)
 * 3. Add these headers in Row 1: [A1] characterId, [B1] health, [C1] momentum, [D1] spirit, [E1] supply, [F1] last_roll.
 * (The script will automatically add more columns as you create more stats! But please note the lables are case sensitive!)
 * * Install the Script
 * 1. In your Google Sheet, go to the top menu and select Extensions > Apps Script.
 * 2. A new tab will open with a code editor.
 * 3. Delete everything currently in the editor (the empty myFunction).
 * 4. Paste the contents of THIS script into Code.gs
 * * DEPLOYMENT INSTRUCTIONS:
 * 1. Click 'Deploy' > 'New Deployment'.
 * 2. Select 'Web App'.
 * 3. Execute as: 'Me' (Your email).
 * 4. Who has access: 'Anyone'.
 * 5. Click "Authorize Access". It will go to your Google Account and complain about security. 
 * 6. Copy the 'Web App URL' and save it somewhere you can find easily. You'll need this to identify the correct Google Sheet.
 * ==============================================================================
 */
/**
 * ==============================================================================
 * PROJECT: Starforged Void-Link Sync
 * INSTRUCTIONS: 
 * 1. Replace the entire contents of your Apps Script editor with this code.
 * 2. Set your GEMINI_KEY in Project Settings > Script Properties.
 * 3. Deploy as a Web App (New Version) whenever you make changes.
 * This script turns your Google Sheet into a database for the Starforged Terminal.
 */

function doGet(e) {
  try {
    const charId = e.parameter.id;
    
    // Route to Gemini Oracle if 'oracle' parameter exists [cite: 15]
    if (e.parameter.oracle) {
      const response = askSecretOracle(e.parameter.oracle);
      return ContentService.createTextOutput(response).setMimeType(ContentService.MimeType.TEXT);
    }
    
    if (!charId) throw new Error("No character ID provided.");

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Stats") || ss.insertSheet("Stats"); [cite: 17]
    
    // Auto-initialize headers if the sheet is brand new [cite: 18]
    if (sheet.getLastColumn() === 0) {
      sheet.appendRow([
        "characterId", "health", "momentum", "spirit", "supply", 
        "history", "journal", "assets", "ship_pos", 
        "edge", "heart", "iron", "shadow", "wits", "xp", "impacts", "tracks"
      ]);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const row = data.find(r => r[0] === charId);
    let result = {};

    if (row) {
      // Map existing character data [cite: 19]
      headers.forEach((header, index) => { result[header] = row[index]; });
    } else {
      // Initialize a new character with Starforged defaults [cite: 20]
      // Format: [id, hp, mom, spi, sup, hist, journ, assets, pos, edg, hrt, irn, sha, wits, xp, impacts, tracks]
      const newRow = [charId, 5, 2, 5, 5, "[]", "", "[]", "20,30", 2, 2, 2, 2, 2, 0, "[]", "[]"];
      sheet.appendRow(newRow); [cite: 21]
      headers.forEach((header, index) => { result[header] = newRow[index] || 0; });
    }
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON); [cite: 21]
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.message})).setMimeType(ContentService.MimeType.JSON); [cite: 22]
  }
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents); [cite: 23]
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Stats");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const charId = params.id;
    const statName = params.stat;
    const value = params.value;
    
    let rowIndex = data.findIndex(r => r[0] === charId);
    if (rowIndex === -1) {
      sheet.appendRow([charId]); [cite: 26]
      rowIndex = sheet.getLastRow() - 1;
    }

    // Route history entries to the specialized logger [cite: 27]
    if (statName === "history_entry") {
      return updateHistoryLog(sheet, rowIndex, value);
    }

    let colIndex = headers.indexOf(statName);
    // If a new stat is sent that doesn't have a column, create it [cite: 28]
    if (colIndex === -1) {
      colIndex = headers.length;
      sheet.getRange(1, colIndex + 1).setValue(statName); [cite: 29]
    }
    
    // Update the specific cell [cite: 29]
    sheet.getRange(rowIndex + 1, colIndex + 1).setValue(value);
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Manages the History array to prevent cell-size overflow [cite: 31]
 */
function updateHistoryLog(sheet, rowIndex, newText) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let colIndex = headers.indexOf("history");
  
  if (colIndex === -1) {
    colIndex = headers.length;
    sheet.getRange(1, colIndex + 1).setValue("history"); [cite: 32]
  }
  
  const cell = sheet.getRange(rowIndex + 1, colIndex + 1);
  let history = [];
  try { 
    const val = cell.getValue();
    history = val ? JSON.parse(val) : []; [cite: 34]
  } catch(e) { history = []; }
  
  const now = new Date();
  const timestamp = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0'); [cite: 36]
  
  history.push({ time: timestamp, text: newText }); [cite: 36]
  if (history.length > 50) history.shift(); // Keep log lean [cite: 37]
  
  cell.setValue(JSON.stringify(history)); [cite: 37]
  return ContentService.createTextOutput("Log Added").setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Interfaces with the Gemini API for the Secret Oracle module [cite: 37]
 */
function askSecretOracle(userPrompt) {
  const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_KEY'); [cite: 37]
  if (!API_KEY) return "VOID ERROR: NO KEY IN CORES."; [cite: 38]
  
  const MODEL = "gemini-1.5-flash"; [cite: 38]
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`; [cite: 38]

  const payload = {
    "contents": [{ "parts": [{ "text": "You are a Starforged AI Oracle. Provide a gritty, cryptic, 2-sentence response to: " + userPrompt }] }],
    "generationConfig": { "temperature": 0.8, "maxOutputTokens": 100 }
  }; [cite: 39]

  try {
    const res = UrlFetchApp.fetch(URL, { 
      "method": "post", 
      "contentType": "application/json", 
      "payload": JSON.stringify(payload), 
      "muteHttpExceptions": true 
    }); [cite: 40]
    
    const data = JSON.parse(res.getContentText()); [cite: 41]
    return res.getResponseCode() === 200 
      ? data.candidates[0].content.parts[0].text 
      : "VOID LINK ERROR: " + (data.error ? data.error.message : "SIGNAL LOST"); [cite: 41]
  } catch (e) { 
    return "SIGNAL LOST: SYSTEM CRASH."; [cite: 42]
  }
}

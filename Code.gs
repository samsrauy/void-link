/**
 * ==============================================================================
 * PROJECT: Starforged Void-Link Sync
 * 
 * INSTRUCTIONS: 
 * 1. Replace the entire contents of your Apps Script editor with this code.
 * 2. Set your GEMINI_KEY in Project Settings > Script Properties, if using Gemini
 * 3. Deploy as a Web App or redeploy (New Version) whenever you make changes.
 * 4. When you deploy, it will complain about and unknown script and if you trust it. THIS script is that unknown script.
 *    And YOUR account is the one trying to access your account. Go ahead and click trust, unless you don't trust yourself.
 * 5. When you deploy, it'll also ask you to select "Execute as". Select "Me" (i.e., you). I'll also ask "Who has access". Select "Anyone".
 *    You'll want to do this because the project will use the Web App URL this script creates to tie everything together. BUT, since the software is designed to borrow
 *    HTML code and JS from the repository and only uses your Google Sheet and this App Script (which is only tied to that Google Sheet) only you and whomever you give
 *    access to it will be able to interact with it or *run* this script. But it's still a computer, who is not you.
 * 6. Now, copy the Web App URL and enter that in cell Settings:B2 in your Google Sheet that's shared (you didn't forget, did ya?)
 * 7. If you want to delete this and not use the project, all you have to do is delete your Google Sheet that you used for this game. That's the extent of "uninstaling."
 *    If only it was that easy to get rid of social media or crappy people. Sorry, I can't help with that!   
 * * 
 * ==============================================================================
 * SETUP FOR PLAYERS:
 * - You do NOT need to manually add headers to your "Stats" tab.
 * - This script will automatically initialize the database headers on first boot.
 * - Ensure your Google Sheet is shared as "Anyone with the link can view."
 * ==============================================================================
 */

function doGet(e) {
  try {
    const charId = e.parameter.id;
    
    // Route to Gemini Oracle if 'oracle' parameter exists
    if (e.parameter.oracle) {
      const response = askSecretOracle(e.parameter.oracle);
      return ContentService.createTextOutput(response).setMimeType(ContentService.MimeType.TEXT);
    }
    
    if (!charId) throw new Error("No character ID provided.");
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Stats") || ss.insertSheet("Stats");
    
    // SCHEMA INITIALIZATION: Auto-initialize headers if the sheet is blank
    if (sheet.getLastColumn() === 0) {
      const defaultHeaders = [
        "characterId", "health", "momentum", "spirit", "supply", 
        "history", "journal", "assets", "ship_pos", 
        "edge", "heart", "iron", "shadow", "wits", "xp", "impacts", "legacies", "vows"
      ];
      sheet.appendRow(defaultHeaders);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const row = data.find(r => r[0] === charId);
    let result = {};

    if (row) {
      // Map existing character data
      headers.forEach((header, index) => { result[header] = row[index]; });
    } else {
      // Initialize a new character with Starforged defaults
      const newRow = [charId, 5, 2, 5, 5, "[]", "", "[]", "20,30", 2, 2, 2, 2, 2, 0, "[]", "[]", "[]"];
      sheet.appendRow(newRow);
      headers.forEach((header, index) => { result[header] = newRow[index] || 0; });
    }
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Stats");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const charId = params.id;
    const statName = params.stat;
    const value = params.value;
    
    let rowIndex = data.findIndex(r => r[0] === charId);
    if (rowIndex === -1) {
      sheet.appendRow([charId]);
      rowIndex = sheet.getLastRow() - 1;
    }

    // Route history entries to the specialized logger
    if (statName === "history_entry") {
      return updateHistoryLog(sheet, rowIndex, value);
    }

    let colIndex = headers.indexOf(statName);
    
    // DYNAMIC SCHEMA: Create column if it doesn't exist
    if (colIndex === -1) {
      colIndex = headers.length;
      sheet.getRange(1, colIndex + 1).setValue(statName);
    }
    
    // Update the specific cell
    sheet.getRange(rowIndex + 1, colIndex + 1).setValue(value);
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Manages the History array to prevent cell-size overflow.
 */
function updateHistoryLog(sheet, rowIndex, newText) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let colIndex = headers.indexOf("history");
  
  if (colIndex === -1) {
    colIndex = headers.length;
    sheet.getRange(1, colIndex + 1).setValue("history");
  }
  
  const cell = sheet.getRange(rowIndex + 1, colIndex + 1);
  let history = [];
  try { 
    const val = cell.getValue();
    history = val ? JSON.parse(val) : [];
  } catch(e) { history = []; }
  
  const now = new Date();
  const timestamp = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
  
  history.push({ time: timestamp, text: newText });
  if (history.length > 50) history.shift();
  
  cell.setValue(JSON.stringify(history));
  return ContentService.createTextOutput("Log Added").setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Interfaces with the Gemini API for the Secret Oracle module.
 */
function askSecretOracle(userPrompt) {
  const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_KEY');
  if (!API_KEY) return "VOID ERROR: NO KEY IN CORES.";
  
  const MODEL = "gemini-1.5-flash";
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const payload = {
    "contents": [{ "parts": [{ "text": "You are a Starforged AI Oracle. Provide a gritty, cryptic, 2-sentence response to: " + userPrompt }] }],
    "generationConfig": { "temperature": 0.8, "maxOutputTokens": 100 }
  };

  try {
    const res = UrlFetchApp.fetch(URL, { 
      "method": "post", 
      "contentType": "application/json", 
      "payload": JSON.stringify(payload), 
      "muteHttpExceptions": true 
    });
    
    const data = JSON.parse(res.getContentText());
    return res.getResponseCode() === 200 
      ? data.candidates[0].content.parts[0].text 
      : "VOID LINK ERROR: " + (data.error ? data.error.message : "SIGNAL LOST");
  } catch (e) { 
    return "SIGNAL LOST: SYSTEM CRASH.";
  }
}

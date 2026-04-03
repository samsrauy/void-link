/**
 * ==============================================================================
 * PROJECT: Starforged Void-Link Sync and Architect - Now with extra Neural Link Core!!!
 * This script handles Stats, Assets, and Persistent GDoc Logging.
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = ss.getSheetByName("Settings");
  const stats = ss.getSheetByName("Stat");
  
  const action = e.parameter.action;
  const id = e.parameter.id;
  const field = e.parameter.field;
  const val = e.parameter.val;

  // ROUTE 1: LOG TO GOOGLE DOC
  if (action === "log") {
    const docId = settings.getRange("B3").getValue();
    return appendToLog(e.parameter, docId);
  }

  // ROUTE 2: DATA PERSISTENCE
  if (id && field) {
    let data = stats.getDataRange().getValues();
    let headers = data[0];
    let colIdx = headers.indexOf(field);

    // Auto-create column if missing (e.g., map_coords)
    if (colIdx === -1) {
      colIdx = headers.length;
      stats.getRange(1, colIdx + 1).setValue(field);
      data = stats.getDataRange().getValues();
    }

    // Find or create character row
    let rowIdx = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString().toLowerCase() === id.toLowerCase()) { rowIdx = i + 1; break; }
    }

    if (rowIdx !== -1) {
      stats.getRange(rowIdx, colIdx + 1).setValue(val);
    } else {
      let newRow = new Array(headers.length).fill("");
      newRow[0] = id;
      newRow[colIdx] = val;
      stats.appendRow(newRow);
    }
    return ContentService.createTextOutput("OK");
  } else if (id) {
    // READ MODE
    const data = stats.getDataRange().getValues();
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString().toLowerCase() === id.toLowerCase()) {
        let obj = {};
        headers.forEach((h, idx) => obj[h] = data[i][idx]);
        return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
      }
    }
  }
}

function appendToLog(p, docId) {
  try {
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();
    const entry = `[${new Date().toLocaleString()}] ${(p.id || "UNK").toUpperCase()}: ${p.message}`;
    const para = body.appendParagraph(entry);
    para.setFontFamily("Courier New").setFontSize(9);
    if (p.message.includes("ROLL:")) para.setForegroundColor("#008b8b");
    return ContentService.createTextOutput("OK");
  } catch(err) { return ContentService.createTextOutput(err.toString()); }
}

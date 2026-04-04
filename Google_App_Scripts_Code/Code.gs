/**
 * VOID-LINK // HEADLESS API
 * Handles database operations for the GitHub Frontend.
 */

function doPost(e) {
  // We parse the incoming payload
  let request;
  try {
    request = JSON.parse(e.postData.contents);
  } catch (err) {
    return createJsonResponse({ status: "error", message: "Invalid JSON payload" });
  }

  const action = request.action;
  const id = request.id;
  
  if (!action || !id) {
    return createJsonResponse({ status: "error", message: "Missing action or id" });
  }

  // Route the request based on the "action" flag
  try {
    if (action === "saveStat") {
      const result = saveStat(id, request.field, request.value);
      return createJsonResponse({ status: result });
    } 
    else if (action === "loadStats") {
      const stats = loadStats(id);
      return createJsonResponse({ status: "success", data: stats });
    } 
    else if (action === "logEntry") {
      const result = writeLog(id, request.message);
      return createJsonResponse({ status: result });
    } 
    else {
      return createJsonResponse({ status: "error", message: "Unknown action" });
    }
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

// Helper function to format the output properly for cross-origin requests
function createJsonResponse(responseObject) {
  return ContentService.createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- DATABASE LOGIC ---

function saveStat(id, field, val) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let stats = ss.getSheetByName("Stat") || ss.insertSheet("Stat");
  const data = stats.getDataRange().getValues();
  const headers = data[0];
  const colIdx = headers.indexOf(field);
  
  if (colIdx === -1) return "ERR_FIELD_NOT_FOUND";

  const searchId = id.toString().trim().toLowerCase();
  let rowIdx = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().trim().toLowerCase() === searchId) {
      rowIdx = i + 1; break; 
    }
  }

  if (rowIdx !== -1) {
    stats.getRange(rowIdx, colIdx + 1).setValue(val);
  } else {
    let newRow = new Array(headers.length).fill("");
    newRow[0] = id.trim(); 
    newRow[colIdx] = val;
    stats.appendRow(newRow);
  }
  return "SUCCESS";
}

function loadStats(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const stats = ss.getSheetByName("Stat");
  if (!stats) return { id: id };
  
  const data = stats.getDataRange().getValues();
  const headers = data[0];
  const searchId = id.toString().trim().toLowerCase();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().trim().toLowerCase() === searchId) {
      let obj = {};
      headers.forEach((h, idx) => obj[h] = data[i][idx]);
      return obj;
    }
  }
  return { id: id };
}

function writeLog(id, message) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = ss.getSheetByName("Settings");
  if (!settings) return "ERR_NO_SETTINGS_SHEET";
  
  const docId = settings.getRange("B3").getValue();
  if (!docId) return "ERR_NO_DOC_ID";
  
  DocumentApp.openById(docId).getBody().appendParagraph(`[${new Date().toLocaleString()}] ${id}: ${message}`);
  return "OK";
}

/**
 * VOID-LINK // HEADLESS API
 * Handles database operations for the GitHub Frontend.
 */

function doPost(e) {
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
    else if (action === "saveSector") {
      const result = saveSector(id, request.sectorId, request.sectorName, request.data);
      return createJsonResponse({ status: result });
    }
    else if (action === "getSectorList") {
      const list = getSectorList(id);
      return createJsonResponse({ status: "success", data: list });
    }
    else if (action === "loadSector") {
      const sectorData = loadSector(id, request.sectorId);
      return createJsonResponse({ status: "success", data: sectorData });
    }
    else {
      return createJsonResponse({ status: "error", message: "Unknown action" });
    }
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

function createJsonResponse(responseObject) {
  return ContentService.createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- CHARACTER DATABASE LOGIC (SELF-BUILDING) ---

function saveStat(id, field, val) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const stats = ss.getSheetByName("Stat");
  if (!stats) return "ERR_SHEET_NOT_FOUND";

  const data = stats.getDataRange().getValues();
  let headers = data[0] || [];
  let colIdx = headers.indexOf(field);
  
  // --- FIX: Dynamic Column Creation ---
  // If the header doesn't exist, create it at the end of the first row
  if (colIdx === -1) {
    colIdx = headers.length; 
    stats.getRange(1, colIdx + 1).setValue(field); 
    headers.push(field); 
  }
  // ------------------------------------

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
    if (data[i][0] && data[i][0].toString().trim().toLowerCase() === searchId) {
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

// --- SECTOR ARCHIVE LOGIC ---

function getArchiveSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Sector_Archive");
  if (!sheet) {
    sheet = ss.insertSheet("Sector_Archive");
    sheet.appendRow(["charId", "sector_id", "sector_name", "sector_data"]);
  }
  return sheet;
}

function saveSector(charId, sectorId, sectorName, sectorData) {
  const sheet = getArchiveSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == charId && data[i][1] == sectorId) {
      sheet.getRange(i + 1, 3).setValue(sectorName);
      sheet.getRange(i + 1, 4).setValue(sectorData);
      return "SUCCESS";
    }
  }
  
  sheet.appendRow([charId, sectorId, sectorName, sectorData]);
  return "SUCCESS";
}

function getSectorList(charId) {
  const sheet = getArchiveSheet();
  const data = sheet.getDataRange().getValues();
  let list = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == charId) {
      list.push({ id: data[i][1], name: data[i][2] });
    }
  }
  return list; 
}

function loadSector(charId, sectorId) {
  const sheet = getArchiveSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == charId && data[i][1] == sectorId) {
      return data[i][3]; 
    }
  }
  return null;
}

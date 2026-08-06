// ============================================================
// Fungsi ini adalah API endpoint untuk website.
// Deploy sebagai Web App setelah setupSheets() berhasil.
// ============================================================

function doGet(e) {
  try {
    const sheetName = e.parameter.sheet;
    
    if (!sheetName) {
      return ContentService.createTextOutput(JSON.stringify({
        error: "Parameter 'sheet' is required"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        error: `Sheet '${sheetName}' not found`
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers_row = data[0];
    const result = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const obj = {};
      let isEmpty = true;
      
      for (let j = 0; j < headers_row.length; j++) {
        obj[headers_row[j]] = row[j];
        if (row[j] !== "") isEmpty = false;
      }
      
      if (!isEmpty) result.push(obj);
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
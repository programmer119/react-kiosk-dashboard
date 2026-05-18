const SHEET_NAME = "vending_logs";

function doPost(e) {
  const sheet = getOrCreateSheet();
  const body = JSON.parse(e.postData.contents);

  sheet.appendRow([
    body.created_at,
    body.device_id,
    body.selected_need,
    body.product_name,
    body.product_id,
    body.slot,
    body.cartridge,
    body.quantity,
    body.dispense_status,
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "created_at",
      "device_id",
      "selected_need",
      "product_name",
      "product_id",
      "slot",
      "cartridge",
      "quantity",
      "dispense_status",
    ]);
  }

  return sheet;
}

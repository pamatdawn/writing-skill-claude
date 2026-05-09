// SEO Content Pipeline — Google Apps Script Web App
// One-time deploy: Extensions > Apps Script > Deploy > New deployment
// Type: Web App | Execute as: Me | Access: Anyone
// Paste the Web App URL into SEO_MASTER_SKILL.md as DRIVE_WEBAPP_URL

var FOLDER_ID    = '1MwJgOscu-0-Pr4xA4cJGB8sfPoEo_Xu5'; // "SEO copy writing"
var TRACKER_NAME = 'Content_Production_Tracker';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.action === 'create_doc')     return createDoc(data);
    if (data.action === 'append_tracker') return appendTracker(data);
    return json({ error: 'Unknown action: ' + data.action });
  } catch (err) {
    return json({ error: err.toString() });
  }
}

function createDoc(data) {
  var doc   = DocumentApp.create(data.title);
  var body  = doc.getBody();
  var lines = data.content.split('\n');
  for (var i = 0; i < lines.length; i++) {
    body.appendParagraph(lines[i]);
  }
  doc.saveAndClose();

  var file   = DriveApp.getFileById(doc.getId());
  var folder = DriveApp.getFolderById(FOLDER_ID);
  folder.addFile(file);
  try { DriveApp.getRootFolder().removeFile(file); } catch(e) {}

  var url = 'https://docs.google.com/document/d/' + doc.getId() + '/edit';
  return json({ success: true, docId: doc.getId(), url: url });
}

function appendTracker(data) {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var ss;
  var hits = folder.getFilesByName(TRACKER_NAME);
  if (hits.hasNext()) {
    ss = SpreadsheetApp.openById(hits.next().getId());
  } else {
    ss = SpreadsheetApp.create(TRACKER_NAME);
    var file = DriveApp.getFileById(ss.getId());
    folder.addFile(file);
    try { DriveApp.getRootFolder().removeFile(file); } catch(e) {}
    ss.getActiveSheet().appendRow(['Date', 'Topic', 'Primary Keyword', 'Google Docs Link', 'Status']);
  }
  ss.getActiveSheet().appendRow([
    data.date, data.topic, data.keyword, data.docUrl, data.status || 'Draft'
  ]);
  var trackerUrl = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/edit';
  return json({ success: true, trackerUrl: trackerUrl });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

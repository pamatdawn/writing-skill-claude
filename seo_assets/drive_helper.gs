// SEO Content Pipeline — Google Apps Script Web App
// One-time deploy: Extensions > Apps Script > Deploy > New deployment
// Type: Web App | Execute as: Me | Access: Anyone
// Paste the Web App URL into SEO_MASTER_SKILL.md as DRIVE_WEBAPP_URL

const FOLDER_ID = '1MwJgOscu-0-Pr4xA4cJGB8sfPoEo_Xu5'; // "SEO copy writing"
const TRACKER_NAME = 'Content_Production_Tracker';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'create_doc')       return createDoc(data);
    if (data.action === 'append_tracker')   return appendTracker(data);
    return json({ error: 'Unknown action: ' + data.action });
  } catch (err) {
    return json({ error: err.toString() });
  }
}

// ── Create a Google Doc in the target folder ──────────────────────────────────
function createDoc(data) {
  const doc    = DocumentApp.create(data.title);
  const body   = doc.getBody();
  body.clear();

  const lines = data.content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0) {
      body.getParagraphs()[0].setText(line)
          .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    } else if (line === '') {
      if (i < lines.length - 1) body.appendParagraph('');
    } else {
      body.appendParagraph(line);
    }
  }
  doc.saveAndClose();

  // Move from root into target folder
  const file   = DriveApp.getFileById(doc.getId());
  const folder = DriveApp.getFolderById(FOLDER_ID);
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  const url = 'https://docs.google.com/document/d/' + doc.getId() + '/edit';
  return json({ success: true, docId: doc.getId(), url: url });
}

// ── Append one row to the tracker sheet ──────────────────────────────────────
function appendTracker(data) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  let ss;

  const hits = folder.getFilesByName(TRACKER_NAME);
  if (hits.hasNext()) {
    ss = SpreadsheetApp.openById(hits.next().getId());
  } else {
    ss = SpreadsheetApp.create(TRACKER_NAME);
    const file = DriveApp.getFileById(ss.getId());
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    ss.getActiveSheet().appendRow(
      ['Date', 'Topic', 'Primary Keyword', 'Google Docs Link', 'Status']
    );
  }

  ss.getActiveSheet().appendRow([
    data.date,
    data.topic,
    data.keyword,
    data.docUrl,
    data.status || 'Draft'
  ]);

  const trackerUrl = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/edit';
  return json({ success: true, trackerUrl: trackerUrl });
}

// ── Helper ────────────────────────────────────────────────────────────────────
function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

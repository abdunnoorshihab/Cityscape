const SPREADSHEET_ID = "1ZdUbi9TVJI2yjyii74fVbMkpMpYlRblc_LyxF4luRB8";
const SHEET_NAME = "Submissions";
const NOTIFICATION_EMAIL = "intellrecurso.bd@gmail.com";

function doPost(e) {
  try {
    const data = e.parameter || {};
    if (data.website) return jsonResponse({ ok: true });

    const required = ["name", "phone", "dateOfBirth", "email", "reference"];
    const missing = required.filter((key) => !String(data[key] || "").trim());
    if (missing.length) return jsonResponse({ ok: false, error: "Missing required fields." });

    const record = {
      submittedAt: new Date(),
      reference: clean(data.reference, 80),
      name: clean(data.name, 80),
      phone: clean(data.phone, 24),
      dateOfBirth: clean(data.dateOfBirth, 20),
      email: clean(data.email, 120),
    };

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
      if (!sheet) throw new Error(`Sheet '${SHEET_NAME}' was not found.`);
      sheet.appendRow([
        record.submittedAt,
        record.reference,
        record.name,
        record.phone,
        record.dateOfBirth,
        record.email,
        "New",
      ]);
    } finally {
      lock.releaseLock();
    }

    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: `New CityScape application — ${record.name}`,
      htmlBody: [
        "<h2>New CityScape invitation request</h2>",
        `<p><strong>Reference:</strong> ${escapeHtml(record.reference)}</p>`,
        `<p><strong>Name:</strong> ${escapeHtml(record.name)}</p>`,
        `<p><strong>Phone:</strong> ${escapeHtml(record.phone)}</p>`,
        `<p><strong>Date of birth:</strong> ${escapeHtml(record.dateOfBirth)}</p>`,
        `<p><strong>Email:</strong> ${escapeHtml(record.email)}</p>`,
      ].join(""),
    });

    return jsonResponse({ ok: true, reference: record.reference });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: "Submission could not be saved." });
  }
}

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character]);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

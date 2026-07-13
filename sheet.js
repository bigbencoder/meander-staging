/* Meander — shared Google-Sheets CSV helpers.
   Same quote-safe parser the menu uses. Reads published-to-web CSV tabs by gid
   from the site's single Google Sheet. */
(function () {
  var SHEET_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMmfXhZFbVxJQB-KmXoxGh3ym5IgbHW7ODr_jKMS0-uRcZUby3YXtKAUA7azzXrqROWk4X_2tkOKYZ/pub?single=true&output=csv';

  function parseCSVLine(line) {
    var result = [], current = '', inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (inQuotes) {
        if (c === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (c === '"') { inQuotes = false; }
        else { current += c; }
      } else {
        if (c === '"') { inQuotes = true; }
        else if (c === ',') { result.push(current); current = ''; }
        else { current += c; }
      }
    }
    result.push(current);
    return result;
  }

  function parseCSV(text, headerHint) {
    var lines = text.trim().split('\n');
    if (!lines.length) return [];
    // Some tabs have a leading title row (e.g. "FAQs,,") above the real headers.
    // If a headerHint column name is given, skip down to the row that contains it.
    var start = 0;
    if (headerHint) {
      var hint = headerHint.trim().toLowerCase();
      for (var k = 0; k < lines.length; k++) {
        var cells = parseCSVLine(lines[k]).map(function (c) { return c.trim().toLowerCase(); });
        if (cells.indexOf(hint) !== -1) { start = k; break; }
      }
    }
    var headers = parseCSVLine(lines[start]);
    return lines.slice(start + 1).map(function (line) {
      var vals = parseCSVLine(line), row = {};
      headers.forEach(function (h, i) { row[h.trim()] = (vals[i] || '').trim(); });
      return row;
    });
  }

  function esc(str) {
    // Escape for BOTH text and attribute contexts. The old textContent->innerHTML
    // round-trip only encoded & < > and left " ' raw, which allowed attribute
    // breakout (e.g. a caption of  x" onload="...  injecting an event handler when
    // interpolated into alt="..."). Escaping quotes too closes that across every
    // sheet-driven page.
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // escape text, then turn any http(s) URLs into clickable links (injection-safe)
  function linkify(text) {
    text = text == null ? '' : String(text);
    var urlRe = /(https?:\/\/[^\s)]+)/g, out = '', last = 0, m;
    while ((m = urlRe.exec(text))) {
      out += esc(text.slice(last, m.index));
      var url = m[1];
      out += '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(url) + '</a>';
      last = m.index + url.length;
    }
    out += esc(text.slice(last));
    return out;
  }

  // fetch one published tab by gid -> Promise<array of {header: value}>
  // headerHint (optional): a column name to locate the real header row, skipping
  // any leading title rows (e.g. a "FAQs,," row above the headers).
  function fetchTab(gid, headerHint) {
    return fetch(SHEET_BASE + '&gid=' + gid)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (text) { return parseCSV(text, headerHint); });
  }

  window.MeanderSheet = { SHEET_BASE: SHEET_BASE, parseCSV: parseCSV, parseCSVLine: parseCSVLine, esc: esc, linkify: linkify, fetchTab: fetchTab };
})();

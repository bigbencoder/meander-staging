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

  function parseCSV(text) {
    var lines = text.trim().split('\n');
    if (!lines.length) return [];
    var headers = parseCSVLine(lines[0]);
    return lines.slice(1).map(function (line) {
      var vals = parseCSVLine(line), row = {};
      headers.forEach(function (h, i) { row[h.trim()] = (vals[i] || '').trim(); });
      return row;
    });
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str == null ? '' : str;
    return d.innerHTML;
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
  function fetchTab(gid) {
    return fetch(SHEET_BASE + '&gid=' + gid)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(parseCSV);
  }

  window.MeanderSheet = { SHEET_BASE: SHEET_BASE, parseCSV: parseCSV, parseCSVLine: parseCSVLine, esc: esc, linkify: linkify, fetchTab: fetchTab };
})();

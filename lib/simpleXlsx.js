export const utils = {
  book_new() {
    return { rows: [] };
  },
  json_to_sheet(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return { rows: [] };
    }
    const headers = Object.keys(data[0]);
    const rows = [headers, ...data.map(row => headers.map(h => row[h] ?? ''))];
    return { rows };
  },
  book_append_sheet(wb, sheet) {
    wb.rows = sheet.rows;
  },
};

export function write(wb, opts = {}) {
  const rows = wb.rows || [];
  const csv = rows
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  if (opts.type === 'buffer') {
    return Buffer.from(csv);
  }
  return csv;
}

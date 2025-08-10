const brandAliases = {
  'VAG': 'Volkswagen',
  'VOLKSWAGEN GENUINE': 'Volkswagen'
  // extend as needed
};

function normPN(pn) {
  return (pn || '').toUpperCase().replace(/[\s\-]/g, '');
}

function parsePrice(raw) {
  if (typeof raw === 'number') return { amount: raw, currency: 'EUR', vatIncluded: false };
  const cleaned = (raw || '').replace(/[^\d,.\-]/g, '').replace(',', '.');
  const amount = Number.parseFloat(cleaned || '0');
  return { amount: isFinite(amount) ? amount : 0, currency: 'EUR', vatIncluded: false };
}

export function normalizeItems(items) {
  const out = [];
  const seen = new Set();
  for (const it of items) {
    const brandRaw = (it.brand || it.marca || '').toString().trim();
    const pnRaw    = (it.partNumber || it.reference || it.ref || '').toString().trim();
    const desc     = (it.description || it.desc || '').toString().trim();
    const priceObj = parsePrice((it.price ?? it.pvp ?? it.neto ?? it.net));

    const brand = brandAliases[brandRaw.toUpperCase()] || brandRaw;
    const pnNorm = normPN(pnRaw);
    const key = `${brand.toUpperCase()}|${pnNorm}`;
    if (pnNorm && !seen.has(key)) {
      seen.add(key);
      out.push({
        source: 'ad360',
        supplierId: 7,
        brand,
        partNumber: pnRaw,
        partNumberNorm: pnNorm,
        description: desc,
        price: priceObj,
        stock: it.stock || it.disponibilidad || '',
        category: it.category || it.categoria || '',
        oeRefs: Array.isArray(it.oeRefs) ? it.oeRefs : []
      });
    }
  }
  return out;
} 
import { chromium } from 'playwright';
import { loadSession } from './sessionStore.js';
import { normalizeItems } from './normalize.js';

export async function fetchPartsForVehicle(tenantId: number, supplierId: number, vin?: string, reg?: string) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const sess = await loadSession(tenantId, supplierId);
  if (!sess?.cookies) { await browser.close(); throw new Error('NEEDS_RELINK'); }
  await ctx.addCookies(sess.cookies);

  await page.goto('https://connect.ad360.es', { waitUntil: 'domcontentloaded' });
  
  // Detect if we're redirected to login screen
  const currentUrl = page.url();
  if (currentUrl.includes('login') || currentUrl.includes('auth') || currentUrl.includes('signin')) {
    throw new Error('NEEDS_RELINK');
  }
  
  // Check for login form elements that might indicate we're not logged in
  const loginForm = await page.$('form[action*="login"], form[action*="auth"], input[name="username"], input[name="password"]');
  if (loginForm) {
    throw new Error('NEEDS_RELINK');
  }

  // Navigate to vehicle search page - try multiple possible URLs
  const searchUrls = [
    'https://connect.ad360.es/vehicle',
    'https://connect.ad360.es/search',
    'https://connect.ad360.es/catalog',
    'https://connect.ad360.es/parts'
  ];
  
  let searchPage = null;
  for (const url of searchUrls) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      // Check if we're on a search page by looking for common search elements
      const hasSearchForm = await page.$('input[name="vin"], input[name="reg"], #vin, #reg, input[placeholder*="VIN"], input[placeholder*="registration"]');
      if (hasSearchForm) {
        searchPage = url;
        break;
      }
    } catch {}
  }
  
  if (!searchPage) {
    throw new Error('Could not find vehicle search page');
  }
  
  // Try to find and fill VIN field
  const vinSelectors = ['input[name="vin"]', '#vin', 'input[placeholder*="VIN"]', 'input[placeholder*="vin"]'];
  let vinField = null;
  for (const selector of vinSelectors) {
    try {
      vinField = await page.$(selector);
      if (vinField) break;
    } catch {}
  }
  
  // Try to find and fill registration field
  const regSelectors = ['input[name="reg"]', '#reg', 'input[placeholder*="registration"]', 'input[placeholder*="plate"]'];
  let regField = null;
  for (const selector of regSelectors) {
    try {
      regField = await page.$(selector);
      if (regField) break;
    } catch {}
  }
  
  // Fill fields if found
  if (vin && vinField) {
    await vinField.fill(vin);
  }
  if (reg && regField) {
    await regField.fill(reg);
  }
  
  // Find and click search button
  const searchSelectors = [
    'button:has-text("Buscar")',
    'button:has-text("Search")',
    'button:has-text("Find")',
    'input[type="submit"]',
    'button[type="submit"]',
    '.search-button',
    '.btn-search'
  ];
  
  let searchButton = null;
  for (const selector of searchSelectors) {
    try {
      searchButton = await page.$(selector);
      if (searchButton) break;
    } catch {}
  }
  
  if (!searchButton) {
    throw new Error('Could not find search button');
  }
  
  await Promise.all([
    page.waitForLoadState('networkidle', { timeout: 15000 }),
    searchButton.click()
  ]);

  const results: any[] = [];

  // Prefer network JSON
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/parts') || url.includes('/catalog')) {
      try {
        const json = await resp.json();
        const items = Array.isArray(json.items) ? json.items : Array.isArray(json) ? json : [];
        if (items.length) results.push(...items);
      } catch {}
    }
  });

  await page.waitForTimeout(1500);

  // Fallback: DOM scrape - try multiple table selectors
  if (!results.length) {
    const tableSelectors = [
      'table.parts tbody tr',
      'table tbody tr',
      '.parts-table tbody tr',
      '.results-table tbody tr',
      '[data-testid="parts-table"] tbody tr',
      '.parts-list .part-item',
      '.results-list .result-item'
    ];
    
    let rows = [];
    for (const selector of tableSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        rows = await page.$$eval(selector, (trs) => trs.map((r) => {
          // Try to find cells with different approaches
          const cells = r.querySelectorAll('td, .cell, .part-cell');
          if (cells.length < 3) return null;
          
          return {
            brand: (cells[1]?.textContent || '').trim(),
            partNumber: (cells[2]?.textContent || '').trim(),
            description: (cells[3]?.textContent || '').trim(),
            price: (cells[4]?.textContent || '').trim(),
            stock: (cells[5]?.textContent || '').trim(),
          };
        }).filter(Boolean));
        
        if (rows.length > 0) break;
      } catch {}
    }
    
    if (rows.length > 0) {
      results.push(...rows);
    }
  }

  const normalized = normalizeItems(results);
  await browser.close();
  return normalized;
} 
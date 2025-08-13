import { chromium } from 'playwright';
import { loadSession } from './sessionStore.js';
import { normalizeItems } from './normalize.js';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// Debug Playwright import
console.log('Playwright chromium import type:', typeof chromium);
console.log('Playwright chromium constructor:', chromium.constructor.name);
console.log('Playwright chromium prototype chain:', Object.getPrototypeOf(chromium)?.constructor?.name);

// Function to check what browsers are available
function checkBrowserAvailability() {
  console.log('Checking browser availability...');
  
  try {
    // Check if we're on Heroku
    const isHeroku = process.env.DYNO || process.env.HEROKU_APP_NAME;
    console.log('Environment:', isHeroku ? 'Heroku' : 'Local');
    console.log('Node version:', process.version);
    console.log('Playwright version:', process.env.PLAYWRIGHT_VERSION || 'unknown');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Check common Playwright paths - ONLY regular chromium, NO headless shell
    const possiblePaths = [
      '/app/.cache/ms-playwright/chromium-1181/chrome-linux/chrome',
      '/app/.cache/ms-playwright/chromium-1181/chrome-linux/chromium',
      process.env.PLAYWRIGHT_BROWSERS_PATH ? join(process.env.PLAYWRIGHT_BROWSERS_PATH, 'chromium-1181/chrome-linux/chrome') : null
    ].filter(Boolean);
    
    console.log('Checking paths:', possiblePaths);
    
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        console.log('✅ Found browser at:', path);
        return path;
      } else {
        console.log('❌ Not found:', path);
      }
    }
    
    // Try to list the cache directory
    try {
      const cacheDir = '/app/.cache/ms-playwright';
      if (existsSync(cacheDir)) {
        console.log('Cache directory exists, contents:');
        const output = execSync(`ls -la ${cacheDir}`, { encoding: 'utf8' });
        console.log(output);
      } else {
        console.log('Cache directory does not exist:', cacheDir);
      }
    } catch (e) {
      console.log('Could not list cache directory:', e.message);
    }
    
    return null;
  } catch (error) {
    console.error('Error checking browser availability:', error);
    return null;
  }
}

export async function fetchVehicleVariants(tenantId, supplierId, vin, reg) {
  console.log('Starting fetchVehicleVariants...');
  
  // Check what browsers are available
  const browserPath = checkBrowserAvailability();
  
  let browser;
  
  try {
    // Try to launch with explicit executable path if we found one - FIRST FUNCTION
    if (browserPath) {
      try {
        console.log('Trying to launch with explicit path:', browserPath);
        console.log('Launching with explicit path, browser type:', typeof chromium, 'browser name:', chromium.name || 'unknown', '- FIRST FUNCTION');
        console.log('Chromium object keys:', Object.keys(chromium));
        console.log('Chromium prototype:', Object.getPrototypeOf(chromium));
        
        // Force the use of the specific executable path
        browser = await chromium.launch({ 
          headless: true,
          executablePath: browserPath,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
          channel: 'chrome' // Force Chrome channel
        });
        console.log('Browser launched successfully with explicit path');
      } catch (pathError) {
        console.log('Failed to launch with explicit path, trying default:', pathError.message);
        browser = await chromium.launch({ 
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        console.log('Browser launched successfully with default path');
      }
    } else {
      // Try default launch - FIRST FUNCTION
      try {
        browser = await chromium.launch({ 
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        console.log('Browser launched successfully with default path');
      } catch (defaultError) {
        console.log('Default launch failed:', defaultError.message);
        throw new Error(`Failed to launch browser: ${defaultError.message}`);
      }
    }
    
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

    // Navigate to vehicle search page based on the actual AD360 site structure
    await page.goto('https://www.ad360.es/#/recambio', { waitUntil: 'domcontentloaded' });
    
    // Wait for the page to load and click on the vehicle search section
    await page.waitForSelector('div.cma', { timeout: 10000 });
    await page.click('div.cma');
    
    // Wait for the vehicle search modal to appear
    await page.waitForSelector('#sv-mat', { timeout: 10000 });
    
    // Fill in the license plate
    const plateInput = await page.$('#sv-mat');
    if (plateInput && reg) {
      await plateInput.fill(reg);
      
      // Wait for variants to load and click Accept button
      await page.waitForTimeout(2000);
      await page.click('#sv div.modal-footer > button');
      
      // Wait for the variants table to appear
      await page.waitForSelector('#mat table tbody tr', { timeout: 10000 });
      
      // Extract vehicle variants from the table
      const variants = await page.$$eval('#mat table tbody tr', (rows) => {
        return rows.map(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 3) return null;
          
          // Based on the AD360 structure from the recording
          const modelText = cells[1]?.textContent?.trim() || '';
          const versionText = cells[2]?.textContent?.trim() || '';
          
          // Parse the model text (e.g., "1 (F21) [12/2011 a 12/2019]")
          const modelMatch = modelText.match(/(\d+)\s*\(([^)]+)\)\s*\[([^\]]+)\]/);
          const versionMatch = versionText.match(/(\d+)\s*([a-z]+)/i);
          
          return {
            make: 'BMW', // From your recording
            model: modelMatch ? modelMatch[1] : modelText,
            version: versionMatch ? `${versionMatch[1]} ${versionMatch[2]}` : versionText,
            power: '', // Will be filled from other sources
            kw: '', // Will be filled from other sources
            engine: '', // Will be filled from other sources
            years: modelMatch ? modelMatch[3] : '',
            fullModel: modelText,
            fullVersion: versionText
          };
        }).filter(Boolean);
      });
      
      await browser.close();
      return variants;
    }
    
    await browser.close();
    throw new Error('Could not find license plate input field');
    
  } catch (error) {
    console.error('Error in fetchVehicleVariants:', error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    throw error;
  }
}

export async function fetchPartsForVehicle(tenantId, supplierId, vin, reg) {
  console.log('Starting fetchPartsForVehicle...');
  
  let browser;
  
  try {
    // Try to launch with explicit executable path if we found one
    const browserPath = checkBrowserAvailability();
    
    if (browserPath) {
      try {
        console.log('Trying to launch with explicit path:', browserPath);
        browser = await chromium.launch({ 
          headless: true,
          executablePath: browserPath,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        console.log('Browser launched successfully with explicit path');
      } catch (pathError) {
        console.log('Failed to launch with explicit path, trying default:', pathError.message);
        browser = await chromium.launch({ 
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        console.log('Browser launched successfully with default path');
      }
    } else {
      // Try default launch - SECOND FUNCTION
      try {
        browser = await chromium.launch({ 
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        console.log('Browser launched successfully with default path');
      } catch (defaultError) {
        console.log('Default launch failed:', defaultError.message);
        throw new Error(`Failed to launch browser: ${defaultError.message}`);
      }
    }
    
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    const sess = await loadSession(tenantId, supplierId);
    if (!sess?.cookies) { await browser.close(); throw new Error('NEEDS_RELINK'); }
    await ctx.addCookies(sess.cookies);

    // Navigate to vehicle search page - use the actual AD360 site structure
    const searchUrls = [
      'https://www.ad360.es/#/recambio',
      'https://www.ad360.es/#/search',
      'https://www.ad360.es/#/catalog'
    ];
    
    let searchPage = null;
    for (const url of searchUrls) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        // Check if we're on a search page by looking for common search elements
        const hasSearchForm = await page.$('input[name="vin"], input[name="reg"], #vin, #reg, input[placeholder*="VIN"], input[placeholder*="reg"]');
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

    const results = [];

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
    
  } catch (error) {
    console.error('Error in fetchPartsForVehicle:', error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    throw error;
  }
}

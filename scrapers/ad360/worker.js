import puppeteer from 'puppeteer';
import { loadSession } from './sessionStore.js';
import { normalizeItems } from './normalize.js';

// Debug Puppeteer import
console.log('Puppeteer import type:', typeof puppeteer);
console.log('Puppeteer constructor:', puppeteer.constructor.name);

// Function to check what browsers are available
function checkBrowserAvailability() {
  console.log('Checking browser availability...');
  
  try {
    // Check if we're on Heroku
    const isHeroku = process.env.DYNO || process.env.HEROKU_APP_NAME;
    console.log('Environment:', isHeroku ? 'Heroku' : 'Local');
    console.log('Node version:', process.version);
    console.log('Puppeteer version:', process.env.PUPPETEER_VERSION || 'unknown');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Check common Puppeteer paths
    const possiblePaths = [
      '/app/.cache/ms-playwright/chromium-1181/chrome-linux/chrome',
      '/app/.cache/ms-playwright/chromium-1181/chrome-linux/chromium',
      process.env.PUPPETEER_EXECUTABLE_PATH || null
    ].filter(Boolean);
    
    console.log('Possible browser paths:', possiblePaths);
    
    // List contents of Playwright cache directory for debugging
    try {
      const { execSync } = require('child_process');
      const { existsSync } = require('fs');
      
      const playwrightCacheDir = '/app/.cache/ms-playwright';
      if (existsSync(playwrightCacheDir)) {
        console.log('Playwright cache directory exists, listing contents:');
        try {
          const contents = execSync(`ls -la ${playwrightCacheDir}`, { encoding: 'utf8' });
          console.log('Cache contents:', contents);
        } catch (lsError) {
          console.log('Could not list cache contents:', lsError.message);
        }
      } else {
        console.log('Playwright cache directory does not exist');
      }
    } catch (importError) {
      console.log('Could not import fs/child_process for directory listing');
    }
    
    // Return the first valid path found
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        console.log('Found valid browser path:', path);
        return path;
      }
    }
    
    console.log('No valid browser path found, will use default Puppeteer launch');
    return null;
  } catch (error) {
    console.error('Error checking browser availability:', error);
    return null;
  }
}

export async function fetchVehicleVariants(tenantId, supplierId, vin, reg) {
  console.log('Starting fetchVehicleVariants with Puppeteer...');
  const browserPath = checkBrowserAvailability();
  let browser;
  
  try {
    // Launch browser with Puppeteer
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    };
    
    if (browserPath) {
      console.log('Trying to launch with explicit path:', browserPath);
      launchOptions.executablePath = browserPath;
    }
    
    console.log('Launching Puppeteer with options:', launchOptions);
    browser = await puppeteer.launch(launchOptions);
    console.log('Puppeteer browser launched successfully');
    
    const page = await browser.newPage();
    console.log('New page created');
    
    // Navigate to AD360
    console.log('Navigating to AD360...');
    await page.goto('https://www.ad360.es/#/recambio', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    console.log('Page loaded');
    
    // Wait for the CMA button and click it
    console.log('Waiting for CMA button...');
    await page.waitForSelector('div.cma', { timeout: 10000 });
    await page.click('div.cma');
    console.log('CMA button clicked');
    
    // Wait for the license plate input field
    console.log('Waiting for license plate input...');
    await page.waitForSelector('#sv-mat', { timeout: 10000 });
    const plateInput = await page.$('#sv-mat');
    
    // Fill in the license plate
    console.log('Filling license plate:', reg);
    await plateInput.type(reg);
    console.log('License plate filled');
    
    // Click the search button
    console.log('Clicking search button...');
    await page.click('#sv div.modal-footer > button');
    console.log('Search button clicked');
    
    // Wait for results table
    console.log('Waiting for results table...');
    await page.waitForSelector('#mat table tbody tr', { timeout: 10000 });
    console.log('Results table loaded');
    
    // Extract vehicle variants
    console.log('Extracting vehicle variants...');
    const variants = await page.evaluate(() => {
      const rows = document.querySelectorAll('#mat table tbody tr');
      return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const variantText = cells[0]?.textContent?.trim() || '';
          const description = cells[1]?.textContent?.trim() || '';
          
          // Parse variant text like "1 (F21) [12/2011 a 12/2019]"
          const match = variantText.match(/^(\d+)\s*\(([^)]+)\)\s*\[([^\]]+)\]/);
          if (match) {
            return {
              id: match[1],
              code: match[2],
              period: match[3],
              description: description,
              fullText: variantText
            };
          } else {
            return {
              id: '1',
              code: 'Unknown',
              period: 'Unknown',
              description: description,
              fullText: variantText
            };
          }
        }
        return null;
      }).filter(Boolean);
    });
    
    console.log('Extracted variants:', variants);
    return variants;
    
  } catch (error) {
    console.error('Error in fetchVehicleVariants:', error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed successfully');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

export async function fetchPartsForVehicle(tenantId, supplierId, vin, reg) {
  console.log('Starting fetchPartsForVehicle with Puppeteer...');
  let browser;
  
  try {
    // Launch browser with Puppeteer
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    };
    
    const browserPath = checkBrowserAvailability();
    if (browserPath) {
      console.log('Using explicit browser path:', browserPath);
      launchOptions.executablePath = browserPath;
    }
    
    console.log('Launching Puppeteer with options:', launchOptions);
    browser = await puppeteer.launch(launchOptions);
    console.log('Puppeteer browser launched successfully');
    
    const page = await browser.newPage();
    console.log('New page created');
    
    // Navigate to AD360 search
    console.log('Navigating to AD360 search...');
    await page.goto('https://www.ad360.es/#/search', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    console.log('Search page loaded');
    
    // Wait for search form and fill in vehicle details
    console.log('Waiting for search form...');
    await page.waitForSelector('input[placeholder*="Matrícula"]', { timeout: 10000 });
    
    // Fill in license plate
    console.log('Filling license plate:', reg);
    await page.type('input[placeholder*="Matrícula"]', reg);
    console.log('License plate filled');
    
    // Fill in VIN if available
    if (vin) {
      console.log('Filling VIN:', vin);
      const vinInput = await page.$('input[placeholder*="VIN"]');
      if (vinInput) {
        await vinInput.type(vin);
        console.log('VIN filled');
      }
    }
    
    // Click search button
    console.log('Clicking search button...');
    const searchButton = await page.$('button[type="submit"], button:contains("Buscar")');
    if (searchButton) {
      await searchButton.click();
      console.log('Search button clicked');
    }
    
    // Wait for results
    console.log('Waiting for search results...');
    await page.waitForSelector('.search-results, .parts-list, table', { timeout: 15000 });
    console.log('Search results loaded');
    
    // Extract parts data
    console.log('Extracting parts data...');
    const parts = await page.evaluate(() => {
      const partElements = document.querySelectorAll('.part-item, .search-result, tr[data-part]');
      return Array.from(partElements).map(part => {
        const partNumber = part.querySelector('.part-number, .sku, [data-part-number]')?.textContent?.trim();
        const description = part.querySelector('.description, .name, [data-description]')?.textContent?.trim();
        const price = part.querySelector('.price, .cost, [data-price]')?.textContent?.trim();
        const brand = part.querySelector('.brand, .manufacturer, [data-brand]')?.textContent?.trim();
        
        return {
          partNumber: partNumber || 'Unknown',
          description: description || 'No description',
          price: price || '0.00',
          brand: brand || 'Unknown',
          source: 'AD360'
        };
      });
    });
    
    console.log('Extracted parts:', parts);
    
    // Normalize the parts data
    const normalizedParts = normalizeItems(parts);
    console.log('Normalized parts:', normalizedParts);
    
    return normalizedParts;
    
  } catch (error) {
    console.error('Error in fetchPartsForVehicle:', error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed successfully');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

import puppeteer from 'puppeteer';
import { loadSession } from './sessionStore.js';
import { normalizeItems } from './normalize.js';

// Debug Puppeteer import
console.log('Puppeteer import type:', typeof puppeteer);
console.log('Puppeteer constructor:', puppeteer.constructor.name);

// Function to get the best available browser path
function getBrowserPath() {
  console.log('Getting browser path...');
  
  try {
    const { execSync } = require('child_process');
    const { existsSync } = require('fs');
    
    // Check Puppeteer cache first
    const puppeteerCacheDir = '/app/.cache/puppeteer';
    if (existsSync(puppeteerCacheDir)) {
      console.log('Puppeteer cache directory exists');
      try {
        const contents = execSync(`ls -la ${puppeteerCacheDir}`, { encoding: 'utf8' });
        console.log('Puppeteer cache contents:', contents);
        
        // Look for Chrome in Puppeteer cache
        // Check multiple possible paths based on the actual installation
        const possibleChromePaths = [
          `${puppeteerCacheDir}/chrome-linux64/chrome`,
          `${puppeteerCacheDir}/chrome/linux-139.0.7258.66/chrome-linux64/chrome`,
          `${puppeteerCacheDir}/chrome/linux-139.0.7258.66/chrome-linux64/chromium`
        ];
        
        for (const chromePath of possibleChromePaths) {
          if (existsSync(chromePath)) {
            console.log('Found Chrome in Puppeteer cache:', chromePath);
            return chromePath;
          }
        }
      } catch (lsError) {
        console.log('Could not list Puppeteer cache contents:', lsError.message);
      }
    }
    
    // Check Playwright cache as fallback
    const playwrightCacheDir = '/app/.cache/ms-playwright';
    if (existsSync(playwrightCacheDir)) {
      console.log('Playwright cache directory exists');
      try {
        const contents = execSync(`ls -la ${playwrightCacheDir}`, { encoding: 'utf8' });
        console.log('Playwright cache contents:', contents);
        
        // Look for Chrome in Playwright cache
        const chromePaths = [
          '/app/.cache/ms-playwright/chromium-1181/chrome-linux/chrome',
          '/app/.cache/ms-playwright/chromium-1181/chrome-linux/chromium'
        ];
        
        for (const path of chromePaths) {
          if (existsSync(path)) {
            console.log('Found Chrome in Playwright cache:', path);
            return path;
          }
        }
      } catch (lsError) {
        console.log('Could not list Playwright cache contents:', lsError.message);
      }
    }
    
    // Check environment variable
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      console.log('Using PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH);
      return process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    
    console.log('No explicit browser path found, will use Puppeteer default');
    return null;
  } catch (error) {
    console.error('Error getting browser path:', error);
    return null;
  }
}

// Function to launch browser with multiple fallback strategies
async function launchBrowser() {
  console.log('Launching browser...');
  
  const browserPath = getBrowserPath();
  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-images',
      '--disable-javascript',
      '--disable-web-security'
    ]
  };
  
  if (browserPath) {
    console.log('Trying with explicit path:', browserPath);
    launchOptions.executablePath = browserPath;
  }
  
  let browser;
  let lastError;
  
  // Strategy 1: Try with explicit path
  if (browserPath) {
    try {
      console.log('Strategy 1: Launching with explicit path...');
      browser = await puppeteer.launch(launchOptions);
      console.log('✅ Browser launched successfully with explicit path');
      return browser;
    } catch (error) {
      console.log('❌ Strategy 1 failed:', error.message);
      lastError = error;
    }
  }
  
  // Strategy 2: Try without explicit path
  try {
    console.log('Strategy 2: Launching without explicit path...');
    delete launchOptions.executablePath;
    browser = await puppeteer.launch(launchOptions);
    console.log('✅ Browser launched successfully without explicit path');
    return browser;
  } catch (error) {
    console.log('❌ Strategy 2 failed:', error.message);
    lastError = error;
  }
  
  // Strategy 3: Try with minimal options
  try {
    console.log('Strategy 3: Launching with minimal options...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ Browser launched successfully with minimal options');
    return browser;
  } catch (error) {
    console.log('❌ Strategy 3 failed:', error.message);
    lastError = error;
  }
  
  // Strategy 4: Try to force download and launch
  try {
    console.log('Strategy 4: Forcing browser download and launch...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      product: 'chrome'
    });
    console.log('✅ Browser launched successfully with forced download');
    return browser;
  } catch (error) {
    console.log('❌ Strategy 4 failed:', error.message);
    lastError = error;
  }
  
  // All strategies failed
  throw new Error(`All browser launch strategies failed. Last error: ${lastError?.message}`);
}

export async function fetchVehicleVariants(tenantId, supplierId, vin, reg) {
  console.log('Starting fetchVehicleVariants with enhanced Puppeteer...');
  let browser;
  
  try {
    browser = await launchBrowser();
    console.log('Browser launched, creating page...');
    
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
  console.log('Starting fetchPartsForVehicle with enhanced Puppeteer...');
  let browser;
  
  try {
    browser = await launchBrowser();
    console.log('Browser launched, creating page...');
    
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

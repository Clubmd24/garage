import puppeteer from 'puppeteer';
import { loadSession } from './sessionStore.js';
import { normalizeItems } from './normalize.js';

// Simple, bulletproof browser launch function - UPDATED
async function launchBrowser() {
  console.log('🚀 Launching browser with bulletproof approach - UPDATED...');
  
  try {
    // Strategy 1: Simple launch with minimal options
    console.log('Trying simple launch...');
    const browser = await puppeteer.launch({
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
    });
    
    console.log('✅ Browser launched successfully!');
    return browser;
    
  } catch (error) {
    console.error('❌ Simple launch failed:', error.message);
    
    // Strategy 2: Force download and launch
    try {
      console.log('🔄 Forcing Chrome download and launch...');
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ],
        product: 'chrome'
      });
      
      console.log('✅ Browser launched successfully with forced download!');
      return browser;
      
    } catch (downloadError) {
      console.error('❌ Forced download failed:', downloadError.message);
      throw new Error(`All browser launch strategies failed: ${downloadError.message}`);
    }
  }
}

export async function fetchVehicleVariants(tenantId, supplierId, vin, reg) {
  console.log('🚀 Starting fetchVehicleVariants...');
  let browser;
  
  try {
    browser = await launchBrowser();
    console.log('📄 Creating new page...');
    
    const page = await browser.newPage();
    console.log('🌐 Navigating to AD360...');
    
    // Navigate to AD360
    await page.goto('https://www.ad360.es/#/recambio', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    console.log('✅ Page loaded');
    
    // Wait for the CMA button and click it
    console.log('🔍 Waiting for CMA button...');
    await page.waitForSelector('div.cma', { timeout: 10000 });
    await page.click('div.cma');
    console.log('✅ CMA button clicked');
    
    // Wait for the license plate input field
    console.log('🔍 Waiting for license plate input...');
    await page.waitForSelector('#sv-mat', { timeout: 10000 });
    const plateInput = await page.$('#sv-mat');
    
    // Fill in the license plate
    console.log('📝 Filling license plate:', reg);
    await plateInput.type(reg);
    console.log('✅ License plate filled');
    
    // Click the search button
    console.log('🔍 Clicking search button...');
    await page.click('#sv div.modal-footer > button');
    console.log('✅ Search button clicked');
    
    // Wait for results table
    console.log('🔍 Waiting for results table...');
    await page.waitForSelector('#mat table tbody tr', { timeout: 10000 });
    console.log('✅ Results table loaded');
    
    // Extract vehicle variants
    console.log('📊 Extracting vehicle variants...');
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
    
    console.log('✅ Extracted variants:', variants);
    return variants;
    
  } catch (error) {
    console.error('❌ Error in fetchVehicleVariants:', error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('🔒 Browser closed successfully');
      } catch (closeError) {
        console.error('❌ Error closing browser:', closeError);
      }
    }
  }
}

export async function fetchPartsForVehicle(tenantId, supplierId, vin, reg) {
  console.log('🚀 Starting fetchPartsForVehicle...');
  let browser;
  
  try {
    browser = await launchBrowser();
    console.log('📄 Creating new page...');
    
    const page = await browser.newPage();
    console.log('🌐 Navigating to AD360 search...');
    
    // Navigate to AD360 search
    await page.goto('https://www.ad360.es/#/search', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    console.log('✅ Search page loaded');
    
    // Wait for search form
    console.log('🔍 Waiting for search form...');
    await page.waitForSelector('input[placeholder*="Matrícula"]', { timeout: 10000 });
    
    // Fill license plate
    console.log('📝 Filling license plate:', reg);
    await page.type('input[placeholder*="Matrícula"]', reg);
    console.log('✅ License plate filled');
    
    // Fill VIN if available
    if (vin) {
      console.log('📝 Filling VIN:', vin);
      const vinInput = await page.$('input[placeholder*="VIN"]');
      if (vinInput) {
        await vinInput.type(vin);
        console.log('✅ VIN filled');
      }
    }
    
    // Click search button
    console.log('🔍 Clicking search button...');
    const searchButton = await page.$('button[type="submit"], button:contains("Buscar")');
    if (searchButton) {
      await searchButton.click();
      console.log('✅ Search button clicked');
    }
    
    // Wait for search results
    console.log('🔍 Waiting for search results...');
    await page.waitForSelector('.search-results, .parts-list, table', { timeout: 15000 });
    console.log('✅ Search results loaded');
    
    // Extract parts data
    console.log('📊 Extracting parts data...');
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
    
    console.log('✅ Extracted parts:', parts);
    const normalizedParts = normalizeItems(parts);
    console.log('✅ Normalized parts:', normalizedParts);
    
    return normalizedParts;
    
  } catch (error) {
    console.error('❌ Error in fetchPartsForVehicle:', error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('🔒 Browser closed successfully');
      } catch (closeError) {
        console.error('❌ Error closing browser:', closeError);
      }
    }
  }
}

// Keep existing functions for compatibility
export async function executeAD360Workflow(tenantId, supplierId, action, additionalData = {}) {
  console.log('🚀 Executing AD360 workflow...');
  
  try {
    const session = await loadSession(tenantId, supplierId);
    if (!session) {
      throw new Error('No active AD360 session found');
    }
    
    // Implementation depends on the action
    switch (action) {
      case 'search_vehicle':
        return await fetchVehicleVariants(tenantId, supplierId, additionalData.vin, additionalData.reg);
      case 'fetch_parts':
        return await fetchPartsForVehicle(tenantId, supplierId, additionalData.vin, additionalData.reg);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
  } catch (error) {
    console.error('❌ AD360 workflow error:', error);
    throw error;
  }
}

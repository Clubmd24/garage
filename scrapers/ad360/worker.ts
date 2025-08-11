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

  try {
    // Step 1: Navigate to AD360 main page
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

    // Step 2: Select distributor (AD Vicente)
    // Look for distributor selection dropdown or button
    const distributorSelectors = [
      'select[name="distributor"]',
      'select[name="dealer"]',
      'select[name="supplier"]',
      '.distributor-select',
      '.dealer-select',
      '[data-testid="distributor-select"]',
      'button:has-text("AD Vicente")',
      'a:has-text("AD Vicente")'
    ];
    
    let distributorElement = null;
    for (const selector of distributorSelectors) {
      try {
        distributorElement = await page.$(selector);
        if (distributorElement) break;
      } catch {}
    }
    
    if (distributorElement) {
      // If it's a select element, select AD Vicente
      const tagName = await distributorElement.evaluate(el => el.tagName.toLowerCase());
      if (tagName === 'select') {
        await distributorElement.selectOption('AD Vicente');
      } else {
        // If it's a button/link, click it
        await distributorElement.click();
      }
      
      // Wait for page to load after distributor selection
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    }

    // Step 3: Navigate to REPLACEMENT tab
    const replacementTabSelectors = [
      'a:has-text("REPLACEMENT")',
      'button:has-text("REPLACEMENT")',
      '[data-tab="replacement"]',
      '.tab:has-text("REPLACEMENT")',
      'nav a:has-text("REPLACEMENT")',
      '.nav-tab:has-text("REPLACEMENT")'
    ];
    
    let replacementTab = null;
    for (const selector of replacementTabSelectors) {
      try {
        replacementTab = await page.$(selector);
        if (replacementTab) break;
      } catch {}
    }
    
    if (replacementTab) {
      await replacementTab.click();
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    }

    // Step 4: Look for vehicle input field (license plate)
    const vehicleInputSelectors = [
      'input[name="vehicle"]',
      'input[name="plate"]',
      'input[name="registration"]',
      'input[name="licence"]',
      'input[placeholder*="license"]',
      'input[placeholder*="plate"]',
      'input[placeholder*="registration"]',
      'input[placeholder*="matrícula"]',
      '#vehicle',
      '#plate',
      '#registration'
    ];
    
    let vehicleField = null;
    for (const selector of vehicleInputSelectors) {
      try {
        vehicleField = await page.$(selector);
        if (vehicleField) break;
      } catch {}
    }
    
    if (!vehicleField) {
      // If no specific vehicle field found, try VIN field
      const vinSelectors = [
        'input[name="vin"]',
        'input[name="vin_number"]',
        'input[placeholder*="VIN"]',
        'input[placeholder*="vin"]',
        '#vin',
        '#vin_number'
      ];
      
      for (const selector of vinSelectors) {
        try {
          vehicleField = await page.$(selector);
          if (vehicleField) break;
        } catch {}
      }
    }
    
    if (!vehicleField) {
      throw new Error('Could not find vehicle input field');
    }
    
    // Step 5: Input vehicle information
    if (reg && vehicleField) {
      await vehicleField.fill(reg);
    } else if (vin && vehicleField) {
      await vehicleField.fill(vin);
    }
    
    // Step 6: Look for search/lookup button
    const searchSelectors = [
      'button:has-text("Buscar")',
      'button:has-text("Search")',
      'button:has-text("Find")',
      'button:has-text("Lookup")',
      'button:has-text("LOOK FOR")',
      'input[type="submit"]',
      'button[type="submit"]',
      '.search-button',
      '.btn-search',
      '.lookup-button'
    ];
    
    let searchButton = null;
    for (const selector of searchSelectors) {
      try {
        searchButton = await page.$(selector);
        if (searchButton) break;
      } catch {}
    }
    
    if (!searchButton) {
      throw new Error('Could not find search/lookup button');
    }
    
    // Step 7: Click search and wait for results
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: 15000 }),
      searchButton.click()
    ]);
    
    // Step 8: Wait for vehicle selection page to load
    // This should show the parts department selection as shown in the screenshot
    await page.waitForTimeout(2000);
    
    // Step 9: Look for parts department selection (the circular icons shown in screenshot)
    const partsDepartmentSelectors = [
      '.parts-departments',
      '.vehicle-systems',
      '.system-icons',
      '.parts-categories',
      '[data-testid="parts-departments"]',
      '.main-content .icon-grid',
      '.content-area .system-grid'
    ];
    
    let partsDepartmentSection = null;
    for (const selector of partsDepartmentSelectors) {
      try {
        partsDepartmentSection = await page.$(selector);
        if (partsDepartmentSection) break;
      } catch {}
    }
    
    if (partsDepartmentSection) {
      // Wait for the parts department icons to load
      await page.waitForTimeout(1000);
    }

    const results: any[] = [];

    // Step 10: Try to capture parts data from network requests
    page.on('response', async (resp) => {
      const url = resp.url();
      if (url.includes('/parts') || url.includes('/catalog') || url.includes('/search') || url.includes('/results')) {
        try {
          const json = await resp.json();
          const items = Array.isArray(json.items) ? json.items : 
                       Array.isArray(json.parts) ? json.parts :
                       Array.isArray(json.results) ? json.results :
                       Array.isArray(json) ? json : [];
          if (items.length) results.push(...items);
        } catch {}
      }
    });

    // Step 11: If no network data, try to scrape from the parts department page
    if (!results.length) {
      // Look for parts data in the current page
      const partsDataSelectors = [
        'table.parts tbody tr',
        'table tbody tr',
        '.parts-table tbody tr',
        '.results-table tbody tr',
        '[data-testid="parts-table"] tbody tr',
        '.parts-list .part-item',
        '.results-list .result-item',
        '.part-card',
        '.item-card'
      ];
      
      let rows = [];
      for (const selector of partsDataSelectors) {
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

    // Step 12: If still no results, the page might be showing the parts department selection
    // In this case, we need to navigate to a specific department to get parts
    if (!results.length) {
      // Look for brake-related department (highlighted in screenshot)
      const brakeDepartmentSelectors = [
        'a:has-text("Brakes")',
        'button:has-text("Brakes")',
        '.icon:has-text("Brakes")',
        '[data-system="brakes"]',
        '.system-icon:has-text("Brakes")'
      ];
      
      let brakeDepartment = null;
      for (const selector of brakeDepartmentSelectors) {
        try {
          brakeDepartment = await page.$(selector);
          if (brakeDepartment) break;
        } catch {}
      }
      
      if (brakeDepartment) {
        await brakeDepartment.click();
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Now try to scrape parts from this department
        const departmentPartsSelectors = [
          'table.parts tbody tr',
          '.parts-list .part-item',
          '.part-card',
          '.item-card'
        ];
        
        for (const selector of departmentPartsSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            const deptRows = await page.$$eval(selector, (trs) => trs.map((r) => {
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
            
            if (deptRows.length > 0) {
              results.push(...deptRows);
              break;
            }
          } catch {}
        }
      }
    }

    const normalized = normalizeItems(results);
    await browser.close();
    return normalized;
    
  } catch (error) {
    await browser.close();
    throw error;
  }
} 
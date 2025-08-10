import { chromium } from 'playwright';
import { saveSession } from '../../../../scrapers/ad360/sessionStore.js';
import pool from '../../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { tenantId, supplierId, username, password, consent } = req.body;

    // Validate required fields
    if (!tenantId || !supplierId || !username || !password || consent !== true) {
      return res.status(400).json({ error: 'Missing required fields or consent not given' });
    }

    // Assert consent and upsert consent fields
    if (!consent) {
      return res.status(400).json({ error: 'Consent is required for automated fetching' });
    }

    // Launch Playwright and perform login
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Go to AD360 login page
      await page.goto('https://connect.ad360.es', { waitUntil: 'domcontentloaded' });
      
      // Wait for login form and fill credentials
      await page.waitForSelector('input[name="username"], input[name="email"], #username, #email', { timeout: 10000 });
      
      // Try different possible selectors for username/email
      const usernameSelectors = ['input[name="username"]', 'input[name="email"]', '#username', '#email'];
      let usernameField = null;
      for (const selector of usernameSelectors) {
        try {
          usernameField = await page.$(selector);
          if (usernameField) break;
        } catch {}
      }
      
      if (!usernameField) {
        throw new Error('Could not find username/email field');
      }
      
      await usernameField.fill(username);

      // Find and fill password field
      const passwordSelectors = ['input[name="password"]', '#password'];
      let passwordField = null;
      for (const selector of passwordSelectors) {
        try {
          passwordField = await page.$(selector);
          if (passwordField) break;
        } catch {}
      }
      
      if (!passwordField) {
        throw new Error('Could not find password field');
      }
      
      await passwordField.fill(password);

      // Find and click submit button
      const submitSelectors = ['button[type="submit"]', 'input[type="submit"]', 'button:has-text("Login")', 'button:has-text("Iniciar")'];
      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          submitButton = await page.$(selector);
          if (submitButton) break;
        } catch {}
      }
      
      if (!submitButton) {
        throw new Error('Could not find submit button');
      }
      
      await submitButton.click();

      // Wait for post-login state (either redirect or dashboard element)
      try {
        await Promise.race([
          page.waitForURL('**/dashboard', { timeout: 10000 }),
          page.waitForSelector('.dashboard, .welcome, .user-info', { timeout: 10000 }),
          page.waitForURL('**/home', { timeout: 10000 })
        ]);
      } catch (error) {
        // Check if we're still on login page (failed login)
        const currentUrl = page.url();
        if (currentUrl.includes('login') || currentUrl.includes('auth')) {
          throw new Error('Invalid credentials');
        }
        // If we're not on login page, assume success
      }

      // Extract session data
      const cookies = await context.cookies();
      const localStorage = await page.evaluate(() => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            data[key] = localStorage.getItem(key);
          }
        }
        return data;
      });

      const sessionObj = { cookies, storage: localStorage };
      
      // Save encrypted session
      await saveSession(tenantId, supplierId, sessionObj);

      // Write audit event
      await pool.query(
        'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
        [tenantId, 'ad360.link', JSON.stringify({ supplierId, success: true })]
      );

      await browser.close();
      
      return res.status(200).json({ status: 'linked' });

    } catch (error) {
      await browser.close();
      
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      if (error.message.includes('captcha') || error.message.includes('2FA')) {
        return res.status(409).json({ error: 'Re-link required at AD360 - captcha or 2FA detected' });
      }
      
      // Write audit event for failure
      await pool.query(
        'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
        [tenantId, 'ad360.link', JSON.stringify({ supplierId, success: false, error: error.message })]
      );
      
      return res.status(502).json({ error: 'Login flow changed or network error' });
    }

  } catch (error) {
    console.error('AD360 link error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
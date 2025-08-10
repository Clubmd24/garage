# AD360 Integration Blueprint (Session-Based, No Credential Storage)

**Owner:** Garage Vision (Parts/Quotes)  
**Target environment:** Next.js (pages router) + Node API + MySQL  
**Date:** 2025-08-10  
**Status:** Implement

---

## 1) Goals (Definition of Done)

- Admin links **AD360** once in **Suppliers** → we store an **encrypted session** (cookies/storage), **no username/password at rest**.  
- In **New Quote → Item Details**, clicking **“From AD360”** fetches parts for the selected **Vehicle (VIN/plate)**.  
- **Part Number / Description** dropdown switches to the AD360 results (search-as-you-type).  
- Selecting an AD360 item **auto-fills Unit Cost** with the net price returned by AD360.  
- Results are **cached per vehicle** (short TTL). Session expiry triggers a **Re-link** prompt.  
- All actions are **audited**.

---

## 2) Architecture Overview

**Components**
- **DB:** `supplier_accounts`, `ad360_cache`, `scrape_jobs` (optional, if async), `audit_events`.
- **API routes:**
  - `POST /api/integrations/ad360/link` — one-time login & **save session** (encrypted).
  - `POST /api/integrations/ad360/fetch-for-vehicle` — fetch parts for VIN/plate using saved session; warm cache.
  - `GET  /api/integrations/ad360/search` — filter cached items for the dropdown.
  - `GET  /api/scrape-jobs/[id]` — (optional) job status if using async queue.
- **Scraper worker (Playwright):** Restores session → vehicle search → prefer **XHR JSON capture**, fallback **DOM scrape** → normalize.
- **Frontend (Quote form):** “From AD360” toggles mode & loads results; picking a line fills **Unit Cost**.

**Flow**
1. Supplier linked → **encrypted session** stored.  
2. Quote form “From AD360” → `fetch-for-vehicle` → cache warmed.  
3. Dropdown shows AD360 items → user selects one → fields filled (PN/Brand/Desc/UnitCost).

---

## 3) Data Model & Migrations

> Use your migration system; scripts below are MySQL-compatible.

### 3.1 `suppliers` (existing)
Seed:
```sql
INSERT INTO suppliers (id, name, base_url)
VALUES (7, 'AD360', 'https://connect.ad360.es')
ON DUPLICATE KEY UPDATE name=VALUES(name), base_url=VALUES(base_url);
```

### 3.2 `supplier_accounts`
```sql
CREATE TABLE IF NOT EXISTS supplier_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  supplier_id INT NOT NULL,            -- FK to suppliers.id
  encrypted_session MEDIUMTEXT,        -- JSON of cookies/storage (encrypted)
  last_session_at DATETIME,
  consent_automated_fetch TINYINT(1) DEFAULT 0,
  consent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_tenant_supplier (tenant_id, supplier_id)
);
```

### 3.3 `scrape_jobs` (optional; for async + polling)
```sql
CREATE TABLE IF NOT EXISTS scrape_jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  supplier_id INT NOT NULL,
  vehicle_id INT,
  vin VARCHAR(64),
  reg VARCHAR(32),
  status ENUM('queued','running','done','error') DEFAULT 'queued',
  error_text TEXT,
  started_at DATETIME,
  finished_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.4 `ad360_cache`
```sql
CREATE TABLE IF NOT EXISTS ad360_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  supplier_id INT NOT NULL,
  vehicle_key VARCHAR(128) NOT NULL,   -- e.g. "VIN:WVW...|REG:1234ABC"
  payload JSON NOT NULL,               -- normalized items array
  fetched_at DATETIME NOT NULL,
  UNIQUE KEY uniq_cache (tenant_id, supplier_id, vehicle_key)
);
```

### 3.5 `audit_events`
```sql
CREATE TABLE IF NOT EXISTS audit_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  user_id INT,
  event_type VARCHAR(64),              -- 'ad360.link','ad360.fetch','ad360.relink'
  event_payload JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4) Encryption Helper

**Goal:** Encrypt `encrypted_session` at rest with AES-256-GCM.

**Env:** `DATA_ENC_KEY` = 64 hex chars (32 bytes). Store in server env (not in repo).

`lib/cryptoVault.ts`:
```ts
import crypto from 'crypto';

const key = Buffer.from(process.env.DATA_ENC_KEY!, 'hex'); // 32 bytes hex

export function encryptJSON(obj: any): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptJSON(b64: string): any {
  const raw = Buffer.from(b64, 'base64');
  const iv  = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return JSON.parse(dec.toString('utf8'));
}
```

---

## 5) Session Store

`scrapers/ad360/sessionStore.ts`:
```ts
import pool from '../../lib/db';
import { encryptJSON, decryptJSON } from '../../lib/cryptoVault';

export async function loadSession(tenantId: number, supplierId: number) {
  const [rows]: any = await pool.query(
    'SELECT encrypted_session FROM supplier_accounts WHERE tenant_id=? AND supplier_id=?',
    [tenantId, supplierId]
  );
  if (!rows.length || !rows[0].encrypted_session) return null;
  return decryptJSON(rows[0].encrypted_session);
}

export async function saveSession(tenantId: number, supplierId: number, sessionObj: any) {
  const encrypted = encryptJSON(sessionObj);
  await pool.query(
    `INSERT INTO supplier_accounts (tenant_id, supplier_id, encrypted_session, last_session_at, consent_automated_fetch, consent_at)
     VALUES (?, ?, ?, NOW(), 1, NOW())
     ON DUPLICATE KEY UPDATE encrypted_session=VALUES(encrypted_session), last_session_at=NOW(), consent_automated_fetch=1, consent_at=NOW()`,
    [tenantId, supplierId, encrypted]
  );
}
```

---

## 6) API Routes

### 6.1 Link AD360 (one-time login; store session only)
`POST /api/integrations/ad360/link`

**Request body:**
```json
{ "tenantId": 123, "supplierId": 7, "username": "user", "password": "pass", "consent": true }
```
> username/password are used **once**; they are **not** stored.

**Server steps:**
1. Assert `consent===true`; upsert consent fields in `supplier_accounts`.  
2. Launch Playwright, go to `https://connect.ad360.es`, perform login (fill + submit), wait for post-login selector.  
3. Extract `context.cookies()` and (optional) selected `localStorage` entries.  
4. `saveSession(tenantId, supplierId, { cookies, storage })`.  
5. Write `audit_events` (`event_type='ad360.link'`).  
6. Return `{ status: "linked" }`.

**Errors:** invalid creds → 401; flow change → 502; captcha/2FA → 409 + message “Re-link required at AD360”.

### 6.2 Fetch parts for vehicle
`POST /api/integrations/ad360/fetch-for-vehicle`

**Request body:**
```json
{ "tenantId": 123, "supplierId": 7, "vehicleId": 456 }
```

**Server steps:**
1. Resolve `VIN`/`REG` from `vehicleId`.  
2. `vehicle_key = "VIN:...|REG:..."`.  
3. Check `ad360_cache` (fresh TTL e.g., 60 min) → if present, return cached payload.  
4. Else call `fetchPartsForVehicle(tenantId, supplierId, vin, reg)` (Playwright worker).  
5. Normalize items; upsert `ad360_cache`.  
6. Write `audit_events` (`event_type='ad360.fetch'`, include counts).  
7. Return `{ vehicleKey, items, fetchedAt, ttlSeconds }`.

**Errors:** missing/expired session → 409 `NEEDS_RELINK`; zero rows → 200 with empty `items`.

### 6.3 Search cached items (for dropdown)
`GET /api/integrations/ad360/search?tenantId=..&supplierId=..&vehicleId=..&q=..`

**Server steps:**
1. Resolve cache for `vehicle_key`. If missing/expired → return 404 or trigger fetch (implementation choice).  
2. Filter items by PN/brand/description (case-insensitive), limit 50.  
3. Return list for the dropdown.

---

## 7) Playwright Worker

`scrapers/ad360/worker.ts`:
```ts
import { chromium } from 'playwright';
import { loadSession } from './sessionStore';
import { normalizeItems } from './normalize';

export async function fetchPartsForVehicle(tenantId: number, supplierId: number, vin?: string, reg?: string) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const sess = await loadSession(tenantId, supplierId);
  if (!sess?.cookies) { await browser.close(); throw new Error('NEEDS_RELINK'); }
  await ctx.addCookies(sess.cookies);

  await page.goto('https://connect.ad360.es', { waitUntil: 'domcontentloaded' });
  // TODO: detect login; if redirected to login screen → throw NEEDS_RELINK

  // TODO: Navigate to vehicle search page (confirm selector/URL at implementation time)
  await page.goto('https://connect.ad360.es/vehicle');
  if (vin) await page.fill('#vin', vin);
  if (reg) await page.fill('#reg', reg);
  await Promise.all([page.waitForLoadState('networkidle'), page.click('button:has-text("Buscar")')]);

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

  // Fallback: DOM scrape
  if (!results.length) {
    await page.waitForSelector('table.parts tbody tr', { timeout: 8000 }).catch(() => {});
    const rows = await page.$$eval('table.parts tbody tr', (trs) => trs.map((r) => ({
      brand: (r.querySelector('td:nth-child(2)')?.textContent || '').trim(),
      partNumber: (r.querySelector('td:nth-child(3)')?.textContent || '').trim(),
      description: (r.querySelector('td:nth-child(4)')?.textContent || '').trim(),
      price: (r.querySelector('td:nth-child(5)')?.textContent || '').trim(),
      stock: (r.querySelector('td:nth-child(6)')?.textContent || '').trim(),
    })));
    results.push(...rows);
  }

  const normalized = normalizeItems(results);
  await browser.close();
  return normalized;
}
```

`scrapers/ad360/normalize.ts`:
```ts
const brandAliases: Record<string,string> = {
  'VAG': 'Volkswagen',
  'VOLKSWAGEN GENUINE': 'Volkswagen'
  // extend as needed
};

function normPN(pn: string) {
  return (pn || '').toUpperCase().replace(/[\s\-]/g, '');
}

function parsePrice(raw: string | number) {
  if (typeof raw === 'number') return { amount: raw, currency: 'EUR', vatIncluded: false };
  const cleaned = (raw || '').replace(/[^\d,.\-]/g, '').replace(',', '.');
  const amount = Number.parseFloat(cleaned || '0');
  return { amount: isFinite(amount) ? amount : 0, currency: 'EUR', vatIncluded: false };
}

export function normalizeItems(items: any[]) {
  const out: any[] = [];
  const seen = new Set<string>();
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
```

---

## 8) Frontend (Quote Form → Item Details)

**UI changes**
- Add **From AD360** button (or `Internal | AD360` toggle) in Item Details.
- On click:
  1. `POST /api/integrations/ad360/fetch-for-vehicle`
  2. Store `items` in state; set `ad360Mode = true`.
  3. Dropdown datasource → AD360 items.

**On select of an AD360 item**
- Set fields:
  - `partNumber` ← `item.partNumber`
  - `description` ← `item.description`
  - `brand` ← `item.brand`
  - `unitCost` ← `item.price.amount`
  - `currency` ← `EUR`
  - `supplier_id` ← `7` (AD360)
- Add a small hint under Unit Cost: “Price from AD360”.

**Empty/expired cache**
- Spinner + message: “Fetching from AD360 for this vehicle…”
- If API returns `409 NEEDS_RELINK` → show toast “AD360 session expired. Re-link in Suppliers.”

---

## 9) Caching & TTL

- Cache key: `(tenant_id, supplier_id, vehicle_key)`; `vehicle_key = "VIN:...|REG:..."`.
- Default TTL: **60 minutes**.
- Provide a small **Refresh** icon to force re-fetch (overrides TTL).

---

## 10) Security, Compliance, Ops

- **Consent:** Store `consent_automated_fetch=1` and `consent_at` during link.
- **No credentials at rest:** Only encrypted session (cookies/localStorage).  
- **Secret management:** `DATA_ENC_KEY` in server env, rotated as part of ops.  
- **Rate limits:** Max 1 concurrent AD360 fetch per tenant; human-like waits (400–900 ms).  
- **Audit:** Write events for link/fetch/relink with minimal metadata (vehicle_key, counts).  
- **Errors taxonomy:**
  - `NEEDS_RELINK` → HTTP 409 from `fetch-for-vehicle`.
  - `NO_RESULTS` → 200 with `items: []`.
  - `SELECTOR_CHANGED` or network failure → 502 with error message + internal alert.
- **Monitoring:** Alert if:
  - >20% `NEEDS_RELINK` in 24h,
  - scrape failures > 5%,
  - zero-results rate spikes.

---

## 11) Rollout Plan

1. Hide behind a **feature flag** (`AD360_ENABLED`).  
2. Implement **Link AD360** page + encrypted session storage.  
3. Implement **fetch-for-vehicle** and **search** with cache.  
4. Wire the **From AD360** button in the Quote form.  
5. Pilot with one tenant; validate selectors; adjust normalize rules.  
6. Enable broadly after stability.

---

## 12) Acceptance Tests

- **Linking:** Wrong creds → 401; success saves session; status shows “Linked”.  
- **Fetching:** With valid session returns items; expired → 409.  
- **Dropdown:** Typing filters; selection fills Unit Cost and supplier.  
- **Cache:** Second fetch within TTL does not call Playwright (assert via logs).  
- **Audit:** Events recorded with accurate counts and vehicle_key.  
- **Security:** `encrypted_session` is unreadable; `DATA_ENC_KEY` not committed.

---

## 13) File/Folder Map (to create)

```
/lib/cryptoVault.ts
/pages/api/integrations/ad360/link.ts
/pages/api/integrations/ad360/fetch-for-vehicle.ts
/pages/api/integrations/ad360/search.ts
/pages/api/scrape-jobs/[id].ts          (optional, if async)
/scrapers/ad360/worker.ts
/scrapers/ad360/sessionStore.ts
/scrapers/ad360/normalize.ts
/components/quotes/FromAD360Button.tsx  (or wherever Item Details lives)
/migrations/20250812_*.sql              (five migration files above)
```

---

## 14) Notes & Open Items

- **Selectors & URLs** inside AD360 need confirming during first run (may vary by tenant).  
- If AD360 deploys **captcha/2FA**, support a **Re-link** flow that prompts the user to re-authenticate.  
- Consider a **purchase-order flow** to send selected lines back to the supplier in a future iteration.

---

**End of Blueprint**

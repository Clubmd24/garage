# Garage-Vision Dev Portal

## Setup

1. Copy `.env.example` to `.env.local` and fill in secrets. The required variables are `DATABASE_URL` and `JWT_SECRET`.
2. Configure AWS S3 to enable uploading logos and other files. Add the following environment variables from `.env.example`:
   - `S3_BUCKET`
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `NEXT_PUBLIC_S3_BUCKET`
   - `NEXT_PUBLIC_AWS_REGION`
   
   The S3 bucket must already exist and permit uploads.
3. Install the Python dependencies:
   `pip install -r requirements.txt`
4. Run `./setup.sh` to install Node.js and all JavaScript dependencies.
   The script installs `nvm` if needed, runs `nvm install 20` then `nvm use 20`,
   and executes `npm ci`. If the online installation of `nvm` fails it will look
   for a local copy at `scripts/nvm-install.sh` and use that instead. When
   preparing an offline environment download Node 20 and all packages listed in
   `package-lock.json` in advance so `npm ci` can run with the cached files.
5. Make the bootstrap script executable and run it to scaffold the portal:
   `chmod +x bootstrap_dev_portal.sh && ./bootstrap_dev_portal.sh`

### Start the database

Start a local MySQL server before running migrations. If Docker is available you can start a container with:

```bash
docker run --name garage-db \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=garage \
  -p 3306:3306 -d mysql:8
```

For a local installation, ensure the MySQL service is running and a database named `garage` exists. Update `DATABASE_URL` in `.env.local` if necessary.

6. Run migrations: `npm run migrate`
   - This command executes every `.sql` file in the `migrations/` directory in
     order and records which have been run.
   - Running the script again safely skips already-applied migrations.
7. Run tests and lint checks: `npm test` and `npm run lint`. The test suite
   requires Node and all npm packages to be installed, so ensure the previous
   step succeeded or use a Docker image with these dependencies preinstalled.
8. Start dev server: `npm run dev`

## Code Style

ESLint is configured using the Next.js base rules. Custom settings warn on
unused variables, enforce single quotes and require semicolons. Run
`npm run lint` or enable an editor integration before committing. See
`.eslintrc.json` or the [Next.js ESLint guide](https://nextjs.org/docs/pages/building-your-application/configuring/eslint)
for the full rule set.

## Database

All database schema changes are stored as `.sql` files in the `migrations/`
directory. The migration script executes them sequentially and records the
results so it can be run repeatedly without errors.

## New Endpoints

- `/api/suppliers` - list and create suppliers.
- `/api/suppliers/[id]` - view, update and delete a supplier.
- `/api/purchase-orders` - create purchase orders with items.
- `/api/quote-items` - create or fetch quote items.
- `/api/search` - search across clients, vehicles, jobs, quotes, invoices and parts.

## Invoice Generation

An invoice template lives in `templates/invoice_template_final.docx`. Use the helper
script `generate_invoice.py` to render this template with data in JSON format
and produce a PDF invoice. Example usage:

```bash
pip install -r requirements.txt  # or run ./setup.sh beforehand
python generate_invoice.py invoice_data.json
```

The PDF conversion relies on either the `docx2pdf` Python package or `unoconv`
being available. `docx2pdf` is installed via the requirements file, while
`unoconv` can be installed separately (e.g. `sudo apt-get install unoconv` on
Ubuntu or `brew install unoconv` on macOS).

The resulting files are written to the `output/` directory as
`invoice_<invoice_number>.docx` and `invoice_<invoice_number>.pdf`.

## Quotation Generation

An editable quotation template lives in `templates/quotation_template_final.docx`.
Use the helper script `generate_quote.py` to fill this template with JSON data
and produce a PDF quote. Example usage:

```bash
pip install -r requirements.txt  # or run ./setup.sh beforehand
python generate_quote.py quote_data.json
```

See the note above regarding installing `docx2pdf` or `unoconv` for PDF
generation.

The resulting files are written to the `output/` directory as
`quote_<quote_number>.docx` and `quote_<quote_number>.pdf`.

## Viewing Quotes

From the office interface you can view any quotes linked to a client or vehicle.
Open a client or vehicle record and all associated quotes will appear beneath
their documents list.

## Master Search

The header on the office layout includes a search bar that queries multiple
entities at once. Results are grouped by type and link to the relevant
view or edit pages. Behind the scenes the `/api/search` endpoint performs
`LIKE` searches across clients, vehicles, jobs, quotes, invoices and parts.

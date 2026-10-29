# Nova Pidloha

Next.js storefront and Strapi CMS. See [production deployment](deploy/README.md) for Docker, the existing shared Nginx, backups, migration and rollback.

- `apps/web`: Next.js **16.2.12**, React 19, TypeScript App Router; npm lockfile. `npm run build`, standalone `node server.js` in Docker.
- `apps/cms`: Strapi **5.51.1**, GraphQL **5.51.1**, local uploads, npm lockfile. `npm run build`, production Strapi `start`.
- `apps/catalog-importer`, `apps/supplier`: existing offline/operator tools, not long-running deployment services.

Development remains SQLite by default. Production Compose explicitly uses PostgreSQL 16 and does **not** copy or migrate SQLite data. Read the migration section before cutover.

Google Maps: set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `apps/web/.env.local` for local development or in the root `.env` for Docker builds. Enable Maps JavaScript API and billing in the Google Cloud project; restrict the browser key to your website referrers and that API. Optionally set `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` to a JavaScript map ID (the default is Google's `DEMO_MAP_ID`). Restart development or rebuild the web image after changing these build-time variables. With a key, the map shows CMS store markers, fits all stores initially, and hides default controls and place cards. Without a key, the previous Google iframe remains available.

# Nova Pidloha

Next.js storefront and Strapi CMS. See [production deployment](deploy/README.md) for Docker, the existing shared Nginx, backups, migration and rollback.

- `apps/web`: Next.js **16.2.12**, React 19, TypeScript App Router; npm lockfile. `npm run build`, standalone `node server.js` in Docker.
- `apps/cms`: Strapi **5.51.1**, GraphQL **5.51.1**, local uploads, npm lockfile. `npm run build`, production Strapi `start`.
- `apps/catalog-importer`, `apps/supplier`: existing offline/operator tools, not long-running deployment services.

Development remains SQLite by default. Production Compose explicitly uses PostgreSQL 16 and does **not** copy or migrate SQLite data. Read the migration section before cutover.

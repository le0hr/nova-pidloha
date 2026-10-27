# Production deployment on Ubuntu

Run these commands yourself on the VPS after review. No VPS or running containers were changed by this implementation. SunBeam and `/opt/reverse-proxy` are outside this Compose project.

## Architecture and configuration

`compose.yaml` uses project `novapidloha`. Node 22 on Debian is compatible with the locked Next.js and Strapi engines. Each app has its own npm lockfile and Docker build context; `.env`, local databases, uploads and build output are excluded from images. Strapi's admin bundle is built before production dependencies are pruned. Both app runtimes use UID/GID 1000 (`node`).

| Service | Networks | Address/data |
| --- | --- | --- |
| web | nova-internal, novapidloha_edge | `http://nova-web:3000` |
| cms | nova-internal, novapidloha_edge | `http://nova-cms:1337`; `/app/public/uploads` |
| db | nova-internal only (internal network) | PostgreSQL 16; `/var/lib/postgresql/data` |

No host ports, Nginx, Certbot, Docker socket or development bind mounts. Volumes default to `novapidloha_postgres_data` and `novapidloha_uploads`. Database credentials only initialize a **new** PostgreSQL volume; changing `.env` will not change an existing DB password. Never point these volumes at SunBeam data. Named volumes survive container updates. Next.js build/cache files are disposable, not business data.

The external edge network must permit outbound access: Strapi's Nova Poshta integration calls an external API. The database has no external network. Containers on the shared edge network are trusted; only Nginx should expose application traffic publicly.

Next server GraphQL requests use runtime `STRAPI_URL=http://nova-cms:1337` and optional server-only `STRAPI_READ_TOKEN`. Browser Nova Poshta requests and media use `NEXT_PUBLIC_STRAPI_URL`, compiled from `CMS_PUBLIC_URL`. Strapi uses `PUBLIC_URL` for its admin build and runtime URLs, trusts proxy headers, and permits CORS from the website and CMS origins. Domain changes require rebuilding **both** images. Do not put API tokens into build arguments or `NEXT_PUBLIC_*` variables.

The shop layout renders dynamically so Docker builds do not require CMS access or embed an empty catalog. Catalog queries, variations, pricing and image mapping are unchanged. GraphQL stays at `/graphql`; the interactive playground is disabled in production. Uploads allow 100 MiB per file with 110 MiB Nginx request allowance. Web health checks measure process availability, not catalog correctness; perform functional checks below.

Reference behavior: [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output), [Strapi proxy/public URL settings](https://docs.strapi.io/cms/configurations/server).

## Before first deployment: SQLite migration

The inspected local CMS uses SQLite (`.tmp/data.db`); its database config already supports PostgreSQL but needed the `pg` driver. Compose **selects a separate PostgreSQL database**, not a conversion of SQLite. Starting it with an empty volume produces an empty Strapi instance and schema. Do not send real traffic there until the catalog, media, permissions and admin access are verified.

1. Freeze writes to the source CMS and make an offline copy of its SQLite database, `public/uploads`, code revision and secrets. Copy the entire SQLite directory after stopping the source process so WAL data is not missed.
2. Rehearse migration into an isolated PostgreSQL instance using the **same Strapi version and content schemas**. Use Strapi's supported export/import or transfer workflow; do not feed a SQLite SQL dump to PostgreSQL. Consult `npm run strapi -- export --help` and `npm run strapi -- import --help` in the source/target release. Import replaces target data: use only a deliberately empty migration target, with a backup and explicit operator approval.
3. Verify relations, product variations, publication states, file records and physical uploads. Admin accounts/API tokens may need recreation; verify public role permissions and issue a new scoped read token if used. The application's existing bootstrap behavior is preserved.
4. Reconcile CMS URLs if old content contains absolute localhost URLs. Normal local uploads use relative `/uploads/...` URLs and are served via the public CMS HTTPS origin.
5. Cut over only after validation. Preserve the original SQLite deployment and backup until the rollback window closes. Never attempt to convert or reuse WordPress's MariaDB volume.

No import, reset, seed or migration command is run by our Docker entrypoints. Strapi itself can synchronize its schema on startup; always back up before deploying schema/version changes.

## First startup

Prerequisites: Docker Engine with Compose v2, Git, `openssl`, `envsubst` (Ubuntu `gettext-base`), sufficient disk/RAM for both builds, and the repository checked out at `/home/novapidloha/app`.

```bash
cd /home/novapidloha/app
umask 077
cp -n .env.example .env
chmod 600 .env
openssl rand -hex 32
```

Edit `.env`: set real HTTPS origins with no trailing slash, unique release `IMAGE_TAG` (e.g. Git SHA), a new PostgreSQL password and all Strapi secrets. Generate each secret independently with `openssl rand -hex 32`; `APP_KEYS` needs four comma-separated generated values. When migrating an existing installation, preserve its appropriate secrets rather than silently rotating them. Add `NP_API_KEY` for checkout lookup. Set `STRAPI_READ_TOKEN` after creating a read-only CMS API token if public permissions do not allow catalog reads. Root `.env` is Compose's input; local `apps/*/.env*` files are neither mounted nor copied.

Existing supplier source contained embedded token defaults; these were removed. Rotate the previously exposed Telegram/Strapi tokens through their issuers and supply `TG_BOT_TOKEN` / `STRAPI_TOKEN` in the operator environment if using that tool. This deployment does not start supplier/importer jobs.

```bash
docker network inspect novapidloha_edge >/dev/null 2>&1 || docker network create novapidloha_edge
docker compose config --quiet
docker compose build --pull cms web
docker compose up -d --wait --wait-timeout 180 db
docker compose up -d --wait --wait-timeout 240 cms
# Complete the migration/permissions/token checks before exposing traffic.
docker compose up -d --wait --wait-timeout 180 web
docker compose ps
docker compose logs --tail=100 cms web
```

Do not print `docker compose config` into shared logs: its full output contains resolved secrets. Build failures must be fixed before proceeding. Docker builds were not possible in the implementation environment because Docker Engine was unavailable.

## Connect existing Nginx: two stages

Templates assume an Nginx `http`-context `conf.d` include and the usual `/etc/letsencrypt` certificate mount. Inspect the actual shared deployment; do not replace its Compose or SunBeam configuration:

```bash
docker inspect edge_nginx --format '{{json .Mounts}}'
docker inspect edge_nginx --format '{{json .NetworkSettings.Networks}}'
cd /opt/reverse-proxy
docker compose config --services
```

Confirm the existing Certbot service name, its entrypoint, the writable ACME webroot inside Certbot, the same webroot's path inside Nginx, certificate mount, and the host directory mounted at Nginx's `conf.d`. If Nginx is already on `novapidloha_edge`, no connection command is needed. Otherwise, the proxy owner must add that **external** network to its existing Compose and connect the running container once:

```bash
docker network connect novapidloha_edge edge_nginx
```

The persistent shared Compose declaration is necessary to survive proxy recreation. Do not disconnect any existing networks. Do not recreate the shared proxy as part of this app deployment.

Set these shell variables to **verified** values, not literal placeholder strings:

```bash
export WEB_DOMAIN='your-website-domain'
export CMS_DOMAIN='your-cms-subdomain'
export CERT_NAME="$WEB_DOMAIN"
export LE_EMAIL='your-certificate-contact-email'
export NGINX_WEBROOT='verified-webroot-path-inside-nginx'
export CERTBOT_WEBROOT='verified-webroot-path-inside-certbot'
export PROXY_CONF_DIR='verified-host-conf.d-directory'
export CERTBOT_SERVICE='verified-existing-certbot-service-name'
```

Both DNS names must point to the VPS; remove incorrect AAAA records or configure IPv6 listeners/routing before issuance. HTTP port 80 must be reachable. The template uses IPv4 listeners; add IPv6 only if supported by the shared setup.

**Stage 1 — HTTP only:**

```bash
cd /home/novapidloha/app
mkdir -p deploy/rendered
envsubst '${WEB_DOMAIN} ${CMS_DOMAIN} ${NGINX_WEBROOT}' \
  < deploy/nginx/novapidloha-http.conf > deploy/rendered/novapidloha.conf
# First installation only: stop if this filename already exists; back it up and review it.
sudo test ! -e "$PROXY_CONF_DIR/novapidloha.conf"
# Proceed only if the previous command succeeded.
sudo install -m 644 deploy/rendered/novapidloha.conf "$PROXY_CONF_DIR/novapidloha.conf"
docker exec edge_nginx nginx -t && docker exec edge_nginx nginx -s reload
```

Only install this new Nova file. If testing fails, restore the prior Nova file (or move the newly added file outside the include directory) and retest. Do not reload an invalid configuration. HTTP returns 503 except for ACME challenges; no nonexistent certificate is referenced.

Issue one certificate covering both names using the existing shared Certbot volumes. The entrypoint override below works even when the existing Certbot service normally runs a renewal loop:

```bash
cd /opt/reverse-proxy
docker compose run --rm --no-deps --entrypoint certbot "$CERTBOT_SERVICE" \
  certonly --webroot -w "$CERTBOT_WEBROOT" \
  --cert-name "$CERT_NAME" -d "$WEB_DOMAIN" -d "$CMS_DOMAIN" \
  --email "$LE_EMAIL" --agree-tos --non-interactive
```

First verify that this certificate name is not used by another site. Do not force renewal or change SunBeam certificates. Confirm the certificate and key are visible in Nginx at `/etc/letsencrypt/live/$CERT_NAME/`.

**Stage 2 — HTTPS:**

```bash
cd /home/novapidloha/app
envsubst '${WEB_DOMAIN} ${CMS_DOMAIN} ${NGINX_WEBROOT} ${CERT_NAME}' \
  < deploy/nginx/novapidloha.conf > deploy/rendered/novapidloha-https.conf
sudo cp "$PROXY_CONF_DIR/novapidloha.conf" /tmp/novapidloha-http.conf.backup
sudo install -m 644 deploy/rendered/novapidloha-https.conf "$PROXY_CONF_DIR/novapidloha.conf"
docker exec edge_nginx nginx -t && docker exec edge_nginx nginx -s reload
```

On test failure, restore `/tmp/novapidloha-http.conf.backup` and retest; do not reload. Render with the explicit variable list above to preserve Nginx `$host`, `$request_uri` etc. The HTTPS configuration uses Docker DNS with periodic resolution, so app container replacement does not leave stale upstream IPs. Have the proxy operator verify existing Certbot renewal and post-renewal Nginx reload; ACME webroot routing remains enabled in the final config.

## Functional verification

```bash
cd /home/novapidloha/app
docker compose exec -T web node -e "fetch('http://nova-cms:1337/_health').then(r=>{console.log(r.status);process.exit(r.ok?0:1)})"
# If wget is installed in the existing Nginx image:
docker exec edge_nginx wget -qO- http://nova-web:3000/api/health
curl -fsS "https://$WEB_DOMAIN/api/health"
curl -fsS "https://$CMS_DOMAIN/_health"
curl -fsS "https://$CMS_DOMAIN/graphql" -H 'Content-Type: application/json' \
  --data '{"query":"{ __typename }"}'
curl -I "http://$WEB_DOMAIN/"
```

Open `/admin` on the CMS domain; verify login and upload a test image. Open its actual `/uploads/...` URL over HTTPS. Visit home, a real category and a real product; check variants, pricing, cart and Nova Poshta checkout suggestions. Inspect browser Network/Console for CORS, mixed content, private hostnames and authorization failures. Verify real catalog GraphQL queries, not just the schema smoke query above. Health checks alone do not establish readiness for customers.

## Consistent backup (database + files + release)

Freeze writes and stop app services briefly so DB/file references remain consistent. The database stays running. Backups contain sensitive data: keep them permission-restricted, encrypted off-host, and test restore periodically.

```bash
cd /home/novapidloha/app
umask 077
backup_dir="$PWD/backups/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup_dir"
docker compose stop web cms
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup_dir/database.dump"
docker compose run --rm -T --no-deps --entrypoint tar cms \
  -C /app/public/uploads -czf - . > "$backup_dir/uploads.tar.gz"
cp .env compose.yaml "$backup_dir/"
git rev-parse HEAD > "$backup_dir/revision.txt"
docker compose images > "$backup_dir/images.txt"
docker compose up -d --wait --wait-timeout 240 cms web
```

Check each command succeeded before moving on. Verify dump readability with `pg_restore --list` in a PostgreSQL 16 environment and `tar -tzf`. Preserve the matching image tags in a registry or `docker image save` archive; do not prune the previous release. Back up the original SQLite source separately before the initial migration.

## Restore without overwriting the current volumes

Restore into **new** explicitly named Nova volumes. This preserves the current data for recovery, but switching to the snapshot loses newer writes from the customer's view. Schedule downtime and approve that recovery point first.

```bash
cd /home/novapidloha/app
export backup_dir='/absolute/path/to/verified/backup'
# Ensure .env credentials/secrets and IMAGE_TAG match that snapshot/release.
# Preserve current .env separately before restoring the backup copy.
docker compose stop web cms db
export DB_VOLUME_NAME="novapidloha_restore_db_$(date -u +%Y%m%dT%H%M%SZ)"
export UPLOADS_VOLUME_NAME="novapidloha_restore_uploads_$(date -u +%Y%m%dT%H%M%SZ)"
docker compose up -d --wait db
docker compose exec -T db sh -c 'pg_restore --exit-on-error --no-owner --no-acl -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "$backup_dir/database.dump"
docker compose run --rm -T --no-deps --entrypoint tar cms \
  -C /app/public/uploads -xzf - < "$backup_dir/uploads.tar.gz"
docker compose up -d --no-build --wait --wait-timeout 240 cms web
```

Check all restore commands before starting applications; use a trusted archive only. The fresh uploads volume inherits node ownership from the CMS image. Persist the selected volume names in `.env` after successful verification, then unset the shell overrides; otherwise a later shell could reconnect the old volumes. Never reuse the restore volume names for another attempt. The original volumes remain intact.

## Updates and rollback

1. Record the deployed Git revision and immutable image tag; create the consistent backup above. Save the old `.env` securely. Never rebuild an old image tag with new code.
2. Check out the reviewed release. Set a new `IMAGE_TAG` in `.env`. Build before stopping the working release:

   ```bash
   docker compose config --quiet
   docker compose build --pull cms web
   docker compose up -d --no-build --wait --wait-timeout 240 cms web
   docker compose ps
   ```

3. Run the functional checks. Expect brief downtime during container replacement; this is not a blue/green deployment.
4. For an application-only rollback with a confirmed compatible database schema, restore the previous code/config and `.env` (including image tag), then run:

   ```bash
   docker compose up -d --no-build --wait --wait-timeout 240 cms web
   ```

5. If Strapi changed schema/data, image rollback alone is unsafe. Stop writes, restore the pre-update database **and media** into fresh volumes using the previous release, then validate before reopening traffic. Preserve newer data for reconciliation. Do not downgrade PostgreSQL against an existing data directory.

Do not delete volumes, run a volume-removing teardown, import data automatically, or rotate existing database credentials during a routine update. Shared proxy configuration and TLS renewal are managed independently.

## Implementation verification and build fixes

Compose was validated with the standalone Docker Compose v2 validator using dummy environment values. Assertions checked project name, network isolation, edge aliases and absence of published ports. Strapi TypeScript and admin build succeeded. Next.js production builds succeeded with both the default Turbopack and webpack; the default build required running outside the sandbox. Existing frontend tests passed (10 test files).

The first frontend production build exposed pre-existing TypeScript errors. Minimal corrections remove an unused `shops` prop passed to Hero, remove an unreachable reviews-tab label branch, and declare the unused AreaCalculator's required props. Unreferenced design exports in `src/imports` are excluded from the application's TypeScript project; active application type checking remains enabled. No catalog calculations or selection behavior were rewritten.

A real Docker image build and running-container integration test still need to be performed on a Docker-enabled host. Shared Nginx syntax and its mount paths must be validated there before reload.

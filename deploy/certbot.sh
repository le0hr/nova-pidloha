#!/bin/sh
# first issue, run from /opt/reverse-proxy after nova-pidloha.http.conf is live
set -e
cd /opt/reverse-proxy
docker compose run --rm certbot certonly --webroot -w /var/www/certbot --cert-name novapidloha \
  -d nova-pidloga-dveri.com -d www.nova-pidloga-dveri.com -d cms.nova-pidloga-dveri.com \
  --email "${CERTBOT_EMAIL:?set CERTBOT_EMAIL}" --agree-tos --no-eff-email

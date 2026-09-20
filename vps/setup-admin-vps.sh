#!/usr/bin/env bash
set -euo pipefail

DOMAIN="admin.habscosadaqah.org"
ROOT="/var/www/habsco-admin"
REPO="https://github.com/HabscoSadaqah/habsco-saqaqah-jariyah-development-trust.git"

apt-get update
apt-get install -y nginx git certbot python3-certbot-nginx

mkdir -p "$ROOT"
if [ -d "$ROOT/.git" ]; then
  git -C "$ROOT" fetch origin main
  git -C "$ROOT" reset --hard origin/main
else
  rm -rf "$ROOT"
  git clone --depth 1 --branch main "$REPO" "$ROOT"
fi

install -d /etc/nginx/sites-available /etc/nginx/sites-enabled
install -m 0644 "$ROOT/vps/nginx/admin.habscosadaq.org.conf" /etc/nginx/sites-available/admin.habscosadaq.org.conf
ln -sf /etc/nginx/sites-available/admin.habscosadaq.org.conf /etc/nginx/sites-enabled/admin.habscosadaq.org.conf

nginx -t
systemctl enable --now nginx
systemctl reload nginx

# The utility gateway uses a separate DNS-only origin hostname so Supabase
# server-to-server traffic does not traverse the proxied admin hostname.
UTILITY_ORIGIN="utility-origin.habscosadaqah.org"
if getent hosts "$UTILITY_ORIGIN" >/dev/null 2>&1; then
  certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email \
    -d "$DOMAIN" -d "$UTILITY_ORIGIN" --keep-until-expiring || true
  nginx -t
  systemctl reload nginx
fi

echo "Admin portal: https://$DOMAIN"
echo "Utility origin: https://$UTILITY_ORIGIN"
echo "If utility-origin DNS is not configured yet, create a DNS-only A record to 45.43.27.75 and rerun this setup script."

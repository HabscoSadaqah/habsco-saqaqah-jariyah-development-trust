#!/usr/bin/env bash
set -euo pipefail

DOMAIN="admin.habscosadaqah.org"
ROOT="/var/www/habsco-admin"
REPO="https://github.com/HabscoSadaqah/habsco-saqaqah-jariyah-development-trust.git"

export DEBIAN_FRONTEND=noninteractive

# Install only missing packages so normal webhook deployments stay fast.
command -v nginx >/dev/null 2>&1 || { apt-get update && apt-get install -y nginx; }
command -v git >/dev/null 2>&1 || { apt-get update && apt-get install -y git; }
command -v certbot >/dev/null 2>&1 || { apt-get update && apt-get install -y certbot python3-certbot-nginx; }

mkdir -p "$ROOT"
if [ -d "$ROOT/.git" ]; then
  git -C "$ROOT" fetch origin main
  git -C "$ROOT" reset --hard origin/main
else
  rm -rf "$ROOT"
  git clone --depth 1 --branch main "$REPO" "$ROOT"
fi

CONFIG="$ROOT/vps/nginx/admin.habscosadaq.org.conf"
if [ ! -f "$CONFIG" ]; then
  echo "ERROR: required Nginx template is missing: $CONFIG" >&2
  exit 1
fi

install -d /etc/nginx/sites-available /etc/nginx/sites-enabled
install -m 0644 "$CONFIG" /etc/nginx/sites-available/admin.habscosadaq.org.conf
ln -sf /etc/nginx/sites-available/admin.habscosadaq.org.conf /etc/nginx/sites-enabled/admin.habscosadaq.org.conf

nginx -t
systemctl enable --now nginx
systemctl reload nginx

# The utility gateway uses a separate DNS-only origin hostname.
UTILITY_ORIGIN="utility-origin.habscosadaq.org"
if getent hosts "$UTILITY_ORIGIN" >/dev/null 2>&1; then
  certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email \
    -d "$DOMAIN" -d "$UTILITY_ORIGIN" --keep-until-expiring || true
  nginx -t
  systemctl reload nginx
fi

echo "Admin portal: https://$DOMAIN"
echo "Utility origin: https://$UTILITY_ORIGIN"

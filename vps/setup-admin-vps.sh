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

echo "Admin portal is now available on http://$DOMAIN"
echo "After DNS points admin.$DOMAIN to this VPS, run:"
echo "certbot --nginx -d $DOMAIN"

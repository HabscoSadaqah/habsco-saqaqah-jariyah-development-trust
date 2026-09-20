#!/usr/bin/env bash
set -euo pipefail

ROOT="/opt/habsco-utility-gateway"
ENV_DIR="/etc/habsco"
SERVICE="/etc/systemd/system/habsco-utility-gateway.service"
REPO="https://github.com/HabscoSadaqah/habsco-saqaqah-jariyah-development-trust.git"

apt-get update
apt-get install -y curl git ca-certificates

if ! command -v deno >/dev/null 2>&1; then
  curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh
  ln -sf /usr/local/bin/deno /usr/local/bin/deno
fi

mkdir -p "$ROOT" "$ENV_DIR"
if [ -d "$ROOT/.git" ]; then
  git -C "$ROOT" fetch origin main
  git -C "$ROOT" reset --hard origin/main
else
  rm -rf "$ROOT"
  git clone --depth 1 --branch main "$REPO" "$ROOT"
fi

install -m 0644 "$ROOT/vps/utility-gateway/index.ts" "$ROOT/index.ts"
install -m 0644 "$ROOT/vps/utility-gateway/habsco-utility-gateway.service" "$SERVICE"

if [ ! -f "$ENV_DIR/utility-gateway.env" ]; then
  install -m 0600 "$ROOT/vps/utility-gateway/utility-gateway.env.example" "$ENV_DIR/utility-gateway.env"
  echo "IMPORTANT: edit $ENV_DIR/utility-gateway.env with the real Supabase service-role key and Accelerate API keys."
fi

systemctl daemon-reload
systemctl enable --now habsco-utility-gateway
systemctl restart habsco-utility-gateway
systemctl status habsco-utility-gateway --no-pager

#!/bin/bash
# ==============================================================================
# Cloudflare Tunnel Custom Domain Automator for AWS EC2
# ==============================================================================
set -e

if [ -z "$1" ]; then
  echo "Usage: ./setup_cloudflare_domain.sh <your-domain.com or sub.yourdomain.com>"
  echo "Example: ./setup_cloudflare_domain.sh mindcare.example.com"
  exit 1
fi

DOMAIN=$1
TUNNEL_NAME="mindcare-production"

echo "Step 1: Logging in to Cloudflare..."
cloudflared tunnel login

echo "Step 2: Creating named tunnel '$TUNNEL_NAME'..."
TUNNEL_OUTPUT=$(cloudflared tunnel create $TUNNEL_NAME)
echo "$TUNNEL_OUTPUT"

TUNNEL_ID=$(echo "$TUNNEL_OUTPUT" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -n 1)

if [ -z "$TUNNEL_ID" ]; then
  echo "Could not extract Tunnel ID. Please check if tunnel already exists."
  TUNNEL_ID=$(cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}')
fi

echo "Tunnel ID: $TUNNEL_ID"

echo "Step 3: Routing DNS for $DOMAIN to Tunnel $TUNNEL_ID..."
cloudflared tunnel route dns $TUNNEL_NAME $DOMAIN

echo "Step 4: Writing Cloudflare Tunnel Configuration (~/.cloudflared/config.yml)..."
mkdir -p ~/.cloudflared
cat <<EOF > ~/.cloudflared/config.yml
tunnel: $TUNNEL_ID
credentials-file: /home/ec2-user/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:3000
  - service: http_status:404
EOF

echo "Step 5: Installing and starting Cloudflare Tunnel as a background daemon..."
sudo cloudflared service install || true
sudo systemctl enable cloudflared
sudo systemctl restart cloudflared

echo "=============================================================================="
echo "🎉 SUCCESS! Your domain $DOMAIN is now connected to MindCare AI!"
echo "Visit: https://$DOMAIN"
echo "=============================================================================="

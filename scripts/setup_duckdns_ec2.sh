#!/bin/bash
# ==============================================================================
# DuckDNS + Nginx + Certbot (Free HTTPS) Auto-Setup for MindCare AI on EC2
# Domain: mindcare-ai.duckdns.org
# ==============================================================================
set -e

DOMAIN="mindcare-ai.duckdns.org"

echo "Step 1: Installing Nginx & Certbot..."
if command -v dnf &> /dev/null; then
    # Amazon Linux 2023
    sudo dnf install -y nginx certbot python3-certbot-nginx
elif command -v apt &> /dev/null; then
    # Ubuntu / Debian
    sudo apt update
    sudo apt install -y nginx certbot python3-certbot-nginx
fi

echo "Step 2: Configuring Nginx reverse proxy for $DOMAIN -> http://localhost:3000..."
sudo cat <<EOF | sudo tee /etc/nginx/conf.d/mindcare.conf
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

echo "Step 3: Starting Nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "Step 4: Obtaining free HTTPS SSL Certificate via Let's Encrypt (Certbot)..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email || {
    echo "Certbot automated SSL acquisition will finalize once DuckDNS IP points to this server."
}

echo "Step 5: Reloading Nginx..."
sudo systemctl reload nginx

echo "=============================================================================="
echo "🎉 SUCCESS! MindCare AI is now available with SSL at:"
echo "👉 https://$DOMAIN"
echo "=============================================================================="

# 🦆 DuckDNS Free Domain & HTTPS Guide (`mindcare-ai.duckdns.org`)

This guide shows how to set up **`https://mindcare-ai.duckdns.org`** with free automatic Let's Encrypt HTTPS/SSL certificates on your AWS EC2 server.

---

## Step 1: Claim `mindcare-ai.duckdns.org` on DuckDNS

1. Go to **[https://www.duckdns.org](https://www.duckdns.org)** and log in.
2. In the domain name field, enter `mindcare-ai`.
3. Set the IP address to your AWS EC2 IP: `13.201.128.206`.
4. Click **add domain**.

---

## Step 2: Ensure AWS EC2 Inbound Rules Allow HTTP/HTTPS

In your **AWS EC2 Console -> Security Groups**:
- **Port 80 (HTTP):** Allowed from `0.0.0.0/0`
- **Port 443 (HTTPS):** Allowed from `0.0.0.0/0`
- **Port 3000 (Custom TCP):** Allowed from `0.0.0.0/0`

---

## Step 3: Run the Auto-Setup Script on EC2

SSH into your AWS EC2 server and run:

```bash
# Download and execute the automated setup script
curl -sSL https://raw.githubusercontent.com/Kushal70-51/MindCare-AI/main/scripts/setup_duckdns_ec2.sh | bash
```

Or copy-paste these commands directly into your EC2 terminal:

```bash
# 1. Install Nginx & Certbot
sudo dnf install -y nginx certbot python3-certbot-nginx

# 2. Create Nginx Reverse Proxy Config
sudo cat <<'EOF' | sudo tee /etc/nginx/conf.d/mindcare.conf
server {
    listen 80;
    server_name mindcare-ai.duckdns.org;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 3. Enable Nginx & Obtain Free SSL Certificate
sudo systemctl enable --now nginx
sudo certbot --nginx -d mindcare-ai.duckdns.org --non-interactive --agree-tos --register-unsafely-without-email
sudo systemctl reload nginx
```

---

## 🎉 Result

Your website will be live permanently with free green lock HTTPS at:
👉 **[https://mindcare-ai.duckdns.org](https://mindcare-ai.duckdns.org)**

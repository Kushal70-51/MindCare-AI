# ☁️ Cloudflare Domain Deployment Guide (Cloudflare Tunnel)

This guide shows how to deploy and expose **MindCare AI** under a **Cloudflare Domain** with automatic HTTPS SSL encryption using **Cloudflare Tunnels (`cloudflared`)**.

> **Why Cloudflare Tunnel?**  
> MindCare AI relies on browser APIs (**Webcam camera**, **Microphone**, **Speech Recognition**, **Web Audio API**) and a Node.js backend with native SQLite (`better-sqlite3`). Cloudflare Tunnels provide a secure HTTPS endpoint directly over Cloudflare's edge network without altering server architecture or database logic.

---

## ⚡ Option A: Quick Free HTTPS Link (Temporary / Immediate)

You can generate a free `https://<random>.trycloudflare.com` URL in seconds.

### 1. Install `cloudflared`

#### On Windows (via PowerShell / Command Prompt):
```powershell
winget install --id Cloudflare.cloudflared
```

#### On Ubuntu / Debian (AWS EC2):
```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

### 2. Start the Tunnel

Ensure your MindCare AI server is running on port 3000 (`npm run dev` or Docker container on port 3000):

```bash
# Run quick tunnel locally or on EC2
cloudflared tunnel --url http://localhost:3000
```
Or use the npm shortcut:
```bash
npm run tunnel
```

### 3. Access your Live Cloudflare URL
Cloudflare will output a public URL in the terminal:
```text
+-----------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                 |
|  https://mindcareai.trycloudflare.com                                       |
+-----------------------------------------------------------------------------------+
```

---

## 🌐 Option B: Permanent Custom Cloudflare Domain (e.g. `mindcare.yourdomain.com`)

If you own a domain managed in Cloudflare Dashboard, follow these steps to bind a permanent subdomain to your server.

### Step 1: Authenticate `cloudflared`
Run in terminal:
```bash
cloudflared tunnel login
```
This opens your browser. Select your Cloudflare domain zone to authorize.

### Step 2: Create a Named Tunnel
```bash
cloudflared tunnel create mindcare-tunnel
```
Save the generated **Tunnel ID** (e.g., `a1b2c3d4-5678-90ab-cdef-1234567890ab`).

### Step 3: Route your Subdomain to the Tunnel
```bash
cloudflared tunnel route dns mindcare-tunnel mindcare.yourdomain.com
```
*(Replace `mindcare.yourdomain.com` with your actual domain or subdomain).*

### Step 4: Create Configuration File (`config.yml`)
Create a file named `config.yml` in your `cloudflared` directory (or `/etc/cloudflared/config.yml` on Linux):

```yaml
tunnel: a1b2c3d4-5678-90ab-cdef-1234567890ab
credentials-file: /path/to/a1b2c3d4-5678-90ab-cdef-1234567890ab.json

ingress:
  - hostname: mindcare.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

### Step 5: Run as a Persistent System Service

#### On AWS EC2 (Systemd Service):
```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

#### On Windows Service:
```powershell
cloudflared service install
```

---

## 🔒 Security & OAuth Notes for Cloudflare URLs

When accessing MindCare AI via a Cloudflare domain (e.g. `https://mindcare.yourdomain.com`):
1. **OAuth Callbacks (YouTube/Reddit/GitHub):** Update your `.env` and OAuth App Developer Dashboards to include the new Cloudflare HTTPS callback URLs:
   ```env
   YOUTUBE_OAUTH_REDIRECT_URI=https://mindcare.yourdomain.com/api/auth/youtube/callback
   REDDIT_REDIRECT_URI=https://mindcare.yourdomain.com/api/auth/reddit/callback
   ```
2. **Camera & Microphone Permissions:** Browsers grant full hardware permissions automatically over Cloudflare HTTPS.

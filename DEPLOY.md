# Deploy "El Presidente" Card Game to Ionos VPS

## Prerequisites

- Ionos VPS with Ubuntu 20.04+ 
- SSH access to the server
- Domain pointing to your VPS IP (optional)

---

## 1. Server Setup

### Connect to your VPS
```bash
ssh root@your-vps-ip
```

### Update system
```bash
apt update && apt upgrade -y
```

### Install Node.js (v20+)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### Install Git (if not installed)
```bash
apt install -y git
```

---

## 2. Deploy the Application

### Clone the repository
```bash
cd /var/www
git clone https://github.com/your-username/presidente-cardgame.git
cd presidente-cardgame
```

### Install dependencies

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### Build frontend
```bash
cd frontend
npm run build
cd ..
```

---

## 3. Configure Firewall

```bash
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 8081  # Game server
ufw enable
```

---

## 4. Set Up Process Manager (PM2)

### Install PM2
```bash
npm install -g pm2
```

### Start the backend server
```bash
cd /var/www/presidente-cardgame/backend
pm2 start index.js --name presidente-backend
```

### Configure PM2 to start on boot
```bash
pm2 startup
pm2 save
```

---

## 5. Configure Nginx (Reverse Proxy for Frontend)

### Install Nginx
```bash
apt install -y nginx
```

### Create Nginx config
```bash
nano /etc/nginx/sites-available/presidente
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (built React app)
    location / {
        root /var/www/presidente-cardgame/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Redirect socket.io to backend
    location /socket.io/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Enable the site
```bash
ln -s /etc/nginx/sites-available/presidente /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 6. SSL Certificate (Let's Encrypt)

### Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### Get certificate
```bash
certbot --nginx -d your-domain.com
```

Follow the prompts. Certbot will automatically configure HTTPS.

---

## 7. Verify Deployment

### Check PM2 status
```bash
pm2 status
```

### Check logs
```bash
pm2 logs presidente-backend
```

### Test your site
Visit: `http://your-domain.com`

---

## 8. Update Deployment

When you push changes to GitHub:

```bash
cd /var/www/presidente-cardgame
git pull

# Rebuild frontend
cd frontend
npm run build
cd ..

# Restart backend
pm2 restart presidente-backend
```

---

## Quick Commands Reference

| Action | Command |
|--------|---------|
| View backend logs | `pm2 logs presidente-backend` |
| Restart backend | `pm2 restart presidente-backend` |
| Stop backend | `pm2 stop presidente-backend` |
| Check backend status | `pm2 status` |
| Reload Nginx | `nginx -s reload` |
| View Nginx logs | `tail -f /var/log/nginx/access.log` |

---

## Troubleshooting

### Backend won't start
Check port 8081 is not in use:
```bash
lsof -i :8081
```

### Socket.io not connecting
- Ensure Nginx config has the socket.io proxy
- Check firewall: `ufw status`
- Check PM2 logs: `pm2 logs presidente-backend`

### Frontend not loading
- Check Nginx: `nginx -t`
- Verify dist folder exists: `ls frontend/dist`

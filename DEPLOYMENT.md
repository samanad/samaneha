# SecureLicense Pro - Complete Deployment Guide

## 🚀 Quick Start (5 minutes)

### 1. Upload Files
```bash
# Upload all files to your server
scp -r . user@yourserver.com:/path/to/licensing-system/
```

### 2. Install & Run
```bash
# SSH to your server
ssh user@yourserver.com

# Navigate to project directory
cd /path/to/licensing-system/

# Make startup script executable
chmod +x start.sh

# Run the startup script
./start.sh
```

## 📋 Complete Deployment Checklist

### ✅ Prerequisites
- [ ] Server with Node.js 14+ installed
- [ ] Server with npm installed
- [ ] Port 3000 available (or configure different port)
- [ ] Firewall configured to allow traffic

### ✅ File Upload
- [ ] `server.js` - Main server file
- [ ] `package.json` - Dependencies
- [ ] `public/` folder with all frontend files
- [ ] `admin-setup.js` - Sample data setup
- [ ] `start.sh` - Startup script
- [ ] `ecosystem.config.js` - PM2 configuration

### ✅ Installation
- [ ] Run `npm install` to install dependencies
- [ ] Run `node admin-setup.js` to create sample data
- [ ] Test with `npm start`

### ✅ Production Setup (Recommended)
- [ ] Install PM2: `npm install -g pm2`
- [ ] Create logs directory: `mkdir logs`
- [ ] Start with PM2: `pm2 start ecosystem.config.js --env production`
- [ ] Save PM2 configuration: `pm2 save`
- [ ] Set PM2 to start on boot: `pm2 startup`

### ✅ Reverse Proxy (Optional but Recommended)
```nginx
# Nginx configuration
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### ✅ SSL Certificate (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Configuration Options

### Environment Variables
Create `.env` file:
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=production
```

### Database Configuration
- **Default**: SQLite (good for small to medium deployments)
- **Production**: PostgreSQL/MySQL (for high-traffic scenarios)

### Port Configuration
- **Default**: 3000
- **Custom**: Set PORT environment variable or modify server.js

## 📊 Monitoring & Maintenance

### PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs SecureLicense-Pro

# Restart application
pm2 restart SecureLicense-Pro

# Stop application
pm2 stop SecureLicense-Pro

# Delete application
pm2 delete SecureLicense-Pro
```

### Log Files
- Application logs: `./logs/`
- PM2 logs: `pm2 logs`
- System logs: `/var/log/`

### Performance Monitoring
- Monitor memory usage: `pm2 monit`
- Check system resources: `htop` or `top`
- Database size: Check `licenses.db` file size

## 🧪 Testing After Deployment

### 1. Basic Functionality
- [ ] Access main page: `http://yourserver.com`
- [ ] Test license verification tab
- [ ] Test support request form
- [ ] Test about page

### 2. License Verification
Test these sample keys:
- `DEMO-1234-5678-9ABC` ✅ Should work
- `TEST-9876-5432-1DEF` ✅ Should work
- `EXPIRED-1111-2222-3333` ❌ Should show expired
- `INVALID-KEY` ❌ Should show invalid

### 3. Support System
- [ ] Submit a test support request
- [ ] Verify request is stored in database
- [ ] Check email notifications (if configured)

### 4. API Endpoints
```bash
# Test license verification
curl -X POST http://yourserver.com/api/verify-license \
  -H "Content-Type: application/json" \
  -d '{"license_key": "DEMO-1234-5678-9ABC"}'

# Test support request
curl -X POST http://yourserver.com/api/support-request \
  -H "Content-Type: application/json" \
  -d '{"company_name": "Test Corp", "contact_name": "John Doe", "contact_email": "john@test.com", "issue_description": "Test issue"}'

# Get statistics
curl http://yourserver.com/api/stats
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 3000
sudo netstat -tulpn | grep :3000

# Kill process if needed
sudo kill -9 <PID>
```

#### Permission Denied
```bash
# Fix file permissions
chmod +x start.sh
chmod 755 public/
```

#### Database Issues
```bash
# Remove and recreate database
rm licenses.db
node admin-setup.js
```

#### PM2 Issues
```bash
# Reset PM2
pm2 kill
pm2 start ecosystem.config.js --env production
```

### Log Analysis
```bash
# View real-time logs
pm2 logs SecureLicense-Pro --lines 100

# View error logs
pm2 logs SecureLicense-Pro --err --lines 50
```

## 🔒 Security Considerations

### Production Security
- [ ] Change default JWT secret
- [ ] Use HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor access logs

### Rate Limiting
- Current: 100 requests per 15 minutes per IP
- Adjust in `server.js` if needed

### Database Security
- SQLite file permissions
- Regular backups
- Access control

## 📈 Scaling Considerations

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize Node.js settings
- Use PM2 cluster mode

### Horizontal Scaling
- Load balancer setup
- Multiple server instances
- Database clustering

### Performance Optimization
- Enable gzip compression
- Use CDN for static assets
- Database query optimization

## 📞 Support

### Getting Help
- Check logs for error messages
- Verify configuration files
- Test with sample data
- Review this deployment guide

### Maintenance Tasks
- [ ] Regular log rotation
- [ ] Database backups
- [ ] Security updates
- [ ] Performance monitoring

---

**🎉 Your SecureLicense Pro system is now ready for production use!**

# SecureLicense Pro - Deployment Guide

## Quick Deployment Steps

### 1. Upload Files to Your Server
Upload all files to your server directory, maintaining this structure:
```
licensing-system/
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
├── public/                # Frontend assets
│   ├── index.html        # Main application page
│   ├── styles.css        # Application styling
│   └── script.js         # Frontend JavaScript
├── admin-setup.js         # Admin script for sample data
└── README.md             # Documentation
```

### 2. Install Dependencies
On your server, run:
```bash
npm install
```

### 3. Set Up Sample Data (Optional)
```bash
node admin-setup.js
```

### 4. Start the Server
```bash
npm start
```

### 5. Access the Application
Open your browser and navigate to your server URL (e.g., `http://yourserver.com`)

## Environment Variables (Optional)
Create a `.env` file on your server:
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=production
```

## Production Considerations
- Use a process manager like PM2: `npm install -g pm2 && pm2 start server.js`
- Set up a reverse proxy (nginx/Apache) for SSL termination
- Configure your firewall to allow traffic on port 3000
- Consider using a production database (PostgreSQL/MySQL) instead of SQLite

## Testing the System
Once deployed, test with these sample license keys:
- `DEMO-1234-5678-9ABC` (Enterprise)
- `TEST-9876-5432-1DEF` (Professional)  
- `SAMPLE-ABCD-EFGH-IJKL` (Standard)
- `EXPIRED-1111-2222-3333` (Expired - for testing expired behavior)

## Support
The system includes a professional support form for companies to submit support requests, which will be stored in the database for your team to review and respond to.

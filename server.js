const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database setup
const db = new sqlite3.Database('./licenses.db');

// Initialize database tables
db.serialize(() => {
  // Licenses table
  db.run(`CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY,
    license_key TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    license_type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    last_verified DATETIME,
    verification_count INTEGER DEFAULT 0
  )`);

  // Support requests table
  db.run(`CREATE TABLE IF NOT EXISTS support_requests (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    issue_description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_to TEXT,
    notes TEXT
  )`);

  // Verification logs table
  db.run(`CREATE TABLE IF NOT EXISTS verification_logs (
    id TEXT PRIMARY KEY,
    license_key TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    verification_result TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Routes

// License verification endpoint
app.post('/api/verify-license', async (req, res) => {
  try {
    const { license_key } = req.body;
    
    if (!license_key) {
      return res.status(400).json({ 
        success: false, 
        message: 'License key is required' 
      });
    }

    // Check if license exists and is active
    db.get(
      'SELECT * FROM licenses WHERE license_key = ? AND status = "active"',
      [license_key],
      (err, license) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
          });
        }

        if (!license) {
          // Log failed verification
          const logId = uuidv4();
          db.run(
            'INSERT INTO verification_logs (id, license_key, ip_address, user_agent, verification_result) VALUES (?, ?, ?, ?, ?)',
            [logId, license_key, req.ip, req.get('User-Agent'), 'invalid']
          );

          return res.status(404).json({ 
            success: false, 
            message: 'Invalid or expired license key' 
          });
        }

        // Check if license is expired
        if (license.expires_at && new Date(license.expires_at) < new Date()) {
          // Log expired verification
          const logId = uuidv4();
          db.run(
            'INSERT INTO verification_logs (id, license_key, ip_address, user_agent, verification_result) VALUES (?, ?, ?, ?, ?)',
            [logId, license_key, req.ip, req.get('User-Agent'), 'expired']
          );

          return res.status(403).json({ 
            success: false, 
            message: 'License has expired' 
          });
        }

        // Update verification count and last verified
        db.run(
          'UPDATE licenses SET verification_count = verification_count + 1, last_verified = CURRENT_TIMESTAMP WHERE id = ?',
          [license.id]
        );

        // Log successful verification
        const logId = uuidv4();
        db.run(
          'INSERT INTO verification_logs (id, license_key, ip_address, user_agent, verification_result) VALUES (?, ?, ?, ?, ?)',
          [logId, license_key, req.ip, req.get('User-Agent'), 'valid']
        );

        res.json({
          success: true,
          message: 'Company license verified successfully - This company is legitimate and licensed',
          license: {
            company_name: license.company_name,
            license_type: license.license_type,
            expires_at: license.expires_at,
            verification_count: license.verification_count + 1
          }
        });
      }
    );
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Company verification endpoint (by company name)
app.post('/api/verify-company', async (req, res) => {
  try {
    const { company_name } = req.body;
    
    if (!company_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company name is required' 
      });
    }

    // Check if company exists and is licensed
    db.get(
      'SELECT * FROM licenses WHERE company_name LIKE ? AND status = "active"',
      [`%${company_name}%`],
      (err, license) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
          });
        }

        if (!license) {
          // Log unlicensed company verification
          const logId = uuidv4();
          db.run(
            'INSERT INTO verification_logs (id, license_key, ip_address, user_agent, verification_result) VALUES (?, ?, ?, ?, ?)',
            [logId, 'UNLICENSED', req.ip, req.get('User-Agent'), 'unlicensed']
          );

          return res.status(404).json({ 
            success: false, 
            message: 'Company is not licensed on our platform - proceed with caution!' 
          });
        }

        // Check if license is expired
        if (license.expires_at && new Date(license.expires_at) < new Date()) {
          // Log expired verification
          const logId = uuidv4();
          db.run(
            'INSERT INTO verification_logs (id, license_key, ip_address, user_agent, verification_result) VALUES (?, ?, ?, ?, ?)',
            [logId, license.license_key, req.ip, req.get('User-Agent'), 'expired']
          );

          return res.status(403).json({ 
            success: false, 
            message: 'Company license has expired - status uncertain' 
          });
        }

        // Update verification count and last verified
        db.run(
          'UPDATE licenses SET verification_count = verification_count + 1, last_verified = CURRENT_TIMESTAMP WHERE id = ?',
          [license.id]
        );

        // Log successful verification
        const logId = uuidv4();
        db.run(
          'INSERT INTO verification_logs (id, license_key, ip_address, user_agent, verification_result) VALUES (?, ?, ?, ?, ?)',
          [logId, license.license_key, req.ip, req.get('User-Agent'), 'valid']
        );

        res.json({
          success: true,
          message: 'Company verified successfully - This company is legitimate and licensed',
          company: {
            company_name: license.company_name,
            license_type: license.license_type,
            expires_at: license.expires_at,
            verification_count: license.verification_count + 1
          }
        });
      }
    );
  } catch (error) {
    console.error('Company verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get all licensed companies
app.get('/api/companies', (req, res) => {
  try {
    db.all(
      'SELECT company_name, license_type, status, expires_at, verification_count FROM licenses WHERE status = "active" ORDER BY company_name',
      (err, companies) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch companies' 
          });
        }

        res.json({
          success: true,
          companies: companies
        });
      }
    );
  } catch (error) {
    console.error('Companies fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Support request endpoint
app.post('/api/support-request', async (req, res) => {
  try {
    const {
      company_name,
      contact_name,
      contact_email,
      contact_phone,
      business_type,
      license_reason
    } = req.body;

    if (!company_name || !contact_name || !contact_email || !license_reason) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    const supportId = uuidv4();
    
    db.run(
      `INSERT INTO support_requests 
       (id, company_name, contact_name, contact_email, contact_phone, issue_description, priority) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [supportId, company_name, contact_name, contact_email, contact_phone, license_reason, 'high'],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to submit licensing request'
          });
        }

        res.json({
          success: true,
          message: 'Licensing request submitted successfully',
          request_id: supportId
        });
      }
    );
  } catch (error) {
    console.error('Support request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get license statistics (for admin dashboard)
app.get('/api/stats', (req, res) => {
  try {
    db.get('SELECT COUNT(*) as total_licenses FROM licenses WHERE status = "active"', (err, licenses) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      db.get('SELECT COUNT(*) as total_support_requests FROM support_requests', (err, support) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        db.get('SELECT COUNT(*) as total_verifications FROM verification_logs', (err, verifications) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
          }

          res.json({
            success: true,
            stats: {
              total_licenses: licenses.total_licenses,
              total_support_requests: support.total_support_requests,
              total_verifications: verifications.total_verifications
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`LicenseVerify Pro server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the application`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

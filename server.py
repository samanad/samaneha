#!/usr/bin/env python3
"""
SecureLicense Pro - Professional Licensing System
Python Flask Alternative Server
"""

from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
import sqlite3
import uuid
import datetime
import os
import json
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
CORS(app)

# Configuration
PORT = int(os.environ.get('PORT', 3000))
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

# Database setup
def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect('licenses.db')
    cursor = conn.cursor()
    
    # Create licenses table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS licenses (
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
        )
    ''')
    
    # Create support requests table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS support_requests (
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
        )
    ''')
    
    # Create verification logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS verification_logs (
            id TEXT PRIMARY KEY,
            license_key TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            verification_result TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db():
    """Get database connection"""
    conn = sqlite3.connect('licenses.db')
    conn.row_factory = sqlite3.Row
    return conn

# Routes
@app.route('/')
def index():
    """Serve the main application"""
    return send_from_directory('public', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('public', filename)

@app.route('/api/verify-license', methods=['POST'])
def verify_license():
    """Verify a license key"""
    try:
        data = request.get_json()
        license_key = data.get('license_key')
        
        if not license_key:
            return jsonify({
                'success': False,
                'message': 'License key is required'
            }), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if license exists and is active
        cursor.execute('''
            SELECT * FROM licenses 
            WHERE license_key = ? AND status = 'active'
        ''', (license_key,))
        
        license_data = cursor.fetchone()
        
        if not license_data:
            # Log failed verification
            log_verification(license_key, request.remote_addr, 
                           request.headers.get('User-Agent'), 'invalid')
            
            return jsonify({
                'success': False,
                'message': 'Invalid or expired license key'
            }), 404
        
        # Check if license is expired
        if license_data['expires_at']:
            expires_at = datetime.datetime.fromisoformat(license_data['expires_at'])
            if expires_at < datetime.datetime.now():
                # Log expired verification
                log_verification(license_key, request.remote_addr,
                               request.headers.get('User-Agent'), 'expired')
                
                return jsonify({
                    'success': False,
                    'message': 'License has expired'
                }), 403
        
        # Update verification count and last verified
        cursor.execute('''
            UPDATE licenses 
            SET verification_count = verification_count + 1, 
                last_verified = CURRENT_TIMESTAMP 
            WHERE id = ?
        ''', (license_data['id'],))
        
        # Log successful verification
        log_verification(license_key, request.remote_addr,
                        request.headers.get('User-Agent'), 'valid')
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'License verified successfully',
            'license': {
                'company_name': license_data['company_name'],
                'license_type': license_data['license_type'],
                'expires_at': license_data['expires_at'],
                'verification_count': license_data['verification_count'] + 1
            }
        })
        
    except Exception as e:
        print(f"Verification error: {e}")
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500

@app.route('/api/support-request', methods=['POST'])
def support_request():
    """Submit a support request"""
    try:
        data = request.get_json()
        
        required_fields = ['company_name', 'contact_name', 'contact_email', 'issue_description']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Required field missing: {field}'
                }), 400
        
        support_id = str(uuid.uuid4())
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO support_requests 
            (id, company_name, contact_name, contact_email, contact_phone, issue_description, priority) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            support_id,
            data['company_name'],
            data['contact_name'],
            data['contact_email'],
            data.get('contact_phone', ''),
            data['issue_description'],
            data.get('priority', 'medium')
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Support request submitted successfully',
            'request_id': support_id
        })
        
    except Exception as e:
        print(f"Support request error: {e}")
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get system statistics"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get license count
        cursor.execute('SELECT COUNT(*) as total FROM licenses')
        total_licenses = cursor.fetchone()['total']
        
        # Get support request count
        cursor.execute('SELECT COUNT(*) as total FROM support_requests')
        total_support = cursor.fetchone()['total']
        
        # Get verification count
        cursor.execute('SELECT COUNT(*) as total FROM verification_logs')
        total_verifications = cursor.fetchone()['total']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_licenses': total_licenses,
                'total_support_requests': total_support,
                'total_verifications': total_verifications
            }
        })
        
    except Exception as e:
        print(f"Stats error: {e}")
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500

def log_verification(license_key, ip_address, user_agent, result):
    """Log verification attempt"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO verification_logs 
            (id, license_key, ip_address, user_agent, verification_result) 
            VALUES (?, ?, ?, ?, ?)
        ''', (str(uuid.uuid4()), license_key, ip_address, user_agent, result))
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Logging error: {e}")

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

if __name__ == '__main__':
    print("🔧 Initializing SecureLicense Pro...")
    init_db()
    print("✅ Database initialized successfully")
    print(f"🚀 Starting server on port {PORT}")
    print(f"📱 Open http://localhost:{PORT} to access the application")
    
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)

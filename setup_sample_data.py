#!/usr/bin/env python3
"""
Setup script for SecureLicense Pro sample data
"""

import sqlite3
import uuid
import datetime

def setup_sample_data():
    """Set up sample licenses and support requests"""
    print("🔧 Setting up sample data for SecureLicense Pro...\n")
    
    # Connect to database
    conn = sqlite3.connect('licenses.db')
    cursor = conn.cursor()
    
    # Sample license data
    sample_licenses = [
        {
            'id': str(uuid.uuid4()),
            'license_key': 'DEMO-1234-5678-9ABC',
            'company_name': 'Demo Corporation',
            'contact_email': 'admin@democorp.com',
            'contact_phone': '+1-555-0101',
            'license_type': 'Enterprise',
            'status': 'active',
            'expires_at': '2025-12-31 23:59:59'
        },
        {
            'id': str(uuid.uuid4()),
            'license_key': 'TEST-9876-5432-1DEF',
            'company_name': 'Test Industries',
            'contact_email': 'support@testindustries.com',
            'contact_phone': '+1-555-0202',
            'license_type': 'Professional',
            'status': 'active',
            'expires_at': '2025-06-30 23:59:59'
        },
        {
            'id': str(uuid.uuid4()),
            'license_key': 'SAMPLE-ABCD-EFGH-IJKL',
            'company_name': 'Sample Solutions',
            'contact_email': 'info@samplesolutions.com',
            'contact_phone': '+1-555-0303',
            'license_type': 'Standard',
            'status': 'active',
            'expires_at': '2024-12-31 23:59:59'
        },
        {
            'id': str(uuid.uuid4()),
            'license_key': 'EXPIRED-1111-2222-3333',
            'company_name': 'Expired Company',
            'contact_email': 'admin@expired.com',
            'contact_phone': '+1-555-0404',
            'license_type': 'Basic',
            'status': 'active',
            'expires_at': '2023-01-01 00:00:00'
        },
        {
            'id': str(uuid.uuid4()),
            'license_key': 'INACTIVE-4444-5555-6666',
            'company_name': 'Inactive Corp',
            'contact_email': 'info@inactive.com',
            'contact_phone': '+1-555-0505',
            'license_type': 'Professional',
            'status': 'inactive',
            'expires_at': '2025-12-31 23:59:59'
        }
    ]
    
    # Sample support requests
    sample_support_requests = [
        {
            'id': str(uuid.uuid4()),
            'company_name': 'Demo Corporation',
            'contact_name': 'John Smith',
            'contact_email': 'john.smith@democorp.com',
            'contact_phone': '+1-555-0101',
            'issue_description': 'Need assistance with license renewal process and understanding the new features in the latest version.',
            'priority': 'high',
            'status': 'open'
        },
        {
            'id': str(uuid.uuid4()),
            'company_name': 'Test Industries',
            'contact_name': 'Sarah Johnson',
            'contact_email': 'sarah.johnson@testindustries.com',
            'contact_phone': '+1-555-0202',
            'issue_description': 'Experiencing technical difficulties with license verification API integration.',
            'priority': 'critical',
            'status': 'open'
        },
        {
            'id': str(uuid.uuid4()),
            'company_name': 'Sample Solutions',
            'contact_name': 'Mike Davis',
            'contact_email': 'mike.davis@samplesolutions.com',
            'contact_phone': '+1-555-0303',
            'issue_description': 'Requesting information about enterprise licensing options and volume discounts.',
            'priority': 'medium',
            'status': 'open'
        }
    ]
    
    # Insert sample licenses
    print("📝 Inserting sample licenses...")
    for license_data in sample_licenses:
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO licenses 
                (id, license_key, company_name, contact_email, contact_phone, license_type, status, expires_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                license_data['id'],
                license_data['license_key'],
                license_data['company_name'],
                license_data['contact_email'],
                license_data['contact_phone'],
                license_data['license_type'],
                license_data['status'],
                license_data['expires_at']
            ))
            print(f"✅ Added license: {license_data['license_key']} for {license_data['company_name']}")
        except Exception as e:
            print(f"❌ Error inserting license {license_data['license_key']}: {e}")
    
    # Insert sample support requests
    print("\n📋 Inserting sample support requests...")
    for request_data in sample_support_requests:
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO support_requests 
                (id, company_name, contact_name, contact_email, contact_phone, issue_description, priority, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                request_data['id'],
                request_data['company_name'],
                request_data['contact_name'],
                request_data['contact_email'],
                request_data['contact_phone'],
                request_data['issue_description'],
                request_data['priority'],
                request_data['status']
            ))
            print(f"✅ Added support request: {request_data['company_name']} - {request_data['priority']} priority")
        except Exception as e:
            print(f"❌ Error inserting support request for {request_data['company_name']}: {e}")
    
    # Commit changes
    conn.commit()
    
    # Display current database contents
    print("\n📊 Current Database Contents:")
    print("=" * 50)
    
    # Display licenses
    cursor.execute('SELECT license_key, company_name, license_type, status, expires_at FROM licenses')
    licenses = cursor.fetchall()
    
    print("\n🔑 Licenses:")
    for license_row in licenses:
        status_icon = "🟢" if license_row[3] == 'active' else "🔴"
        expires_at = datetime.datetime.fromisoformat(license_row[4]) if license_row[4] else None
        expired = " (EXPIRED)" if expires_at and expires_at < datetime.datetime.now() else ""
        print(f"  {status_icon} {license_row[0]} - {license_row[1]} ({license_row[2]}){expired}")
    
    # Display support requests
    cursor.execute('SELECT company_name, priority, status FROM support_requests')
    requests = cursor.fetchall()
    
    print("\n📋 Support Requests:")
    priority_icons = {
        'low': '🟢',
        'medium': '🟡',
        'high': '🟠',
        'critical': '🔴'
    }
    
    for request_row in requests:
        priority_icon = priority_icons.get(request_row[1], '⚪')
        status_icon = "📝" if request_row[2] == 'open' else "✅"
        print(f"  {priority_icon} {status_icon} {request_row[0]} - {request_row[1]} priority")
    
    conn.close()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📱 You can now test the system:")
    print("  1. Start the server: python3 server.py")
    print("  2. Open http://localhost:3000")
    print("  3. Try verifying these license keys:")
    
    active_licenses = [l for l in sample_licenses if l['status'] == 'active']
    for license_data in active_licenses:
        print(f"     - {license_data['license_key']}")
    
    print("\n⚠️  Note: The expired license will show as expired when verified.")

if __name__ == "__main__":
    setup_sample_data()

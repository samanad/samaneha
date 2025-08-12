const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

// Create database connection
const db = new sqlite3.Database('./licenses.db');

console.log('🔧 Setting up sample data for SecureLicense Pro...\n');

// Sample license data
const sampleLicenses = [
    {
        id: uuidv4(),
        license_key: 'DEMO-1234-5678-9ABC',
        company_name: 'Demo Corporation',
        contact_email: 'admin@democorp.com',
        contact_phone: '+1-555-0101',
        license_type: 'Enterprise',
        status: 'active',
        expires_at: '2025-12-31 23:59:59'
    },
    {
        id: uuidv4(),
        license_key: 'TEST-9876-5432-1DEF',
        company_name: 'Test Industries',
        contact_email: 'support@testindustries.com',
        contact_phone: '+1-555-0202',
        license_type: 'Professional',
        status: 'active',
        expires_at: '2025-06-30 23:59:59'
    },
    {
        id: uuidv4(),
        license_key: 'SAMPLE-ABCD-EFGH-IJKL',
        company_name: 'Sample Solutions',
        contact_email: 'info@samplesolutions.com',
        contact_phone: '+1-555-0303',
        license_type: 'Standard',
        status: 'active',
        expires_at: '2024-12-31 23:59:59'
    },
    {
        id: uuidv4(),
        license_key: 'EXPIRED-1111-2222-3333',
        company_name: 'Expired Company',
        contact_email: 'admin@expired.com',
        contact_phone: '+1-555-0404',
        license_type: 'Basic',
        status: 'active',
        expires_at: '2023-01-01 00:00:00'
    },
    {
        id: uuidv4(),
        license_key: 'INACTIVE-4444-5555-6666',
        company_name: 'Inactive Corp',
        contact_email: 'info@inactive.com',
        contact_phone: '+1-555-0505',
        license_type: 'Professional',
        status: 'inactive',
        expires_at: '2025-12-31 23:59:59'
    }
];

// Sample support requests
const sampleSupportRequests = [
    {
        id: uuidv4(),
        company_name: 'Demo Corporation',
        contact_name: 'John Smith',
        contact_email: 'john.smith@democorp.com',
        contact_phone: '+1-555-0101',
        issue_description: 'Need assistance with license renewal process and understanding the new features in the latest version.',
        priority: 'high',
        status: 'open'
    },
    {
        id: uuidv4(),
        company_name: 'Test Industries',
        contact_name: 'Sarah Johnson',
        contact_email: 'sarah.johnson@testindustries.com',
        contact_phone: '+1-555-0202',
        issue_description: 'Experiencing technical difficulties with license verification API integration.',
        priority: 'critical',
        status: 'open'
    },
    {
        id: uuidv4(),
        company_name: 'Sample Solutions',
        contact_name: 'Mike Davis',
        contact_email: 'mike.davis@samplesolutions.com',
        contact_phone: '+1-555-0303',
        issue_description: 'Requesting information about enterprise licensing options and volume discounts.',
        priority: 'medium',
        status: 'open'
    }
];

// Function to insert sample licenses
function insertSampleLicenses() {
    return new Promise((resolve, reject) => {
        console.log('📝 Inserting sample licenses...');
        
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO licenses 
            (id, license_key, company_name, contact_email, contact_phone, license_type, status, expires_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        let completed = 0;
        const total = sampleLicenses.length;
        
        sampleLicenses.forEach(license => {
            stmt.run([
                license.id,
                license.license_key,
                license.company_name,
                license.contact_email,
                license.contact_phone,
                license.license_type,
                license.status,
                license.expires_at
            ], function(err) {
                if (err) {
                    console.error(`❌ Error inserting license ${license.license_key}:`, err.message);
                } else {
                    console.log(`✅ Added license: ${license.license_key} for ${license.company_name}`);
                }
                
                completed++;
                if (completed === total) {
                    stmt.finalize();
                    resolve();
                }
            });
        });
    });
}

// Function to insert sample support requests
function insertSampleSupportRequests() {
    return new Promise((resolve, reject) => {
        console.log('\n📋 Inserting sample support requests...');
        
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO support_requests 
            (id, company_name, contact_name, contact_email, contact_phone, issue_description, priority, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        let completed = 0;
        const total = sampleSupportRequests.length;
        
        sampleSupportRequests.forEach(request => {
            stmt.run([
                request.id,
                request.company_name,
                request.contact_name,
                request.contact_email,
                request.contact_phone,
                request.issue_description,
                request.priority,
                request.status
            ], function(err) {
                if (err) {
                    console.error(`❌ Error inserting support request for ${request.company_name}:`, err.message);
                } else {
                    console.log(`✅ Added support request: ${request.company_name} - ${request.priority} priority`);
                }
                
                completed++;
                if (completed === total) {
                    stmt.finalize();
                    resolve();
                }
            });
        });
    });
}

// Function to display current database contents
function displayDatabaseContents() {
    return new Promise((resolve, reject) => {
        console.log('\n📊 Current Database Contents:');
        console.log('=' .repeat(50));
        
        // Display licenses
        db.all('SELECT license_key, company_name, license_type, status, expires_at FROM licenses', (err, licenses) => {
            if (err) {
                console.error('❌ Error fetching licenses:', err.message);
            } else {
                console.log('\n🔑 Licenses:');
                licenses.forEach(license => {
                    const status = license.status === 'active' ? '🟢' : '🔴';
                    const expired = new Date(license.expires_at) < new Date() ? ' (EXPIRED)' : '';
                    console.log(`  ${status} ${license.license_key} - ${license.company_name} (${license.license_type})${expired}`);
                });
            }
            
            // Display support requests
            db.all('SELECT company_name, priority, status FROM support_requests', (err, requests) => {
                if (err) {
                    console.error('❌ Error fetching support requests:', err.message);
                } else {
                    console.log('\n📋 Support Requests:');
                    requests.forEach(request => {
                        const priorityIcon = {
                            'low': '🟢',
                            'medium': '🟡',
                            'high': '🟠',
                            'critical': '🔴'
                        }[request.priority] || '⚪';
                        
                        const statusIcon = request.status === 'open' ? '📝' : '✅';
                        console.log(`  ${priorityIcon} ${statusIcon} ${request.company_name} - ${request.priority} priority`);
                    });
                }
                
                resolve();
            });
        });
    });
}

// Main setup function
async function setupSampleData() {
    try {
        // Insert sample data
        await insertSampleLicenses();
        await insertSampleSupportRequests();
        
        // Display current contents
        await displayDatabaseContents();
        
        console.log('\n🎉 Setup completed successfully!');
        console.log('\n📱 You can now test the system:');
        console.log('  1. Start the server: npm start');
        console.log('  2. Open http://localhost:3000');
        console.log('  3. Try verifying these license keys:');
        sampleLicenses.filter(l => l.status === 'active').forEach(license => {
            console.log(`     - ${license.license_key}`);
        });
        console.log('\n⚠️  Note: The expired license will show as expired when verified.');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        db.close();
    }
}

// Run the setup
setupSampleData();

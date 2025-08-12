// Tab Navigation
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and tabs
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and target tab
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Load specific content for certain tabs
            if (targetTab === 'companies') {
                loadLicensedCompanies();
            }
        });
    });

    // Support form submission
    const supportForm = document.getElementById('support-form');
    if (supportForm) {
        supportForm.addEventListener('submit', handleSupportSubmit);
    }

    // Load initial data
    loadCompanyStats();
});

// Company Verification Function
async function verifyCompany() {
    const companyName = document.getElementById('company-name').value.trim();
    const licenseKey = document.getElementById('license-key').value.trim();
    const resultDiv = document.getElementById('verification-result');
    
    if (!companyName && !licenseKey) {
        showError('Please enter either a company name or license key to verify');
        return;
    }

    showLoading(true);
    
    try {
        let endpoint = '/api/verify-license';
        let requestBody = {};
        
        if (licenseKey) {
            requestBody.license_key = licenseKey;
        } else {
            endpoint = '/api/verify-company';
            requestBody.company_name = companyName;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        if (data.success) {
            showVerificationResult('success', data.message, data.company || data.license);
        } else {
            if (response.status === 403) {
                showVerificationResult('expired', 'Company license has expired', null);
            } else if (response.status === 404) {
                showVerificationResult('unlicensed', 'Company is not licensed - proceed with caution!', null);
            } else {
                showVerificationResult('error', data.message, null);
            }
        }
    } catch (error) {
        console.error('Verification error:', error);
        showVerificationResult('error', 'Network error. Please try again.', null);
    } finally {
        showLoading(false);
    }
}

// Show Verification Result
function showVerificationResult(type, message, companyData) {
    const resultDiv = document.getElementById('verification-result');
    
    let resultClass = '';
    let icon = '';
    let title = '';
    let warningClass = '';
    
    switch (type) {
        case 'success':
            resultClass = 'result-success';
            icon = 'fas fa-check-circle';
            title = 'Company Verified - Licensed & Legitimate';
            break;
        case 'error':
            resultClass = 'result-error';
            icon = 'fas fa-times-circle';
            title = 'Verification Failed';
            break;
        case 'expired':
            resultClass = 'result-expired';
            icon = 'fas fa-exclamation-triangle';
            title = 'License Expired - Company Status Uncertain';
            break;
        case 'unlicensed':
            resultClass = 'result-unlicensed';
            icon = 'fas fa-exclamation-triangle';
            title = 'Company Not Licensed - Proceed with Caution!';
            warningClass = 'warning-highlight';
            break;
    }
    
    let detailsHTML = '';
    if (companyData && type === 'success') {
        detailsHTML = `
            <div class="result-details">
                <div class="result-item">
                    <strong>Company Name</strong>
                    ${companyData.company_name}
                </div>
                <div class="result-item">
                    <strong>License Type</strong>
                    ${companyData.license_type}
                </div>
                <div class="result-item">
                    <strong>Verification Count</strong>
                    ${companyData.verification_count}
                </div>
                ${companyData.expires_at ? `
                <div class="result-item">
                    <strong>License Expires</strong>
                    ${new Date(companyData.expires_at).toLocaleDateString()}
                </div>
                ` : ''}
            </div>
        `;
    } else if (type === 'unlicensed') {
        detailsHTML = `
            <div class="result-details warning-details">
                <div class="warning-item">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>This company is NOT licensed on our platform</strong>
                </div>
                <div class="warning-item">
                    <i class="fas fa-info-circle"></i>
                    <strong>Recommendation:</strong> Consider working with licensed companies instead
                </div>
                <div class="warning-item">
                    <i class="fas fa-shield-alt"></i>
                    <strong>Risk Level:</strong> Higher - Company legitimacy not verified
                </div>
            </div>
        `;
    }
    
    resultDiv.innerHTML = `
        <div class="result-header ${warningClass}">
            <i class="${icon}"></i>
            <h3>${title}</h3>
        </div>
        <p>${message}</p>
        ${detailsHTML}
    `;
    
    resultDiv.className = `verification-result ${resultClass}`;
    resultDiv.style.display = 'block';
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Load Licensed Companies
async function loadLicensedCompanies() {
    try {
        const response = await fetch('/api/companies');
        const data = await response.json();
        
        if (data.success) {
            displayCompanies(data.companies);
        }
    } catch (error) {
        console.error('Error loading companies:', error);
        // Show sample companies for demo
        displaySampleCompanies();
    }
}

// Display Companies
function displayCompanies(companies) {
    const companiesGrid = document.getElementById('companies-grid');
    
    if (!companies || companies.length === 0) {
        companiesGrid.innerHTML = '<p class="no-companies">No licensed companies found.</p>';
        return;
    }
    
    const companiesHTML = companies.map(company => `
        <div class="company-card">
            <div class="company-header">
                <i class="fas fa-building"></i>
                <h3>${company.company_name}</h3>
            </div>
            <div class="company-details">
                <p><strong>License Type:</strong> ${company.license_type}</p>
                <p><strong>Status:</strong> <span class="status-${company.status}">${company.status}</span></p>
                <p><strong>Verified:</strong> ${company.verification_count} times</p>
                ${company.expires_at ? `<p><strong>Expires:</strong> ${new Date(company.expires_at).toLocaleDateString()}</p>` : ''}
            </div>
            <div class="company-actions">
                <button class="verify-company-btn" onclick="verifySpecificCompany('${company.company_name}')">
                    <i class="fas fa-search"></i> Verify This Company
                </button>
            </div>
        </div>
    `).join('');
    
    companiesGrid.innerHTML = companiesHTML;
}

// Display Sample Companies (for demo)
function displaySampleCompanies() {
    const companiesGrid = document.getElementById('companies-grid');
    
    const sampleCompanies = [
        {
            company_name: 'Demo Corporation',
            license_type: 'Enterprise',
            status: 'active',
            verification_count: 156,
            expires_at: '2025-12-31'
        },
        {
            company_name: 'Test Industries',
            license_type: 'Professional',
            status: 'active',
            verification_count: 89,
            expires_at: '2025-06-30'
        },
        {
            company_name: 'Sample Solutions',
            license_type: 'Standard',
            status: 'active',
            verification_count: 234,
            expires_at: '2024-12-31'
        }
    ];
    
    displayCompanies(sampleCompanies);
}

// Verify Specific Company
function verifySpecificCompany(companyName) {
    document.getElementById('company-name').value = companyName;
    document.getElementById('license-key').value = '';
    
    // Switch to verification tab
    document.querySelector('[data-tab="verification"]').click();
    
    // Trigger verification
    verifyCompany();
}

// Load Company Statistics
async function loadCompanyStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('total-companies').textContent = data.stats.total_licenses || 3;
            document.getElementById('verified-today').textContent = data.stats.total_verifications || 156;
            document.getElementById('trusted-by').textContent = '1,000+';
        }
    } catch (error) {
        // Set default values for demo
        document.getElementById('total-companies').textContent = '3';
        document.getElementById('verified-today').textContent = '156';
        document.getElementById('trusted-by').textContent = '1,000+';
    }
}

// Support Form Submission
async function handleSupportSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const formObject = Object.fromEntries(formData.entries());
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/support-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject)
        });

        const data = await response.json();
        
        if (data.success) {
            showSuccess(`Licensing request submitted successfully! Your request ID is: ${data.request_id}. We'll review your application and contact you within 2 business days.`);
            event.target.reset();
        } else {
            showError(data.message || 'Failed to submit licensing request');
        }
    } catch (error) {
        console.error('Support request error:', error);
        showError('Network error. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Show Loading Modal
function showLoading(show) {
    const loadingModal = document.getElementById('loading-modal');
    if (show) {
        loadingModal.style.display = 'flex';
    } else {
        loadingModal.style.display = 'none';
    }
}

// Show Success Modal
function showSuccess(message) {
    const successModal = document.getElementById('success-modal');
    const successMessage = document.getElementById('success-message');
    
    successMessage.textContent = message;
    successModal.style.display = 'flex';
}

// Show Error Modal
function showError(message) {
    const errorModal = document.getElementById('error-modal');
    const errorMessage = document.getElementById('error-message');
    
    errorMessage.textContent = message;
    errorModal.style.display = 'flex';
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal, .loading-modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Close modals with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal, .loading-modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to trust indicators
    const trustItems = document.querySelectorAll('.trust-item');
    trustItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Add typing effect to verification header
    const verificationHeader = document.querySelector('.verification-header p');
    if (verificationHeader) {
        const text = verificationHeader.textContent;
        verificationHeader.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                verificationHeader.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 1000);
    }
});

// Enhanced form validation for support form
document.addEventListener('DOMContentLoaded', function() {
    const supportForm = document.getElementById('support-form');
    if (supportForm) {
        const inputs = supportForm.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.style.borderColor = '#e74c3c';
                    this.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
                } else {
                    this.style.borderColor = '#e1e8ed';
                    this.style.boxShadow = 'none';
                }
            });
            
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.style.borderColor = '#3498db';
                    this.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
                }
            });
        });
    }
});

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
        });
    });

    // Support form submission
    const supportForm = document.getElementById('support-form');
    if (supportForm) {
        supportForm.addEventListener('submit', handleSupportSubmit);
    }
});

// License Verification Function
async function verifyLicense() {
    const licenseKey = document.getElementById('license-key').value.trim();
    const resultDiv = document.getElementById('verification-result');
    
    if (!licenseKey) {
        showError('Please enter a license key');
        return;
    }

    showLoading(true);
    
    try {
        const response = await fetch('/api/verify-license', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ license_key: licenseKey })
        });

        const data = await response.json();
        
        if (data.success) {
            showVerificationResult('success', data.message, data.license);
        } else {
            if (response.status === 403) {
                showVerificationResult('expired', 'License has expired', null);
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
function showVerificationResult(type, message, licenseData) {
    const resultDiv = document.getElementById('verification-result');
    
    let resultClass = '';
    let icon = '';
    let title = '';
    
    switch (type) {
        case 'success':
            resultClass = 'result-success';
            icon = 'fas fa-check-circle';
            title = 'License Verified Successfully';
            break;
        case 'error':
            resultClass = 'result-error';
            icon = 'fas fa-times-circle';
            title = 'Verification Failed';
            break;
        case 'expired':
            resultClass = 'result-expired';
            icon = 'fas fa-exclamation-triangle';
            title = 'License Expired';
            break;
    }
    
    let detailsHTML = '';
    if (licenseData && type === 'success') {
        detailsHTML = `
            <div class="result-details">
                <div class="result-item">
                    <strong>Company Name</strong>
                    ${licenseData.company_name}
                </div>
                <div class="result-item">
                    <strong>License Type</strong>
                    ${licenseData.license_type}
                </div>
                <div class="result-item">
                    <strong>Verification Count</strong>
                    ${licenseData.verification_count}
                </div>
                ${licenseData.expires_at ? `
                <div class="result-item">
                    <strong>Expires At</strong>
                    ${new Date(licenseData.expires_at).toLocaleDateString()}
                </div>
                ` : ''}
            </div>
        `;
    }
    
    resultDiv.innerHTML = `
        <div class="result-header">
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
            showSuccess(`Support request submitted successfully! Your request ID is: ${data.request_id}`);
            event.target.reset();
        } else {
            showError(data.message || 'Failed to submit support request');
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

// Add some sample license keys for testing
function addSampleLicenses() {
    const sampleKeys = [
        'DEMO-1234-5678-9ABC',
        'TEST-9876-5432-1DEF',
        'SAMPLE-ABCD-EFGH-IJKL'
    ];
    
    const licenseInput = document.getElementById('license-key');
    if (licenseInput) {
        licenseInput.placeholder = `Enter your license key (e.g., ${sampleKeys[0]})`;
    }
}

// Initialize sample licenses on page load
document.addEventListener('DOMContentLoaded', addSampleLicenses);

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
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

// Add form validation
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            field.style.borderColor = '#e1e8ed';
        }
    });
    
    return isValid;
}

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

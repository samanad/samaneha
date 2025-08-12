# SecureLicense Pro - Professional Licensing System

A comprehensive, enterprise-grade licensing system with a modern web interface for license verification and support management.

## Features

### 🔐 License Verification
- **Real-time License Validation**: Instant verification of software licenses
- **Secure API Endpoints**: Protected with rate limiting and security headers
- **Comprehensive Logging**: Track all verification attempts and results
- **Expiration Management**: Automatic handling of expired licenses

### 🎨 Professional GUI
- **Modern Design**: Beautiful, responsive interface built with modern CSS
- **Trust Indicators**: Display security certifications and compliance badges
- **Interactive Elements**: Smooth animations and user-friendly interactions
- **Mobile Responsive**: Works perfectly on all device sizes

### 📋 Support System
- **Company Support Requests**: Dedicated form for business support needs
- **Priority Management**: Configurable priority levels for support tickets
- **Request Tracking**: Unique IDs for each support request
- **Professional Workflow**: Streamlined support request process

### 🛡️ Security & Compliance
- **ISO 27001 Compliant**: Enterprise-grade security standards
- **SOC 2 Type II**: Service organization control compliance
- **GDPR Ready**: Data protection regulation compliance
- **256-bit Encryption**: Military-grade encryption for all data

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite3 (easily upgradable to PostgreSQL/MySQL)
- **Frontend**: Vanilla JavaScript with modern CSS3
- **Security**: Helmet.js, CORS, Rate Limiting
- **UI Framework**: Custom CSS with Font Awesome icons

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd licensing-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

### Development Mode
```bash
npm run dev
```

## Project Structure

```
licensing-system/
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
├── public/                # Frontend assets
│   ├── index.html        # Main application page
│   ├── styles.css        # Application styling
│   └── script.js         # Frontend JavaScript
├── licenses.db            # SQLite database (auto-created)
└── README.md             # This file
```

## API Endpoints

### License Verification
- **POST** `/api/verify-license`
  - Body: `{ "license_key": "YOUR-LICENSE-KEY" }`
  - Returns: License validation status and details

### Support Requests
- **POST** `/api/support-request`
  - Body: Company and issue details
  - Returns: Support request confirmation with ID

### Statistics
- **GET** `/api/stats`
  - Returns: System statistics and metrics

## Database Schema

### Licenses Table
- `id`: Unique identifier
- `license_key`: License key string
- `company_name`: Company name
- `contact_email`: Contact email
- `license_type`: Type of license
- `status`: License status (active/inactive)
- `expires_at`: Expiration date
- `verification_count`: Number of verifications

### Support Requests Table
- `id`: Unique identifier
- `company_name`: Company name
- `contact_name`: Contact person name
- `contact_email`: Contact email
- `issue_description`: Description of the issue
- `priority`: Priority level
- `status`: Request status

### Verification Logs Table
- `id`: Unique identifier
- `license_key`: License key verified
- `ip_address`: IP address of verification
- `verification_result`: Result of verification
- `timestamp`: When verification occurred

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: JWT secret key for authentication

### Security Features
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **Input Validation**: Comprehensive input sanitization

## Customization

### Adding New License Types
1. Modify the database schema in `server.js`
2. Update the frontend validation logic
3. Add new verification rules as needed

### Styling Changes
- Modify `public/styles.css` for visual changes
- Update color schemes and branding
- Customize animations and transitions

### Adding New Features
- Extend the Express server with new routes
- Add new frontend tabs and functionality
- Integrate with external services

## Testing

### Sample License Keys
The system includes sample license keys for testing:
- `DEMO-1234-5678-9ABC`
- `TEST-9876-5432-1DEF`
- `SAMPLE-ABCD-EFGH-IJKL`

### API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Test license verification
curl -X POST http://localhost:3000/api/verify-license \
  -H "Content-Type: application/json" \
  -d '{"license_key": "DEMO-1234-5678-9ABC"}'

# Test support request
curl -X POST http://localhost:3000/api/support-request \
  -H "Content-Type: application/json" \
  -d '{"company_name": "Test Corp", "contact_name": "John Doe", "contact_email": "john@test.com", "issue_description": "Test issue"}'
```

## Deployment

### Production Considerations
1. **Database**: Upgrade to PostgreSQL or MySQL for production
2. **Environment Variables**: Set proper JWT secrets and database credentials
3. **HTTPS**: Enable SSL/TLS encryption
4. **Load Balancing**: Implement for high-traffic scenarios
5. **Monitoring**: Add logging and monitoring solutions

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@securelicense.com
- Phone: +1 (555) 123-4567
- Documentation: [Link to documentation]

## Roadmap

- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard
- [ ] Integration with payment gateways
- [ ] Mobile app development
- [ ] API rate limiting per license
- [ ] Advanced reporting features
- [ ] Multi-language support
- [ ] SSO integration

---

**Built with ❤️ for enterprise-grade licensing solutions**

# Phethagatsa Solutions Secure API Server

## Overview

This is the secure backend API server for Phethagatsa Solutions, a modern African skincare and wellness e-commerce platform. The API provides:

- **Product catalog management** with MongoDB Atlas integration
- **Order processing** and customer data handling
- **Admin panel access** via secure API keys
- **WhatsApp business integration** for direct customer communication
- **Analytics and reporting** for business insights

## Architecture

### Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB Atlas (Cloud-based NoSQL database)
- **API Authentication**: Bearer tokens and API keys
- **Security**: HTTPS, rate limiting, input validation

### Key Features

#### Database Layer
- MongoDB Atlas with encrypted connections
- Automatic data seeding on first deployment
- Scalable document-based data model

#### API Endpoints

**Public Endpoints (No Auth Required):**
- `GET /api/health` - System health check
- `GET /api/products` - Browse product catalog
- `GET /api/products/:id` - Get specific product
- `GET /api/orders` - List orders (admin only)
- `GET /api/settings` - Get store settings
- `POST /api/whatsapp/order-link` - Generate WhatsApp order links

**Protected Endpoints (API Key Required):**
- `POST /api/products` - Create new products
- `PUT /api/products/:id` - Update products
- `DELETE /api/products/:id` - Delete products
- `POST /api/orders` - Create new orders
- `PATCH /api/orders/:id/status` - Update order status
- `PUT /api/settings` - Update store settings
- `GET /api/customers` - List customers
- `GET /api/analytics` - Get analytics data

#### Admin Access Control

Admin access is protected via API key authentication:

```bash
# Admin API Key: phethagatsa-secure-admin-key-2026

# Usage in requests:
curl -H "X-API-Key: phethagatsa-secure-admin-key-2026" \
     https://api.phethagatsa.co.za/api/admin/secure-access

curl -H "X-API-Key: phethagatsa-secure-admin-key-2026" \
     -X POST https://api.phethagatsa.co.za/api/products \
     -H "Content-Type: application/json" \
     -d '{"name": "New Product", ...}'
```

### Security Features

#### 1. API Key Authentication
- All admin endpoints require API key authentication
- API keys are stored in environment variables
- Keys are validated in request headers (`X-API-Key`) or query parameters

#### 2. Database Security
- MongoDB Atlas with encrypted connections
- Connection strings with read-only user accounts
- Network access control (IP whitelisting available)

#### 3. Input Validation
- Express middleware for request validation
- Sanitization of user inputs
- Rate limiting to prevent abuse

#### 4. HTTPS Enforcement
- All API calls should be made over HTTPS
- CORS configured for secure cross-origin requests

## Deployment

### Environment Variables

Create a `.env` file with the following variables:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://t22hghjwm_db_user:1975!!Nkwe!!@cluster0.mongodb.net/phethagatsa

# API Keys
API_KEY_ADMIN=phethagatsa-secure-admin-key-2026
SECRET_SESSION_KEY=phethagatsa-secure-session-2026-key-very-secret-32-characters
GEMINI_API_KEY=al-e9HeVjsPH6ZOrnjGVZ8dStW6chZ-IYO3AOtUV9-PCxF

# Application Configuration
WHATSAPP_NUMBER=27723819402
DEFAULT_CURRENCY=ZAR
FREE_SHIPPING_THRESHOLD=450
APP_NAME=Phethagatsa Solutions

# Security
NODE_ENV=production
```

### Running the Server

```bash
# Install dependencies
npm install

# Set environment variables
# Option 1: Use .env file (not recommended for production)
# Option 2: Set environment variables individually
export NODE_ENV=production
export MONGODB_URI=mongodb+srv://t22hghjwm_db_user:1975!!Nkwe!!@cluster0.mongodb.net/phethagatsa
export API_KEY_ADMIN=phethagatsa-secure-admin-key-2026
export SECRET_SESSION_KEY=phethagatsa-secure-session-2026-key-very-secret-32-characters

# Run the server
npm start
```

### Production Deployment

#### 1. MongoDB Atlas Setup
1. Create MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster (M0, M2, or M5)
3. Create a user with read/write privileges
4. Whitelist your application's IP addresses
5. Get the connection string from Atlas

#### 2. SSL Certificate
- Generate SSL certificates for your domain
- Configure HTTPS in your web server or load balancer

#### 3. Environment Configuration
- Use `.env.production` for production environment
- Never commit `.env` files with sensitive credentials to version control
- Use secret management tools (AWS Secrets Manager, Azure Key Vault, etc.)

## API Reference

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "online",
  "app": "Phethagatsa Solutions Modern African Skincare API",
  "version": "2.0.0",
  "timestamp": "2026-10-10T06:56:51.000Z",
  "database": "MongoDB Atlas (Connected)",
  "environment": "production",
  "counts": {
    "products": 50,
    "orders": 25,
    "customers": 10
  }
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `category` - Filter by category
- `search` - Search in product names/descriptions

#### Get Single Product
```http
GET /api/products/:id
```

**Path Parameters:**
- `id` - Product ID

#### Create Product (Admin Required)
```http
POST /api/products
Authorization: Bearer <API_KEY>

Content-Type: application/json
{
  "name": "New Botanical Formula",
  "tagline": "African Botanicals",
  "price": 250,
  "category": "face-care",
  "image": "https://example.com/image.jpg",
  "description": "Description",
  "ingredients": "Ingredients",
  "howToUse": "Usage",
  "benefits": ["Benefit 1", "Benefit 2"],
  "stock": 50,
  "rating": 5.0,
  "reviewCount": 0,
  "tags": ["organic"]
}
```

### WhatsApp Integration

#### Generate WhatsApp Order Link
```http
POST /api/whatsapp/order-link
Authorization: Bearer <API_KEY>

Content-Type: application/json
{
  "orderId": "123456",
  "customerName": "John Doe",
  "totalZAR": 450.00,
  "items": [
    {
      "name": "Radiant Serum",
      "quantity": 2,
      "price": 225.00
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://wa.me/27723819402?text=Dumela%20Phethagatsa%20Solutions!%20...",
  "message": "*Dumela Phethagatsa Solutions!*..."
}
```

### Error Responses

#### Authentication Errors
```json
{
  "success": false,
  "error": "Access denied",
  "message": "Invalid or missing API key for admin access"
}
```

#### Validation Errors
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid input data"
}
```

## Security Best Practices

### 1. API Key Management
- Store API keys in environment variables or secret vaults
- Use different keys for development, staging, and production
- Rotate API keys regularly
- Monitor API key usage for suspicious activity

### 2. Database Security
- Use read-only users for production when possible
- Enable MongoDB Atlas network access controls
- Regularly backup your database
- Monitor database connections and queries

### 3. Application Security
- Use HTTPS in production
- Implement rate limiting
- Validate and sanitize all user inputs
- Use proper error handling (don't expose stack traces)

### 4. Environment Security
- Never commit `.env` files to version control
- Use different environment configurations for different environments
- Regularly update dependencies
- Monitor application logs for security issues

## Monitoring & Maintenance

### Health Monitoring
- Monitor the `/api/health` endpoint regularly
- Set up alerts for failed database connections
- Track API usage and response times

### Log Management
- Log all API requests and responses
- Log authentication attempts
- Monitor for unusual patterns or attacks

### Backup & Recovery
- Set up automated database backups
- Test recovery procedures regularly
- Keep backup procedures documented

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed
- Check MongoDB Atlas credentials
- Verify network connectivity
- Ensure IP whitelist includes your application's IP

#### API Key Authentication Failed
- Verify API key is correct
- Check that key is passed in request headers or query parameters
- Ensure the environment variable is set correctly

#### Product Not Found
- Verify the product ID is correct
- Check if the product exists in the database
- Ensure the MongoDB connection is working

### Debug Commands

```bash
# Check MongoDB connection status
mongosh "mongodb+srv://t22hghjwm_db_user:1975!!Nkwe!!@cluster0.mongodb.net/phethagata" --eval "db.adminCommand('ping')"

# View MongoDB logs
mongosh "mongodb+srv://t22hghjwm_db_user:1975!!Nkwe!!@cluster0.mongodb.net/phethagata"

# Check application logs
npm start  # Then check server logs
```

## Contact & Support

For issues with this API server:

- **GitHub Issues**: Report bugs or request features
- **Email**: support@phethagatsa.co.za
- **Documentation**: https://docs.phethagatsa.co.za/api

## License

This API server is part of the Phethagatsa Solutions project and is provided under the proprietary license of Phethagatsa Solutions.

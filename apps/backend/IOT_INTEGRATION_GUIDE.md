# IoT Machine Integration Guide

This guide explains how IoT vending machines can integrate with the authentication system using REST APIs.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Backoffice    │    │   IoT Machine   │
│   (tRPC)        │    │   (tRPC)        │    │   (REST API)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Backend API   │
                    │  (NestJS)       │
                    │                 │
                    │ • tRPC Auth     │
                    │ • REST Auth     │
                    │ • JWT Tokens    │
                    └─────────────────┘
```

## Authentication Flow

### 1. User Authentication (Mobile/Backoffice)

```typescript
// User logs in via mobile app or backoffice
const response = await trpc.auth.login.mutate({
  email: 'user@example.com',
  password: 'password123',
});

// Gets JWT token
const jwtToken = response.access_token;
```

### 2. Generate Machine Token

```typescript
// User generates machine token via mobile/backoffice
const machineTokenResponse = await trpc.auth.generateMachineToken.mutate();

// Gets machine-specific token and QR code
const { machine_token, qr_code_data, machine_id } = machineTokenResponse;
```

### 3. IoT Machine Authentication

```bash
# IoT machine uses the token to authenticate REST API calls
curl -X POST http://localhost:3000/api/order-delivery/confirm \
  -H "Authorization: Bearer MACHINE_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-123",
    "deliveredItems": [
      {
        "productId": "product-1",
        "quantity": 1
      }
    ]
  }'
```

## API Endpoints for IoT Machines

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/generate-machine-token` - Generate machine token (requires user auth)

### Order Management Endpoints

- `POST /api/order-delivery/confirm` - Confirm order delivery
- `GET /api/order-delivery/order/:orderId` - Get order details
- `DELETE /api/order-delivery/order/:orderId` - Delete order
- `POST /api/order-delivery/cancel/:orderId` - Cancel order

### Stock Management Endpoints

- `POST /api/stocks/update-quantity` - Update stock quantity (for IoT machines)

### Order Validation Endpoints

- `POST /api/order-validation/validate-qr` - Validate QR code
- `POST /api/order-validation/validate-token` - Validate token
- `GET /api/order-validation/order/:orderId` - Get order status

### Payment Endpoints

- `POST /api/card-payment/process` - Process card payment
- `POST /api/card-payment/test` - Test payment endpoint

## Implementation Examples

### 1. Machine Token Generation (Mobile App)

```typescript
// In your mobile app or backoffice
const generateMachineToken = async () => {
  try {
    const response = await fetch('/api/auth/generate-machine-token', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Display QR code for machine scanning
    displayQRCode(data.qr_code_data);

    // Or send token directly to machine
    sendTokenToMachine(data.machine_token);
  } catch (error) {
    console.error('Failed to generate machine token:', error);
  }
};
```

### 2. IoT Machine REST API Client

```typescript
// IoT Machine implementation
class IoTVendingMachine {
  private baseUrl = 'http://localhost:3000';
  private machineToken: string;

  constructor(token: string) {
    this.machineToken = token;
  }

  async confirmOrderDelivery(orderId: string, deliveredItems: any[]) {
    const response = await fetch(`${this.baseUrl}/api/order-delivery/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.machineToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        deliveredItems,
      }),
    });

    return response.json();
  }

  async getOrderDetails(orderId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/order-delivery/order/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${this.machineToken}`,
        },
      },
    );

    return response.json();
  }

  async validateQRCode(qrData: string) {
    const response = await fetch(
      `${this.baseUrl}/api/order-validation/validate-qr`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.machineToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
      },
    );

    return response.json();
  }

  async updateStockQuantity(stockId: string, quantity: number) {
    const response = await fetch(`${this.baseUrl}/api/stocks/update-quantity`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.machineToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stockId, quantity }),
    });

    return response.json();
  }
}

// Usage
const machine = new IoTVendingMachine('MACHINE_TOKEN_HERE');
const result = await machine.confirmOrderDelivery('order-123', [
  { productId: 'product-1', quantity: 1 },
]);
```

### 3. QR Code Integration

```typescript
// Generate QR code for machine scanning
const generateQRCode = (machineToken: string) => {
  const qrData = `iot-auth:${machineToken}`;

  // Use a QR code library to generate the code
  const qrCode = QRCode.toDataURL(qrData);

  // Display on screen for machine to scan
  displayQRCode(qrCode);
};
```

## Security Considerations

### 1. Token Management

- Machine tokens expire after 1 hour
- Tokens are tied to specific users
- Tokens include machine-specific claims

### 2. Network Security

- Use HTTPS in production
- Implement rate limiting
- Validate all inputs

### 3. Machine Authentication

- Machines should validate tokens before use
- Implement token refresh mechanism
- Log all machine interactions

## Error Handling

### Common Error Responses

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

```json
{
  "message": "Order not found",
  "statusCode": 404
}
```

```json
{
  "message": "Invalid QR code",
  "statusCode": 400
}
```

## Testing

### Test Machine Token Generation

```bash
# 1. Login as user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Generate machine token
curl -X POST http://localhost:3000/api/auth/generate-machine-token \
  -H "Authorization: Bearer USER_TOKEN_HERE"

# 3. Use machine token for REST API calls
curl -X POST http://localhost:3000/api/order-delivery/confirm \
  -H "Authorization: Bearer MACHINE_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test-order","deliveredItems":[]}'
```

## Deployment Considerations

### 1. Environment Variables

```env
JWT_SECRET=your-super-secret-jwt-key-here
DATABASE_URL=your-database-url
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### 2. CORS Configuration

```typescript
// In main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true,
});
```

### 3. Rate Limiting

```typescript
// Implement rate limiting for machine endpoints
app.use(
  '/api/order-delivery',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);
```

## Troubleshooting

### Common Issues

1. **Token Expired**
   - Generate new machine token
   - Check token expiration time

2. **Unauthorized Access**
   - Verify token is valid
   - Check user permissions

3. **Network Issues**
   - Verify machine can reach backend
   - Check firewall settings

4. **QR Code Issues**
   - Ensure QR code data is correct
   - Verify machine can read QR codes

## Support

For issues or questions about IoT machine integration:

- Check the Swagger documentation at `/api-docs`
- Review server logs for error details
- Test endpoints manually with curl
- Verify authentication flow step by step

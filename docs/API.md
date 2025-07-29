# Garage Vision API Documentation

## Overview

The Garage Vision API provides endpoints for managing garage operations, including jobs, clients, vehicles, and more. All endpoints require authentication via JWT tokens.

## Authentication

Most endpoints require authentication. Include your JWT token in cookies or as a Bearer token in the Authorization header.

### Login Endpoints

- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

## Core Endpoints

### Jobs

- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/[id]` - Get job details
- `PUT /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job

### Clients

- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/[id]` - Get client details
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

### Vehicles

- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles` - Create new vehicle
- `GET /api/vehicles/[id]` - Get vehicle details
- `PUT /api/vehicles/[id]` - Update vehicle
- `DELETE /api/vehicles/[id]` - Delete vehicle

### Quotes

- `GET /api/quotes` - List all quotes
- `POST /api/quotes` - Create new quote
- `GET /api/quotes/[id]` - Get quote details
- `PUT /api/quotes/[id]` - Update quote
- `DELETE /api/quotes/[id]` - Delete quote
- `GET /api/quotes/[id]/pdf` - Generate PDF quote

### Invoices

- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/[id]` - Get invoice details
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `GET /api/invoices/[id]/pdf` - Generate PDF invoice

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "error_type",
  "message": "Human readable message",
  "details": {}
}
```

Common error types:
- `unauthorized` - Authentication required
- `forbidden` - Insufficient permissions
- `not_found` - Resource not found
- `validation_error` - Invalid input data
- `internal_error` - Server error

## Rate Limiting

API endpoints are rate limited to 100 requests per 15 minutes per IP address. Rate limit headers are included in responses:

- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining in window
- `X-RateLimit-Reset` - When the limit resets

## Pagination

List endpoints support pagination via query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Search

The search endpoint allows querying across multiple entities:

`GET /api/search?q=search_term`

Returns results grouped by entity type:

```json
{
  "clients": [...],
  "vehicles": [...],
  "jobs": [...],
  "quotes": [...],
  "invoices": [...],
  "parts": [...]
}
```

## File Uploads

File uploads are handled via S3 presigned URLs:

1. Request upload URL: `POST /api/chat/upload`
2. Upload file to returned URL
3. Use returned key in subsequent requests

## WebSocket

Real-time chat functionality via Socket.IO:

- Connect to `/api/socket-io`
- Events: `chat:join`, `chat:send`, `chat:delete`, `chat:recv`

## Development

For development, set `NODE_ENV=development` to get detailed error messages and stack traces. 
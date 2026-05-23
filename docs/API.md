# API Documentation

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, the API does not require authentication (Phase 2 feature).
Future versions will include JWT authentication.

## Common Responses

### Success Response

```json
{
  "success": true,
  "data": { /* resource data */ }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Health & Status

#### Get Health Status
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

#### Get API Status
```
GET /api/status
```

**Response:**
```json
{
  "success": true,
  "application": "Canadian Payroll System",
  "version": "0.1.0",
  "status": "running",
  "database": "connected"
}
```

---

## Organizations

### Create Organization

```
POST /api/organizations
Content-Type: application/json

{
  "name": "Acme Corporation",
  "province": "ON",
  "businessNumber": "123456789RC0001",
  "address": "123 Main St",
  "city": "Toronto",
  "postalCode": "M1A 1A1",
  "contactEmail": "hr@acme.com",
  "contactPhone": "416-555-0100"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Corporation",
    "province": "ON",
    "businessNumber": "123456789RC0001",
    "address": "123 Main St",
    "city": "Toronto",
    "postalCode": "M1A 1A1",
    "contactEmail": "hr@acme.com",
    "contactPhone": "416-555-0100",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### List Organizations

```
GET /api/organizations?page=1&limit=10
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Corporation",
      "province": "ON",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Get Organization

```
GET /api/organizations/{organizationId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Corporation",
    "province": "ON",
    ...
  }
}
```

### Update Organization

```
PATCH /api/organizations/{organizationId}
Content-Type: application/json

{
  "name": "Acme Corp (Updated)",
  "contactEmail": "newemail@acme.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Corp (Updated)",
    ...
  }
}
```

### Delete Organization

```
DELETE /api/organizations/{organizationId}
```

**Response (204 No Content)**

### Get Organization Employee Count

```
GET /api/organizations/{organizationId}/employee-count
```

**Response:**
```json
{
  "success": true,
  "data": {
    "organizationId": "550e8400-e29b-41d4-a716-446655440000",
    "employeeCount": 42
  }
}
```

---

## Employees

### Create Employee

```
POST /api/organizations/{organizationId}/employees
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "sin": "123456789",
  "dateOfBirth": "1990-01-15",
  "email": "john.doe@example.com",
  "phone": "416-555-0101",
  "address": "456 Oak Ave, Toronto, ON",
  "province": "ON",
  "employmentType": "full_time",
  "salaryAnnual": 60000,
  "hireDate": "2024-01-01",
  "federalTaxExemptions": 1,
  "provincialTaxExemptions": 1
}
```

**Required Fields:**
- firstName, lastName
- sin (Social Insurance Number)
- dateOfBirth
- hireDate
- federalTaxExemptions, provincialTaxExemptions
- employmentType

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "organizationId": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "sin": "123456789",
    "dateOfBirth": "1990-01-15",
    "email": "john.doe@example.com",
    "phone": "416-555-0101",
    "address": "456 Oak Ave, Toronto, ON",
    "province": "ON",
    "employmentType": "full_time",
    "salaryAnnual": 60000,
    "hourlyRate": null,
    "hireDate": "2024-01-01",
    "terminationDate": null,
    "federalTaxExemptions": 1,
    "provincialTaxExemptions": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### List Employees

```
GET /api/organizations/{organizationId}/employees?page=1&limit=50&includeInactive=false
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)
- `includeInactive`: Include terminated employees (default: false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 42,
    "totalPages": 1
  }
}
```

### Get Active Employees

```
GET /api/organizations/{organizationId}/employees/active
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "firstName": "John",
      "lastName": "Doe",
      ...
    }
  ]
}
```

### Get Employee

```
GET /api/organizations/{organizationId}/employees/{employeeId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "firstName": "John",
    "lastName": "Doe",
    ...
  }
}
```

### Update Employee

```
PATCH /api/organizations/{organizationId}/employees/{employeeId}
Content-Type: application/json

{
  "email": "newemail@example.com",
  "salaryAnnual": 65000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "newemail@example.com",
    "salaryAnnual": 65000,
    ...
  }
}
```

### Deactivate Employee

Marks an employee as inactive (termination):

```
POST /api/organizations/{organizationId}/employees/{employeeId}/deactivate
```

**Response:**
```json
{
  "success": true,
  "message": "Employee deactivated",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": false,
    "terminationDate": "2024-01-15T10:30:00.000Z",
    ...
  }
}
```

### Reactivate Employee

Re-activates a previously terminated employee:

```
POST /api/organizations/{organizationId}/employees/{employeeId}/reactivate
```

**Response:**
```json
{
  "success": true,
  "message": "Employee reactivated",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "terminationDate": null,
    ...
  }
}
```

### Delete Employee

Permanently removes an employee (use deactivate instead):

```
DELETE /api/organizations/{organizationId}/employees/{employeeId}
```

**Response (204 No Content)**

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| UNAUTHORIZED | 401 | Authentication required |
| INTERNAL_ERROR | 500 | Server error |

---

## Example Usage

### Create Organization and Employee

```bash
# 1. Create organization
ORG_ID=$(curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "province": "ON"
  }' | jq -r '.data.id')

echo "Organization ID: $ORG_ID"

# 2. Add employee
curl -X POST http://localhost:3000/api/organizations/$ORG_ID/employees \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "sin": "123456789",
    "dateOfBirth": "1990-01-15",
    "hireDate": "2024-01-01",
    "employmentType": "full_time",
    "salaryAnnual": 60000,
    "federalTaxExemptions": 1,
    "provincialTaxExemptions": 1
  }'

# 3. List employees
curl http://localhost:3000/api/organizations/$ORG_ID/employees
```

---

## Rate Limiting

Currently not implemented (planned for Phase 3).

## Pagination

All list endpoints support pagination:
- `page`: 1-indexed page number
- `limit`: 1-100 items per page

---

**API Version:** 0.1.0
**Last Updated:** January 2024

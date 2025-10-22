# API Documentation - FluxoLab Backend

## Overview

This document describes the REST APIs implemented to support the frontend functionality. All APIs follow RESTful conventions and return JSON responses.

## Authentication

All protected endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## Base URL

```
http://localhost:3000/api
```

## API Endpoints

### Dashboard APIs

#### GET /api/dashboard/overview
Get dashboard overview with statistics and trial information.

**Response:**
```json
{
  "status": "ok",
  "totalWorkflows": 15,
  "activeWorkflows": 12,
  "totalExecutions": 150,
  "totalCredentials": 8,
  "lastExecutionAt": "2024-01-15T10:30:00Z",
  "trialInfo": {
    "isTrial": true,
    "daysLeft": 5,
    "executionsUsed": 6,
    "executionsLimit": 1000,
    "planName": "trial",
    "features": ["Up to 1000 executions per month", "Basic workflow templates"],
    "upgradeUrl": "/settings/plans"
  }
}
```

#### GET /api/dashboard/stats
Get execution statistics for a specific period.

**Query Parameters:**
- `period` (optional): Time period (default: "7d")

**Response:**
```json
{
  "status": "ok",
  "stats": {
    "prodExecutions": 45,
    "failedExecutions": 2,
    "failureRate": 4.26,
    "timeSaved": null,
    "avgRunTime": "2.34s"
  }
}
```

#### GET /api/dashboard/workflows
Get list of workflows with pagination and filtering.

**Query Parameters:**
- `limit` (optional): Number of items per page (default: 50)
- `offset` (optional): Number of items to skip (default: 0)
- `search` (optional): Search term for workflow names
- `sortBy` (optional): Sort field (default: "updated_at")
- `status` (optional): Filter by status

**Response:**
```json
{
  "status": "ok",
  "workflows": {
    "workflows": [
      {
        "id": "uuid",
        "name": "My Workflow",
        "status": "active",
        "owner": "John Doe",
        "lastUpdated": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-10T09:00:00Z",
        "executionCount": 25,
        "tags": ["automation", "email"]
      }
    ],
    "total": 15
  }
}
```

### Workflow APIs

#### GET /api/workflows
List all workflows for the current workspace.

**Query Parameters:**
- `limit` (optional): Number of items per page (default: 50)
- `offset` (optional): Number of items to skip (default: 0)

#### GET /api/workflows/:workflowId
Get a specific workflow with its definition.

#### POST /api/workflows
Create a new workflow.

**Request Body:**
```json
{
  "name": "My Workflow",
  "tags": ["automation"],
  "definition": {
    "nodes": [
      {
        "id": "node1",
        "type": "webhook",
        "name": "Webhook Trigger",
        "position": { "x": 100, "y": 100 },
        "params": { "path": "/webhook" }
      }
    ],
    "connections": []
  }
}
```

#### PUT /api/workflows/:workflowId
Update an existing workflow.

#### DELETE /api/workflows/:workflowId
Delete a workflow.

#### GET /api/workflows/:workflowId/executions
Get execution history for a workflow.

#### POST /api/workflows/:workflowId/test
Execute a workflow for testing.

### Workflow Nodes APIs

#### GET /api/workflows/nodes/templates
Get available node templates.

**Response:**
```json
{
  "status": "ok",
  "templates": [
    {
      "id": "ai-agent",
      "name": "AI Agent",
      "description": "Build autonomous agents...",
      "category": "ai",
      "icon": "ai",
      "type": "ai-agent",
      "inputs": 1,
      "outputs": 1,
      "configSchema": { ... },
      "defaultConfig": { ... }
    }
  ]
}
```

#### GET /api/workflows/nodes/categories
Get node categories.

#### GET /api/workflows/nodes/triggers
Get available trigger types.

#### GET /api/workflows/nodes/config-schema/:nodeType
Get configuration schema for a specific node type.

#### POST /api/workflows/nodes/validate
Validate node configuration.

#### POST /api/workflows/nodes/test
Test node execution.

### User Management APIs

#### GET /api/users/profile
Get current user profile.

**Response:**
```json
{
  "status": "ok",
  "profile": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "avatarColor": "#a855f7",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-01-15T10:30:00Z",
    "preferences": {
      "theme": "light",
      "language": "en",
      "timezone": "UTC",
      "notifications": {
        "email": true,
        "push": true,
        "workflow": true
      },
      "dashboard": {
        "defaultView": "overview",
        "itemsPerPage": 50
      }
    }
  }
}
```

#### PUT /api/users/profile
Update user profile.

#### GET /api/users/trial-info
Get trial information for the current user.

#### GET /api/users/workspace-members
Get workspace members.

#### GET /api/users/preferences
Get user preferences.

#### PUT /api/users/preferences
Update user preferences.

### Webhook APIs

#### POST /api/webhooks
Create a new webhook.

**Request Body:**
```json
{
  "name": "My Webhook",
  "path": "/webhook/my-webhook",
  "method": "POST",
  "authentication": "none",
  "respondMode": "immediately",
  "workflowId": "uuid"
}
```

#### GET /api/webhooks
List webhooks for the current workspace.

#### GET /api/webhooks/:webhookId
Get a specific webhook.

#### PUT /api/webhooks/:webhookId
Update a webhook.

#### DELETE /api/webhooks/:webhookId
Delete a webhook.

#### POST /api/webhooks/:webhookId/test
Test a webhook.

#### GET /api/webhooks/:webhookId/logs
Get webhook execution logs.

#### POST /api/webhooks/execute/:token
Execute a webhook (public endpoint, no auth required).

### Credentials APIs

#### GET /api/workflows/credentials
List workflow credentials.

#### POST /api/workflows/credentials
Create new credentials.

#### PUT /api/workflows/credentials/:credentialId
Update credentials.

#### DELETE /api/workflows/credentials/:credentialId
Delete credentials.

## Error Responses

All APIs return consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Pagination

List endpoints support pagination with `limit` and `offset` query parameters:

- `limit`: Number of items per page (default: 50, max: 100)
- `offset`: Number of items to skip (default: 0)

Response includes total count:
```json
{
  "status": "ok",
  "items": [...],
  "total": 150
}
```

## Filtering and Sorting

Many list endpoints support filtering and sorting:

- `search`: Search term for text fields
- `sortBy`: Field to sort by (prefix with `-` for descending)
- `status`: Filter by status
- `dateFrom`/`dateTo`: Date range filtering

## Rate Limiting

APIs are rate limited to prevent abuse:
- Default: 100 requests per minute per user
- Webhook execution: 1000 requests per minute per webhook

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## WebSocket Events

Real-time updates are available via WebSocket:

- `workflow.status` - Workflow execution status updates
- `webhook.triggered` - Webhook execution events
- `user.notification` - User notifications

## Database Schema

The APIs use the following main tables:
- `workspaces` - Workspace information and trial data
- `users` - User profiles and preferences
- `workflows` - Workflow definitions
- `workflow_versions` - Workflow version history
- `workflow_executions` - Execution history
- `webhooks` - Webhook configurations
- `webhook_logs` - Webhook execution logs
- `workflow_credentials` - Stored credentials
- `execution_stats` - Daily execution statistics
- `node_templates` - Available node templates
- `node_categories` - Node categories

## Security

- All endpoints require JWT authentication except public webhook execution
- Workspace isolation ensures users can only access their workspace data
- Input validation and sanitization on all endpoints
- Rate limiting to prevent abuse
- CORS configured for frontend domain

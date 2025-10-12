# 🔌 API REST do FluxoLab

A API REST do FluxoLab fornece acesso programático a todas as funcionalidades da plataforma através de endpoints HTTP padronizados.

## 📋 Visão Geral

- **Base URL**: `https://api.fluxolab.com` (produção) ou `http://localhost:3000/api` (desenvolvimento)
- **Formato**: JSON
- **Autenticação**: Bearer Token (JWT)
- **Rate Limiting**: 120 requests/minuto por IP
- **Versionamento**: v1 (implícito na URL)

## 🔐 Autenticação

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Resposta:**
```json
{
  "status": "ok",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "João Silva",
    "avatarColor": "#6366f1",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Registro
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "João Silva"
}
```

### Informações do Usuário
```http
GET /auth/me
Authorization: Bearer <token>
```

## 🏢 Workspace

### Overview do Workspace
```http
GET /workspace/overview
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "status": "ok",
  "overview": {
    "metrics": {
      "totalProjects": 5,
      "totalWebhooks": 12,
      "totalEvents": 1250
    },
    "projects": [
      {
        "id": "uuid",
        "title": "Processo de Vendas",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "metadata": {
          "description": "Automação do processo de vendas"
        }
      }
    ],
    "activities": [
      {
        "id": "uuid",
        "entityType": "workflow",
        "entityId": "uuid",
        "action": "created",
        "payload": {},
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "recentWebhooks": [
      {
        "id": "uuid",
        "type": "message_received",
        "status": "processed",
        "signatureValid": true,
        "receivedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "onboarding": [
      {
        "id": "first_workflow",
        "title": "Criar Primeiro Workflow",
        "steps": ["Definir trigger", "Adicionar ações"],
        "completed": false
      }
    ]
  }
}
```

### Listar Projetos
```http
GET /workspace/projects?limit=20&offset=0
Authorization: Bearer <token>
```

### Listar Atividades
```http
GET /workspace/activities?limit=20&offset=0
Authorization: Bearer <token>
```

### Webhooks Recentes
```http
GET /workspace/webhooks/recent?limit=10
Authorization: Bearer <token>
```

## ⚙️ Configurações

### Resumo das Configurações
```http
GET /settings/summary
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "status": "ok",
  "summary": {
    "workspaceId": "uuid",
    "plan": {
      "planCode": "basico",
      "name": "Plano Básico",
      "priceAmount": 39.99,
      "currency": "BRL",
      "billingInterval": "month",
      "trialDays": 0,
      "limits": {
        "workspaces": 2,
        "users": 10,
        "webhook": 10000
      },
      "features": {
        "support": "email",
        "integrations": true
      },
      "subscriptionStatus": "active",
      "renewsAt": "2024-02-01T00:00:00.000Z"
    },
    "usage": {
      "workflowsActive": 3,
      "usersActive": 5,
      "webhookEvents": 1250,
      "collectedAt": "2024-01-01T00:00:00.000Z"
    },
    "apiKeys": [
      {
        "id": "uuid",
        "label": "API Integration",
        "keyPreview": "FLX-1234...ABCD",
        "scopes": ["projects:read", "webhooks:manage"],
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastUsedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": {
          "id": "uuid",
          "email": "admin@example.com"
        }
      }
    ],
    "environments": [
      {
        "id": "uuid",
        "name": "Production",
        "slug": "prod",
        "type": "production",
        "region": "us-east-1",
        "status": "ready",
        "lastSyncedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "featureGates": [
      {
        "id": "environments",
        "title": "Ambientes",
        "requiredPlan": "Intermediário",
        "status": "available",
        "copy": "Separe deploy por Sandbox, Staging e Produção com aprovação."
      }
    ]
  }
}
```

## 🔗 Webhooks

### Gerar Webhook
```http
POST /generate-webhook
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "WhatsApp Integration",
  "description": "Webhook para integração com WhatsApp Business"
}
```

**Resposta:**
```json
{
  "status": "ok",
  "webhook": {
    "id": "uuid",
    "token": "wh_1234567890abcdef",
    "url": "https://api.fluxolab.com/webhooks/wh_1234567890abcdef",
    "label": "WhatsApp Integration",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Verificar Webhook (Challenge)
```http
GET /webhooks/{token}?hub.mode=subscribe&hub.challenge=CHALLENGE_STRING&hub.verify_token=YOUR_VERIFY_TOKEN
```

### Receber Evento
```http
POST /webhooks/{token}
Content-Type: application/json
X-Hub-Signature-256: sha256=signature

{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15551234567",
              "phone_number_id": "123456789"
            },
            "messages": [
              {
                "from": "15551234567",
                "id": "wamid.xxx",
                "timestamp": "1234567890",
                "text": {
                  "body": "Hello World"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

## 🤖 MCP (Model Context Protocol)

### Status do MCP
```http
GET /mcp/status
Authorization: Bearer <token>
```

### Listar Ferramentas Disponíveis
```http
GET /mcp/tools
Authorization: Bearer <token>
```

### Executar Ferramenta
```http
POST /mcp/tools/{toolName}/call
Authorization: Bearer <token>
Content-Type: application/json

{
  "arguments": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

### Gerar Código de Workflow
```http
POST /mcp/workflows/generate-code
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Workflow para processar pedidos de e-commerce",
  "language": "javascript"
}
```

### Analisar Workflow
```http
POST /mcp/workflows/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "definition": {
    "name": "Process Order",
    "steps": [...]
  }
}
```

## 📊 Monitoramento

### Health Check
```http
GET /monitoring/health
```

**Resposta:**
```json
{
  "status": "ok",
  "health": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "services": {
      "database": {
        "status": "up",
        "responseTime": 15,
        "lastChecked": "2024-01-01T00:00:00.000Z"
      },
      "redis": {
        "status": "up",
        "responseTime": 5,
        "lastChecked": "2024-01-01T00:00:00.000Z"
      }
    },
    "uptime": 86400,
    "version": "1.0.0"
  }
}
```

### Informações do Sistema
```http
GET /monitoring/system
Authorization: Bearer <token>
```

### Métricas
```http
GET /monitoring/metrics
Authorization: Bearer <token>
```

### Métricas Prometheus
```http
GET /monitoring/metrics/prometheus
```

## 🔍 Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Recurso não encontrado |
| 422 | Erro de validação |
| 429 | Rate limit excedido |
| 500 | Erro interno do servidor |

## 🚨 Tratamento de Erros

### Formato de Erro
```json
{
  "status": "error",
  "message": "Descrição do erro",
  "code": "ERROR_CODE",
  "details": {
    "field": "campo com erro",
    "reason": "motivo do erro"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

### Códigos de Erro Comuns

| Código | Descrição |
|--------|-----------|
| `INVALID_CREDENTIALS` | Credenciais inválidas |
| `TOKEN_EXPIRED` | Token expirado |
| `INSUFFICIENT_PERMISSIONS` | Permissões insuficientes |
| `RESOURCE_NOT_FOUND` | Recurso não encontrado |
| `VALIDATION_ERROR` | Erro de validação |
| `RATE_LIMIT_EXCEEDED` | Rate limit excedido |
| `WEBHOOK_SIGNATURE_INVALID` | Assinatura de webhook inválida |

## 📚 SDKs e Bibliotecas

### JavaScript/Node.js
```bash
npm install @fluxolab/sdk
```

```javascript
import { FluxoLabClient } from '@fluxolab/sdk';

const client = new FluxoLabClient({
  baseUrl: 'https://api.fluxolab.com',
  token: 'your-jwt-token'
});

// Usar o cliente
const overview = await client.workspace.getOverview();
```

### Python
```bash
pip install fluxolab-sdk
```

```python
from fluxolab import FluxoLabClient

client = FluxoLabClient(
    base_url='https://api.fluxolab.com',
    token='your-jwt-token'
)

# Usar o cliente
overview = client.workspace.get_overview()
```

## 🔗 Links Úteis

- [Documentação Interativa (Swagger)](http://localhost:3000/api/docs)
- [Postman Collection](./postman-collection.json)
- [OpenAPI Specification](./openapi.yaml)
- [Exemplos de Código](./examples/)

---

**Próximo**: [Webhooks](./webhooks.md)

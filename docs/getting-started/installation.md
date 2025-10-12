# 🚀 Instalação do FluxoLab

Este guia irá te ajudar a instalar e configurar o FluxoLab em seu ambiente local ou de produção.

## 📋 Pré-requisitos

### Software Necessário
- **Node.js**: v20.0.0 ou superior
- **npm**: v9.0.0 ou superior
- **PostgreSQL**: v13.0 ou superior
- **Redis**: v7.0 ou superior (opcional, mas recomendado)
- **Docker**: v20.10 ou superior (opcional)
- **Docker Compose**: v2.0 ou superior (opcional)

### Recursos do Sistema
- **RAM**: Mínimo 4GB, recomendado 8GB+
- **CPU**: 2 cores, recomendado 4+ cores
- **Storage**: 10GB de espaço livre
- **Network**: Conexão estável com a internet

## 🔧 Instalação Local

### 1. Clone o Repositório
```bash
git clone https://github.com/your-org/fluxolab.git
cd fluxolab
```

### 2. Instale as Dependências
```bash
# Instalar dependências raiz
npm install

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

### 3. Configure o Banco de Dados

#### PostgreSQL
```bash
# Criar banco de dados
createdb fluxolab

# Ou usando psql
psql -U postgres
CREATE DATABASE fluxolab;
\q
```

#### Redis (Opcional)
```bash
# Instalar Redis (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server

# Iniciar Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 4. Configure as Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
nano .env
```

#### Configurações Essenciais
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/fluxolab

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
TOKEN_HASH_SECRET=your_token_hash_secret_here

# Webhooks
VERIFY_TOKEN=your_webhook_verify_token
APP_SECRET=your_webhook_app_secret

# CORS
CORS_ORIGINS=http://localhost:3001,http://localhost:5173
```

### 5. Execute as Migrações
```bash
cd backend
npm run migrate
```

### 6. Inicie a Aplicação

#### Desenvolvimento
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Produção
```bash
# Build das aplicações
cd backend && npm run build
cd ../frontend && npm run build

# Iniciar em produção
npm start
```

## 🐳 Instalação com Docker

### 1. Clone e Configure
```bash
git clone https://github.com/your-org/fluxolab.git
cd fluxolab
cp .env.example .env
```

### 2. Configure as Variáveis Docker
```env
# Database
POSTGRES_PASSWORD=your_secure_password

# Redis
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
TOKEN_HASH_SECRET=your_token_hash_secret_here
```

### 3. Inicie os Serviços
```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

### 4. Acesse a Aplicação
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Documentação**: http://localhost:3000/api/docs

## 🌐 Instalação em Produção

### 1. Preparar Servidor
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configurar SSL (Recomendado)
```bash
# Instalar Certbot
sudo apt install certbot

# Obter certificado
sudo certbot certonly --standalone -d yourdomain.com

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Deploy
```bash
# Clone do repositório
git clone https://github.com/your-org/fluxolab.git
cd fluxolab

# Configurar ambiente de produção
cp .env.example .env.production
# Editar .env.production com configurações de produção

# Deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## ✅ Verificação da Instalação

### 1. Verificar Serviços
```bash
# Verificar se os containers estão rodando
docker-compose ps

# Verificar logs
docker-compose logs backend
docker-compose logs frontend
```

### 2. Testar APIs
```bash
# Health check
curl http://localhost:3000/api/monitoring/health

# Status da aplicação
curl http://localhost:3000/api/monitoring/status
```

### 3. Verificar Frontend
- Acesse http://localhost:3001
- Faça login com credenciais padrão
- Verifique se o dashboard carrega corretamente

## 🔧 Configurações Avançadas

### Variáveis de Ambiente Completas
```env
# === CORE CONFIGURATION ===
NODE_ENV=production
PORT=3000
BASE_URL=https://yourdomain.com

# === DATABASE ===
DATABASE_URL=postgresql://user:pass@localhost:5432/fluxolab
PG_POOL_MAX=10
PG_IDLE_TIMEOUT_MS=30000
PG_SSL=false

# === REDIS ===
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# === AUTHENTICATION ===
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=12h
TOKEN_HASH_SECRET=your_token_hash_secret
BCRYPT_SALT_ROUNDS=10

# === WEBHOOKS ===
VERIFY_TOKEN=your_verify_token
APP_SECRET=your_app_secret

# === SECURITY ===
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120

# === MONITORING ===
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info

# === EMAIL ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@yourdomain.com

# === FILE STORAGE ===
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket

# === MCP INTEGRATION ===
MCP_SERVER_URL=https://your-mcp-server.com
MCP_API_KEY=your_mcp_api_key

# === FEATURE FLAGS ===
ENABLE_SWAGGER=true
ENABLE_METRICS=true
```

## 🚨 Solução de Problemas

### Problemas Comuns

#### 1. Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conexão
psql -U username -h localhost -d fluxolab
```

#### 2. Erro de Porta em Uso
```bash
# Verificar processos usando a porta
sudo netstat -tulpn | grep :3000

# Matar processo se necessário
sudo kill -9 PID
```

#### 3. Problemas com Docker
```bash
# Limpar containers e volumes
docker-compose down -v
docker system prune -a

# Rebuild completo
docker-compose build --no-cache
docker-compose up -d
```

#### 4. Problemas de Permissão
```bash
# Corrigir permissões
sudo chown -R $USER:$USER .
chmod -R 755 .
```

## 📞 Suporte

Se você encontrar problemas durante a instalação:

1. **Verifique os logs**: `docker-compose logs`
2. **Consulte a documentação**: [docs/](../README.md)
3. **Abra uma issue**: [GitHub Issues](https://github.com/your-org/fluxolab/issues)
4. **Entre em contato**: support@fluxolab.com

---

**Próximo passo**: [Configuração Inicial](./initial-setup.md)

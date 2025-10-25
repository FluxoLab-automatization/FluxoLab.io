# Configuração SMTP - Envio de Emails

## Status Atual

✅ **Configuração Criada**: Arquivo `.env` com variáveis SMTP configuradas no diretório `backend/`

⚠️ **Senha Precisa de Atualização**: A senha `Saladas.2` precisa ser substituída por uma **Senha de App** do Google

## Variáveis Configuradas

```bash
# backend/.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=fluxolab.contato@gmail.com
SMTP_PASS=Saladas.2  # ⚠️ Precisa ser substituída por Senha de App
MAIL_FROM=FluxoLab Contato <fluxolab.contato@gmail.com>
```

## Como Gerar Senha de App no Gmail

### Pré-requisitos
1. Conta Google: fluxolab.contato@gmail.com
2. Acesso à conta com senha: `Saladas.2`

### Passos para Gerar Senha de App

1. **Acesse a página de Senhas de App**
   - URL: https://myaccount.google.com/apppasswords
   - (Pode pedir confirmação de senha)

2. **Configure a geração**
   - **Selecione app**: Email
   - **Selecione dispositivo**: Outro (Nome personalizado)
   - **Digite**: `FluxoLab Backend`
   - Clique em **Gerar**

3. **Copie a senha gerada**
   - Formato: `xxxx xxxx xxxx xxxx` (4 grupos de 4 caracteres)
   - Exemplo: `abcd efgh ijkl mnop`

4. **Remova os espaços**
   - Converte para: `abcdefghijklmnop`

5. **Atualize o arquivo .env**
   ```bash
   # backend/.env
   SMTP_PASS=abcdefghijklmnop  # Sem espaços
   ```

## Comportamento Atual

### Modo Desenvolvimento (SMTP_PASS não configurado ou inválido)
- ✅ Sistema continua funcionando
- ✅ Código de verificação é **gerado**
- ✅ Código aparece **no console do backend**
- ⚠️ Email **não é enviado**
- ℹ️ Logs mostram o código para testes

### Modo Produção (SMTP_PASS com Senha de App válida)
- ✅ Sistema funcionando normalmente
- ✅ Código de verificação é gerado
- ✅ Email é **enviado** com sucesso
- ✅ Usuário recebe email com código

## Teste Manual

Após configurar a Senha de App:

```bash
cd backend
npm run build
node test_email.js
```

Resultado esperado:
```
✅ Servidor SMTP está pronto para enviar emails
✅ Email enviado com sucesso!
Message ID: <xxx@xxx.com>
```

## Troubleshooting

### Erro: "Invalid login: 535-5.7.8"
- **Causa**: Senha não é uma Senha de App
- **Solução**: Gerar nova Senha de App (passos acima)

### Erro: "Missing credentials"
- **Causa**: Variável SMTP_PASS vazia
- **Solução**: Verificar arquivo `.env`

### Erro: "2FA not enabled"
- **Causa**: Autenticação de dois fatores não habilitada
- **Solução**: Habilitar 2FA na conta Google (necessário para Senhas de App)

## Segurança

⚠️ **IMPORTANTE**: 
- Nunca commitar arquivo `.env` no Git
- O arquivo `.env` já está em `.gitignore`
- Senhas de App são específicas por aplicação
- Se comprometida, pode ser revogada no Google

## Referências

- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Nodemailer SMTP](https://nodemailer.com/about/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)

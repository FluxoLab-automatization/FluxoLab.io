**Descrição:** Sistema robusto de execução com retry e DLQ
**Estimativa:** 4 dias
**Prioridade:** 🔴 Alta

**Checklist:**
- [ ] Criar tabelas: `runs`, `run_steps`, `dlq`
- [ ] Implementar retries com backoff exponencial
- [ ] Idempotência por execução
- [ ] Dead Letter Queue (DLQ)
- [ ] Endpoint de replay de execuções
- [ ] Dashboard de execuções falhas

**Critérios de Aceite:**
- [ ] Retry automático em falhas transitórias
- [ ] Execuções duplicadas são ignoradas
- [ ] DLQ captura falhas permanentes
- [ ] Replay refaz execução do ponto de falha
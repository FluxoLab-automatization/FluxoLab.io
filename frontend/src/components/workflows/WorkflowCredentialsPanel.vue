<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSessionStore } from '../../stores/session.store';
import {
  createWorkflowCredential,
  listWorkflowCredentials,
  type WorkflowCredentialSummary,
} from '../../services/workflows.service';

const sessionStore = useSessionStore();
const { token } = storeToRefs(sessionStore);

const loading = ref(false);
const credentials = ref<WorkflowCredentialSummary[]>([]);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

const form = reactive({
  name: '',
  host: '',
  port: 587,
  secure: true,
  user: '',
  password: '',
});

const disabled = computed(() => !token.value || loading.value);

async function refreshCredentials() {
  if (!token.value) return;
  loading.value = true;
  error.value = null;
  try {
    const response = await listWorkflowCredentials(token.value);
    credentials.value = response.credentials;
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Falha ao buscar credenciais.';
    }
  } finally {
    loading.value = false;
  }
}

async function submit() {
  if (!token.value) {
    error.value = 'Faca login para criar credenciais.';
    return;
  }
  loading.value = true;
  error.value = null;
  success.value = null;
  try {
    const payload = {
      name: form.name || `smtp-${Date.now()}`,
      type: 'smtp',
      secret: {
        host: form.host,
        port: Number(form.port),
        secure: Boolean(form.secure),
        user: form.user,
        password: form.password,
      },
    };
    await createWorkflowCredential(token.value, payload);
    success.value = 'Credencial criada com sucesso.';
    await refreshCredentials();
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Falha ao criar credencial.';
    }
  } finally {
    loading.value = false;
  }
}

refreshCredentials().catch(() => {
  /* swallow */
});
</script>

<template>
  <section class="credentials-panel">
    <header>
      <div>
        <h3>Credenciais SMTP</h3>
        <p>Crie credenciais para usar nos workflows (SMTP para envio de e-mails).</p>
      </div>
      <button type="button" class="refresh-btn" :disabled="disabled" @click="refreshCredentials">
        Atualizar
      </button>
    </header>

    <div class="panel-content">
      <aside>
        <h4>Credenciais cadastradas</h4>
        <ul v-if="credentials.length > 0">
          <li v-for="cred in credentials" :key="cred.id">
            <span class="cred-name">{{ cred.name }}</span>
            <small>{{ cred.type }} · {{ new Date(cred.createdAt).toLocaleString() }}</small>
          </li>
        </ul>
        <p v-else class="empty-state">
          Nenhuma credencial cadastrada. Use o formulario ao lado para criar.
        </p>
      </aside>

      <form class="cred-form" @submit.prevent="submit">
        <h4>Nova credencial SMTP</h4>
        <label class="form-field">
          <span>Nome</span>
          <input v-model="form.name" type="text" :disabled="disabled" placeholder="smtp-producao" />
        </label>

        <label class="form-field">
          <span>Host</span>
          <input v-model="form.host" type="text" :disabled="disabled" placeholder="smtp.mailgun.org" />
        </label>

        <label class="form-field">
          <span>Porta</span>
          <input v-model.number="form.port" type="number" min="1" :disabled="disabled" />
        </label>

        <label class="form-field form-field--checkbox">
          <input v-model="form.secure" type="checkbox" :disabled="disabled" />
          <span>Usar TLS/SSL</span>
        </label>

        <label class="form-field">
          <span>Usuário</span>
          <input v-model="form.user" type="text" :disabled="disabled" />
        </label>

        <label class="form-field">
          <span>Senha</span>
          <input v-model="form.password" type="password" :disabled="disabled" />
        </label>

        <button type="submit" class="submit-btn" :disabled="disabled">Criar credencial</button>

        <p v-if="error" class="feedback error">{{ error }}</p>
        <p v-if="success" class="feedback success">{{ success }}</p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.credentials-panel {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

header p {
  margin: 0.25rem 0 0 0;
  color: rgba(148, 163, 184, 0.75);
  font-size: 0.85rem;
}

.refresh-btn {
  border: 1px solid rgba(99, 102, 241, 0.45);
  background: rgba(99, 102, 241, 0.12);
  color: #c7d2fe;
  padding: 0.45rem 0.9rem;
  border-radius: 0.6rem;
  cursor: pointer;
}

.refresh-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.panel-content {
  display: grid;
  grid-template-columns: minmax(200px, 240px) 1fr;
  gap: 1.5rem;
}

aside {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

aside h4 {
  margin: 0;
  font-size: 0.95rem;
  color: #f8fafc;
}

aside ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

aside li {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cred-name {
  font-weight: 600;
}

.empty-state {
  color: rgba(148, 163, 184, 0.75);
  font-size: 0.85rem;
}

.cred-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  align-items: start;
}

.cred-form h4 {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.85rem;
}

.form-field input[type='text'],
.form-field input[type='number'],
.form-field input[type='password'] {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 0.6rem;
  padding: 0.5rem 0.75rem;
  color: #f8fafc;
}

.form-field--checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.submit-btn {
  grid-column: 1 / -1;
  justify-self: flex-start;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 0.75rem;
  padding: 0.55rem 1.2rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback {
  grid-column: 1 / -1;
  font-size: 0.82rem;
  margin: 0;
}

.feedback.error {
  color: #f87171;
}

.feedback.success {
  color: #4ade80;
}

@media (max-width: 900px) {
  .panel-content {
    grid-template-columns: 1fr;
  }
}
</style>







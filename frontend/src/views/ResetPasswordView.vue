<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <div class="header">
        <div class="logo">
          <h1>FluxoLab</h1>
        </div>
        <h2>Definir nova senha</h2>
        <p class="subtitle">
          Digite sua nova senha para continuar
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="input-group">
          <label for="newPassword" class="input-label">
            Nova senha
          </label>
          <div class="password-input-container">
            <input
              id="newPassword"
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              :class="['input', 'password-input', { 'input-error': errors.newPassword }]"
              placeholder="Digite sua nova senha"
              :disabled="loading"
              @input="clearError('newPassword')"
            />
            <button
              type="button"
              class="password-toggle"
              @click="togglePassword"
              :disabled="loading"
            >
              <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <span v-if="errors.newPassword" class="error-message">
            {{ errors.newPassword }}
          </span>
        </div>

        <div class="input-group">
          <label for="confirmPassword" class="input-label">
            Confirmar senha
          </label>
          <div class="password-input-container">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              :class="['input', 'password-input', { 'input-error': errors.confirmPassword }]"
              placeholder="Confirme sua nova senha"
              :disabled="loading"
              @input="clearError('confirmPassword')"
            />
            <button
              type="button"
              class="password-toggle"
              @click="toggleConfirmPassword"
              :disabled="loading"
            >
              <svg v-if="showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <span v-if="errors.confirmPassword" class="error-message">
            {{ errors.confirmPassword }}
          </span>
        </div>

        <div class="password-requirements">
          <h4>Requisitos da senha:</h4>
          <ul>
            <li :class="{ 'valid': passwordChecks.length }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              Pelo menos 8 caracteres
            </li>
            <li :class="{ 'valid': passwordChecks.uppercase }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              Uma letra maiúscula
            </li>
            <li :class="{ 'valid': passwordChecks.lowercase }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              Uma letra minúscula
            </li>
            <li :class="{ 'valid': passwordChecks.number }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              Um número
            </li>
            <li :class="{ 'valid': passwordChecks.special }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              Um caractere especial (@$!%*?&)
            </li>
          </ul>
        </div>

        <button
          type="submit"
          :disabled="!isFormValid || loading"
          class="submit-button"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Alterando senha...' : 'Alterar senha' }}
        </button>
      </form>

      <div class="footer">
        <p>
          Lembrou da senha?
          <router-link to="/login" class="login-link">
            Fazer login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSessionStore } from '../stores/session.store'

const router = useRouter()
const route = useRoute()
const sessionStore = useSessionStore()

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = reactive<Record<string, string>>({})

const passwordChecks = computed(() => {
  const password = newPassword.value
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  }
})

const isFormValid = computed(() => {
  return (
    newPassword.value.length >= 8 &&
    confirmPassword.value.length >= 8 &&
    newPassword.value === confirmPassword.value &&
    Object.values(passwordChecks.value).every(check => check)
  )
})

const clearError = (field: string) => {
  if (errors[field]) {
    delete errors[field]
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!newPassword.value) {
    newErrors.newPassword = 'Nova senha é obrigatória'
  } else if (newPassword.value.length < 8) {
    newErrors.newPassword = 'Senha deve ter pelo menos 8 caracteres'
  } else if (!Object.values(passwordChecks.value).every(check => check)) {
    newErrors.newPassword = 'Senha não atende aos requisitos'
  }

  if (!confirmPassword.value) {
    newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
  } else if (newPassword.value !== confirmPassword.value) {
    newErrors.confirmPassword = 'As senhas não coincidem'
  }

  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    await sessionStore.resetPassword({ resetToken: sessionStore.resetToken!, newPassword: newPassword.value })

    // Redirecionar para login com mensagem de sucesso
    router.push({
      name: 'login',
      query: { message: 'Senha alterada com sucesso! Faça login com sua nova senha.' }
    })

  } catch (error: any) {
    console.error('Erro ao alterar senha:', error)

    if (error.response?.data?.message) {
      errors.general = error.response.data.message
    } else {
      errors.general = 'Erro ao alterar senha. Tente novamente.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Verificar se há token de reset
  if (!sessionStore.resetToken) {
    router.push('/login')
  }
})
</script>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.reset-password-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 480px;
  padding: 40px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.logo h1 {
  margin: 0 0 16px 0;
  font-size: 2rem;
  font-weight: 700;
  color: #7c3aed;
}

.header h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.password-input-container {
  position: relative;
}

.password-input {
  padding: 12px 48px 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: white;
  width: 100%;
}

.password-input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.password-input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.password-toggle:hover:not(:disabled) {
  background-color: #f3f4f6;
  color: #374151;
}

.password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 4px;
}

.password-requirements {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.password-requirements h4 {
  margin: 0 0 12px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.password-requirements ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.password-requirements li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #6b7280;
  transition: all 0.2s;
}

.password-requirements li.valid {
  color: #16a34a;
}

.password-requirements li svg {
  flex-shrink: 0;
}

.submit-button {
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
}

.submit-button:hover:not(:disabled) {
  background-color: #6d28d9;
}

.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.footer {
  margin-top: 24px;
  text-align: center;
}

.footer p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.login-link {
  color: #7c3aed;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.login-link:hover {
  color: #6d28d9;
  text-decoration: underline;
}
</style>

<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>Esqueci minha senha</h2>
        <button class="close-button" @click="closeModal" aria-label="Fechar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <p class="description">
          Digite seu e-mail ou CPF para receber um código de verificação
        </p>

        <form @submit.prevent="handleSubmit" class="form">
          <div class="input-group">
            <label for="identifier" class="input-label">
              E-mail ou CPF
            </label>
            <input
              id="identifier"
              v-model="identifier"
              type="text"
              :class="['input', { 'input-error': errors.identifier }]"
              placeholder="seu@email.com ou 000.000.000-00"
              :disabled="loading"
              @input="clearError('identifier')"
            />
            <span v-if="errors.identifier" class="error-message">
              {{ errors.identifier }}
            </span>
          </div>

          <button
            type="submit"
            :disabled="!identifier.trim() || loading"
            class="submit-button"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Enviando...' : 'Enviar código' }}
          </button>
        </form>

        <div class="help-text">
          <p>
            <strong>Dica:</strong> Use o mesmo e-mail ou CPF que você usou para criar sua conta.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useSessionStore } from '../../stores/session.store'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'next', identifier: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const sessionStore = useSessionStore()

const identifier = ref('')
const loading = ref(false)
const errors = reactive<Record<string, string>>({})

const clearError = (field: string) => {
  if (errors[field]) {
    delete errors[field]
  }
}

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!identifier.value.trim()) {
    newErrors.identifier = 'E-mail ou CPF é obrigatório'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/

    if (!emailRegex.test(identifier.value) && !cpfRegex.test(identifier.value)) {
      newErrors.identifier = 'Digite um e-mail ou CPF válido'
    }
  }

  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    await sessionStore.forgotPassword({ identifier: identifier.value.trim() })

    // Fechar modal e abrir próximo
    emit('update:show', false)
    emit('next', identifier.value.trim())

    // Limpar formulário
    identifier.value = ''
    Object.keys(errors).forEach(key => delete errors[key])

  } catch (error: any) {
    console.error('Erro ao solicitar reset de senha:', error)

    if (error.response?.data?.message) {
      errors.general = error.response.data.message
    } else {
      errors.general = 'Erro ao enviar código. Tente novamente.'
    }
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  if (!loading.value) {
    emit('update:show', false)
    // Limpar formulário ao fechar
    identifier.value = ''
    Object.keys(errors).forEach(key => delete errors[key])
  }
}

// Limpar erros quando o modal abrir
watch(() => props.show, (newShow) => {
  if (newShow) {
    Object.keys(errors).forEach(key => delete errors[key])
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 0 24px 24px 24px;
}

.description {
  color: #6b7280;
  margin-bottom: 24px;
  line-height: 1.5;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: white;
}

.input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
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

.help-text {
  margin-top: 16px;
  padding: 12px;
  background-color: #f3f4f6;
  border-radius: 8px;
  border-left: 4px solid #7c3aed;
}

.help-text p {
  margin: 0;
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.4;
}

.help-text strong {
  color: #7c3aed;
}
</style>

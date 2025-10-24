<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>Verificar código</h2>
        <button class="close-button" @click="closeModal" aria-label="Fechar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="success-message">
          <div class="success-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"></path>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </div>
          <p>
            Enviamos um código de 6 dígitos para o e-mail associado a esta conta.
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="form">
          <div class="input-group">
            <label for="code" class="input-label">
              Código de verificação
            </label>
            <input
              id="code"
              ref="codeInput"
              v-model="code"
              type="text"
              :class="['input', 'code-input', { 'input-error': errors.code }]"
              placeholder="000000"
              maxlength="6"
              :disabled="loading"
              @input="handleCodeInput"
              @paste="handlePaste"
            />
            <span v-if="errors.code" class="error-message">
              {{ errors.code }}
            </span>
          </div>

          <div class="timer-container">
            <div v-if="timeLeft > 0" class="timer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
              <span>Expira em {{ formatTime(timeLeft) }}</span>
            </div>
            <button
              v-else
              type="button"
              @click="resendCode"
              :disabled="resendLoading"
              class="resend-button"
            >
              {{ resendLoading ? 'Enviando...' : 'Reenviar código' }}
            </button>
          </div>

          <button
            type="submit"
            :disabled="code.length !== 6 || loading"
            class="submit-button"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Verificando...' : 'Verificar código' }}
          </button>
        </form>

        <div class="help-text">
          <p>
            <strong>Não recebeu o código?</strong> Verifique sua caixa de spam ou aguarde alguns minutos.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useSessionStore } from '../../stores/session.store'

interface Props {
  show: boolean
  identifier: string
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'verified', resetToken: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const sessionStore = useSessionStore()

const code = ref('')
const loading = ref(false)
const resendLoading = ref(false)
const errors = reactive<Record<string, string>>({})
const timeLeft = ref(600) // 10 minutos em segundos
const codeInput = ref<HTMLInputElement>()

let timer: number | null = null

const clearError = (field: string) => {
  if (errors[field]) {
    delete errors[field]
  }
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const startTimer = () => {
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timer!)
      timer = null
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const handleCodeInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '') // Apenas números

  if (value.length <= 6) {
    code.value = value
    clearError('code')
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const numbers = pastedData.replace(/\D/g, '')

  if (numbers.length <= 6) {
    code.value = numbers
    clearError('code')
  }
}

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!code.value) {
    newErrors.code = 'Código é obrigatório'
  } else if (code.value.length !== 6) {
    newErrors.code = 'Código deve ter 6 dígitos'
  }

  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    const resetToken = await sessionStore.verifyResetCode({ identifier: props.identifier, code: code.value })

    // Fechar modal e passar o token
    emit('update:show', false)
    emit('verified', resetToken)

    // Limpar formulário
    code.value = ''
    Object.keys(errors).forEach(key => delete errors[key])
    stopTimer()

  } catch (error: any) {
    console.error('Erro ao verificar código:', error)

    if (error.response?.data?.message) {
      errors.code = error.response.data.message
    } else {
      errors.code = 'Código inválido. Verifique e tente novamente.'
    }
  } finally {
    loading.value = false
  }
}

const resendCode = async () => {
  resendLoading.value = true

  try {
    await sessionStore.forgotPassword({ identifier: props.identifier })

    // Reiniciar timer
    timeLeft.value = 600
    startTimer()

    // Limpar código atual
    code.value = ''
    Object.keys(errors).forEach(key => delete errors[key])

  } catch (error: any) {
    console.error('Erro ao reenviar código:', error)
    // Não mostrar erro para o usuário, apenas log
  } finally {
    resendLoading.value = false
  }
}

const closeModal = () => {
  if (!loading.value && !resendLoading.value) {
    emit('update:show', false)
    // Limpar formulário ao fechar
    code.value = ''
    Object.keys(errors).forEach(key => delete errors[key])
    stopTimer()
  }
}

// Focar no input quando o modal abrir
watch(() => props.show, async (newShow) => {
  if (newShow) {
    Object.keys(errors).forEach(key => delete errors[key])
    timeLeft.value = 600
    startTimer()

    await nextTick()
    codeInput.value?.focus()
  } else {
    stopTimer()
  }
})

onMounted(() => {
  if (props.show) {
    startTimer()
  }
})

onUnmounted(() => {
  stopTimer()
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

.success-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.success-icon {
  color: #16a34a;
  flex-shrink: 0;
  margin-top: 2px;
}

.success-message p {
  margin: 0;
  color: #166534;
  font-size: 0.875rem;
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

.code-input {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5em;
  font-family: 'Courier New', monospace;
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

.timer-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.timer {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.875rem;
}

.resend-button {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.resend-button:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.resend-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

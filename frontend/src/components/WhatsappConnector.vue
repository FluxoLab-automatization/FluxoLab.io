<template>
  <div class="whatsapp-connector">
    <h2>Conector WhatsApp</h2>
    <div class="status-card">
      <p>Status: <span :class="`status-text status-${status.toLowerCase()}`">{{ formattedStatus }}</span></p>
    </div>

    <div v-if="status === 'QR_RECEIVED' && qrCode" class="qr-card">
      <p>Escaneie o código abaixo com o seu celular:</p>
      <div class="qr-code">
        <QrcodeVue :value="qrCode" :size="300" level="H" />
      </div>
    </div>

    <div v-if="status === 'READY'" class="ready-message">
      <p>✅ Cliente WhatsApp conectado com sucesso!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { io, type Socket } from 'socket.io-client';
import QrcodeVue from 'qrcode.vue';
import { apiBaseUrl } from '@/services/api';

type WhatsappStatus =
  | 'INITIALIZING'
  | 'QR_RECEIVED'
  | 'READY'
  | 'DISCONNECTED'
  | 'AUTH_FAILURE'
  | 'INIT_FAILURE';

const status = ref<WhatsappStatus>('DISCONNECTED');
const qrCode = ref('');
const socketRef = ref<Socket | null>(null);

const statusMap: Record<WhatsappStatus, string> = {
  INITIALIZING: 'Inicializando...',
  QR_RECEIVED: 'Aguardando leitura do QR Code',
  READY: 'Conectado',
  DISCONNECTED: 'Desconectado',
  AUTH_FAILURE: 'Falha na Autenticação',
  INIT_FAILURE: 'Falha ao Inicializar',
};

const formattedStatus = computed(() => statusMap[status.value] ?? status.value);

function resolveSocketOrigin(): string {
  const fromEnv = import.meta.env.VITE_SOCKET_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    try {
      const url = new URL(fromEnv.trim());
      return url.origin + url.pathname.replace(/\/+$/, '');
    } catch (error) {
      console.warn('[WhatsappConnector] Invalid VITE_SOCKET_URL, falling back to defaults.', error);
    }
  }

  if (apiBaseUrl.startsWith('http')) {
    try {
      const url = new URL(apiBaseUrl);
      return url.origin;
    } catch (error) {
      console.warn('[WhatsappConnector] Failed to parse apiBaseUrl, using window origin.', error);
    }
  }

  return window.location.origin;
}

function resetQrIfNeeded(nextStatus: WhatsappStatus) {
  if (nextStatus !== 'QR_RECEIVED') {
    qrCode.value = '';
  }
}

onMounted(() => {
  const socket = io(resolveSocketOrigin(), {
    path: import.meta.env.VITE_SOCKET_PATH || '/socket.io',
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });

  socketRef.value = socket;

  socket.on('connect', () => {
    console.debug('[WhatsappConnector] Connected to websocket server', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.warn('[WhatsappConnector] Connection error', error);
    status.value = 'DISCONNECTED';
    resetQrIfNeeded(status.value);
  });

  socket.on('whatsapp.status', (data) => {
    if (!data || typeof data.status !== 'string') {
      return;
    }
    const incoming = data.status.toUpperCase();
    const nextStatus: WhatsappStatus =
      incoming in statusMap ? (incoming as WhatsappStatus) : 'DISCONNECTED';
    status.value = nextStatus;
    resetQrIfNeeded(status.value);
  });

  socket.on('whatsapp.qr', (data) => {
    if (!data || typeof data.qr !== 'string') {
      return;
    }
    qrCode.value = data.qr;
    status.value = 'QR_RECEIVED';
  });

  socket.on('disconnect', () => {
    console.debug('[WhatsappConnector] Disconnected from websocket server');
    status.value = 'DISCONNECTED';
    resetQrIfNeeded(status.value);
  });
});

onBeforeUnmount(() => {
  socketRef.value?.removeAllListeners();
  socketRef.value?.disconnect();
  socketRef.value = null;
});
</script>

<style scoped>
.whatsapp-connector {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  margin: 20px auto;
  font-family: sans-serif;
  text-align: center;
}

.status-card {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.status-text {
  font-weight: bold;
}

.status-initializing, .status-qr_received {
  color: #ffa500; /* Orange */
}

.status-ready {
  color: #28a745; /* Green */
}

.status-disconnected, .status-auth_failure, .status-init_failure {
  color: #dc3545; /* Red */
}

.qr-card {
  margin-top: 20px;
}

.qr-code {
  padding: 20px;
  background-color: white;
  display: inline-block;
  border-radius: 8px;
  margin-top: 10px;
}

.ready-message {
  color: #28a745;
  font-weight: bold;
  margin-top: 20px;
}
</style>

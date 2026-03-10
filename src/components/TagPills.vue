<template>
  <div class="tag-pills-container">
    <div class="tag-pills">
      <span
        v-for="tag in tags"
        :key="tag.id"
        :class="['tag-pill', { active: store.activeTags.includes(tag.id) }]"
        :style="{ background: tag.color }"
        @click="store.filterByTag(tag.id)"
      >
        #{{ tag.id }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '../stores/app'

const store = useAppStore()

const tags = [
  { id: 'rce', label: 'RCE', color: '#f38ba8' },
  { id: 'cmdi', label: 'Command Injection', color: '#eba0ac' },
  { id: 'lfi', label: 'LFI', color: '#fab387' },
  { id: 'upload', label: 'File Upload', color: '#f9e2af' },
  { id: 'sqli', label: 'SQLi', color: '#a6e3a1' },
  { id: 'deser', label: 'Deserialization', color: '#94e2d5' },
  { id: 'ssrf', label: 'SSRF', color: '#89dceb' },
  { id: 'xxe', label: 'XXE', color: '#74c7ec' },
  { id: 'type', label: 'Type Juggling', color: '#89b4fa' },
  { id: 'crypto', label: 'Weak Crypto', color: '#b4befe' },
  { id: 'info', label: 'Info Disclosure', color: '#cba6f7' },
  { id: 'filter', label: 'Stream Wrappers', color: '#f5c2e7' },
  { id: 'bypass', label: 'Bypass', color: '#f5e0dc' },
  { id: 'ssti', label: 'SSTI', color: '#f2cdcd' }
]
</script>

<style scoped>
.tag-pills-container {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.tag-pills {
  display: flex;
  gap: 6px;
  padding: 4px 0;
  white-space: nowrap;
}

.tag-pill {
  color: var(--ctp-crust);
  flex-shrink: 0;
}
</style>

<template>
  <div class="modal-overlay" @click.self="store.showCompareMode = false">
    <div class="modal compare-modal">
      <div class="modal-header">
        <h2>Compare Functions</h2>
        <button @click="store.showCompareMode = false" class="btn-close">✕</button>
      </div>

      <div class="compare-selector">
        <div class="compare-item">
          <strong>Current:</strong> {{ store.currentDoc?.name }}
        </div>
        <div class="compare-item">
          <strong>Compare with:</strong>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for function..."
            class="compare-search"
          />
          <select v-model="selectedDoc" class="compare-select">
            <option value="">Select a function...</option>
            <option
              v-for="entry in filteredEntries"
              :key="entry.file"
              :value="entry.file"
            >
              {{ entry.name }} - {{ entry.title }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="selectedDoc" class="compare-view">
        <div class="compare-pane">
          <h3>{{ store.currentDoc?.name }}</h3>
          <iframe
            :src="`/php-chunked-xhtml/${store.currentDoc?.file}`"
            class="compare-iframe"
          ></iframe>
        </div>
        <div class="compare-pane">
          <h3>{{ compareEntry?.name }}</h3>
          <iframe
            :src="`/php-chunked-xhtml/${selectedDoc}`"
            class="compare-iframe"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const searchQuery = ref('')
const selectedDoc = ref('')

const filteredEntries = computed(() => {
  if (!searchQuery.value) return store.allEntries.slice(0, 50)
  const query = searchQuery.value.toLowerCase()
  return store.allEntries
    .filter(e => e.name?.toLowerCase().includes(query))
    .slice(0, 50)
})

const compareEntry = computed(() => {
  return store.allEntries.find(e => e.file === selectedDoc.value)
})
</script>

<style scoped>
.compare-modal {
  width: 95vw;
  height: 90vh;
  max-width: none;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 20px;
  color: var(--ctp-text);
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: var(--ctp-text);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.compare-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--ctp-surface0);
  border-radius: 8px;
}

.compare-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compare-search,
.compare-select {
  width: 100%;
}

.compare-view {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
}

.compare-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.compare-pane h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: var(--ctp-text);
}

.compare-iframe {
  flex: 1;
  width: 100%;
  border: 1px solid var(--ctp-surface2);
  border-radius: 6px;
  background: white;
}
</style>

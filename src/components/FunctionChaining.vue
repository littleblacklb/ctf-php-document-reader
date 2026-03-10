<template>
  <div class="function-chaining">
    <div class="chain-header">🔗 Commonly chained with:</div>
    <div class="chain-chips">
      <button
        v-for="chain in chains"
        :key="chain"
        @click="navigateToFunction(chain)"
        class="chain-chip"
      >
        {{ chain }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '../stores/app'

defineProps({
  chains: {
    type: Array,
    required: true
  }
})

const store = useAppStore()

function navigateToFunction(funcName) {
  const entry = store.allEntries.find(e =>
    e.name === funcName || e.name === `${funcName}()`
  )
  if (entry) {
    store.openDocument(entry.file)
  }
}
</script>

<style scoped>
.function-chaining {
  margin: 16px;
  padding: 12px 16px;
  background: var(--ctp-surface0);
  border-radius: 8px;
}

.chain-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--ctp-text);
  margin-bottom: 8px;
}

.chain-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chain-chip {
  padding: 6px 12px;
  background: var(--ctp-blue);
  color: var(--ctp-crust);
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.chain-chip:hover {
  background: var(--ctp-sapphire);
  transform: translateY(-2px);
}
</style>

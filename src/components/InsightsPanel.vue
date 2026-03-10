<template>
  <div class="insights-panel">
    <div class="insights-header">💡 Attack Insights</div>
    <div class="insights-list">
      <div
        v-for="(suggestion, index) in store.insightSuggestions"
        :key="index"
        :class="['insight-item', `insight-${suggestion.type}`]"
      >
        {{ suggestion.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '../stores/app'

const store = useAppStore()
</script>

<style scoped>
.insights-panel {
  padding: 16px;
  background: var(--ctp-surface0);
  border-top: 1px solid var(--ctp-surface1);
}

.insights-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--ctp-text);
  margin-bottom: 12px;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.insight-item {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.4;
}

.insight-attack {
  background: var(--ctp-red);
  color: var(--ctp-crust);
}

.insight-pattern {
  background: var(--ctp-blue);
  color: var(--ctp-crust);
}
</style>

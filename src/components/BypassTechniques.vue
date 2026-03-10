<template>
  <div class="bypass-techniques">
    <div class="panel-header" @click="expanded = !expanded">
      <h3>🔓 Bypass Techniques</h3>
      <span class="toggle">{{ expanded ? '▼' : '▶' }}</span>
    </div>
    <div v-if="expanded" class="bypasses">
      <div v-for="(bypass, index) in bypasses" :key="index" class="bypass-item">
        <div class="bypass-technique">{{ bypass.technique }}</div>
        <div class="bypass-versions" v-if="bypass.versions">
          Affected: {{ bypass.versions }}
        </div>
        <pre class="code-block">{{ bypass.payload }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  bypasses: {
    type: Array,
    required: true
  }
})

const expanded = ref(true)
</script>

<style scoped>
.bypass-techniques {
  margin: 16px;
  background: var(--ctp-surface0);
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  padding: 12px 16px;
  background: var(--ctp-yellow);
  color: var(--ctp-crust);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.toggle {
  font-size: 12px;
}

.bypasses {
  padding: 16px;
}

.bypass-item {
  margin-bottom: 16px;
}

.bypass-item:last-child {
  margin-bottom: 0;
}

.bypass-technique {
  font-weight: 600;
  color: var(--ctp-text);
  margin-bottom: 4px;
}

.bypass-versions {
  font-size: 12px;
  color: var(--ctp-subtext0);
  margin-bottom: 8px;
}
</style>

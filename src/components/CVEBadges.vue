<template>
  <div class="cve-badges">
    <div class="cve-warning">⚠️ Known CVEs</div>
    <div class="cve-list">
      <a
        v-for="cve in cves"
        :key="cve.cveId"
        :href="cve.link"
        target="_blank"
        class="cve-badge"
        :title="cve.description"
      >
        {{ cve.cveId }}
      </a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cves: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.cve-badges {
  padding: 12px 16px;
  background: var(--ctp-red);
  color: var(--ctp-crust);
  display: flex;
  align-items: center;
  gap: 12px;
}

.cve-warning {
  font-weight: 600;
  font-size: 14px;
}

.cve-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cve-badge {
  background: var(--ctp-crust);
  color: var(--ctp-red);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.cve-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
</style>

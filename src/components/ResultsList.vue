<template>
  <div class="results-list">
    <div
      v-for="entry in visibleEntries"
      :key="entry.file"
    >
      <ResultItem :entry="entry" />
    </div>
    <div v-if="store.filteredEntries.length === 0" class="empty-state">
      No results found. Try a different search.
    </div>
    <div v-if="hasMore" class="load-more">
      <button @click="loadMore" class="btn">Load More</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppStore } from '../stores/app'
import ResultItem from './ResultItem.vue'

const store = useAppStore()
const batchSize = 100
const currentBatch = ref(1)

const visibleEntries = computed(() => {
  return store.filteredEntries.slice(0, currentBatch.value * batchSize)
})

const hasMore = computed(() => {
  return visibleEntries.value.length < store.filteredEntries.length
})

function loadMore() {
  currentBatch.value++
}

// Reset batch when filters change
watch(() => store.filteredEntries, () => {
  currentBatch.value = 1
})
</script>

<style scoped>
.results-list {
  padding: 8px;
}

.empty-state {
  padding: 32px 16px;
  text-align: center;
  color: var(--ctp-subtext0);
  font-size: 14px;
}

.load-more {
  padding: 16px;
  text-align: center;
}
</style>

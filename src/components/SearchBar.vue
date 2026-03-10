<template>
  <div class="search-bar">
    <input
      type="search"
      class="search-input"
      v-model="searchQuery"
      @input="onSearch"
      placeholder="Search functions... (try #rce, #sqli)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const searchQuery = ref('')
let debounceTimer = null

function onSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    store.search(searchQuery.value)
  }, 50)
}
</script>

<style scoped>
.search-bar {
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  font-size: 14px;
}
</style>

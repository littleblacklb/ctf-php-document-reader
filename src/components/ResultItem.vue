<template>
  <div class="result-item" @click="openDoc">
    <div class="result-header">
      <span :class="['badge', badgeClass]">{{ entry.category }}</span>
      <button
        class="bookmark-btn"
        @click.stop="toggleBookmark"
        :title="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
      >
        {{ isBookmarked ? '★' : '☆' }}
      </button>
    </div>
    <div class="result-name">{{ entry.name }}</div>
    <div class="result-title">{{ entry.title }}</div>
    <div v-if="entry.tags && entry.tags.length > 0" class="result-tags">
      <span v-for="tag in entry.tags" :key="tag" class="tag">#{{ tag }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../stores/app'

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
})

const store = useAppStore()

const badgeClass = computed(() => {
  const categoryMap = {
    'Functions': 'badge-blue',
    'Classes': 'badge-green',
    'Class Methods': 'badge-purple',
    'Books': 'badge-peach',
    'References': 'badge-yellow',
    'Language': 'badge-red',
    'Control Structures': 'badge-red'
  }
  return categoryMap[props.entry.category] || 'badge-grey'
})

const isBookmarked = computed(() => {
  return !!store.bookmarks[props.entry.file]
})

function openDoc() {
  store.openDocument(props.entry.file)
}

function toggleBookmark() {
  store.toggleBookmark(props.entry.file)
}
</script>

<style scoped>
.result-item {
  padding: 12px;
  margin-bottom: 8px;
  background: var(--ctp-surface0);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  background: var(--ctp-surface1);
  transform: translateX(4px);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.bookmark-btn {
  background: none;
  border: none;
  color: var(--ctp-yellow);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.bookmark-btn:hover {
  transform: scale(1.2);
}

.result-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--ctp-text);
  margin-bottom: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
}

.result-title {
  font-size: 13px;
  color: var(--ctp-subtext0);
  margin-bottom: 6px;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  font-size: 11px;
  color: var(--ctp-blue);
  background: var(--ctp-surface2);
  padding: 2px 6px;
  border-radius: 4px;
}
</style>

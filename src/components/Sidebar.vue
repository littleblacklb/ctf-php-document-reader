<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1 class="title">PHP Docs CTF</h1>
      <SearchBar />
      <TagPills />
    </div>

    <div class="sidebar-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: store.activeTab === tab.id }]"
        @click="store.activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="sidebar-filters">
      <select v-model="store.activeCategory" @change="store.applyFilters()">
        <option value="all">All Categories</option>
        <option value="Functions">Functions</option>
        <option value="Classes">Classes</option>
        <option value="Class Methods">Class Methods</option>
        <option value="Books">Books/Extensions</option>
        <option value="References">References</option>
        <option value="Language">Language</option>
      </select>

      <select v-model="store.activePhpVersion" @change="store.applyFilters()">
        <option value="all">All PHP Versions</option>
        <option value="5.x">PHP 5.x</option>
        <option value="7.x">PHP 7.x</option>
        <option value="8.x">PHP 8.x</option>
      </select>
    </div>

    <div class="sidebar-content">
      <ResultsList v-if="store.activeTab === 'browse'" />
      <div v-else-if="store.activeTab === 'bookmarks'" class="bookmarks-list">
        <ResultItem
          v-for="entry in store.bookmarkedEntries"
          :key="entry.file"
          :entry="entry"
        />
        <div v-if="store.bookmarkedEntries.length === 0" class="empty-state">
          No bookmarks yet. Click ★ to bookmark functions.
        </div>
      </div>
      <div v-else-if="store.activeTab === 'history'" class="history-list">
        <ResultItem
          v-for="item in store.history"
          :key="item.file + item.time"
          :entry="item"
        />
        <div v-if="store.history.length === 0" class="empty-state">
          No history yet. Browse some functions!
        </div>
      </div>
      <RegexLibrary v-else-if="store.activeTab === 'regex'" />
    </div>

    <InsightsPanel v-if="store.insightSuggestions.length > 0" />
  </div>
</template>

<script setup>
import { useAppStore } from '../stores/app'
import SearchBar from './SearchBar.vue'
import TagPills from './TagPills.vue'
import ResultsList from './ResultsList.vue'
import ResultItem from './ResultItem.vue'
import RegexLibrary from './RegexLibrary.vue'
import InsightsPanel from './InsightsPanel.vue'

const store = useAppStore()

const tabs = [
  { id: 'browse', label: 'Browse' },
  { id: 'bookmarks', label: 'Bookmarks' },
  { id: 'history', label: 'History' },
  { id: 'regex', label: 'Regex' }
]
</script>

<style scoped>
.sidebar {
  width: 380px;
  background: var(--ctp-mantle);
  border-right: 1px solid var(--ctp-surface0);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--ctp-surface0);
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: var(--ctp-blue);
  margin-bottom: 12px;
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--ctp-surface0);
  background: var(--ctp-base);
}

.tab {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  color: var(--ctp-subtext0);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: var(--ctp-text);
  background: var(--ctp-surface0);
}

.tab.active {
  color: var(--ctp-blue);
  border-bottom-color: var(--ctp-blue);
}

.sidebar-filters {
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--ctp-surface0);
}

.sidebar-filters select {
  flex: 1;
  font-size: 12px;
  padding: 6px 8px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.bookmarks-list,
.history-list {
  padding: 8px;
}

.empty-state {
  padding: 32px 16px;
  text-align: center;
  color: var(--ctp-subtext0);
  font-size: 14px;
}
</style>

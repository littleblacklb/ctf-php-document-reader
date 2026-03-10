<template>
  <div class="document-viewer">
    <div v-if="!store.currentDoc" class="welcome-screen">
      <h2>PHP Documentation Searcher</h2>
      <p>CTF Edition - Rapid exploit research tool</p>
      <div class="welcome-stats">
        <div class="stat">
          <div class="stat-value">{{ store.allEntries.length }}</div>
          <div class="stat-label">Functions & Classes</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ Object.keys(store.bookmarks).length }}</div>
          <div class="stat-label">Bookmarks</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ store.history.length }}</div>
          <div class="stat-label">History</div>
        </div>
      </div>
      <div class="welcome-shortcuts">
        <h3>Keyboard Shortcuts</h3>
        <div class="shortcut"><kbd>Ctrl+K</kbd> Focus search</div>
        <div class="shortcut"><kbd>Ctrl+B</kbd> Toggle bookmark</div>
        <div class="shortcut"><kbd>Ctrl+N</kbd> Open notes</div>
        <div class="shortcut"><kbd>Ctrl+T</kbd> Open tools</div>
        <div class="shortcut"><kbd>Ctrl+D</kbd> Disable functions checker</div>
        <div class="shortcut"><kbd>Esc</kbd> Close modals</div>
      </div>
    </div>

    <div v-else class="document-content">
      <div class="toolbar">
        <button v-if="store.navStack.length > 0" @click="store.goBack()" class="btn">
          ← Back
        </button>
        <div class="breadcrumb">{{ store.currentDoc.name }}</div>
        <div class="toolbar-actions">
          <button @click="toggleBookmark" class="btn" :title="isBookmarked ? 'Remove bookmark' : 'Add bookmark'">
            {{ isBookmarked ? '★' : '☆' }}
          </button>
          <button @click="copySignature" class="btn" title="Copy function signature">
            Copy
          </button>
          <button @click="store.showCompareMode = true" class="btn" title="Compare with another function">
            Compare
          </button>
          <button @click="store.showTools = true" class="btn" title="Encoder/Decoder tools">
            Tools
          </button>
          <button @click="store.showWrapperRef = true" class="btn" title="Stream wrappers reference">
            Wrappers
          </button>
          <button @click="store.showDisableFunctions = true" class="btn" title="Disable functions checker">
            Disable Check
          </button>
          <button @click="store.showShare = true" class="btn" title="Share bookmarks">
            Share
          </button>
          <button @click="openExternal" class="btn" title="Open in new tab">
            ↗
          </button>
        </div>
      </div>

      <CVEBadges v-if="currentCVEs.length > 0" :cves="currentCVEs" />

      <div class="doc-panels">
        <iframe
          :src="`/php-chunked-xhtml/${store.currentDoc.file}`"
          class="doc-iframe"
          @load="onIframeLoad"
        ></iframe>
      </div>

      <ExploitPanel v-if="currentExploits.length > 0" :exploits="currentExploits" />
      <BypassTechniques v-if="currentBypasses.length > 0" :bypasses="currentBypasses" />
      <FunctionChaining v-if="currentChains.length > 0" :chains="currentChains" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../stores/app'
import CVEBadges from './CVEBadges.vue'
import ExploitPanel from './ExploitPanel.vue'
import BypassTechniques from './BypassTechniques.vue'
import FunctionChaining from './FunctionChaining.vue'

const store = useAppStore()

const isBookmarked = computed(() => {
  return store.currentDoc && !!store.bookmarks[store.currentDoc.file]
})

const currentExploits = computed(() => {
  if (!store.currentDoc) return []
  const funcName = store.currentDoc.name?.replace(/\(\)$/, '')
  return store.exploits[funcName] || []
})

const currentBypasses = computed(() => {
  if (!store.currentDoc) return []
  const funcName = store.currentDoc.name?.replace(/\(\)$/, '')
  return store.bypasses[funcName] || []
})

const currentCVEs = computed(() => {
  if (!store.currentDoc) return []
  const funcName = store.currentDoc.name?.replace(/\(\)$/, '')
  return store.cves[funcName] || []
})

const currentChains = computed(() => {
  if (!store.currentDoc) return []
  const funcName = store.currentDoc.name?.replace(/\(\)$/, '')
  return store.chainSuggestions[funcName] || []
})

function toggleBookmark() {
  if (store.currentDoc) {
    store.toggleBookmark(store.currentDoc.file)
  }
}

function copySignature() {
  if (store.currentDoc) {
    navigator.clipboard.writeText(store.currentDoc.name)
  }
}

function openExternal() {
  if (store.currentDoc) {
    window.open(`/php-chunked-xhtml/${store.currentDoc.file}`, '_blank')
  }
}

function onIframeLoad() {
  // Could add iframe content manipulation here if needed
}
</script>

<style scoped>
.document-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--ctp-base);
}

.welcome-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.welcome-screen h2 {
  font-size: 32px;
  color: var(--ctp-blue);
  margin-bottom: 8px;
}

.welcome-screen p {
  font-size: 16px;
  color: var(--ctp-subtext0);
  margin-bottom: 32px;
}

.welcome-stats {
  display: flex;
  gap: 48px;
  margin-bottom: 48px;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--ctp-text);
}

.stat-label {
  font-size: 14px;
  color: var(--ctp-subtext0);
  margin-top: 4px;
}

.welcome-shortcuts {
  max-width: 400px;
}

.welcome-shortcuts h3 {
  font-size: 18px;
  margin-bottom: 16px;
  color: var(--ctp-text);
}

.shortcut {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: var(--ctp-subtext0);
}

kbd {
  background: var(--ctp-surface0);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: var(--ctp-text);
}

.document-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--ctp-mantle);
  border-bottom: 1px solid var(--ctp-surface0);
}

.breadcrumb {
  flex: 1;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  color: var(--ctp-text);
  font-weight: 600;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.toolbar .btn {
  padding: 6px 12px;
  font-size: 13px;
}

.doc-panels {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.doc-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}
</style>

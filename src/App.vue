<template>
  <div class="app-container">
    <Sidebar />
    <DocumentViewer />

    <!-- Modals -->
    <NotesPanel v-if="store.showNotesPanel" />
    <CompareMode v-if="store.showCompareMode" />
    <WrapperReference v-if="store.showWrapperRef" />
    <ToolsModal v-if="store.showTools" />
    <DisableFunctionsChecker v-if="store.showDisableFunctions" />
    <ShareModal v-if="store.showShare" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'
import Sidebar from './components/Sidebar.vue'
import DocumentViewer from './components/DocumentViewer.vue'
import NotesPanel from './components/NotesPanel.vue'
import CompareMode from './components/CompareMode.vue'
import WrapperReference from './components/WrapperReference.vue'
import ToolsModal from './components/ToolsModal.vue'
import DisableFunctionsChecker from './components/DisableFunctionsChecker.vue'
import ShareModal from './components/ShareModal.vue'

const store = useAppStore()

onMounted(async () => {
  await store.loadIndex()
  await store.loadExploits()
  await store.loadBypasses()
  await store.loadCVEs()
  store.loadUserData()

  // Setup keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard)
})

function handleKeyboard(e) {
  // Ctrl+K - Focus search
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault()
    document.querySelector('.search-input')?.focus()
  }

  // Ctrl+B - Toggle bookmark
  if (e.ctrlKey && e.key === 'b') {
    e.preventDefault()
    if (store.currentDoc) {
      store.toggleBookmark(store.currentDoc.file)
    }
  }

  // Ctrl+N - Open notes
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault()
    store.showNotesPanel = !store.showNotesPanel
  }

  // Ctrl+T - Open tools
  if (e.ctrlKey && e.key === 't') {
    e.preventDefault()
    store.showTools = !store.showTools
  }

  // Ctrl+D - Open disable functions checker
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault()
    store.showDisableFunctions = !store.showDisableFunctions
  }

  // Esc - Close modals
  if (e.key === 'Escape') {
    store.showNotesPanel = false
    store.showCompareMode = false
    store.showWrapperRef = false
    store.showTools = false
    store.showDisableFunctions = false
    store.showShare = false
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
</style>

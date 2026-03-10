<template>
  <div class="modal-overlay" @click.self="store.showShare = false">
    <div class="modal share-modal">
      <div class="modal-header">
        <h2>Share & Export</h2>
        <button @click="store.showShare = false" class="btn-close">✕</button>
      </div>

      <div class="share-content">
        <div class="share-section">
          <h3>Export Data</h3>
          <p>Export your bookmarks, notes, and history to share with teammates.</p>
          <div class="export-options">
            <label>
              <input type="checkbox" v-model="exportOptions.bookmarks" />
              Bookmarks ({{ Object.keys(store.bookmarks).length }})
            </label>
            <label>
              <input type="checkbox" v-model="exportOptions.notes" />
              Notes ({{ Object.keys(store.notes).length }})
            </label>
            <label>
              <input type="checkbox" v-model="exportOptions.history" />
              History ({{ store.history.length }})
            </label>
          </div>
          <div class="export-buttons">
            <button @click="exportJSON" class="btn btn-primary">Export as JSON</button>
            <button @click="exportURL" class="btn">Copy as URL</button>
          </div>
        </div>

        <div class="share-section">
          <h3>Import Data</h3>
          <p>Import bookmarks and notes from a teammate.</p>
          <div class="import-options">
            <label>Merge Strategy:</label>
            <select v-model="mergeStrategy">
              <option value="keep">Keep Both (Merge)</option>
              <option value="overwrite">Overwrite Existing</option>
              <option value="skip">Skip Duplicates</option>
            </select>
          </div>
          <div class="import-methods">
            <div class="import-method">
              <label>From JSON File:</label>
              <input type="file" @change="importFile" accept=".json" />
            </div>
            <div class="import-method">
              <label>From Text:</label>
              <textarea
                v-model="importText"
                rows="4"
                placeholder="Paste JSON or base64 data..."
              ></textarea>
              <button @click="importFromText" class="btn">Import</button>
            </div>
          </div>
        </div>

        <div v-if="exportResult" class="result-section">
          <h4>Export Result</h4>
          <textarea v-model="exportResult" rows="6" readonly></textarea>
          <button @click="copyText(exportResult)" class="btn-copy">Copy</button>
        </div>

        <div v-if="importResult" class="result-section">
          <div :class="['import-result', importResult.success ? 'success' : 'error']">
            {{ importResult.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const exportOptions = ref({
  bookmarks: true,
  notes: true,
  history: false
})

const mergeStrategy = ref('keep')
const importText = ref('')
const exportResult = ref('')
const importResult = ref(null)

function exportJSON() {
  const data = {}
  if (exportOptions.value.bookmarks) data.bookmarks = store.bookmarks
  if (exportOptions.value.notes) data.notes = store.notes
  if (exportOptions.value.history) data.history = store.history
  data.exportedAt = Date.now()

  exportResult.value = JSON.stringify(data, null, 2)
}

function exportURL() {
  const data = {}
  if (exportOptions.value.bookmarks) data.bookmarks = store.bookmarks
  if (exportOptions.value.notes) data.notes = store.notes
  if (exportOptions.value.history) data.history = store.history

  const json = JSON.stringify(data)
  const base64 = btoa(json)
  const url = `${window.location.origin}${window.location.pathname}?import=${base64}`
  exportResult.value = url
  navigator.clipboard.writeText(url)
}

function importFile(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      performImport(data)
    } catch (error) {
      importResult.value = { success: false, message: 'Invalid JSON file' }
    }
  }
  reader.readAsText(file)
}

function importFromText() {
  try {
    let data
    // Try JSON first
    try {
      data = JSON.parse(importText.value)
    } catch {
      // Try base64
      const decoded = atob(importText.value)
      data = JSON.parse(decoded)
    }
    performImport(data)
  } catch (error) {
    importResult.value = { success: false, message: 'Invalid data format' }
  }
}

function performImport(data) {
  try {
    if (mergeStrategy.value === 'overwrite') {
      store.importData(data)
    } else if (mergeStrategy.value === 'keep') {
      store.importData(data)
    } else {
      // Skip duplicates
      const filtered = {}
      if (data.bookmarks) {
        filtered.bookmarks = {}
        for (const [key, value] of Object.entries(data.bookmarks)) {
          if (!store.bookmarks[key]) {
            filtered.bookmarks[key] = value
          }
        }
      }
      if (data.notes) {
        filtered.notes = {}
        for (const [key, value] of Object.entries(data.notes)) {
          if (!store.notes[key]) {
            filtered.notes[key] = value
          }
        }
      }
      store.importData(filtered)
    }

    importResult.value = {
      success: true,
      message: 'Data imported successfully!'
    }
    importText.value = ''
  } catch (error) {
    importResult.value = {
      success: false,
      message: 'Import failed: ' + error.message
    }
  }
}

function copyText(text) {
  navigator.clipboard.writeText(text)
}
</script>

<style scoped>
.share-modal {
  width: 700px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 20px;
  color: var(--ctp-text);
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: var(--ctp-text);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.share-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.share-section {
  padding: 16px;
  background: var(--ctp-surface0);
  border-radius: 8px;
}

.share-section h3 {
  font-size: 16px;
  margin-bottom: 8px;
  color: var(--ctp-text);
}

.share-section p {
  font-size: 13px;
  color: var(--ctp-subtext0);
  margin-bottom: 16px;
}

.export-options,
.import-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.export-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ctp-text);
}

.export-buttons,
.import-methods {
  display: flex;
  gap: 12px;
}

.import-method {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.import-method label {
  font-weight: 600;
  color: var(--ctp-text);
  font-size: 13px;
}

.import-method textarea {
  width: 100%;
}

.result-section {
  padding: 16px;
  background: var(--ctp-surface0);
  border-radius: 8px;
}

.result-section h4 {
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--ctp-text);
}

.result-section textarea {
  width: 100%;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

.btn-copy {
  margin-top: 8px;
  padding: 4px 12px;
  background: var(--ctp-blue);
  color: var(--ctp-crust);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.import-result {
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
}

.import-result.success {
  background: var(--ctp-green);
  color: var(--ctp-crust);
}

.import-result.error {
  background: var(--ctp-red);
  color: var(--ctp-crust);
}
</style>

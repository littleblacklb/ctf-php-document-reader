<template>
  <div class="modal-overlay" @click.self="store.showNotesPanel = false">
    <div class="modal notes-modal">
      <div class="modal-header">
        <h2>Notes - {{ store.currentDoc?.name }}</h2>
        <button @click="store.showNotesPanel = false" class="btn-close">✕</button>
      </div>

      <div class="notes-content">
        <textarea
          v-model="noteText"
          placeholder="Write your notes here... (Markdown supported)"
          class="notes-textarea"
          rows="10"
        ></textarea>

        <div class="notes-tags">
          <input
            v-model="tagInput"
            type="text"
            placeholder="Add tags (comma separated)"
            class="tags-input"
          />
        </div>

        <div class="notes-actions">
          <button @click="saveNote" class="btn btn-primary">Save Note</button>
          <button @click="store.showNotesPanel = false" class="btn">Cancel</button>
        </div>

        <div v-if="existingNote" class="existing-note">
          <div class="note-meta">
            Last saved: {{ formatDate(existingNote.timestamp) }}
          </div>
          <div v-if="existingNote.tags && existingNote.tags.length > 0" class="note-tags">
            <span v-for="tag in existingNote.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const noteText = ref('')
const tagInput = ref('')

const existingNote = computed(() => {
  if (!store.currentDoc) return null
  const funcName = store.currentDoc.name?.replace(/\(\)$/, '')
  return store.notes[funcName]
})

watch(() => store.currentDoc, () => {
  if (existingNote.value) {
    noteText.value = existingNote.value.note || ''
    tagInput.value = existingNote.value.tags?.join(', ') || ''
  } else {
    noteText.value = ''
    tagInput.value = ''
  }
}, { immediate: true })

function saveNote() {
  if (!store.currentDoc) return
  const funcName = store.currentDoc.name?.replace(/\(\)$/, '')
  const tags = tagInput.value.split(',').map(t => t.trim()).filter(Boolean)
  store.saveNote(funcName, noteText.value, tags)
  store.showNotesPanel = false
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString()
}
</script>

<style scoped>
.notes-modal {
  width: 600px;
  max-width: 90vw;
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

.notes-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notes-textarea {
  width: 100%;
  min-height: 200px;
  resize: vertical;
  font-family: inherit;
}

.tags-input {
  width: 100%;
}

.notes-actions {
  display: flex;
  gap: 12px;
}

.existing-note {
  padding: 12px;
  background: var(--ctp-surface0);
  border-radius: 6px;
}

.note-meta {
  font-size: 12px;
  color: var(--ctp-subtext0);
  margin-bottom: 8px;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 4px 8px;
  background: var(--ctp-blue);
  color: var(--ctp-crust);
  border-radius: 4px;
  font-size: 12px;
}
</style>

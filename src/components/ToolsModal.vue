<template>
  <div class="modal-overlay" @click.self="store.showTools = false">
    <div class="modal tools-modal">
      <div class="modal-header">
        <h2>Payload Tools</h2>
        <button @click="store.showTools = false" class="btn-close">✕</button>
      </div>

      <div class="tools-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tool-tab', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tools-content">
        <!-- Encoder/Decoder -->
        <div v-if="activeTab === 'encode'" class="tool-panel">
          <div class="tool-section">
            <label>Input</label>
            <textarea v-model="encodeInput" rows="4" placeholder="Enter text to encode..."></textarea>
          </div>

          <div class="tool-section">
            <label>Encoding Type</label>
            <select v-model="encodeType">
              <option value="url">URL Encode</option>
              <option value="base64">Base64</option>
              <option value="hex">Hex</option>
              <option value="unicode">Unicode Escape</option>
              <option value="html">HTML Entities</option>
            </select>
          </div>

          <button @click="encode" class="btn btn-primary">Encode</button>

          <div v-if="encodeOutput" class="tool-section">
            <label>Output</label>
            <textarea v-model="encodeOutput" rows="4" readonly></textarea>
            <button @click="copyText(encodeOutput)" class="btn-copy">Copy</button>
          </div>
        </div>

        <!-- Type Juggling Tester -->
        <div v-if="activeTab === 'juggling'" class="tool-panel">
          <div class="tool-section">
            <label>Value 1</label>
            <input v-model="juggleValue1" type="text" placeholder="e.g., 0e123456" />
          </div>

          <div class="tool-section">
            <label>Value 2</label>
            <input v-model="juggleValue2" type="text" placeholder="e.g., 0e789012" />
          </div>

          <div class="tool-section">
            <label>Comparison Type</label>
            <select v-model="juggleOp">
              <option value="==">== (loose)</option>
              <option value="===">=== (strict)</option>
              <option value="strcmp">strcmp()</option>
              <option value="in_array">in_array()</option>
            </select>
          </div>

          <button @click="testJuggling" class="btn btn-primary">Test</button>

          <div v-if="juggleResult" class="tool-result">
            <strong>Result:</strong> {{ juggleResult }}
          </div>

          <div class="magic-hashes">
            <h4>Magic Hashes (MD5)</h4>
            <div class="hash-list">
              <div v-for="hash in magicHashes" :key="hash.plain" class="hash-item">
                <code>{{ hash.plain }}</code> → <code>{{ hash.hash }}</code>
                <button @click="copyText(hash.plain)" class="btn-copy-small">Copy</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Magic Hash Finder -->
        <div v-if="activeTab === 'magic'" class="tool-panel">
          <div class="tool-section">
            <label>Hash Type</label>
            <select v-model="hashType">
              <option value="md5">MD5</option>
              <option value="sha1">SHA1</option>
            </select>
          </div>

          <div class="magic-hash-list">
            <h4>Known Magic Hashes</h4>
            <div class="hash-grid">
              <div v-for="item in currentMagicHashes" :key="item.plain" class="hash-card">
                <div class="hash-plain">{{ item.plain }}</div>
                <div class="hash-value">{{ item.hash }}</div>
                <button @click="copyText(item.plain)" class="btn-copy">Copy Plain</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const activeTab = ref('encode')

const tabs = [
  { id: 'encode', label: 'Encode/Decode' },
  { id: 'juggling', label: 'Type Juggling' },
  { id: 'magic', label: 'Magic Hashes' }
]

// Encoder
const encodeInput = ref('')
const encodeType = ref('url')
const encodeOutput = ref('')

function encode() {
  const input = encodeInput.value
  switch (encodeType.value) {
    case 'url':
      encodeOutput.value = encodeURIComponent(input)
      break
    case 'base64':
      encodeOutput.value = btoa(input)
      break
    case 'hex':
      encodeOutput.value = Array.from(input)
        .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
      break
    case 'unicode':
      encodeOutput.value = Array.from(input)
        .map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
        .join('')
      break
    case 'html':
      encodeOutput.value = input.replace(/[&<>"']/g, c => {
        const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
        return entities[c]
      })
      break
  }
}

// Type Juggling
const juggleValue1 = ref('')
const juggleValue2 = ref('')
const juggleOp = ref('==')
const juggleResult = ref('')

function testJuggling() {
  const v1 = juggleValue1.value
  const v2 = juggleValue2.value

  try {
    let result
    switch (juggleOp.value) {
      case '==':
        result = v1 == v2
        break
      case '===':
        result = v1 === v2
        break
      case 'strcmp':
        result = v1.localeCompare(v2) === 0
        break
      case 'in_array':
        result = [v2].includes(v1)
        break
    }
    juggleResult.value = `${v1} ${juggleOp.value} ${v2} → ${result ? 'TRUE' : 'FALSE'}`
  } catch (e) {
    juggleResult.value = 'Error: ' + e.message
  }
}

// Magic Hashes
const hashType = ref('md5')

const magicHashes = [
  { plain: '240610708', hash: '0e462097431906509019562988736854' },
  { plain: 'QNKCDZO', hash: '0e830400451993494058024219903391' },
  { plain: 'aabg7XSs', hash: '0e087386482136013740957780965295' },
  { plain: 's878926199a', hash: '0e545993274517709034328855841020' }
]

const sha1MagicHashes = [
  { plain: 'aaroZmOk', hash: '0e66507019969427134894567494305185566735' },
  { plain: 'aaK1STfY', hash: '0e76658526655756207688271159624026011393' },
  { plain: 'aaO8zKZF', hash: '0e89257456677279068558073954252716165668' }
]

const currentMagicHashes = computed(() => {
  return hashType.value === 'md5' ? magicHashes : sha1MagicHashes
})

function copyText(text) {
  navigator.clipboard.writeText(text)
}
</script>

<style scoped>
.tools-modal {
  width: 800px;
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

.tools-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tool-tab {
  padding: 8px 16px;
  background: var(--ctp-surface0);
  border: 2px solid var(--ctp-surface2);
  color: var(--ctp-text);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.tool-tab:hover {
  background: var(--ctp-surface1);
}

.tool-tab.active {
  background: var(--ctp-blue);
  color: var(--ctp-crust);
  border-color: var(--ctp-blue);
}

.tools-content {
  flex: 1;
  overflow-y: auto;
}

.tool-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-section label {
  font-weight: 600;
  color: var(--ctp-text);
}

.tool-section input,
.tool-section textarea,
.tool-section select {
  width: 100%;
}

.tool-result {
  padding: 12px;
  background: var(--ctp-surface0);
  border-radius: 6px;
  color: var(--ctp-text);
}

.btn-copy,
.btn-copy-small {
  padding: 4px 12px;
  background: var(--ctp-blue);
  color: var(--ctp-crust);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
}

.btn-copy-small {
  padding: 2px 8px;
  font-size: 11px;
  margin-top: 0;
}

.magic-hashes {
  margin-top: 24px;
  padding: 16px;
  background: var(--ctp-surface0);
  border-radius: 8px;
}

.magic-hashes h4 {
  margin-bottom: 12px;
  color: var(--ctp-text);
}

.hash-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hash-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: var(--ctp-crust);
  border-radius: 4px;
  font-size: 13px;
}

.hash-item code {
  font-family: 'Monaco', 'Menlo', monospace;
  color: var(--ctp-text);
}

.magic-hash-list h4 {
  margin-bottom: 16px;
  color: var(--ctp-text);
}

.hash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.hash-card {
  padding: 12px;
  background: var(--ctp-surface0);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hash-plain {
  font-weight: 600;
  color: var(--ctp-text);
  font-family: 'Monaco', 'Menlo', monospace;
}

.hash-value {
  font-size: 11px;
  color: var(--ctp-subtext0);
  font-family: 'Monaco', 'Menlo', monospace;
  word-break: break-all;
}
</style>

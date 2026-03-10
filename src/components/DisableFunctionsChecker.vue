<template>
  <div class="modal-overlay" @click.self="store.showDisableFunctions = false">
    <div class="modal disable-functions-modal">
      <div class="modal-header">
        <h2>Disable Functions Checker</h2>
        <button @click="store.showDisableFunctions = false" class="btn-close">✕</button>
      </div>

      <div class="checker-content">
        <div class="input-section">
          <label>Paste phpinfo() output or disable_functions value:</label>
          <textarea
            v-model="inputText"
            rows="6"
            placeholder="e.g., system,exec,passthru,shell_exec..."
          ></textarea>
          <button @click="analyze" class="btn btn-primary">Analyze</button>
        </div>

        <div v-if="analyzed" class="results-section">
          <div class="stats">
            <div class="stat-box disabled">
              <div class="stat-value">{{ disabledFunctions.length }}</div>
              <div class="stat-label">Disabled</div>
            </div>
            <div class="stat-box available">
              <div class="stat-value">{{ availableFunctions.length }}</div>
              <div class="stat-label">Available</div>
            </div>
          </div>

          <div v-if="availableFunctions.length > 0" class="available-section">
            <h3>✅ Available Dangerous Functions</h3>
            <div class="function-grid">
              <div
                v-for="func in availableFunctions"
                :key="func"
                class="function-chip available-chip"
              >
                {{ func }}
              </div>
            </div>
          </div>

          <div v-if="bypassSuggestions.length > 0" class="bypass-section">
            <h3>🔓 Bypass Suggestions</h3>
            <div class="bypass-list">
              <div v-for="(bypass, index) in bypassSuggestions" :key="index" class="bypass-item">
                <div class="bypass-title">{{ bypass.title }}</div>
                <div class="bypass-desc">{{ bypass.description }}</div>
              </div>
            </div>
          </div>

          <div class="export-section">
            <button @click="exportList" class="btn">Export Available Functions</button>
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
const inputText = ref('')
const analyzed = ref(false)
const disabledFunctions = ref([])

const dangerousFunctions = [
  'system', 'exec', 'passthru', 'shell_exec', 'popen', 'proc_open',
  'pcntl_exec', 'eval', 'assert', 'create_function', 'include', 'require',
  'include_once', 'require_once', 'file_get_contents', 'file_put_contents',
  'fopen', 'readfile', 'curl_exec', 'curl_multi_exec', 'parse_ini_file',
  'show_source', 'symlink', 'link', 'dl', 'mail', 'putenv', 'apache_setenv',
  'mb_send_mail', 'imap_open', 'error_log', 'FFI'
]

const availableFunctions = computed(() => {
  return dangerousFunctions.filter(f => !disabledFunctions.value.includes(f))
})

const bypassSuggestions = computed(() => {
  const suggestions = []

  if (disabledFunctions.value.includes('system') && !disabledFunctions.value.includes('mail')) {
    suggestions.push({
      title: 'LD_PRELOAD via mail()',
      description: 'Use putenv() + mail() to load malicious .so file'
    })
  }

  if (disabledFunctions.value.includes('system') && !disabledFunctions.value.includes('imap_open')) {
    suggestions.push({
      title: 'Command execution via imap_open()',
      description: 'Use imap_open() with -oProxyCommand parameter'
    })
  }

  if (!disabledFunctions.value.includes('FFI')) {
    suggestions.push({
      title: 'FFI (PHP 7.4+)',
      description: 'Use FFI to call system functions directly'
    })
  }

  if (!disabledFunctions.value.includes('dl')) {
    suggestions.push({
      title: 'Load extension with dl()',
      description: 'Load custom PHP extension for code execution'
    })
  }

  if (availableFunctions.value.length === 0) {
    suggestions.push({
      title: 'All dangerous functions disabled',
      description: 'Try: file operations, deserialization, or PHP wrappers'
    })
  }

  return suggestions
})

function analyze() {
  const input = inputText.value.toLowerCase()

  // Extract disabled functions from various formats
  let disabled = []

  // Try to find disable_functions line
  const match = input.match(/disable_functions[^\n]*?([a-z_,\s]+)/i)
  if (match) {
    disabled = match[1].split(',').map(f => f.trim()).filter(Boolean)
  } else {
    // Assume direct input of function names
    disabled = input.split(/[,\s]+/).map(f => f.trim()).filter(Boolean)
  }

  disabledFunctions.value = disabled
  analyzed.value = true
}

function exportList() {
  const text = availableFunctions.value.join('\n')
  navigator.clipboard.writeText(text)
}
</script>

<style scoped>
.disable-functions-modal {
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

.checker-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-section label {
  font-weight: 600;
  color: var(--ctp-text);
}

.input-section textarea {
  width: 100%;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats {
  display: flex;
  gap: 16px;
}

.stat-box {
  flex: 1;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-box.disabled {
  background: var(--ctp-red);
  color: var(--ctp-crust);
}

.stat-box.available {
  background: var(--ctp-green);
  color: var(--ctp-crust);
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  font-weight: 600;
}

.available-section,
.bypass-section {
  padding: 16px;
  background: var(--ctp-surface0);
  border-radius: 8px;
}

.available-section h3,
.bypass-section h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: var(--ctp-text);
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}

.function-chip {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  font-family: 'Monaco', 'Menlo', monospace;
}

.available-chip {
  background: var(--ctp-green);
  color: var(--ctp-crust);
}

.bypass-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bypass-item {
  padding: 12px;
  background: var(--ctp-crust);
  border-radius: 6px;
}

.bypass-title {
  font-weight: 600;
  color: var(--ctp-text);
  margin-bottom: 4px;
}

.bypass-desc {
  font-size: 13px;
  color: var(--ctp-subtext0);
}

.export-section {
  text-align: center;
}
</style>

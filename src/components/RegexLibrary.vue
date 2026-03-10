<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal regex-library-modal">
      <div class="modal-header">
        <h2>Regex Pattern Library</h2>
        <button @click="close" class="btn-close">✕</button>
      </div>

      <div class="regex-categories">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['category-btn', { active: activeCategory === cat.id }]"
          @click="activeCategory = cat.id"
        >
          {{ cat.label }}
        </button>
      </div>

      <div class="regex-patterns">
        <div
          v-for="pattern in filteredPatterns"
          :key="pattern.name"
          class="pattern-item"
        >
          <div class="pattern-header">
            <span class="pattern-name">{{ pattern.name }}</span>
            <button @click="copyPattern(pattern.pattern)" class="btn-copy">Copy</button>
          </div>
          <div class="pattern-description">{{ pattern.description }}</div>
          <pre class="code-block">{{ pattern.pattern }}</pre>
          <div v-if="pattern.example" class="pattern-example">
            <strong>Example:</strong> {{ pattern.example }}
          </div>
        </div>
      </div>

      <div class="regex-tester">
        <h3>Test Regex</h3>
        <input
          v-model="testPattern"
          type="text"
          placeholder="Enter regex pattern..."
          class="test-input"
        />
        <textarea
          v-model="testInput"
          placeholder="Enter test input..."
          class="test-textarea"
          rows="4"
        ></textarea>
        <div v-if="testResult" class="test-result">
          <strong>Matches:</strong> {{ testResult }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const activeCategory = ref('redos')
const testPattern = ref('')
const testInput = ref('')
const testResult = ref('')

const categories = [
  { id: 'redos', label: 'ReDoS' },
  { id: 'bypass', label: 'Bypass' },
  { id: 'encoding', label: 'Encoding' },
  { id: 'extraction', label: 'Extraction' }
]

const patterns = [
  {
    category: 'redos',
    name: 'Catastrophic Backtracking',
    description: 'Pattern vulnerable to ReDoS attacks',
    pattern: '(a+)+b',
    example: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  },
  {
    category: 'bypass',
    name: 'Newline Bypass',
    description: 'Bypass preg_match with newline',
    pattern: '^admin',
    example: 'admin\\nmalicious'
  },
  {
    category: 'bypass',
    name: 'Null Byte Bypass',
    description: 'Bypass string comparison with null byte',
    pattern: 'admin\\x00',
    example: 'admin\\x00malicious'
  },
  {
    category: 'encoding',
    name: 'URL Encoding',
    description: 'Match URL encoded characters',
    pattern: '%[0-9a-fA-F]{2}',
    example: '%3Cscript%3E'
  },
  {
    category: 'encoding',
    name: 'Unicode Escape',
    description: 'Match unicode escape sequences',
    pattern: '\\\\u[0-9a-fA-F]{4}',
    example: '\\u003cscript\\u003e'
  },
  {
    category: 'extraction',
    name: 'PHP Variable',
    description: 'Extract PHP variable names',
    pattern: '\\$[a-zA-Z_\\x7f-\\xff][a-zA-Z0-9_\\x7f-\\xff]*',
    example: '$_GET, $_POST, $myVar'
  },
  {
    category: 'extraction',
    name: 'Function Call',
    description: 'Extract function calls',
    pattern: '[a-zA-Z_][a-zA-Z0-9_]*\\s*\\(',
    example: 'eval(, system(, exec('
  }
]

const filteredPatterns = computed(() => {
  return patterns.filter(p => p.category === activeCategory.value)
})

watch([testPattern, testInput], () => {
  if (testPattern.value && testInput.value) {
    try {
      const regex = new RegExp(testPattern.value, 'g')
      const matches = testInput.value.match(regex)
      testResult.value = matches ? matches.join(', ') : 'No matches'
    } catch (e) {
      testResult.value = 'Invalid regex'
    }
  } else {
    testResult.value = ''
  }
})

function copyPattern(pattern) {
  navigator.clipboard.writeText(pattern)
}

function close() {
  // This component is shown/hidden by parent, so we don't need to emit
}
</script>

<style scoped>
.regex-library-modal {
  width: 800px;
  max-width: 90vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 24px;
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

.regex-categories {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.category-btn {
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

.category-btn:hover {
  background: var(--ctp-surface1);
}

.category-btn.active {
  background: var(--ctp-blue);
  color: var(--ctp-crust);
  border-color: var(--ctp-blue);
}

.regex-patterns {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.pattern-item {
  padding: 16px;
  background: var(--ctp-surface0);
  border-radius: 8px;
  margin-bottom: 12px;
}

.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.pattern-name {
  font-weight: 600;
  color: var(--ctp-text);
  font-size: 15px;
}

.btn-copy {
  padding: 4px 12px;
  background: var(--ctp-blue);
  color: var(--ctp-crust);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.pattern-description {
  font-size: 13px;
  color: var(--ctp-subtext0);
  margin-bottom: 8px;
}

.pattern-example {
  margin-top: 8px;
  font-size: 13px;
  color: var(--ctp-subtext0);
}

.regex-tester {
  padding: 16px;
  background: var(--ctp-surface0);
  border-radius: 8px;
}

.regex-tester h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: var(--ctp-text);
}

.test-input,
.test-textarea {
  width: 100%;
  margin-bottom: 12px;
}

.test-result {
  padding: 12px;
  background: var(--ctp-crust);
  border-radius: 6px;
  font-size: 13px;
  color: var(--ctp-text);
}
</style>

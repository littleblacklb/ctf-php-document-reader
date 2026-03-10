import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // Core data
    allEntries: [],
    filteredEntries: [],
    exploits: {},
    bypasses: {},
    cves: {},
    chainSuggestions: {
      'file_get_contents': ['php://filter', 'php://input', 'data://', 'phar://', 'expect://'],
      'unserialize': ['phar://', '__wakeup', '__destruct', '__toString'],
      'preg_match': ['preg_replace', 'PCRE_DOTALL'],
      'include': ['php://filter', 'php://input', 'data://', 'zip://'],
      'fopen': ['php://filter', 'php://input', 'phar://'],
      'system': ['exec', 'passthru', 'shell_exec', 'proc_open'],
      'eval': ['assert', 'create_function', 'preg_replace'],
      'curl_exec': ['curl_setopt', 'CURLOPT_URL', 'file_get_contents'],
      'strcmp': ['md5', 'sha1', 'in_array'],
      'md5': ['sha1', 'strcmp', 'hash'],
      'mysqli_query': ['mysqli_real_escape_string', 'PDO'],
      'move_uploaded_file': ['getimagesize', 'exif_imagetype', 'finfo_file']
    },

    // UI state
    currentDoc: null,
    searchQuery: '',
    activeTags: [],
    activeCategory: 'all',
    activePhpVersion: 'all',
    activeTab: 'browse',

    // Navigation
    navStack: [],

    // User data (persisted to localStorage)
    bookmarks: {},
    history: [],
    notes: {},

    // Modals
    showNotesPanel: false,
    showCompareMode: false,
    showWrapperRef: false,
    showTools: false,
    showDisableFunctions: false,
    showShare: false,
    compareDoc: null
  }),

  getters: {
    bookmarkedEntries: (state) => {
      return Object.keys(state.bookmarks).map(file => {
        const entry = state.allEntries.find(e => e.file === file)
        return entry ? { ...entry, ...state.bookmarks[file] } : null
      }).filter(Boolean)
    },

    insightSuggestions: (state) => {
      const suggestions = []
      const recentFunctions = [...state.history.slice(-10), ...Object.keys(state.bookmarks)]
        .map(item => typeof item === 'string' ? item : item.file)
        .map(file => state.allEntries.find(e => e.file === file))
        .filter(Boolean)

      const tags = new Set(recentFunctions.flatMap(f => f.tags || []))

      if (tags.has('lfi') && tags.has('deser')) {
        suggestions.push({ text: 'Try phar:// deserialization', type: 'attack' })
      }
      if (tags.has('rce') && tags.has('type')) {
        suggestions.push({ text: 'Check for /e modifier RCE', type: 'attack' })
      }
      if (recentFunctions.filter(f => f.tags?.includes('type')).length >= 2) {
        suggestions.push({ text: 'Consider type juggling attack', type: 'pattern' })
      }

      return suggestions
    }
  },

  actions: {
    async loadIndex() {
      try {
        const response = await fetch('/doc-index.json')
        const data = await response.json()
        this.allEntries = data.entries || []
        this.filteredEntries = this.allEntries
      } catch (error) {
        console.error('Failed to load index:', error)
      }
    },

    async loadExploits() {
      try {
        const response = await fetch('/exploits.json')
        this.exploits = await response.json()
      } catch (error) {
        console.error('Failed to load exploits:', error)
      }
    },

    async loadBypasses() {
      try {
        const response = await fetch('/bypasses.json')
        this.bypasses = await response.json()
      } catch (error) {
        console.error('Failed to load bypasses:', error)
      }
    },

    async loadCVEs() {
      try {
        const response = await fetch('/cves.json')
        this.cves = await response.json()
      } catch (error) {
        console.error('Failed to load CVEs:', error)
      }
    },

    loadUserData() {
      const bookmarks = localStorage.getItem('phpDocBookmarks')
      const history = localStorage.getItem('phpDocHistory')
      const notes = localStorage.getItem('phpDocNotes')

      if (bookmarks) this.bookmarks = JSON.parse(bookmarks)
      if (history) this.history = JSON.parse(history)
      if (notes) this.notes = JSON.parse(notes)
    },

    search(query) {
      this.searchQuery = query
      this.applyFilters()
    },

    filterByTag(tag) {
      const index = this.activeTags.indexOf(tag)
      if (index > -1) {
        this.activeTags.splice(index, 1)
      } else {
        this.activeTags.push(tag)
      }
      this.applyFilters()
    },

    applyFilters() {
      let results = this.allEntries

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()

        // Check for tag search
        if (query.startsWith('#')) {
          const tag = query.slice(1)
          results = results.filter(entry => entry.tags?.includes(tag))
        } else {
          results = results.filter(entry => {
            const nameMatch = entry.name?.toLowerCase().includes(query)
            const titleMatch = entry.title?.toLowerCase().includes(query)
            const fileMatch = entry.file?.toLowerCase().includes(query)
            return nameMatch || titleMatch || fileMatch
          })
        }
      }

      // Tag filter
      if (this.activeTags.length > 0) {
        results = results.filter(entry =>
          this.activeTags.some(tag => entry.tags?.includes(tag))
        )
      }

      // Category filter
      if (this.activeCategory !== 'all') {
        results = results.filter(entry => entry.category === this.activeCategory)
      }

      // PHP version filter
      if (this.activePhpVersion !== 'all') {
        results = results.filter(entry =>
          entry.phpVersions?.includes(this.activePhpVersion)
        )
      }

      this.filteredEntries = results
    },

    openDocument(file) {
      const entry = this.allEntries.find(e => e.file === file)
      if (!entry) return

      this.navStack.push(this.currentDoc)
      this.currentDoc = entry

      // Add to history
      const historyItem = {
        file: entry.file,
        name: entry.name,
        title: entry.title,
        time: Date.now()
      }
      this.history = [historyItem, ...this.history.filter(h => h.file !== file)].slice(0, 50)
      localStorage.setItem('phpDocHistory', JSON.stringify(this.history))
    },

    goBack() {
      if (this.navStack.length > 0) {
        this.currentDoc = this.navStack.pop()
      }
    },

    toggleBookmark(file) {
      const entry = this.allEntries.find(e => e.file === file)
      if (!entry) return

      if (this.bookmarks[file]) {
        delete this.bookmarks[file]
      } else {
        this.bookmarks[file] = {
          name: entry.name,
          title: entry.title,
          category: entry.category,
          time: Date.now()
        }
      }
      localStorage.setItem('phpDocBookmarks', JSON.stringify(this.bookmarks))
    },

    saveNote(functionName, note, tags = []) {
      this.notes[functionName] = {
        note,
        tags,
        timestamp: Date.now()
      }
      localStorage.setItem('phpDocNotes', JSON.stringify(this.notes))
    },

    exportData() {
      return {
        bookmarks: this.bookmarks,
        notes: this.notes,
        history: this.history,
        exportedAt: Date.now()
      }
    },

    importData(data) {
      if (data.bookmarks) {
        this.bookmarks = { ...this.bookmarks, ...data.bookmarks }
        localStorage.setItem('phpDocBookmarks', JSON.stringify(this.bookmarks))
      }
      if (data.notes) {
        this.notes = { ...this.notes, ...data.notes }
        localStorage.setItem('phpDocNotes', JSON.stringify(this.notes))
      }
      if (data.history) {
        this.history = [...data.history, ...this.history].slice(0, 50)
        localStorage.setItem('phpDocHistory', JSON.stringify(this.history))
      }
    }
  }
})

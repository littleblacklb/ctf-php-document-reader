# PHP Documentation Searcher — Implementation Plan (CTF-Oriented)

## Overview

Build a **CTF-focused** local web application to rapidly search, browse, classify, and bookmark ~11,834 PHP chunked XHTML documentation pages. Optimized for **time-pressured CTF competitions** where you need to quickly look up exploitable functions, dangerous behaviors, type juggling tricks, and security-relevant PHP quirks.

## Architecture

**Tech Stack**: Vite + Vue 3 + Pinia (builds to single HTML file for CTF portability)

**Files**:

1. **`build_index.py`** — One-time script that scans all HTML files, extracts `<title>`, classifies by filename prefix, **enriches with CTF security tags**, and outputs `doc-index.json`
2. **`src/`** — Vue 3 application source code with component-based architecture
3. **`dist/index.html`** — Built single-file application (all assets inlined) for deployment

**Development**: `npm run dev` (hot reload)
**Build**: `npm run build` → outputs single `dist/index.html` with all assets inlined
**Deployment**: `python -m http.server 8080 --directory dist`

**Why Vue 3 + Vite?**
- 15+ features need component architecture for maintainability
- Reactive state management (Pinia) handles complex interactions
- Still CTF-friendly: builds to single portable HTML file
- TypeScript support reduces bugs
- Hot reload speeds up development
- Easy to add/modify features

---

## Features

### 1. Search (fuzzy name matching to shrink scope)

- Fuzzy search across name, title, and filename with weighted scoring:
  - Exact substring match → highest score (bonus for match at start)
  - Consecutive character matches → bonus
  - Word boundary matches (after `_`, `-`, `.`, space) → bonus
- **CTF security tag search**: Type `#rce`, `#sqli`, `#ssrf` etc. to instantly filter by exploit category
- Debounced input (50ms) to avoid thrashing on fast typing
- Keyboard navigation: `Ctrl+K` focus, `↑↓` navigate results, `Enter` open

### 2. Classification (categorize HTML files)

Auto-classify by filename prefix into categories with colored badges:

| Prefix | Category | Badge Color |
|---|---|---|
| `function.*` | Functions (~3,565) | Blue |
| `class.*` | Classes (~757) | Green |
| `*.method.*` (class methods) | Class Methods (~5,000+) | Purple |
| `book.*` | Books / Extensions (~171) | Peach |
| `ref.*` | Function References (~159) | Yellow |
| `language.*` | Language Reference (~132) | Red |
| `control-structures.*` | Control Structures (~15) | Red |
| `intro.*` | Introductions (~168) | Grey |
| `install.*` | Installation (~44) | Grey |
| `migration*` | Migration Guides | Grey |
| `reserved.*` | Reserved Words | Grey |
| `security.*` | Security | Grey |
| `features.*` | Features | Grey |
| `faq.*` | FAQ | Grey |
| `about.*` | About | Grey |

Category dropdown filter to narrow results.

### 3. Bookmarks

- Toggle bookmark via ☆/★ button on each result item
- Toolbar "Bookmark" button for the currently viewed page
- `Ctrl+B` keyboard shortcut
- Persisted in `localStorage` (`phpDocBookmarks` key)
- Dedicated "Bookmarks" tab showing all bookmarked items sorted by time
- Remove bookmark by clicking ★ again

### 4. CTF Quick-Access Panels (NEW — CTF-specific)

Pre-built exploit-category quick filters for common CTF attack surfaces:

| Tag | Label | Functions / Topics |
|---|---|---|
| `#rce` | Remote Code Execution | `eval`, `assert`, `preg_replace` (/e), `system`, `exec`, `passthru`, `shell_exec`, `popen`, `proc_open`, `pcntl_exec`, backtick operator |
| `#cmdi` | Command Injection | `system`, `exec`, `passthru`, `shell_exec`, `popen`, `proc_open`, `escapeshellcmd`, `escapeshellarg` |
| `#lfi` | Local File Inclusion | `include`, `require`, `include_once`, `require_once`, `file_get_contents`, `fopen`, `readfile`, `file`, `SplFileObject`, `php://filter` |
| `#upload` | File Upload | `move_uploaded_file`, `$_FILES`, `getimagesize`, `exif_imagetype`, `finfo_file`, `mime_content_type` |
| `#sqli` | SQL Injection | `mysqli_query`, `PDO::query`, `pg_query`, `sqlite_query`, `mysql_query` (deprecated) |
| `#deser` | Deserialization | `unserialize`, `__wakeup`, `__destruct`, `__toString`, `__call`, `Serializable`, `phar://` |
| `#ssrf` | SSRF | `file_get_contents`, `curl_exec`, `fopen` (with URL wrappers), `SoapClient`, `copy` |
| `#xxe` | XML External Entity | `simplexml_load_string`, `simplexml_load_file`, `DOMDocument::loadXML`, `XMLReader`, `libxml_disable_entity_loader` |
| `#type` | Type Juggling | `==` vs `===`, `strcmp`, `md5`, `sha1`, `json_decode`, `intval`, `is_numeric`, `in_array` (loose), `array_search` (loose), `switch` type coercion |
| `#crypto` | Weak Crypto | `md5`, `sha1`, `crc32`, `rand`, `mt_rand`, `lcg_value`, `openssl_encrypt`, `mcrypt_*` |
| `#info` | Information Disclosure | `phpinfo`, `var_dump`, `print_r`, `debug_backtrace`, `get_defined_vars`, `getenv` |
| `#filter` | PHP Stream Wrappers | `php://input`, `php://filter`, `data://`, `phar://`, `expect://`, `zip://` |
| `#bypass` | Disable Function Bypass | `dl`, `putenv`, `mail` (via LD_PRELOAD), `mb_send_mail`, `imap_open`, `FFI` |
| `#ssti` | Template Injection | `Twig`, `Smarty`, `Blade` related classes |

Clicking a tag pill instantly filters to the relevant functions. Tags are shown as colored pills in the sidebar header area.

### 5. Exploit Code Snippets Library

- Pre-built exploit templates for each dangerous function
- One-click copy of common payloads (e.g., `eval($_GET['cmd'])`, `system('cat /flag')`)
- Polyglot payloads for bypassing filters
- Quick reference for magic hashes, type juggling values
- Stored in `exploits.json` loaded at startup
- Displayed in a dedicated panel when viewing a function with known exploits
- Copy button for each snippet with syntax highlighting

### 6. Function Chaining Suggestions

- When viewing a function, show "commonly chained with" suggestions
- Example: `file_get_contents` → suggest `php://filter` wrappers, `data://` URIs
- `unserialize` → suggest POP chain gadgets, phar:// deserialization
- `preg_match` → suggest newline bypass techniques
- Displayed as clickable chips below function description
- Clicking a suggestion navigates to that function's documentation

### 7. Bypass Techniques Database

- For each dangerous function, list common bypass methods
- Examples:
  - `escapeshellcmd` + `escapeshellarg` → double-escape vulnerability
  - `preg_match` → newline bypass with `%0a`, PCRE backtrack limit
  - `strcmp` → NULL byte and array bypass
  - `in_array` → loose comparison type juggling
  - `parse_url` → URL parser differentials
- Stored in `bypasses.json` with function name mapping
- Displayed in expandable "Bypass Techniques" section in viewer
- Each bypass includes: description, payload example, affected versions

### 8. Version-Specific Vulnerabilities

- Tag functions with PHP version where behavior changed
- Highlight deprecated functions still exploitable in old PHP
- Show when `disable_functions` bypass techniques work (PHP 7.0-7.4 FFI, etc.)
- Version badges: "PHP 5.x", "PHP 7.0-7.4", "PHP 8.0+"
- Filter by PHP version in sidebar
- Stored in index as `phpVersions: ["5.x", "7.x", "8.x"]` array

### 9. Quick Diff/Compare Mode

- Compare similar functions side-by-side (`include` vs `require`, `==` vs `===`)
- Highlight security-relevant differences
- Show which is more exploitable and why
- Accessible via "Compare" button when viewing a function
- Select second function from dropdown or search
- Split-screen view with synchronized scrolling
- Difference highlights in yellow

### 10. Regex Pattern Library

- Common dangerous regex patterns (`/e` modifier, ReDoS patterns)
- Filter bypass patterns for WAFs
- Encoding variations (URL, base64, hex, unicode)
- Dedicated "Regex Library" tab in sidebar
- Categories: ReDoS, Bypass, Encoding, Extraction
- Copy button for each pattern
- Test regex against sample input (live preview)

### 11. Wrapper/Protocol Quick Reference

- Dedicated panel for PHP stream wrappers with exploit examples
- `php://filter/convert.base64-encode/resource=` templates
- `phar://` deserialization setup
- `zip://`, `data://`, `expect://` usage
- Accessible via "Wrappers" button in toolbar
- Modal overlay with tabbed interface for each wrapper type
- Copy button for each template
- Shows: syntax, use cases, restrictions, bypass techniques

### 12. Notes & CTF Journal

- Per-function notes field (persisted in localStorage)
- "Worked in [CTF Name]" tags
- Quick scratchpad for challenge-specific observations
- Export/import notes as JSON for team sharing
- Notes icon in toolbar, opens side panel
- Rich text editor with markdown support
- Timestamp and auto-save
- Search within notes
- localStorage key: `phpDocNotes` → `{functionName: {note, tags[], timestamp}}`

### 13. Related CVEs

- Link functions to known CVEs
- Quick CVE search integration
- "This function was involved in CVE-XXXX-YYYY"
- Stored in `cves.json` with function name mapping
- Displayed as warning badges in function header
- Click to open CVE details in modal or external link
- Filter by "Has CVE" in sidebar

### 14. Challenge Hints System

- When you bookmark multiple functions, suggest possible attack vectors
- Pattern recognition: "You're looking at file functions + deserialization → possible phar:// attack"
- "Functions viewed together" correlation
- Displayed in "Insights" panel in sidebar
- Updates in real-time based on current bookmarks and history
- Machine learning-style suggestions based on common CTF patterns
- Examples:
  - `file_get_contents` + `unserialize` → "Try phar:// deserialization"
  - `preg_replace` + `eval` → "Check for /e modifier RCE"
  - Multiple comparison functions → "Consider type juggling attack"

### 15. Payload Encoder/Decoder

- Built-in tool to encode payloads (URL, base64, hex, unicode escape)
- Test type juggling comparisons
- MD5/SHA1 collision finder for magic hashes
- Accessible via "Tools" button in toolbar
- Modal overlay with tabs: Encode, Decode, Type Juggling, Magic Hashes
- Input/output text areas with copy buttons
- Live preview of encoding transformations
- Chain multiple encodings (e.g., base64 → URL encode)

### 16. Disable Functions Checker

- Paste `phpinfo()` output or `disable_functions` list
- Instantly highlight which documented functions are still available
- Suggest alternative functions for bypassing restrictions
- Accessible via "Disable Functions" button in toolbar
- Modal with textarea input
- Parses `disable_functions` directive
- Shows: disabled count, available alternatives, bypass suggestions
- Highlights available dangerous functions in green
- Export available functions list

### 17. Source Code Search

- Search within the actual PHP source code examples in docs
- Find usage patterns: "show me all examples using `$_GET`"
- Regex support for advanced patterns
- Accessible via "Code Search" tab in sidebar
- Search across all code blocks in documentation
- Results show: function name, code snippet with highlight, line number
- Click to navigate to full documentation

### 18. Team Collaboration Features

- Generate shareable bookmark collections
- "Share my research" → export as URL or JSON
- Import teammate's bookmarks
- Accessible via "Share" button in toolbar
- Export formats: JSON file, base64 URL parameter, clipboard
- Import via file upload or paste
- Merge strategy: keep both, overwrite, skip duplicates
- Share includes: bookmarks, notes, history (optional)

### 19. Additional Features

- **History**: Last 50 visited pages with timestamps, dedicated "History" tab, persisted in `localStorage`
- **Document Viewer**: Inline iframe rendering of selected doc page with breadcrumb toolbar
- **Copy Function Signature**: One-click copy of the function prototype from the doc (useful for writing exploits fast)
- **Navigation Stack**: Back button to return to previously viewed page
- **Open External**: Open current doc in a new browser tab
- **Virtual Scrolling**: Lazy-load results in batches of 100 for performance with 11K+ entries
- **Mobile Responsive**: Full-screen sidebar/viewer toggle on small screens (useful on CTF LAN setups)
- **Dark Theme**: Catppuccin Mocha color scheme (easy on eyes during long CTF sessions)

---

## File Structure After Implementation

```
phpDocumentReader/
├── package.json            # Dependencies: vite, vue, pinia
├── vite.config.js          # Vite config for single-file build
├── index.html              # Vite entry point
├── src/
│   ├── main.js             # Vue app initialization
│   ├── App.vue             # Root component with layout
│   ├── components/
│   │   ├── Sidebar.vue                    # Main sidebar container
│   │   ├── SearchBar.vue                  # Search input with #tag support
│   │   ├── TagPills.vue                   # CTF quick-access tag pills
│   │   ├── ResultsList.vue                # Virtual scrolling results
│   │   ├── ResultItem.vue                 # Single result with badge + bookmark
│   │   ├── DocumentViewer.vue             # iframe viewer with toolbar
│   │   ├── ExploitPanel.vue               # Exploit snippets display
│   │   ├── BypassTechniques.vue           # Bypass techniques section
│   │   ├── FunctionChaining.vue           # Chaining suggestions chips
│   │   ├── CVEBadges.vue                  # CVE warning badges
│   │   ├── NotesPanel.vue                 # Per-function notes editor
│   │   ├── InsightsPanel.vue              # Attack vector suggestions
│   │   ├── CompareMode.vue                # Split-screen comparison
│   │   ├── RegexLibrary.vue               # Regex patterns tab
│   │   ├── WrapperReference.vue           # Stream wrappers modal
│   │   ├── ToolsModal.vue                 # Encoder/decoder tools
│   │   ├── DisableFunctionsChecker.vue    # Disable functions analyzer
│   │   ├── ShareModal.vue                 # Export/import bookmarks
│   │   └── SourceCodeSearch.vue           # Code example search
│   ├── stores/
│   │   └── app.js          # Pinia store (state management)
│   └── styles/
│       └── main.css        # Global styles (Catppuccin Mocha theme)
├── build_index.py          # Index builder script (with CTF tags)
├── dist/
│   └── index.html          # Built single-file app (deploy this)
├── public/
│   ├── doc-index.json      # Generated search index
│   ├── exploits.json       # Exploit code snippets library
│   ├── bypasses.json       # Bypass techniques database
│   └── cves.json           # CVE mappings for functions
└── php-chunked-xhtml/      # Existing PHP docs (~11,834 HTML files)
    ├── styles/             # 2 CSS files
    ├── js/                 # 2 JS files
    ├── images/             # 68 image files
    ├── function.*.html
    ├── class.*.html
    ├── book.*.html
    └── ...
```

## `build_index.py` Design

- Uses `HTMLParser` to extract `<title>` (reads only first 2KB per file for speed)
- Classifies via filename prefix lookup table
- Generates human-readable names: `function.array-push.html` → `array_push()`
- **Assigns CTF security tags** based on a hardcoded mapping of ~150+ dangerous functions/classes to exploit categories
- Outputs JSON to `public/doc-index.json` with structure:
  ```json
  {
    "generated": true,
    "totalFiles": 11834,
    "categories": { "Functions": 3565, "Classes": 757, ... },
    "ctfTags": ["rce", "cmdi", "lfi", "sqli", "deser", "ssrf", "xxe", "type", "crypto", "info", "filter", "bypass", "upload", "ssti"],
    "entries": [
      {
        "file": "function.eval.html",
        "name": "eval()",
        "title": "Evaluate a string as PHP code",
        "category": "Functions",
        "tags": ["rce"],
        "phpVersions": ["5.x", "7.x", "8.x"]
      },
      {
        "file": "function.unserialize.html",
        "name": "unserialize()",
        "title": "Creates a PHP value from a stored representation",
        "category": "Functions",
        "tags": ["deser"],
        "phpVersions": ["5.x", "7.x", "8.x"]
      },
      ...
    ]
  }
  ```

## Vite Configuration

`vite.config.js` must be configured to build a single HTML file with all assets inlined:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile()  // Inline all CSS/JS into single HTML
  ],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000,  // Inline all assets
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
```

**Dependencies** (`package.json`):
```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "pinia": "^2.1.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "vite-plugin-singlefile": "^2.0.0"
  }
}
```

## `index.html` Design

Vue 3 single-page application with component-based architecture.

### Component Hierarchy

```
App.vue
├── Sidebar.vue
│   ├── SearchBar.vue
│   ├── TagPills.vue
│   ├── Tabs (Browse / Bookmarks / History / Regex Library)
│   ├── Filters (Category, PHP Version)
│   ├── ResultsList.vue
│   │   └── ResultItem.vue (virtual scrolling)
│   └── InsightsPanel.vue
└── DocumentViewer.vue
    ├── Toolbar (breadcrumb, buttons)
    ├── iframe (doc content)
    ├── ExploitPanel.vue
    ├── BypassTechniques.vue
    ├── FunctionChaining.vue
    ├── CVEBadges.vue
    └── Modals
        ├── NotesPanel.vue
        ├── CompareMode.vue
        ├── WrapperReference.vue
        ├── ToolsModal.vue
        ├── DisableFunctionsChecker.vue
        └── ShareModal.vue
```

### Layout
- **Sidebar** (380px):
  - Search input with `#tag` support
  - CTF quick-access tag pills (horizontally scrollable, colored)
  - Tabs (Browse / Bookmarks / History / Regex Library)
  - Category filter dropdown
  - PHP version filter dropdown
  - Results list with badge + bookmark button
  - "Insights" panel showing attack vector suggestions based on bookmarks/history
- **Viewer** (flex remaining):
  - Toolbar: breadcrumb, bookmark, copy signature, open external, back, compare, tools, share, disable functions checker
  - iframe document viewer or welcome screen
  - Exploit snippets panel (when viewing dangerous function)
  - Bypass techniques expandable section
  - Function chaining suggestions (clickable chips)
  - CVE warning badges
  - Notes side panel (toggle)
  - Compare mode split-screen view

### State Management (Pinia Store)

```javascript
// stores/app.js
export const useAppStore = defineStore('app', {
  state: () => ({
    // Core data
    allEntries: [],           // Full index loaded from JSON
    filteredEntries: [],      // After search + category + tag filter
    exploits: {},             // Loaded from exploits.json
    bypasses: {},             // Loaded from bypasses.json
    cves: {},                 // Loaded from cves.json
    chainSuggestions: {},     // Hardcoded function chaining map

    // UI state
    currentDoc: null,         // Currently viewed document
    searchQuery: '',          // Search input value
    activeTags: [],           // Selected CTF exploit tags
    activeCategory: 'all',    // Category filter
    activePhpVersion: 'all',  // PHP version filter
    activeTab: 'browse',      // browse | bookmarks | history | regex

    // Navigation
    navStack: [],             // Back button history

    // User data (persisted to localStorage)
    bookmarks: {},            // file → {name, title, category, time}
    history: [],              // [{file, name, title, time}] (last 50)
    notes: {},                // functionName → {note, tags[], timestamp}

    // Modals
    showNotesPanel: false,
    showCompareMode: false,
    showWrapperRef: false,
    showTools: false,
    showDisableFunctions: false,
    showShare: false,
  }),

  getters: {
    // Computed properties
    bookmarkedEntries: (state) => { /* ... */ },
    insightSuggestions: (state) => { /* ... */ },
    availableFunctions: (state) => { /* ... */ },
  },

  actions: {
    // Methods
    loadIndex() { /* ... */ },
    search(query) { /* ... */ },
    filterByTag(tag) { /* ... */ },
    openDocument(file) { /* ... */ },
    toggleBookmark(file) { /* ... */ },
    saveNote(functionName, note) { /* ... */ },
    exportData() { /* ... */ },
    importData(json) { /* ... */ },
  }
})
```

## Usage

### Development
```bash
# Install dependencies
npm install

# Run dev server with hot reload
npm run dev
# Open http://localhost:5173

# Generate search index (run once, or when docs update)
python build_index.py
```

### Production Build
```bash
# Build to single HTML file (all assets inlined)
npm run build

# Output: dist/index.html (single portable file)

# Serve the built app
python -m http.server 8080 --directory dist
# Open http://localhost:8080
```

### CTF Deployment
1. Build once before CTF: `npm run build`
2. Copy `dist/index.html` to CTF machine
3. Serve: `python -m http.server 8080 --directory dist`
4. Works offline, no dependencies needed

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+K` | Focus search bar |
| `↑ / ↓` | Navigate results |
| `Enter` | Open selected result |
| `Ctrl+B` | Toggle bookmark on current page |
| `Ctrl+N` | Open notes panel |
| `Ctrl+T` | Open tools (encoder/decoder) |
| `Ctrl+D` | Open disable functions checker |
| `Ctrl+Shift+C` | Copy function signature |
| `Ctrl+Shift+E` | Copy exploit snippet (if available) |
| `Esc` | Clear search / close modals / back to sidebar (mobile) |
| `#tag` in search | Filter by CTF exploit category |

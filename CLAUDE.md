# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CTF-focused PHP documentation searcher for rapidly finding exploitable functions, dangerous behaviors, type juggling tricks, and security-relevant PHP quirks during time-pressured competitions.

**Current Status**: Planning phase complete, implementation not yet started.

## Architecture

**Tech Stack**: Vite + Vue 3 + Pinia (builds to single HTML file for CTF portability)

**Why this stack?**
- 15+ features need component-based architecture for maintainability
- Reactive state management (Pinia) handles complex interactions
- Still CTF-friendly: builds to single portable HTML file
- TypeScript support reduces bugs
- Hot reload speeds up development

**Development**: `npm run dev` (hot reload at http://localhost:5173)
**Build**: `npm run build` → outputs single `dist/index.html` with all assets inlined
**Deployment**: `python -m http.server 8080 --directory dist`

## Project Structure

```
src/
├── App.vue                 # Root component with layout
├── main.js                 # Vue app initialization
├── components/
│   ├── Sidebar.vue                    # Main sidebar container
│   ├── SearchBar.vue                  # Search input with #tag support
│   ├── TagPills.vue                   # CTF quick-access tag pills
│   ├── ResultsList.vue                # Virtual scrolling results
│   ├── ResultItem.vue                 # Single result with badge + bookmark
│   ├── DocumentViewer.vue             # iframe viewer with toolbar
│   ├── ExploitPanel.vue               # Exploit snippets display
│   ├── BypassTechniques.vue           # Bypass techniques section
│   ├── FunctionChaining.vue           # Chaining suggestions chips
│   ├── CVEBadges.vue                  # CVE warning badges
│   ├── NotesPanel.vue                 # Per-function notes editor
│   ├── InsightsPanel.vue              # Attack vector suggestions
│   ├── CompareMode.vue                # Split-screen comparison
│   ├── RegexLibrary.vue               # Regex patterns tab
│   ├── WrapperReference.vue           # Stream wrappers modal
│   ├── ToolsModal.vue                 # Encoder/decoder tools
│   ├── DisableFunctionsChecker.vue    # Disable functions analyzer
│   ├── ShareModal.vue                 # Export/import bookmarks
│   └── SourceCodeSearch.vue           # Code example search
├── stores/
│   └── app.js              # Pinia store (state management)
└── styles/
    └── main.css            # Global styles (Catppuccin Mocha theme)

public/
├── doc-index.json          # Generated search index
├── exploits.json           # Exploit code snippets library
├── bypasses.json           # Bypass techniques database
└── cves.json               # CVE mappings for functions

php-chunked-xhtml/          # 11,834 PHP documentation HTML files
```

## Key Implementation Details

### Document Classification by Filename Prefix

The 11,834 HTML files follow naming patterns that determine their category:
- `function.*` → Functions (~3,565 files) - Blue badge
- `class.*` → Classes (~757 files) - Green badge
- `*.method.*` → Class Methods (~5,000+ files) - Purple badge
- `book.*` → Books/Extensions (~171 files) - Peach badge
- `ref.*` → Function References (~159 files) - Yellow badge
- `language.*` → Language Reference (~132 files) - Red badge
- `control-structures.*` → Control Structures (~15 files) - Red badge
- `intro.*`, `install.*`, `migration*`, `reserved.*`, `security.*`, `features.*`, `faq.*`, `about.*` → Grey badges

### CTF Security Tags System

Critical feature: Pre-classified exploit categories for quick filtering during CTFs:
- `#rce` - eval, assert, preg_replace(/e), system, exec, passthru, shell_exec, popen, proc_open, pcntl_exec
- `#cmdi` - Command injection functions + escapeshellcmd/escapeshellarg
- `#lfi` - include, require, file_get_contents, fopen, readfile, SplFileObject, php://filter
- `#upload` - move_uploaded_file, $_FILES, getimagesize, exif_imagetype, finfo_file
- `#sqli` - mysqli_query, PDO::query, pg_query, sqlite_query, mysql_query
- `#deser` - unserialize, __wakeup, __destruct, __toString, __call, Serializable, phar://
- `#ssrf` - file_get_contents, curl_exec, fopen (URL wrappers), SoapClient, copy
- `#xxe` - simplexml_load_string, DOMDocument::loadXML, XMLReader, libxml_disable_entity_loader
- `#type` - Type juggling: ==, strcmp, md5, sha1, json_decode, intval, is_numeric, in_array, array_search
- `#crypto` - md5, sha1, crc32, rand, mt_rand, openssl_encrypt, mcrypt_*
- `#info` - phpinfo, var_dump, print_r, debug_backtrace, get_defined_vars, getenv
- `#filter` - php://input, php://filter, data://, phar://, expect://, zip://
- `#bypass` - dl, putenv, mail (LD_PRELOAD), mb_send_mail, imap_open, FFI
- `#ssti` - Twig, Smarty, Blade template classes

### State Management (Pinia Store)

Single store at `stores/app.js` manages all application state:

**Core Data:**
- `allEntries[]` - Full index loaded from doc-index.json
- `filteredEntries[]` - After search + category + tag filter
- `exploits{}` - Loaded from exploits.json
- `bypasses{}` - Loaded from bypasses.json
- `cves{}` - Loaded from cves.json
- `chainSuggestions{}` - Hardcoded function chaining map

**UI State:**
- `currentDoc` - Currently viewed document
- `searchQuery` - Search input value
- `activeTags[]` - Selected CTF exploit tags
- `activeCategory` - Category filter
- `activePhpVersion` - PHP version filter
- `activeTab` - browse | bookmarks | history | regex

**User Data (persisted to localStorage):**
- `bookmarks{}` - file → {name, title, category, time}
- `history[]` - [{file, name, title, time}] (last 50)
- `notes{}` - functionName → {note, tags[], timestamp}

### Advanced CTF Features

**Exploit Code Snippets Library** (`exploits.json`):
- Pre-built exploit templates for dangerous functions
- One-click copy of common payloads
- Displayed in ExploitPanel.vue when viewing exploitable functions

**Function Chaining Suggestions** (FunctionChaining.vue):
- Shows commonly chained functions as clickable chips
- Example: `file_get_contents` → `php://filter`, `data://`, `phar://`

**Bypass Techniques Database** (`bypasses.json`):
- Common bypass methods for security functions
- Displayed in BypassTechniques.vue expandable section
- Each bypass includes: description, payload example, affected PHP versions

**Version-Specific Vulnerabilities**:
- Tag functions with PHP version where behavior changed
- Filter by PHP version in sidebar
- Stored in index as `phpVersions: ["5.x", "7.x", "8.x"]`

**Quick Diff/Compare Mode** (CompareMode.vue):
- Side-by-side comparison of similar functions
- Split-screen with synchronized scrolling

**Regex Pattern Library** (RegexLibrary.vue):
- Dedicated tab for dangerous regex patterns, WAF bypasses, encoding variations
- Live regex testing against sample input

**Wrapper/Protocol Quick Reference** (WrapperReference.vue):
- Modal overlay with PHP stream wrapper exploit templates
- Copy buttons for each template

**Notes & CTF Journal** (NotesPanel.vue):
- Per-function notes with markdown support
- Export/import as JSON for team sharing

**Related CVEs** (CVEBadges.vue):
- Warning badges in function header
- Click to view CVE details

**Challenge Hints System** (InsightsPanel.vue):
- Pattern recognition based on bookmarks/history
- Real-time attack vector suggestions

**Payload Encoder/Decoder** (ToolsModal.vue):
- Encode payloads (URL, base64, hex, unicode)
- Type juggling comparison tester
- Magic hash finder

**Disable Functions Checker** (DisableFunctionsChecker.vue):
- Parse phpinfo() output or disable_functions list
- Highlights available dangerous functions
- Suggests bypass techniques

**Source Code Search** (SourceCodeSearch.vue):
- Search within PHP code examples in documentation
- Regex support for advanced patterns

**Team Collaboration** (ShareModal.vue):
- Export/import bookmarks, notes, history as JSON
- Base64 URL parameter sharing

### Search Algorithm Requirements

Fuzzy search with weighted scoring:
- Exact substring match → highest score (bonus for match at start)
- Consecutive character matches → bonus
- Word boundary matches (after `_`, `-`, `.`, space) → bonus
- Support `#tag` syntax to filter by security category
- Debounced input (50ms)

### Performance Optimization

Virtual scrolling in ResultsList.vue: Lazy-load results in batches of 100 to handle 11K+ entries efficiently.

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server with hot reload
npm run dev
# Open http://localhost:5173

# Generate search index (run once, or when docs update)
python build_index.py

# Build to single HTML file (all assets inlined)
npm run build
# Output: dist/index.html

# Serve the built app
python -m http.server 8080 --directory dist
# Open http://localhost:8080

# Count documentation files
ls -1 php-chunked-xhtml/*.html | wc -l  # Should be 11834
```

## Vite Configuration

`vite.config.js` must inline all assets into single HTML file:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile()
  ],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
```

## Dependencies

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

## Keyboard Shortcuts

- `Ctrl+K` - Focus search bar
- `↑/↓` - Navigate results
- `Enter` - Open selected result
- `Ctrl+B` - Toggle bookmark on current page
- `Ctrl+N` - Open notes panel
- `Ctrl+T` - Open tools (encoder/decoder)
- `Ctrl+D` - Open disable functions checker
- `Ctrl+Shift+C` - Copy function signature
- `Ctrl+Shift+E` - Copy exploit snippet (if available)
- `Esc` - Clear search / close modals / back to sidebar

## UI Layout

**Sidebar (380px)**:
- Search input with `#tag` support
- CTF quick-access tag pills (horizontally scrollable, colored)
- Tabs: Browse / Bookmarks / History / Regex Library
- Category filter dropdown
- PHP version filter dropdown
- Results list with badge + bookmark button
- "Insights" panel showing attack vector suggestions

**Viewer (flex remaining)**:
- Toolbar: breadcrumb, bookmark, copy signature, open external, back, compare, tools, share, disable functions checker
- iframe document viewer or welcome screen
- Exploit snippets panel (when viewing dangerous function)
- Bypass techniques expandable section
- Function chaining suggestions (clickable chips)
- CVE warning badges
- Notes side panel (toggle)
- Compare mode split-screen view

## Component Guidelines

- Use Vue 3 Composition API (`<script setup>`)
- Use Pinia store for all shared state
- Emit events for parent-child communication
- Use props for data passing down
- Keep components focused on single responsibility
- Use virtual scrolling for large lists (ResultsList.vue)
- Persist user data to localStorage via Pinia actions
- Use Catppuccin Mocha color scheme for dark theme

## CTF Deployment Workflow

1. Build once before CTF: `npm run build`
2. Copy `dist/index.html` to CTF machine
3. Serve: `python -m http.server 8080 --directory dist`
4. Works offline, no dependencies needed

## Reference

Full implementation specification in `plan-phpDocSearcher.prompt.md`

# PHP Documentation Searcher - CTF Edition

A CTF-focused web application for rapidly searching and browsing PHP documentation with exploit research features.

## Features

- **Fast Search**: Fuzzy search across 11,834 PHP documentation pages
- **CTF Tags**: Pre-classified exploit categories (#rce, #sqli, #lfi, etc.)
- **Exploit Snippets**: Ready-to-use payload templates
- **Bypass Techniques**: Common security function bypasses
- **Function Chaining**: Suggestions for commonly chained functions
- **CVE Warnings**: Known vulnerabilities for dangerous functions
- **Notes & Bookmarks**: Save research for team sharing
- **Tools**: Encoder/decoder, type juggling tester, magic hash finder
- **Disable Functions Checker**: Analyze phpinfo() output
- **Stream Wrappers Reference**: PHP wrapper exploitation guide

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Generate search index
python build_index.py

# Start dev server
npm run dev
# Open http://localhost:5173
```

### Production Build

```bash
# Build to single HTML file
npm run build

# Serve the built app
python -m http.server 8080 --directory dist
# Open http://localhost:8080
```

### CTF Deployment

1. Build once: `npm run build`
2. Copy `dist/index.html` to CTF machine
3. Serve: `python -m http.server 8080 --directory dist`
4. Works offline, no dependencies needed!

## Keyboard Shortcuts

- `Ctrl+K` - Focus search
- `Ctrl+B` - Toggle bookmark
- `Ctrl+N` - Open notes
- `Ctrl+T` - Open tools
- `Ctrl+D` - Disable functions checker
- `Esc` - Close modals

## Tech Stack

- **Vue 3** - Component framework
- **Pinia** - State management
- **Vite** - Build tool
- **Catppuccin Mocha** - Dark theme

## Project Structure

```
src/
├── App.vue                 # Root component
├── main.js                 # Entry point
├── components/             # 18 Vue components
├── stores/app.js           # Pinia store
└── styles/main.css         # Global styles

public/
├── doc-index.json          # Search index
├── exploits.json           # Exploit snippets
├── bypasses.json           # Bypass techniques
└── cves.json               # CVE mappings

php-chunked-xhtml/          # 11,834 PHP docs
```

## License

For educational and CTF purposes only.

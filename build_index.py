#!/usr/bin/env python3
"""
Build search index for PHP documentation files.
Extracts titles, classifies by filename, and enriches with CTF security tags.
"""

import os
import json
import re
from html.parser import HTMLParser
from pathlib import Path


class TitleExtractor(HTMLParser):
    """Extract <title> tag content from HTML."""
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title = ""

    def handle_starttag(self, tag, attrs):
        if tag == "title":
            self.in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


def extract_title(html_path):
    """Extract title from HTML file (read only first 2KB for speed)."""
    try:
        with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read(2048)
        parser = TitleExtractor()
        parser.feed(content)
        return parser.title.strip()
    except Exception as e:
        print(f"Error reading {html_path}: {e}")
        return ""


def classify_file(filename):
    """Classify file by filename prefix."""
    if filename.startswith('function.'):
        return 'Functions'
    elif filename.startswith('class.'):
        return 'Classes'
    elif '.method.' in filename or filename.endswith('.method.html'):
        return 'Class Methods'
    elif filename.startswith('book.'):
        return 'Books'
    elif filename.startswith('ref.'):
        return 'References'
    elif filename.startswith('language.'):
        return 'Language'
    elif filename.startswith('control-structures.'):
        return 'Control Structures'
    else:
        return 'Other'


def generate_name(filename, title):
    """Generate human-readable name from filename."""
    # Remove .html extension
    name = filename.replace('.html', '')

    # For functions: function.array-push -> array_push()
    if name.startswith('function.'):
        func_name = name.replace('function.', '').replace('-', '_')
        return f"{func_name}()"

    # For classes: class.datetime -> DateTime
    if name.startswith('class.'):
        class_name = name.replace('class.', '')
        return class_name.replace('-', '').title()

    # For methods: datetime.format -> DateTime::format()
    if '.method.' in name or name.endswith('.method'):
        parts = name.split('.')
        if len(parts) >= 2:
            class_name = parts[0].title()
            method_name = parts[-1] if parts[-1] != 'method' else parts[-2]
            return f"{class_name}::{method_name}()"

    # Default: use title or cleaned filename
    if title:
        return title.split(' - ')[0].strip()
    return name.replace('-', ' ').title()


# CTF Security Tags Mapping
SECURITY_TAGS = {
    'rce': [
        'eval', 'assert', 'preg_replace', 'system', 'exec', 'passthru',
        'shell_exec', 'popen', 'proc_open', 'pcntl_exec', 'create_function'
    ],
    'cmdi': [
        'system', 'exec', 'passthru', 'shell_exec', 'popen', 'proc_open',
        'escapeshellcmd', 'escapeshellarg', 'pcntl_exec'
    ],
    'lfi': [
        'include', 'require', 'include_once', 'require_once',
        'file_get_contents', 'fopen', 'readfile', 'file', 'splfileobject'
    ],
    'upload': [
        'move_uploaded_file', 'getimagesize', 'exif_imagetype',
        'finfo_file', 'mime_content_type'
    ],
    'sqli': [
        'mysqli_query', 'pdo', 'pg_query', 'sqlite_query', 'mysql_query'
    ],
    'deser': [
        'unserialize', '__wakeup', '__destruct', '__tostring', '__call',
        'serializable'
    ],
    'ssrf': [
        'file_get_contents', 'curl_exec', 'fopen', 'soapclient', 'copy',
        'curl_init', 'curl_setopt'
    ],
    'xxe': [
        'simplexml_load_string', 'simplexml_load_file', 'domdocument',
        'xmlreader', 'libxml_disable_entity_loader'
    ],
    'type': [
        'strcmp', 'md5', 'sha1', 'json_decode', 'intval', 'is_numeric',
        'in_array', 'array_search', 'switch'
    ],
    'crypto': [
        'md5', 'sha1', 'crc32', 'rand', 'mt_rand', 'lcg_value',
        'openssl_encrypt', 'mcrypt'
    ],
    'info': [
        'phpinfo', 'var_dump', 'print_r', 'debug_backtrace',
        'get_defined_vars', 'getenv', 'get_defined_functions'
    ],
    'filter': [
        'php', 'filter', 'input', 'data', 'phar', 'expect', 'zip'
    ],
    'bypass': [
        'dl', 'putenv', 'mail', 'mb_send_mail', 'imap_open', 'ffi',
        'apache_setenv'
    ],
    'ssti': [
        'twig', 'smarty', 'blade', 'template'
    ]
}


def assign_tags(name, filename):
    """Assign CTF security tags based on function name."""
    tags = []
    name_lower = name.lower().replace('()', '').replace('::', '_')
    filename_lower = filename.lower()

    for tag, keywords in SECURITY_TAGS.items():
        for keyword in keywords:
            if keyword in name_lower or keyword in filename_lower:
                if tag not in tags:
                    tags.append(tag)

    return tags


def assign_php_versions(name):
    """Assign PHP versions (simplified - would need more detailed mapping)."""
    # Default: available in all versions
    return ['5.x', '7.x', '8.x']


def build_index(docs_dir='php-chunked-xhtml', output_file='public/doc-index.json'):
    """Build the search index."""
    print(f"Scanning {docs_dir}...")

    entries = []
    categories = {}

    # Get all HTML files
    html_files = list(Path(docs_dir).glob('*.html'))
    total = len(html_files)

    print(f"Found {total} HTML files")

    for i, html_path in enumerate(html_files, 1):
        if i % 500 == 0:
            print(f"Processing {i}/{total}...")

        filename = html_path.name
        title = extract_title(html_path)
        category = classify_file(filename)
        name = generate_name(filename, title)
        tags = assign_tags(name, filename)
        php_versions = assign_php_versions(name)

        # Count categories
        categories[category] = categories.get(category, 0) + 1

        entry = {
            'file': filename,
            'name': name,
            'title': title,
            'category': category,
            'tags': tags,
            'phpVersions': php_versions
        }

        entries.append(entry)

    # Sort entries by name
    entries.sort(key=lambda x: x['name'].lower())

    # Build final index
    index = {
        'generated': True,
        'totalFiles': total,
        'categories': categories,
        'ctfTags': list(SECURITY_TAGS.keys()),
        'entries': entries
    }

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Index built successfully!")
    print(f"  Total files: {total}")
    print(f"  Categories: {len(categories)}")
    print(f"  Output: {output_file}")
    print(f"\nCategory breakdown:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")


if __name__ == '__main__':
    build_index()

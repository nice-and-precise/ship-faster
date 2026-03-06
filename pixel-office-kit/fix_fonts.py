#!/usr/bin/env python3
import os
import re

def fix_file(path):
    with open(path, 'rb') as f:
        raw = f.read()
    
    # Decode as utf-8
    content = raw.decode('utf-8')
    
    # Check if it contains the problematic character pattern
    # The unicode right single quotation mark is U+2019 (')
    if "Press Start 2P" in content:
        # Replace the unicode right single quotation mark with regular apostrophe
        # Using the actual unicode code point
        content = content.replace('\u2019', "'")
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {path}")
        return True
    return False

for root, dirs, files in os.walk('components'):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            fix_file(path)

print("Done")

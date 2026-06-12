import re
import os

files_to_process = ['index.html', 'index-en.html']

for filename in files_to_process:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add loading="lazy" decoding="async" to all <img> tags that don't have it
    # We will skip the logo (logo__img)
    
    def process_img(match):
        img_tag = match.group(0)
        
        # Skip logo or hero images if any
        if 'logo__img' in img_tag or 'hero-bg' in img_tag or 'loading="lazy"' in img_tag:
            return img_tag
            
        # Insert loading and decoding attributes before the closing >
        if img_tag.endswith('/>'):
            new_img = img_tag[:-2] + ' loading="lazy" decoding="async" />'
        else:
            new_img = img_tag[:-1] + ' loading="lazy" decoding="async">'
            
        return new_img
        
    content = re.sub(r'<img[^>]+>', process_img, content)

    # 2. Add missing width/height to timeline images based on others (1000x562)
    def add_timeline_dims(match):
        tag = match.group(0)
        if 'width=' not in tag:
            if tag.endswith('/>'):
                return tag[:-2] + ' width="1000" height="562" />'
            else:
                return tag[:-1] + ' width="1000" height="562">'
        return tag
        
    content = re.sub(r'<img\s+src="assets/timeline/[^>]+>', add_timeline_dims, content)

    # 3. Add width/height to the unsplash image based on its style width:100% height:400px (use 1200x400 as default aspect)
    def add_unsplash_dims(match):
        tag = match.group(0)
        if 'unsplash.com' in tag and 'width=' not in tag:
            return tag[:-1] + ' width="1200" height="400">'
        return tag
    content = re.sub(r'<img[^>]+unsplash\.com[^>]+>', add_unsplash_dims, content)

    # 4. Change video preload="auto" to preload="metadata"
    content = content.replace('preload="auto"', 'preload="metadata"')

    # 5. Add defer to main.js if missing
    # In index.html it is <script src="js/main.js"></script>
    content = content.replace('<script src="js/main.js"></script>', '<script src="js/main.js" defer></script>')

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

print("HTML Optimization complete.")

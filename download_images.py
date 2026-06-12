import os
import json
import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

output_dir = '/home/kensey/work/koreana/info-website/assets/timeline/leadership'
os.makedirs(output_dir, exist_ok=True)

def download_unsplash(query, limit):
    url = f"https://unsplash.com/napi/search/photos?query={query}&per_page={limit}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read().decode())
    
    for i, result in enumerate(data.get('results', [])):
        img_url = result['urls']['regular']
        filename = f"{query.replace(' ', '_')}_{i+1}.jpg"
        filepath = os.path.join(output_dir, filename)
        print(f"Downloading {filename}...")
        try:
            urllib.request.urlretrieve(img_url, filepath)
        except Exception as e:
            print(f"Failed to download {filename}: {e}")

download_unsplash("cosmetics", 5)
download_unsplash("household cleaning products", 5)


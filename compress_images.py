"""
compress_images.py - Nen anh webp/jpg de giam dung luong upload Git
Chien luoc:
  - webp: re-encode voi quality=72, resize neu canh dai > 1200px
  - jpg:  re-encode voi quality=72, resize neu canh dai > 1200px
  - mp3:  bo qua
Chay: python compress_images.py
"""

import sys
import io
from pathlib import Path
from PIL import Image

# Force UTF-8 output to avoid cp1252 issues on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

TARGET_DIR    = Path(__file__).parent
MAX_LONG_SIDE = 1200   # pixel
WEBP_QUALITY  = 72
JPG_QUALITY   = 72

exts = {'.webp', '.jpg', '.jpeg', '.png'}

results = []

for img_path in sorted(TARGET_DIR.iterdir()):
    if img_path.suffix.lower() not in exts:
        continue

    original_size = img_path.stat().st_size

    try:
        with Image.open(img_path) as img:
            # Convert RGBA/P -> RGB for JPEG
            if img.mode in ('RGBA', 'P') and img_path.suffix.lower() in ('.jpg', '.jpeg'):
                img = img.convert('RGB')

            # Resize if too large
            w, h = img.size
            long_side = max(w, h)
            if long_side > MAX_LONG_SIDE:
                scale = MAX_LONG_SIDE / long_side
                img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

            # Save back with compression
            ext = img_path.suffix.lower()
            if ext == '.webp':
                img.save(img_path, 'WEBP', quality=WEBP_QUALITY, method=6)
            elif ext in ('.jpg', '.jpeg'):
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                img.save(img_path, 'JPEG', quality=JPG_QUALITY, optimize=True)
            elif ext == '.png':
                img.save(img_path, 'PNG', optimize=True, compress_level=9)

        new_size = img_path.stat().st_size
        saved_kb = (original_size - new_size) / 1024
        ratio    = (1 - new_size / original_size) * 100
        results.append((img_path.name, original_size, new_size, saved_kb, ratio))
        print(f"OK  {img_path.name:<22} {original_size/1024:>7.1f} KB -> {new_size/1024:>7.1f} KB  (-{saved_kb:.1f} KB / -{ratio:.0f}%)")

    except Exception as e:
        results.append((img_path.name, original_size, original_size, 0, 0))
        print(f"ERR {img_path.name}: {e}")

total_before = sum(r[1] for r in results)
total_after  = sum(r[2] for r in results)
print(f"\n{'='*62}")
print(f"TONG: {total_before/1024:.1f} KB -> {total_after/1024:.1f} KB  "
      f"(tiet kiem {(total_before-total_after)/1024:.1f} KB / "
      f"{(1-total_after/total_before)*100:.0f}%)")

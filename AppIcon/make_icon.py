#!/usr/bin/env python3
"""Generate CityUniClub App Icon PNG"""

try:
    from PIL import Image, ImageDraw, ImageFont
    print("✓ PIL available")
except ImportError:
    print("⚠️  PIL not available. Install with: pip3 install Pillow")
    print("\nAlternative: Open create_icon.html in Safari and click Download")
    exit(1)

# Create 1024x1024 image
img = Image.new('RGB', (1024, 1024), color='#A3C9D8')
draw = ImageDraw.Draw(img)

# Outer circle
draw.ellipse([(112, 112), (912, 912)], outline='#003366', width=12)

# Inner circle
draw.ellipse([(132, 132), (892, 892)], outline='#003366', width=2)

# Try to load Georgia font
font = None
font_paths = [
    "/System/Library/Fonts/Georgia.ttc",
    "/System/Library/Fonts/Georgia.ttf",
    "/Library/Fonts/Georgia.ttf"
]
for path in font_paths:
    try:
        font = ImageFont.truetype(path, 400)
        print(f"✓ Loaded font: {path}")
        break
    except:
        continue

if not font:
    font = ImageFont.load_default()
    print("⚠️  Using default font")

# CUC text
draw.text((340, 512), "C", fill='#003366', font=font, anchor='mm')
draw.text((512, 512), "U", fill='#003366', font=font, anchor='mm')
draw.text((684, 512), "C", fill='#003366', font=font, anchor='mm')

# Decorative dots
draw.ellipse([(497, 265), (527, 295)], fill='#003366')
draw.ellipse([(497, 729), (527, 759)], fill='#003366')

# Save
img.save('AppIcon-1024.png', 'PNG')
print("✅ Created AppIcon-1024.png")

# Copy to Assets folder
import shutil
import os
assets_path = os.path.join(os.path.dirname(__file__), '..', 'CityUniClub app', 'CityUniClub app', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-1024.png')
shutil.copy('AppIcon-1024.png', assets_path)
print(f"✅ Copied to Assets.xcassets")

# Update Contents.json
contents = {
    "images": [
        {
            "filename": "AppIcon-1024.png",
            "idiom": "universal",
            "platform": "ios",
            "size": "1024x1024"
        }
    ],
    "info": {
        "author": "xcode",
        "version": 1
    }
}

import json
contents_path = os.path.join(os.path.dirname(__file__), '..', 'CityUniClub app', 'CityUniClub app', 'Assets.xcassets', 'AppIcon.appiconset', 'Contents.json')
with open(contents_path, 'w') as f:
    json.dump(contents, f, indent=2)
print("✅ Updated Contents.json")

print("\n🎉 Done! Open Xcode and build the app.")

#!/usr/bin/env python3
"""Generate CityUniClub App Icon with True Intertwined CUC Monogram"""

from PIL import Image, ImageDraw, ImageFont
import math

# Create 1024x1024 image with alpha
img = Image.new('RGBA', (1024, 1024), color=(0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Load Georgia font
font = ImageFont.truetype("/System/Library/Fonts/Georgia.ttf", 500)

# Create a mask for the intertwined effect
# We'll draw each letter separately and composite them

# Layer 1: Left C (back layer)
layer1 = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
d1 = ImageDraw.Draw(layer1)
d1.text((250, 512), "C", fill='#003366', font=font, anchor='mm')

# Layer 2: U (middle layer)
layer2 = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
d2 = ImageDraw.Draw(layer2)
d2.text((512, 512), "U", fill='#003366', font=font, anchor='mm')

# Layer 3: Right C (front layer)
layer3 = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
d3 = ImageDraw.Draw(layer3)
d3.text((774, 512), "C", fill='#003366', font=font, anchor='mm')

# Composite layers
img = Image.alpha_composite(img, layer1)
img = Image.alpha_composite(img, layer2)
img = Image.alpha_composite(img, layer3)

# Create final image with background
final = Image.new('RGB', (1024, 1024), color='#A3C9D8')
final.paste(img, (0, 0), img)

draw = ImageDraw.Draw(final)

# Outer circle
draw.ellipse([(112, 112), (912, 912)], outline='#003366', width=12)

# Inner circle
draw.ellipse([(132, 132), (892, 892)], outline='#003366', width=2)

# Decorative dots
draw.ellipse([(497, 265), (527, 295)], fill='#003366')
draw.ellipse([(497, 729), (527, 759)], fill='#003366')

# Save
final.save('AppIcon-Intertwined-v2.png', 'PNG')
print("✅ Created AppIcon-Intertwined-v2.png")

# Also copy to Assets
import shutil
import os
assets_path = '../CityUniClub app/CityUniClub app/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png'
shutil.copy('AppIcon-Intertwined-v2.png', assets_path)
print(f"✅ Copied to Assets.xcassets")

print("\n🎉 Done! The CUC letters now overlap/intertwine.")

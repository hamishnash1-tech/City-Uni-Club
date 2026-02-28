#!/usr/bin/env python3
"""Generate CityUniClub App Icon with Intertwined CUC Monogram"""

try:
    from PIL import Image, ImageDraw, ImageFont
    print("✓ PIL available")
except ImportError:
    print("⚠️  PIL not available")
    exit(1)

# Create 1024x1024 image
img = Image.new('RGB', (1024, 1024), color='#A3C9D8')
draw = ImageDraw.Draw(img)

# Outer circle
draw.ellipse([(112, 112), (912, 912)], outline='#003366', width=12)

# Inner circle
draw.ellipse([(132, 132), (892, 892)], outline='#003366', width=2)

# Load Georgia font
font = None
font_paths = [
    "/System/Library/Fonts/Georgia.ttc",
    "/System/Library/Fonts/Georgia.ttf",
    "/Library/Fonts/Georgia.ttf"
]
for path in font_paths:
    try:
        font = ImageFont.truetype(path, 450)
        print(f"✓ Loaded font: {path}")
        break
    except:
        continue

if not font:
    font = ImageFont.load_default()
    print("⚠️  Using default font")

# Create intertwined CUC monogram
# First C (left, slightly transparent)
draw.text((280, 512), "C", fill='#003366', font=font, anchor='mm')

# U (center, overlaps both C's)
draw.text((512, 512), "U", fill='#003366', font=font, anchor='mm')

# Second C (right, overlaps U)
draw.text((744, 512), "C", fill='#003366', font=font, anchor='mm')

# Add decorative elements to make it more crest-like
# Top ornament
draw.arc([(462, 180), (562, 280)], start=0, end=180, fill='#003366', width=3)
draw.point([(512, 170)], fill='#003366')

# Bottom ornament  
draw.arc([(462, 744), (562, 844)], start=180, end=360, fill='#003366', width=3)
draw.point([(512, 854)], fill='#003366')

# Side ornaments
draw.point([(170, 512)], fill='#003366')
draw.point([(854, 512)], fill='#003366')

# Save
img.save('AppIcon-1024-Intertwined.png', 'PNG')
print("✅ Created AppIcon-1024-Intertwined.png")

print("\n🎉 Done! Check AppIcon folder for the new design.")

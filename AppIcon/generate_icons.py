#!/usr/bin/env python3
"""
Generate CityUniClub App Icon PNG files
Creates all required sizes from SVG definition
"""

import base64
import subprocess
import os

# SVG Template for the icon
SVG_TEMPLATE = '''<svg width="{size}" height="{size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#A3C9D8" rx="224" ry="224"/>
  <circle cx="512" cy="512" r="400" fill="none" stroke="#003366" stroke-width="12"/>
  <circle cx="512" cy="512" r="380" fill="none" stroke="#003366" stroke-width="2"/>
  <g transform="translate(280, 512)">
    <path d="M 0,-180 C -100,-180 -180,-100 -180,0 C -180,100 -100,180 0,180" fill="none" stroke="#003366" stroke-width="45" stroke-linecap="round"/>
  </g>
  <g transform="translate(512, 512)">
    <path d="M -150,-180 L -150,50 C -150,150 -100,200 0,200 C 100,200 150,150 150,50 L 150,-180" fill="none" stroke="#003366" stroke-width="45" stroke-linecap="round"/>
  </g>
  <g transform="translate(744, 512)">
    <path d="M 0,-180 C 100,-180 180,-100 180,0 C 180,100 100,180 0,180" fill="none" stroke="#003366" stroke-width="45" stroke-linecap="round"/>
  </g>
  <circle cx="512" cy="280" r="15" fill="#003366"/>
  <circle cx="512" cy="744" r="15" fill="#003366"/>
</svg>'''

# Required icon sizes
ICON_SIZES = [
    (1024, "AppIcon-1024.png"),
    (180, "AppIcon-180.png"),
    (167, "AppIcon-167.png"),
    (152, "AppIcon-152.png"),
    (120, "AppIcon-120.png"),
    (87, "AppIcon-87.png"),
    (80, "AppIcon-80.png"),
    (60, "AppIcon-60.png"),
    (58, "AppIcon-58.png"),
    (40, "AppIcon-40.png"),
    (29, "AppIcon-29.png"),
    (20, "AppIcon-20.png"),
]

def generate_png(size, filename):
    """Generate PNG from SVG using rsvg-convert or online converter"""
    svg_content = SVG_TEMPLATE.format(size=size)
    
    # Save SVG temporarily
    temp_svg = f"/tmp/AppIcon-{size}.svg"
    with open(temp_svg, 'w') as f:
        f.write(svg_content)
    
    # Try to convert using rsvg-convert (if installed)
    output_png = os.path.join(os.path.dirname(__file__), filename)
    
    try:
        # Try rsvg-convert
        subprocess.run([
            'rsvg-convert',
            '-w', str(size),
            '-h', str(size),
            '-o', output_png,
            temp_svg
        ], check=True)
        print(f"✓ Created {filename} ({size}x{size})")
    except FileNotFoundError:
        # rsvg-convert not available, provide instructions
        print(f"⚠️  rsvg-convert not found")
        print(f"   Please create {filename} manually:")
        print(f"   1. Go to https://svgtopng.com")
        print(f"   2. Upload the SVG or use the data URL")
        print(f"   3. Download as {size}x{size} PNG")
        print()
        return False
    
    return True

def main():
    print("🎨 CityUniClub App Icon Generator")
    print("=" * 40)
    print()
    
    output_dir = os.path.dirname(__file__)
    
    # Generate each size
    success_count = 0
    for size, filename in ICON_SIZES:
        if generate_png(size, filename):
            success_count += 1
    
    print()
    print("=" * 40)
    if success_count == len(ICON_SIZES):
        print(f"✅ All {success_count} icons created successfully!")
        print()
        print("Next steps:")
        print("1. Open Xcode project")
        print("2. Navigate to Assets.xcassets")
        print("3. Select AppIcon")
        print("4. The icons should auto-populate")
    else:
        print(f"⚠️  Created {success_count}/{len(ICON_SIZES)} icons")
        print()
        print("Alternative method:")
        print("1. Go to https://appicon.co")
        print("2. Upload AppIcon-1024.png")
        print("3. Download complete icon set")
        print("4. Drag to Xcode Assets.xcassets")

if __name__ == "__main__":
    main()

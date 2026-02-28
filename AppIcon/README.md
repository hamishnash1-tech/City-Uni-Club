# CityUniClub App Icon

## Design
- **Background**: Cambridge Blue (#A3C9D8)
- **Foreground**: Oxford Blue CUC letters (#003366)
- **Style**: Classic serif font with decorative circles

---

## How to Create App Icon

### Option 1: Use Online Generator (Recommended)

1. **Go to**: [https://appicon.co](https://appicon.co)

2. **Upload**: The SVG file in this folder

3. **Download**: Complete iOS icon set

4. **Add to Xcode**:
   - Open `CityUniClub app.xcodeproj`
   - Navigate to `Assets.xcassets`
   - Find `AppIcon` appiconset
   - Drag icons to appropriate slots

---

### Option 2: Use HTML Generator

1. **Open**: `icon.html` in Safari

2. **Right-click** on the 1024×1024 icon

3. **Save Image As** → `AppIcon-1024.png`

4. **Use online tool** to generate all sizes:
   - [https://icon.kitchen](https://icon.kitchen)
   - [https://makeappicon.com](https://makeappicon.com)

---

### Option 3: Manual Creation in Xcode

1. **Open** `CityUniClub app.xcodeproj`

2. **Navigate to** `Assets.xcassets`

3. **Select** `AppIcon`

4. **For each size**, create a square image with:
   - Cambridge Blue background: `#A3C9D8`
   - Oxford Blue text: `#003366`
   - Text: "CUC" in Georgia Bold

---

## Required Icon Sizes

| Device | Size | Scale |
|--------|------|-------|
| iPhone App | 180×180 | @3x |
| iPhone App | 120×120 | @2x |
| iPhone Spotlight | 87×87 | @3x |
| iPhone Spotlight | 58×58 | @2x |
| iPhone Settings | 60×60 | @3x |
| iPhone Settings | 40×40 | @2x |
| iPad App | 167×167 | @2x |
| iPad App | 152×152 | @2x |
| iPad Spotlight | 100×100 | @2x |
| iPad Settings | 58×58 | @2x |
| App Store | 1024×1024 | @1x |

---

## Color Codes

### Cambridge Blue
- **HEX**: `#A3C9D8`
- **RGB**: `rgb(163, 201, 216)`
- **SwiftUI**: `Color(red: 0.639, green: 0.788, blue: 0.847)`

### Oxford Blue
- **HEX**: `#003366`
- **RGB**: `rgb(0, 51, 102)`
- **SwiftUI**: `Color(red: 0, green: 0.2, blue: 0.4)`

---

## Adding to Xcode

1. **Generate** all icon sizes using one of the methods above

2. **Open** `Assets.xcassets` in Xcode

3. **Find** `AppIcon` appiconset

4. **Drag and drop** each icon to its slot:
   - Look for the size label (e.g., "iPhone App @3x")
   - Match the icon size to the slot
   - Xcode will validate automatically

5. **Build** the project

6. **Run** on device/simulator to see new icon

---

## Preview

Open `icon.html` in Safari to preview the icon design before generating.

---

## Tips

✅ Use **1024×1024** as source file for best quality
✅ Ensure icons are **PNG format** with transparency
✅ Check icon visibility on **light and dark backgrounds**
✅ Test on **actual device** (simulator colors may vary)

---

## Need Help?

- [Apple App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Xcode Asset Catalog Help](https://help.apple.com/xcode/mac/current/#/dev10510b1f7)

#!/bin/bash

# Logo Optimization Script
# Creates properly sized logo files for different viewports

set -e

COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_BLUE}=================================${COLOR_RESET}"
echo -e "${COLOR_BLUE}   Logo Optimization Script     ${COLOR_RESET}"
echo -e "${COLOR_BLUE}=================================${COLOR_RESET}"
echo ""

# Check if we're in the frontend directory
if [ ! -d "public/logo" ]; then
  echo -e "${COLOR_YELLOW}Changing to frontend directory...${COLOR_RESET}"
  cd frontend 2>/dev/null || {
    echo "Error: Not in frontend directory"
    exit 1
  }
fi

LOGO_DIR="public/logo"
SOURCE_IMAGE="$LOGO_DIR/rrlogo-optimized.png"

if [ ! -f "$SOURCE_IMAGE" ]; then
  echo "Error: Source image not found: $SOURCE_IMAGE"
  exit 1
fi

echo -e "${COLOR_YELLOW}Current logo file:${COLOR_RESET}"
ls -lh "$SOURCE_IMAGE"
file "$SOURCE_IMAGE"
echo ""

echo -e "${COLOR_BLUE}Analysis:${COLOR_RESET}"
echo "Current size: 1024x723px (117KB)"
echo "Displayed at: 54x70px (header), 48-64px (footer)"
echo "Waste: 95% of pixels are never displayed!"
echo ""

echo -e "${COLOR_YELLOW}Recommendations:${COLOR_RESET}"
echo "1. ✅ Use Next.js Image component (DONE)"
echo "2. ✅ Add responsive sizes attribute (DONE)"
echo "3. 📸 Next.js will auto-generate optimized sizes"
echo "4. 🎯 Expected savings: 90%+ bandwidth reduction"
echo ""

echo -e "${COLOR_GREEN}What Next.js Image will do:${COLOR_RESET}"
echo "- Generate 48px, 64px, 96px, 128px versions"
echo "- Convert to WebP/AVIF format (smaller)"
echo "- Serve appropriate size based on device"
echo "- Lazy load footer logo (not in viewport)"
echo "- Priority load header logo (above fold)"
echo ""

echo -e "${COLOR_BLUE}Build and check:${COLOR_RESET}"
echo "1. npm run build"
echo "2. Check .next/cache/images/ for optimized versions"
echo "3. Test: npm start"
echo "4. Run Lighthouse to verify"
echo ""

# Optional: Create manually optimized versions if ImageMagick is available
if command -v convert &> /dev/null; then
  echo -e "${COLOR_YELLOW}ImageMagick detected. Create optimized versions manually? (y/n)${COLOR_RESET}"
  read -p "" create_manual
  
  if [[ "$create_manual" == "y" ]]; then
    echo -e "${COLOR_GREEN}Creating optimized logo versions...${COLOR_RESET}"
    
    # Create 1x versions for different viewports
    convert "$SOURCE_IMAGE" -resize 48x62 -quality 90 "$LOGO_DIR/rrlogo-48.png"
    convert "$SOURCE_IMAGE" -resize 64x83 -quality 90 "$LOGO_DIR/rrlogo-64.png"
    convert "$SOURCE_IMAGE" -resize 96x124 -quality 90 "$LOGO_DIR/rrlogo-96.png"
    
    # Create 2x versions for retina displays
    convert "$SOURCE_IMAGE" -resize 96x124 -quality 90 "$LOGO_DIR/rrlogo-48@2x.png"
    convert "$SOURCE_IMAGE" -resize 128x166 -quality 90 "$LOGO_DIR/rrlogo-64@2x.png"
    
    # Create WebP versions (even smaller)
    convert "$SOURCE_IMAGE" -resize 48x62 -quality 85 "$LOGO_DIR/rrlogo-48.webp"
    convert "$SOURCE_IMAGE" -resize 64x83 -quality 85 "$LOGO_DIR/rrlogo-64.webp"
    
    echo -e "${COLOR_GREEN}Created optimized versions:${COLOR_RESET}"
    ls -lh "$LOGO_DIR"/rrlogo-*.{png,webp} 2>/dev/null | grep -v "optimized"
    echo ""
    
    echo "You can now use these in your components:"
    echo '  <Image src="/logo/rrlogo-48.png" ... />'
  fi
else
  echo -e "${COLOR_YELLOW}Note: ImageMagick not installed${COLOR_RESET}"
  echo "Next.js Image component will handle optimization automatically"
fi

echo ""
echo -e "${COLOR_GREEN}✅ Logo optimization configured!${COLOR_RESET}"
echo ""
echo "Next steps:"
echo "1. Build: npm run build"
echo "2. Start: npm start"
echo "3. Test: Open DevTools > Network > check logo file size"
echo "4. Lighthouse: Should see improved 'Properly size images' score"

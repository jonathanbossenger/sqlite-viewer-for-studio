#!/bin/bash

# Create iconset directory if it doesn't exist
mkdir -p assets/AppIcon.iconset

# Generate different icon sizes from the original PNG
sips -z 16 16     assets/SQlite\ viewer\ icon.png --out assets/AppIcon.iconset/icon_16x16.png
sips -z 32 32     assets/SQlite\ viewer\ icon.png --out assets/AppIcon.iconset/icon_16x16@2x.png
sips -z 32 32     assets/SQlite\ viewer\ icon.png --out assets/AppIcon.iconset/icon_32x32.png
sips -z 64 64     assets/SQlite\ viewer\ icon.png --out assets/AppIcon.iconset/icon_32x32@2x.png
sips -z 128 128   assets/SQlite\ viewer\ icon.png --out assets/AppIcon.iconset/icon_128x128.png
sips -z 256 256   assets/SQlite\ viewer\ icon.png --out assets/AppIcon.iconset/icon_128x128@2x.png
sips -z 256 256   assets/SQlite\ viewer\ icon.png --out assets/AppIcon.iconset/icon_256x256.png
sips -z 512 512   assets/SQlite\ viewer\ icon.png --out assets/AppIcon.iconset/icon_256x256@2x.png
sips -z 512 512   assets/SQlite\ viewer\ icon.png --out assets/AppIcon.iconset/icon_512x512.png
sips -z 1024 1024 assets/SQlite\ viewer\ icon.png --out assets/AppIcon.iconset/icon_512x512@2x.png

# Create icns file from the iconset
iconutil -c icns assets/AppIcon.iconset

# Clean up the iconset directory
rm -rf assets/AppIcon.iconset 

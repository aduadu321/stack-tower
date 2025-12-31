#!/bin/bash
# Generate Stack Tower icon using ImageMagick

# Create base icon
convert -size 512x512 xc:"#1a1a2e" \
    -fill "#ff6b6b" -draw "roundrectangle 100,380,412,430,5,5" \
    -fill "#ff8e53" -draw "roundrectangle 120,330,392,380,5,5" \
    -fill "#feca57" -draw "roundrectangle 140,280,372,330,5,5" \
    -fill "#48dbfb" -draw "roundrectangle 160,230,352,280,5,5" \
    -fill "#1dd1a1" -draw "roundrectangle 180,180,332,230,5,5" \
    -fill "#5f27cd" -draw "roundrectangle 200,130,312,180,5,5" \
    -fill "#ff9ff3" -draw "roundrectangle 220,80,292,130,5,5" \
    icon_512.png

# Android icon sizes
convert icon_512.png -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
convert icon_512.png -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert icon_512.png -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert icon_512.png -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert icon_512.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png

# Foreground icons (same for now)
cp android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png
cp android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
cp android/app/src/main/res/mipmap-xhdpi/ic_launcher.png android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
cp android/app/src/main/res/mipmap-hdpi/ic_launcher.png android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
cp android/app/src/main/res/mipmap-mdpi/ic_launcher.png android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png

# Round icons
convert icon_512.png -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
convert icon_512.png -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
convert icon_512.png -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
convert icon_512.png -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
convert icon_512.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png

echo "Icons generated!"

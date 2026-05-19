#!/bin/bash
set -e

EXTENSION_UUID="topspot@cahtarevic.ermin"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="$SCRIPT_DIR/../src"

echo "Installing TopSpot..."

glib-compile-schemas "$SRC_DIR/schemas/"
echo "  Compiled GSettings schemas"

mkdir -p "$(dirname "$EXTENSION_DIR")"

if [ -L "$EXTENSION_DIR" ]; then
    rm "$EXTENSION_DIR"
elif [ -d "$EXTENSION_DIR" ]; then
    rm -rf "$EXTENSION_DIR"
fi

ln -s "$SRC_DIR" "$EXTENSION_DIR"
echo "  Linked $SRC_DIR -> $EXTENSION_DIR"

echo ""
echo "Done! To activate TopSpot:"
echo "  1. Log out and log back in (required on Wayland)"
echo "  2. Enable the extension:"
echo "     gnome-extensions enable $EXTENSION_UUID"
echo ""
echo "Or enable it from the Extensions app."

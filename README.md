# TopSpot

A GNOME Shell extension that shows the currently focused application name in the top panel — with a plugin system for extra functionality.

![GNOME 45+](https://img.shields.io/badge/GNOME-45%20%7C%2046-blue)

## Features

- Displays the active app name to the right of the Activities button
- Optional app icon next to the name
- Configurable max label width with ellipsis truncation
- "Desktop" label when no window is focused (toggleable)
- Plugin system for extending the panel
- Settings UI via the Extensions app

### Spotify Plugin

Built-in plugin that shows playback controls and track info whenever Spotify is running:

- Previous / Play-Pause / Next buttons
- Current track artist and title
- Automatically appears when Spotify starts, hides when it exits
- Can be toggled on/off from the extension preferences

## Install

```bash
git clone https://github.com/cahtarevic-ermin/topspot-gnome.git
cd topspot-gnome
chmod +x scripts/install.sh
./scripts/install.sh
```

Then log out and back in, and enable the extension:

```bash
gnome-extensions enable topspot@cahtarevic.ermin
```

Or toggle it on from the **Extensions** app.

## Uninstall

```bash
rm ~/.local/share/gnome-shell/extensions/topspot@cahtarevic.ermin
```

## Requirements

- GNOME Shell 45 or 46
- `glib-compile-schemas` (usually pre-installed on Ubuntu)

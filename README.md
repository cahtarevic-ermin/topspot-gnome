# TopSpot

A GNOME Shell extension that shows the currently focused application name in the top panel.

![GNOME 45+](https://img.shields.io/badge/GNOME-45%20%7C%2046-blue)

## Features

- Displays the active app name to the right of the Activities button
- Optional app icon next to the name
- Configurable max label width with ellipsis truncation
- "Desktop" label when no window is focused (toggleable)
- Settings UI via the Extensions app

## Install

```bash
git clone https://github.com/cahtarevic/topspot-gnome.git
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

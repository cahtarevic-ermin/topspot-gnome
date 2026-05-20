import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TopSpotPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'TopSpot',
            icon_name: 'preferences-system-symbolic',
        });
        window.add(page);

        const appearanceGroup = new Adw.PreferencesGroup({
            title: 'Appearance',
        });
        page.add(appearanceGroup);

        const showIconRow = new Adw.SwitchRow({
            title: 'Show Application Icon',
            subtitle: 'Display the app icon next to its name',
        });
        settings.bind('show-icon', showIconRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        appearanceGroup.add(showIconRow);

        const maxWidthRow = new Adw.SpinRow({
            title: 'Maximum Label Width',
            subtitle: 'Width in pixels before text is truncated',
            adjustment: new Gtk.Adjustment({
                lower: 50,
                upper: 500,
                step_increment: 10,
                page_increment: 50,
                value: settings.get_int('max-label-width'),
            }),
        });
        settings.bind('max-label-width', maxWidthRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        appearanceGroup.add(maxWidthRow);

        const behaviorGroup = new Adw.PreferencesGroup({
            title: 'Behavior',
        });
        page.add(behaviorGroup);

        const showOnDesktopRow = new Adw.SwitchRow({
            title: 'Show on Desktop',
            subtitle: 'Show "Desktop" when no window is focused',
        });
        settings.bind('show-on-desktop', showOnDesktopRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        behaviorGroup.add(showOnDesktopRow);

        const pluginsGroup = new Adw.PreferencesGroup({
            title: 'Plugins',
        });
        page.add(pluginsGroup);

        const spotifyRow = new Adw.SwitchRow({
            title: 'Spotify Controls',
            subtitle: 'Show playback controls and track info when Spotify is running',
        });
        settings.bind('spotify-enabled', spotifyRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        pluginsGroup.add(spotifyRow);
    }
}

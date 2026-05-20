import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {SpotifyPlugin} from './plugins/spotify.js';

const TopSpotIndicator = GObject.registerClass(
class TopSpotIndicator extends PanelMenu.Button {
    _init(settings) {
        super._init(0.0, 'TopSpot', true);

        this._settings = settings;

        this._box = new St.BoxLayout({style_class: 'panel-status-indicators-box'});
        this.add_child(this._box);

        this._icon = new St.Icon({style_class: 'topspot-icon'});
        this._box.add_child(this._icon);

        this._label = new St.Label({
            style_class: 'topspot-label',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._box.add_child(this._label);

        this._tracker = Shell.WindowTracker.get_default();

        this._applySettings();

        this._settingsChangedIds = [
            this._settings.connect('changed::show-icon', () => this._applySettings()),
            this._settings.connect('changed::max-label-width', () => this._applySettings()),
            this._settings.connect('changed::show-on-desktop', () => this._updateLabel()),
        ];

        this._focusWindowId = global.display.connect(
            'notify::focus-window', () => this._updateLabel());
    }

    _applySettings() {
        const showIcon = this._settings.get_boolean('show-icon');
        this._icon.visible = showIcon;

        const maxWidth = this._settings.get_int('max-label-width');
        this._label.set_style(`max-width: ${maxWidth}px;`);
        this._label.clutter_text.ellipsize = Pango.EllipsizeMode.END;

        this._updateLabel();
    }

    _updateLabel() {
        const focusWindow = global.display.focus_window;

        if (!focusWindow) {
            const showOnDesktop = this._settings.get_boolean('show-on-desktop');
            if (showOnDesktop) {
                this._label.set_text('Desktop');
                this._icon.set_icon_name('user-desktop-symbolic');
                this.visible = true;
            } else {
                this.visible = false;
            }
            return;
        }

        const app = this._tracker.get_window_app(focusWindow);
        if (app) {
            this._label.set_text(app.get_name());
            if (this._settings.get_boolean('show-icon'))
                this._icon.set_gicon(app.get_icon());
        } else {
            this._label.set_text(focusWindow.get_title() || '');
            this._icon.set_icon_name('application-x-executable-symbolic');
        }

        this.visible = true;
    }

    destroy() {
        global.display.disconnect(this._focusWindowId);

        for (const id of this._settingsChangedIds)
            this._settings.disconnect(id);
        this._settingsChangedIds = [];

        super.destroy();
    }
});

export default class TopSpotExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._indicator = new TopSpotIndicator(this._settings);
        Main.panel.addToStatusArea('topspot', this._indicator, 1, 'left');

        this._plugins = [new SpotifyPlugin()];
        for (const plugin of this._plugins)
            plugin.enable(this._indicator._box, this._settings);
    }

    disable() {
        if (this._plugins) {
            for (const plugin of this._plugins.reverse())
                plugin.disable();
            this._plugins = null;
        }

        this._indicator?.destroy();
        this._indicator = null;
        this._settings = null;
    }
}

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';
import St from 'gi://St';

const MPRIS_PLAYER_IFACE = 'org.mpris.MediaPlayer2.Player';
const MPRIS_PATH = '/org/mpris/MediaPlayer2';
const SPOTIFY_BUS_NAME = 'org.mpris.MediaPlayer2.spotify';
const DBUS_PROPERTIES_IFACE = 'org.freedesktop.DBus.Properties';

const MprisPlayerIface = `
<node>
  <interface name="${MPRIS_PLAYER_IFACE}">
    <method name="PlayPause"/>
    <method name="Next"/>
    <method name="Previous"/>
    <property name="PlaybackStatus" type="s" access="read"/>
    <property name="Metadata" type="a{sv}" access="read"/>
  </interface>
</node>`;

const MprisPlayerProxy = Gio.DBusProxy.makeProxyWrapper(MprisPlayerIface);

export class SpotifyPlugin {
    enable(panelBox, settings) {
        this._panelBox = panelBox;
        this._settings = settings;
        this._proxy = null;
        this._signalIds = [];

        this._container = new St.BoxLayout({
            style_class: 'topspot-spotify-box',
            visible: false,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._panelBox.add_child(this._container);

        const separator = new St.Widget({style_class: 'topspot-separator'});
        this._container.add_child(separator);

        this._prevBtn = this._makeButton('media-skip-backward-symbolic', () => {
            this._proxy?.PreviousRemote();
        });
        this._container.add_child(this._prevBtn);

        this._playPauseBtn = this._makeButton('media-playback-start-symbolic', () => {
            this._proxy?.PlayPauseRemote();
        });
        this._container.add_child(this._playPauseBtn);

        this._nextBtn = this._makeButton('media-skip-forward-symbolic', () => {
            this._proxy?.NextRemote();
        });
        this._container.add_child(this._nextBtn);

        this._trackLabel = new St.Label({
            style_class: 'topspot-spotify-label',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._trackLabel.clutter_text.ellipsize = Pango.EllipsizeMode.END;
        this._container.add_child(this._trackLabel);

        this._settingsId = this._settings.connect('changed::spotify-enabled', () => {
            this._onSettingsChanged();
        });

        this._watchId = Gio.bus_watch_name(
            Gio.BusType.SESSION,
            SPOTIFY_BUS_NAME,
            Gio.BusNameWatcherFlags.NONE,
            () => this._onSpotifyAppeared(),
            () => this._onSpotifyVanished(),
        );

        this._onSettingsChanged();
    }

    disable() {
        if (this._watchId) {
            Gio.bus_unwatch_name(this._watchId);
            this._watchId = null;
        }

        if (this._settingsId) {
            this._settings.disconnect(this._settingsId);
            this._settingsId = null;
        }

        this._disconnectProxy();
        this._container?.destroy();
        this._container = null;
    }

    _onSettingsChanged() {
        const enabled = this._settings.get_boolean('spotify-enabled');
        if (!enabled) {
            this._container.visible = false;
            this._disconnectProxy();
        } else if (this._proxy) {
            this._container.visible = true;
        }
    }

    _onSpotifyAppeared() {
        if (!this._settings.get_boolean('spotify-enabled'))
            return;

        try {
            this._proxy = new MprisPlayerProxy(
                Gio.DBus.session,
                SPOTIFY_BUS_NAME,
                MPRIS_PATH,
            );

            this._signalIds.push(
                this._proxy.connect('g-properties-changed', () => this._updateState())
            );

            this._container.visible = true;
            this._updateState();
        } catch (e) {
            logError(e, 'TopSpot Spotify: failed to create proxy');
        }
    }

    _onSpotifyVanished() {
        this._disconnectProxy();
        this._container.visible = false;
    }

    _disconnectProxy() {
        for (const id of this._signalIds)
            this._proxy?.disconnect(id);
        this._signalIds = [];
        this._proxy = null;
    }

    _updateState() {
        if (!this._proxy)
            return;

        const status = this._proxy.PlaybackStatus;
        const iconName = status === 'Playing'
            ? 'media-playback-pause-symbolic'
            : 'media-playback-start-symbolic';
        this._playPauseBtn.child.icon_name = iconName;

        const metadata = this._proxy.Metadata;
        if (metadata) {
            const title = metadata['xesam:title']?.deepUnpack() ?? '';
            const artists = metadata['xesam:artist']?.deepUnpack() ?? [];
            const artist = artists.join(', ');
            this._trackLabel.set_text(artist ? `${artist} — ${title}` : title);
        } else {
            this._trackLabel.set_text('');
        }
    }

    _makeButton(iconName, callback) {
        const button = new St.Button({
            style_class: 'topspot-spotify-btn',
            y_align: Clutter.ActorAlign.CENTER,
            child: new St.Icon({
                icon_name: iconName,
                style_class: 'topspot-spotify-btn-icon',
            }),
        });
        button.connect('clicked', callback);
        return button;
    }
}

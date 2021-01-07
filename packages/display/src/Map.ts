/*
 * Copyright (C) 2019-2021 HERE Europe B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 * License-Filename: LICENSE
 */

import {getElDimension} from './DOMTools';
import WebglDisplay from './displays/webgl/Display';
import CanvasDisplay from './displays/canvas/Display';
import BasicDisplay from './displays/BasicDisplay';
import {Behavior, BehaviorOptions} from './behavior/Behavior';
import {EventDispatcher} from './event/Dispatcher';
import {Search} from './search/Search';
import {MapEvent} from './event/Event';
import MVCRecognizer from './MVCRecognizer';
import UI from './ui/UI';
import {JSUtils, Listener} from '@here/xyz-maps-common';
import {ZoomAnimator} from './animation/ZoomAnimator';
import {KineticPanAnimator} from './animation/KineticPanAnimator';
import {defaultOptions, MapOptions} from './MapOptions';
import {layers, projection, PixelPoint, PixelRect, GeoPoint, GeoRect} from '@here/xyz-maps-core';

const project = projection.webMercator;
const TileLayer = layers.TileLayer;

const DEFAULT_ZOOM_ANIMATION_MS = 250;
let DEFAULT_ZOOM_BEHAVIOR: 'fixed' | 'float' | boolean = 'fixed';

const MAX_LONGITUDE = 180;
const MIN_LONGITUDE = -MAX_LONGITUDE;
const MAX_LATITUDE = 85.05112878;
const MIN_LATITUDE = -MAX_LATITUDE;

const TILESIZE = 256;
const RENDER_TILE_SIZE = 256;

const MAX_GRID_ZOOM = 20;
const MAX_POSSIBLE_ZOOMLEVEL = 28;

const LON = 'longitude';
const LAT = 'latitude';
const WIDTH = 'width';
const HEIGHT = 'height';
const BEHAVIOR_ZOOM = 'zoom';
const BEHAVIOR_DRAG = 'drag';
const BEHAVIOR_PITCH = 'pitch';
const BEHAVIOR_ROTATE = 'rotate';
const ON_LAYER_ADD_EVENT = 'addLayer';
const ON_LAYER_REMOVE_EVENT = 'removeLayer';

let UNDEF;

function calcZoomLevelForBounds(minLon, minLat, maxLon, maxLat, mapWidth, mapHeight) {
    let maxZoom = 20;
    let maxWorldSize = Math.pow(2, maxZoom) * TILESIZE;
    let zoomLevelWidth;
    let zoomLevelHeight;
    let toMap;

    for (let zoom = maxZoom; zoom >= 0; --zoom) {
        toMap = maxZoom - zoom;

        zoomLevelWidth =
            (project.lon2x(maxLon, maxWorldSize) >> toMap) - (project.lon2x(minLon, maxWorldSize) >> toMap);

        zoomLevelHeight =
            (project.lat2y(minLat, maxWorldSize) >> toMap) - (project.lat2y(maxLat, maxWorldSize) >> toMap);

        if (zoomLevelWidth <= mapWidth && zoomLevelHeight <= mapHeight) {
            return zoom;
        }
    }

    return 0;
};


/**
 *  XYZ Map is a map display with support for dynamically changing vector data.
 */
export default class Map {
    id: number;

    private _el: HTMLElement;
    private _l: Listener;
    private _w: number; // map width in pixel
    private _h: number; // map height in pixel
    private _cx: number; // center screen in pixel
    private _cy: number; // center screen in pixel

    private _s: number = 1; // current scale

    private _display: BasicDisplay;
    private _mvcRecognizer: MVCRecognizer;
    private _rz: number = 0; // rotation z in rad
    private _rx: number = 0; // rotation x in rad
    private _z: number; // zoom level

    private _tlwx: number;
    private _tlwy: number;

    private _wSize: number; // world size pixel

    private _vp: GeoRect; // viewport/viewbounds

    private ui: UI;

    private _cfg: MapOptions;// mapconfig

    private _evDispatcher: EventDispatcher;
    private _b: Behavior;

    // TODO: cleanup
    private _cw: PixelPoint = new PixelPoint(0, 0); // center world in pixel
    private _c: GeoPoint = new GeoPoint(0, 0); // center geo
    private _pc: GeoPoint = new GeoPoint(0, 0); // previous center geo

    // TODO: remove screenOffset
    private _ox = 0; // screenOffsetY
    private _oy = 0; // screenOffsetX

    // TODO: remove
    private layers: layers.TileLayer[];
    private _vplock: any; // current viewport lock state
    private zoomAnimator: ZoomAnimator;
    private _search: Search;

    /**
     *  XYZ Map is a map display with support for dynamically changing vector data.
     *
     *  @param mapEl - HTMLElement used to create the map display
     *  @param mapOptions - configuration for the map
     *
     *  ```javascript
     *  //create Map display
     *  var display = new here.xyz.maps.Map( mapDiv, {
     *      zoomLevel : 19,
     *      center: {
     *          latitude: 50.10905256955773, longitude: 8.657339975607162
     *      },
     *      // add layers to display
     *      layers: layers
     *  });
     *  ```
     */
    constructor(mapEl: HTMLElement, mapOptions: MapOptions) {
        this._cfg = mapOptions = JSUtils.extend(true,
            JSUtils.extend(true, {}, defaultOptions),
            mapOptions || {}
        );

        let tigerMap = this;

        // mapsize is same as displaysize by default
        this._w = getElDimension(mapEl, WIDTH);
        this._h = getElDimension(mapEl, HEIGHT);
        this._cx = this._w / 2;
        this._cy = this._h / 2;

        // init defaults
        const zoomLevel = mapOptions['zoomLevel'] || mapOptions['zoomlevel'];

        mapOptions.maxLevel = Math.min(MAX_POSSIBLE_ZOOMLEVEL, mapOptions.maxLevel);

        this._z = Math.min(MAX_GRID_ZOOM, zoomLevel) ^ 0;

        this._wSize = Math.pow(2, this._z) * TILESIZE;
        this._l = new Listener([
            'center',
            'rotation',
            'zoomlevel',

            'mapviewchangestart',
            'mapviewchange',
            'mapviewchangeend',

            'resize',

            ON_LAYER_ADD_EVENT,
            ON_LAYER_REMOVE_EVENT
        ]);

        let listeners = this._l;
        let layers = [];
        let parent = mapEl;


        tigerMap.layers = layers;
        tigerMap.id = Math.random() * 1e6 ^ 0;

        mapEl = document.createElement('div');
        mapEl.className = '_' + JSUtils.String.random(11);
        mapEl.style['-webkit-tap-highlight-color'] = 'rgba(0,0,0,0)';
        mapEl.style.position = 'relative';
        mapEl.style.width = this._w + 'px';
        mapEl.style.height = this._h + 'px';

        parent.appendChild(mapEl);

        this._el = mapEl;

        console.log('TM', this._w, 'x', this._h);

        const Display = mapOptions['renderer'] == 'canvas' ? CanvasDisplay : WebglDisplay;

        if (typeof Display.zoomBehavior == 'string') {
            DEFAULT_ZOOM_BEHAVIOR = Display.zoomBehavior;
        }

        // var display = new Display( tigerMap, mapEl );
        const display = new Display(
            mapEl,
            RENDER_TILE_SIZE,
            mapOptions['devicePixelRatio'],
            mapOptions['renderOptions'] || {}
        );

        tigerMap._mvcRecognizer = new MVCRecognizer(tigerMap,
            function triggerEventListeners(type, detail, sync) {
                listeners.trigger(
                    type,
                    [new MapEvent(type, detail)],
                    sync
                );
            },
            display
        );

        tigerMap._display = display;

        this._search = new Search(tigerMap);

        const pointerEvents = this._evDispatcher = new EventDispatcher(mapEl, tigerMap, layers, mapOptions);

        listeners.add('mapviewchangestart', (e) => pointerEvents.disable('pointerenter'));
        listeners.add('mapviewchangeend', (e) => pointerEvents.enable('pointerenter'));
        listeners.add('mapviewchangeend', (e) => display.viewChangeDone());


        this.zoomAnimator = new ZoomAnimator(tigerMap);

        const behaviorOptions = {...mapOptions['behavior'], ...mapOptions['behaviour']};

        if (behaviorOptions[BEHAVIOR_ZOOM] == UNDEF) {
            behaviorOptions[BEHAVIOR_ZOOM] = DEFAULT_ZOOM_BEHAVIOR;
        }

        let behavior = this._b = new Behavior(
            mapEl,
            tigerMap,
            new KineticPanAnimator(tigerMap),
            <BehaviorOptions>behaviorOptions,
            mapOptions
        );
        // just attach the eventlisteners..
        // does not influence actual drag/zoom behavior
        behavior.drag(true);
        behavior.scroll(true);

        this._vplock = {
            pan: false,
            minLevel: mapOptions['minLevel'],
            maxLevel: mapOptions['maxLevel']
        };

        const uiOptions = mapOptions['UI'] || mapOptions['ui'] || {};
        if (uiOptions.Compass == UNDEF) {
            // enable compass ui if pitch or rotate is enabled
            uiOptions.Compass = behaviorOptions[BEHAVIOR_ROTATE] || behaviorOptions[BEHAVIOR_PITCH];
        }

        this.ui = new UI(mapEl, mapOptions, tigerMap);

        tigerMap.setCenter(mapOptions['center']);
        tigerMap.pitch(mapOptions['pitch']);
        tigerMap.rotate(mapOptions['rotate']);

        tigerMap.setZoomlevel(zoomLevel);

        (mapOptions['layers'] || []).forEach((layer) => this.addLayer(layer));
    }

    private initViewPort(): [number, number] {
        const currentScale = this._s;
        let cOffsetX = this._w / 2;
        let cOffsetY = this._h / 2;

        let centerWorldPixelX = this._cw.x;
        let centerWorldPixelY = this._cw.y;

        let topLeftWorldX = centerWorldPixelX - cOffsetX / currentScale;
        let topLeftWorldY = centerWorldPixelY - cOffsetY / currentScale;

        this._tlwx = topLeftWorldX;
        this._tlwy = topLeftWorldY;

        // topLeftX = centerWorldPixelX - this._w / currentScale / 2;
        // topLeftY = centerWorldPixelY - this._h / currentScale / 2;

        this._ox = centerWorldPixelX - cOffsetX - topLeftWorldX;
        this._oy = centerWorldPixelY - cOffsetY - topLeftWorldY;


        const worldSizePixel = this._wSize;

        let topLeftLon = project.x2lon(topLeftWorldX, worldSizePixel);
        let topLeftLat = project.y2lat(topLeftWorldY, worldSizePixel);
        let bottomRightX = centerWorldPixelX + cOffsetX / currentScale;
        let bottomRightY = centerWorldPixelY + cOffsetY / currentScale;
        let bottomRightLon = project.x2lon(bottomRightX, worldSizePixel);
        let bottomRightLat = project.y2lat(bottomRightY, worldSizePixel);

        this._vp = new GeoRect(topLeftLon, bottomRightLat, bottomRightLon, topLeftLat);

        return [centerWorldPixelX / worldSizePixel, centerWorldPixelY / worldSizePixel];
    };

    private updateGrid() {
        const display = this._display;
        const centerGeo = this._c;
        const prevCenterGeo = this._pc;

        this._mvcRecognizer.watch(true);

        display.setTransform(this._s, this._rz, this._rx);

        display.updateGrid(this.initViewPort(), this._z, this._ox, this._oy);

        if (prevCenterGeo[LON] != centerGeo[LON] || prevCenterGeo[LAT] != centerGeo[LAT]) {
            this._l.trigger('center', ['center', centerGeo, prevCenterGeo], true);
            this._pc = centerGeo;
        }
    }

    private _setCenter(lon, lat) {
        const worldSizePixel = this._wSize;

        if (arguments.length != 2) {
            if (lon instanceof Array) {
                lat = lon[1];
                lon = lon[0];
            } else {
                lon = lon || this._c;
                lat = lon[LAT];
                lon = lon[LON];
            }
        }

        if (isNaN(lon) || isNaN(lat) || typeof lon != 'number' || typeof lat != 'number') {
            return false;
        }

        if (lon > MAX_LONGITUDE) {
            lon -= 360;
        } else if (lon < MIN_LONGITUDE) {
            lon += 360;
        }

        if (lat < MIN_LATITUDE) {
            lat = MIN_LATITUDE;
        } else if (lat > MAX_LATITUDE) {
            lat = MAX_LATITUDE;
        }

        this._c = new GeoPoint(lon, lat);

        this._cw = new PixelPoint(
            project.lon2x(lon, worldSizePixel),
            project.lat2y(lat, worldSizePixel)
        );

        return true;
    }

    repaint() {
        this.updateGrid();
    };

    debug(d) {
        this._display.showGrid(d);
        this.updateGrid();
    };

    /**
     * Set or get map pitch (tilt) in degrees
     *
     * @param pitch - pitch in degrees
     */
    pitch(pitch?: number) {
        if (pitch !== UNDEF) {
            const maxPitch = this._cfg.maxPitch;
            const deg = Math.max(0, Math.min(maxPitch, Math.round(pitch % 360 * 10) / 10));

            this._rx = -deg * Math.PI / 180;
            this.updateGrid();
        }
        return -this._rx * 180 / Math.PI;
    };

    /**
     * Set or get map rotation along z-axis
     *
     * @param rotation - set absolute map rotation in degrees
     *
     * @returns current applied rotation in degrees
     */
    rotate(rotation?: number): number {
        if (rotation !== UNDEF) {
            const rad = Math.round(10 * rotation || 0) * Math.PI / 1800;
            const rotZRad = this._rz;

            if (rad !== rotZRad) {
                const rcx = this._cx;
                const rcy = this._cy;
                const uRotCenter = this._display.unproject(rcx, rcy);
                const centerWorldPixel = this._cw;

                centerWorldPixel.x += uRotCenter[0] - rcx;
                centerWorldPixel.y += uRotCenter[1] - rcy;

                this._rz = rad;

                this.updateGrid();

                this._l.trigger('rotation',
                    ['rotation', this._rz, rotZRad],
                    true
                );
            }
        }
        return this._rz / Math.PI * 180;
    };

    /**
     * Set the background color of the map
     *
     * @param color - the background color to set
     */
    setBackgroundColor(color: string) {
        this._display.setBGColor(color);
        this.refresh();
    };

    /**
     * Adds an event listener.
     * supported events: 'mapviewchangestart', 'mapviewchange', 'mapviewchangeend', 'resize',
     * 'tap', 'dbltap', 'pointerup', 'pointerenter', 'pointerleave', 'pointerdown', 'pointermove', 'pressmove'
     *
     * @param type - event name
     * @param callback - callback function
     */
    addEventListener(type: string, callback) {
        const listeners = this._l;
        type.split(' ').forEach((type) => {
            if (listeners.isDefined(type)) { // normal event listeners.
                return listeners.add(type, callback);
            }
            this._evDispatcher.addEventListener(type, callback);
        });
    };

    /**
     * Removes an event listener.
     *
     * @param type event name
     * @param callback callback function
     */
    removeEventListener(type: string, callback) {
        const listeners = this._l;
        type.split(' ').forEach((type) => {
            if (listeners.isDefined(type)) { // normal event listeners.
                return listeners.remove(type, callback);
            }
            this._evDispatcher.removeEventListener(type, callback);
        });
    };

    /**
     * Gets the current view bounds of the view port.
     *
     * @return {here.xyz.maps.GeoRect}
     */
    getViewBounds(): GeoRect {
        let viewport = this._vp;
        let minLon = viewport.minLon;
        let maxLon = viewport.maxLon;
        let minLat = viewport.minLat;
        let maxLat = viewport.maxLat;

        if (minLat <= MIN_LATITUDE) {
            minLat = -90;
        }

        if (maxLat >= MAX_LATITUDE) {
            maxLat = 90;
        }

        if (minLon < MIN_LONGITUDE) {
            minLon = MIN_LONGITUDE;
        }

        if (maxLon > MAX_LONGITUDE) {
            maxLon = MAX_LONGITUDE;
        }

        return new GeoRect(minLon, minLat, maxLon, maxLat);
    };

    /**
     * Set view bounds for the map to display.
     *
     * @expose
     * @function
     * @name here.xyz.maps.Map#setViewBounds
     * @param {here.xyz.maps.GeoRect|Array.<number>} bounds is either an geojson bbox array [minLon, minLat, maxLon, maxLat] or GeoRect defining the viewbounds.
     *
     * @also
     *
     * Set view bounds for the map to display.
     *
     * @expose
     * @function
     * @name here.xyz.maps.Map#setViewBounds
     * @param {here.xyz.maps.providers.FeatureProvider.Feature} view bounds will be set to fit feature on screen.
     *
     */
    setViewBounds(bounds) {
        const args = arguments;
        let minLon;
        let minLat;
        let maxLon;
        let maxLat;
        let dLon;
        let dLat;

        if (args.length == 4) {
            minLon = args[0];
            minLat = args[1];
            maxLon = args[2];
            maxLat = args[3];
        } else {
            if (bounds.bbox) {
                bounds = bounds.bbox;
            }
            if (bounds instanceof Array) {
                minLon = bounds[0];
                minLat = bounds[1];
                maxLon = bounds[2];
                maxLat = bounds[3];
            } else {
                minLon = bounds['minLon'];
                minLat = bounds['minLat'];
                maxLon = bounds['maxLon'];
                maxLat = bounds['maxLat'];
            }
        }

        dLon = maxLon - minLon;
        dLat = maxLat - minLat;

        this.setZoomlevel(
            calcZoomLevelForBounds(
                minLon,
                minLat,
                maxLon,
                maxLat,
                this.getWidth(),
                this.getHeight()
            )
        );

        this.setCenter(
            minLon + dLon / 2,
            minLat + dLat / 2
        );
    };

    /**
     * Get most top rendered feature within the given area of map
     *
     * @expose
     * @function
     *

     * @param {here.xyz.maps.PixelPoint|here.xyz.maps.pixel.Rect=} point or rect in pixel
     * @param {Object=} options
     * @param {number=} options.width width in pixel of rectangle if point geometry is used.
     * @param {number=} options.height height in pixel of rectangle if point geometry is used.
     * @param {Array.<here.xyz.maps.layers.TileLayer>=} options.layers defines the layer(s) to search in.
     * @name here.xyz.maps.Map#getFeatureAt
     * @return {Object} result object providing {@link here.xyz.maps.layers.TileLayer|"layer"} and
     *  {@link here.xyz.maps.providers.FeatureProvider.Feature|"feature"}.
     */
    getFeatureAt(geo, opt?) {
        opt = opt || {};
        opt.topOnly = true;

        let result = this.getFeaturesAt(geo, opt);

        if (result.length) {
            result = result[result.length - 1];
            (<any>result).feature = (<any>result).features[0];
            return result;
        }
    };

    /**
     * Get rendered features within the given area of map
     *
     * @expose
     * @function
     *

     * @param {here.xyz.maps.PixelPoint|here.xyz.maps.pixel.Rect=} point or rect in pixel
     * @param {Object=} options
     * @param {number=} options.width width in pixel of rectangle if point geometry is used.
     * @param {number=} options.height height in pixel of rectangle if point geometry is used.
     * @param {Boolean=} [options.topOnly=false] if set to true only the top most feature will be returned.
     * @param {Array.<here.xyz.maps.layers.TileLayer>=} options.layers defines the layer(s) to search in.
     * @name here.xyz.maps.Map#getFeaturesAt
     * @return {Array.<Object>} zIndex ordered Array of result objects providing:
     *  {@link here.xyz.maps.layers.TileLayer|"layer"} and {@link here.xyz.maps.providers.FeatureProvider.Feature|"features"}.
     */
    getFeaturesAt(geo, opt) {
        let x1;
        let x2;
        let y1;
        let y2;

        opt = opt || {};

        // its a point
        if (geo.x != UNDEF && geo.y != UNDEF) {
            let x = geo.x;
            let y = geo.y;
            let w = opt.width ^ 0;
            let h = opt.height || w;

            x1 = x - w / 2;
            x2 = x + w / 2;

            y1 = y - h / 2;
            y2 = y + h / 2;
        } else if (geo.minX != UNDEF && geo.maxX != UNDEF) {
            // its a  rect point
            x1 = geo.minX;
            y1 = geo.minY;
            x2 = geo.maxX;
            y2 = geo.maxY;
        }

        return x1 != UNDEF && this._search.search(
            x1, y1, x2, y2,
            opt.layers,
            opt.topOnly
        );
    };

    /**
     * Get map behavior.
     *
     * @public
     * @expose
     * @function
     * @name here.xyz.maps.Map#getBehavior
     * @return {Object} behavior
     *  an object containg two properties: "zoom" and "drag", its boolean value indicates if
     *  map zooming and dragging are activated or not.
     */
    getBehavior() {
        const settings = {};
        const options = this._b.getOptions();
        for (let b in options) {
            settings[b] = !!options[b];
        }
        return settings;
        // return JSUtils.clone(options);
    };

    /**
     * Set map behavior.
     *
     * @example
     *  //to deactivate zooming map:
     *setBehavior({zoom: false, drag: true})
     *
     * @public
     * @expose
     * @function
     * @param {Object} behavior
     * @param {Boolean=} behavior.zoom true to enable map zooming, false to disable.
     * @param {Boolean=} behavior.drag true to enable map dragging, false to disable.
     // * @param {Boolean=} behavior.pitch true to enable map pitching, false to disable.
     // * @param {Boolean=} behavior.rotate true to enable map rotation, false to disable.
     * @name here.xyz.maps.Map#setBehavior
     */
    setBehavior(key, value) {
        let type = typeof key;
        let options = type == 'object' ? key : {};
        const behaviorOptions = this._b.getOptions();

        if (type == 'string') {
            options[key] = value;
        }

        let zoom = options[BEHAVIOR_ZOOM];
        if (zoom != UNDEF) {
            // "backdoor" to change default zoom behavior..
            if (zoom == 'fixed' || zoom == 'float') {
                behaviorOptions[BEHAVIOR_ZOOM] = zoom;
            } else {
                behaviorOptions[BEHAVIOR_ZOOM] = zoom
                    ? DEFAULT_ZOOM_BEHAVIOR
                    : false;
            }
        }
        for (let option of [BEHAVIOR_DRAG, BEHAVIOR_PITCH, BEHAVIOR_ROTATE]) {
            let val = options[option];
            if (val != UNDEF) {
                behaviorOptions[option] = !!val;
            }
        }
    };

    /**
     * Gets current zoomlevel
     *
     * @expose
     * @function
     * @name here.xyz.maps.Map#getZoomlevel
     * @return {number} zoomlevel
     */
    getZoomlevel() {
        return this._z + Math.log(this._s) / Math.LN2;
    };

    /**
     * Sets zoomlevel with an optional anchor point
     *
     * @expose
     * @function
     * @param {number} toLevel new zoomlevel
     * @param {number=} toX new center in pixel
     * @param {number=} toY new center in pixel
     * @param {number=} [animation=0] zoom transition animation time in ms
     * @name here.xyz.maps.Map#setZoomlevel
     */
    setZoomlevel(zoomTo: number, fixedX?: number, fixedY?: number, animate?: number) {
        const vplock = this._vplock;
        const zoomLevel = this._z;
        const currentScale = this._s;

        zoomTo = Math.round(zoomTo * 1e3) / 1e3;
        zoomTo = Math.max(Math.min(zoomTo, vplock.maxLevel), vplock.minLevel);

        if (arguments.length == 2) {
            animate = fixedX;
            fixedX = UNDEF;
        }
        if (fixedX == UNDEF || fixedY == UNDEF) {
            fixedX = this._cx;
            fixedY = this._cy;
        }

        if (zoomLevel != zoomTo || currentScale != 1) {
            if (animate) {
                this.zoomAnimator.animate(zoomTo, fixedX, fixedY,
                    typeof animate === 'number'
                        ? animate
                        : DEFAULT_ZOOM_ANIMATION_MS
                );
            } else {
                const startZoom = this.getZoomlevel();
                const _uFixed = this._display.unproject(fixedX, fixedY);
                const gridZoom = Math.min(MAX_GRID_ZOOM, zoomTo) ^ 0;
                const deltaFixedZoom = zoomLevel - gridZoom;
                const worldSizePixel = this._wSize;
                const scale = Math.pow(2, zoomTo - gridZoom);

                if (deltaFixedZoom) {
                    this._z = Math.min(MAX_GRID_ZOOM, zoomTo) ^ 0;
                    this._wSize = Math.pow(2, this._z) * TILESIZE;
                }

                this._display.setTransform(scale * Math.pow(.5, deltaFixedZoom), this._rz, this._rx);

                const uFixed = this._display.unproject(fixedX, fixedY);

                this._setCenter(
                    project.x2lon(this._cw.x + _uFixed[0] - uFixed[0], worldSizePixel),
                    project.y2lat(this._cw.y + _uFixed[1] - uFixed[1], worldSizePixel)
                );

                this._s = scale;
                this.updateGrid();

                this._l.trigger('zoomlevel', ['zoomlevel', this.getZoomlevel(), startZoom], true);
            }
        }
    };

    /**
     * Set new map center.
     *
     * @expose
     * @function
     * @param {here.xyz.maps.GeoPoint} center center point
     * @name here.xyz.maps.Map#setCenter
     *
     * @example
     * display.setCenter({longitude: 80.10282, latitude: 12.91696});
     *
     * @also
     *
     * Set new map center.
     *
     * @expose
     * @function
     * @param {number} log longitude of the center
     * @param {number} lat latitude of the center
     * @name here.xyz.maps.Map#setCenter
     *
     * @example
     * display.setCenter(80.10282, 12.91696);
     */
    setCenter(lon: number | GeoPoint, lat?: number) {
        if (this._setCenter.apply(this, arguments)) {
            this.updateGrid();
        }
    };

    /**
     *  Get map center.
     *
     *  @public
     *  @expose
     *  @function
     *  @name here.xyz.maps.Map#getCenter
     *  @return {here.xyz.maps.GeoPoint}
     *      map center
     */
    getCenter() {
        return new GeoPoint(
            this._c.longitude,
            this._c.latitude
        );
    };

    /**
     * lock view port by indicating if pan, minLevel and maxLevel are locked
     *
     * @expose
     * @function
     * @param {Object} lock
     * @param {Boolean=} lock.pan true to enable panning, false to disable panning.
     * @param {number=} lock.minLevel minimum zoomlevel to which the map could zoom.
     * @param {number=} lock.maxLevel maximum zoomlevel to which the map could zoom.
     * @name here.xyz.maps.Map#lockViewport
     * @return {Object} an object literal including "pan", "minLevel" and "maxLevel" values.
     */
    lockViewport(lock?): { pan: boolean, minLevel: number, maxLevel: number } {
        const lockState = this._vplock;

        if (lock) {
            let pan = lock['pan'];
            let minLevel = lock['minLevel'];
            let maxLevel = lock['maxLevel'];

            // resest to default
            minLevel = minLevel === false ? this._cfg['minLevel'] : minLevel;
            maxLevel = maxLevel === false ? this._cfg['maxLevel'] : maxLevel;

            if (pan != UNDEF) {
                lockState['pan'] = pan;
            }

            if (typeof minLevel == 'number') {
                lockState['minLevel'] = minLevel;
            }

            if (typeof maxLevel == 'number') {
                lockState['maxLevel'] = maxLevel;
            }
        }

        return lockState;
    };


    /**
     * Moves the map
     *
     * @expose
     * @function
     * @param {number} dx distance in pixels to pan on x axis
     * @param {number} dy distance in pixels to pn on y axis
     * @param {number=} ax anchor point on x axis
     * @param {number=} ay anchor point on y axis
     * @name here.xyz.maps.Map#pan
     */
    pan(dx: number, dy: number, _dx?: number, _dy?: number) {
        // make sure dx or dy results in real viewport change...
        if (dx != 0 || dy != 0) {
            const worldSizePixel = this._wSize;
            const cx = this._cx;
            const cy = this._cy;
            const centerWorldPixel = this._cw;
            const uDelta = this._display.unproject(cx + dx, cy + dy);
            const x = centerWorldPixel.x - uDelta[0] + cx;
            const y = centerWorldPixel.y - uDelta[1] + cy;

            this.setCenter(
                project.x2lon(x, worldSizePixel),
                project.y2lat(y, worldSizePixel)
            );
        }
    };

    /**
     * Gets layers in map display
     *
     * @expose
     * @function
     * @param {number=} index
     * @name here.xyz.maps.Map#getLayers
     * @return {Array.<here.xyz.maps.layers.TileLayer>|here.xyz.maps.layers.TileLayer} layers that added to map display
     */
    getLayers(index?: number) {
        const layers = this.layers;
        if (index != UNDEF) {
            return layers[index];
        }
        return layers.slice();
    };


    /**
     * Adds a layer to the map display.
     * If index is defined the layer will be placed at respective index in drawing hierarchy.
     * otherwise it's added on top.
     *
     * @expose
     * @function
     * @param {here.xyz.maps.layers.TileLayer} layer layer
     * @param {number=} index layer-index in drawing hierarchy
     * @name here.xyz.maps.Map#addLayer
     */
    addLayer(layer: layers.TileLayer, index?: number) {
        const layers = this.layers;
        // make sure layer isn't active already
        if (layers.indexOf(layer) == -1) {
            if (index == UNDEF) {
                index = layers.length;
            }

            // initLayer(layer, index);
            this._display.addLayer(layer, layer.getStyle(), index);
            // if layer get's cleared -> refresh/refetch data
            layer.addEventListener('clear', (l) => this.refresh(l));
            this._l.trigger(ON_LAYER_ADD_EVENT,
                [new MapEvent(ON_LAYER_ADD_EVENT, {index: index, layer: layer})]
            );

            layers.splice(index, 0, layer);
            this.updateGrid();
        }
    };


    /**
     * Removes a layer provider from the map overlay
     *
     * @expose
     * @function
     * @param {here.xyz.maps.layers.TileLayer} layer layer
     * @name here.xyz.maps.Map#removeLayer
     */
    removeLayer(layer: layers.TileLayer) {
        const layers = this.layers;
        const index = layers.indexOf(layer);

        if (index >= 0) {
            this._display.removeLayer(layer);
            layer.removeEventListener('clear', (l) => this.refresh(l));

            layers.splice(index, 1);

            this.updateGrid();

            this._l.trigger(
                ON_LAYER_REMOVE_EVENT,
                [new MapEvent(ON_LAYER_REMOVE_EVENT, {index: index, layer: layer})]
            );
        }
    };


    /**
     * Refreshes the map
     *
     * @expose
     * @function
     * @name here.xyz.maps.Map#refresh
     * @param {(here.xyz.maps.layers.TileLayer|Array.<here.xyz.maps.layers.TileLayer>)=} layer
     *      Refresh the given layer in map, all layers in map are refreshed if layer is not given.
     */
    refresh(refreshlayer?) {
        if (!(refreshlayer instanceof Array)) {
            refreshlayer = [refreshlayer];
        }
        let len = refreshlayer.length;
        while (len--) {
            if (refreshlayer[len] instanceof TileLayer) {
                this._display.clearLayer(refreshlayer[len]);
            }
        }
        this.updateGrid();
    };


    /**
     * Converts from screen pixel to geo coordinate
     *
     * @expose
     * @function
     * @param {number} x
     * @param {number} y
     * @name here.xyz.maps.Map#pixelToGeo
     * @return {here.xyz.maps.GeoPoint} geo coordinate
     *
     * @also
     *
     * Converts from screen pixel to geo coordinate
     *
     * @expose
     * @function
     * @param {here.xyz.maps.PixelPoint} pixel coordinate
     * @name here.xyz.maps.Map#pixelToGeo
     * @return {here.xyz.maps.GeoPoint} geo coordinate
     *
     */
    pixelToGeo(x: number | PixelPoint, y?: number) {
        const worldSizePixel = this._wSize;

        if (arguments.length == 1) {
            y = (<PixelPoint>x).y;
            x = (<PixelPoint>x).x;
        }
        const screenOffsetX = this._ox;
        const screenOffsetY = this._oy;

        // converts screenpixel to unprojected screenpixels
        let p = this._display.unproject(<number>x, <number>y);

        const topLeftWorldX = this._tlwx;
        const topLeftWorldY = this._tlwy;

        let worldX = p[0] + topLeftWorldX + screenOffsetX;
        let worldY = p[1] + topLeftWorldY + screenOffsetY;

        worldX %= worldSizePixel;
        worldY %= worldSizePixel;

        if (worldY < 0) {
            worldY += worldSizePixel;
        }

        return new GeoPoint(
            project.x2lon(worldX, worldSizePixel),
            project.y2lat(worldY, worldSizePixel)
        );
    };

    /**
     * Converts from geo to screen pixel coordinate.
     *
     * @expose
     * @function
     * @param {number} lon longitude
     * @param {number} lat latitude
     * @name here.xyz.maps.Map#geoToPixel
     * @return {here.xyz.maps.PixelPoint} pixel coordinate
     *
     * @also
     * Converts from geo to screen pixel coordinate.
     *
     * @expose
     * @function
     * @param {here.xyz.maps.GeoPoint} geo coordinate
     * @name here.xyz.maps.Map#geoToPixel
     * @return {here.xyz.maps.PixelPoint} pixel coordinate
     */
    geoToPixel(lon: number | GeoPoint, lat?: number) {
        if (lat == UNDEF) {
            lat = (<GeoPoint>lon).latitude;
            lon = (<GeoPoint>lon).longitude;
        }

        if (lat < MIN_LATITUDE) {
            lat = MIN_LATITUDE;
        } else if (lat > MAX_LATITUDE) {
            lat = MAX_LATITUDE;
        }
        const worldSizePixel = this._wSize;
        const topLeftWorldX = this._tlwx;
        const topLeftWorldY = this._tlwy;
        const screenX = project.lon2x(<number>lon, worldSizePixel) - topLeftWorldX;
        const screenY = project.lat2y(<number>lat, worldSizePixel) - topLeftWorldY;
        const pixel = this._display.project(screenX, screenY);

        return new PixelPoint(pixel[0], pixel[1]);
    };

    /**
     * Destroys the map
     *
     * @expose
     * @function
     * @name here.xyz.maps.Map#destroy
     */
    destroy() {
        const mapEl = this._el;
        this.ui.destroy();

        this.layers.forEach((layer) => this.removeLayer(layer));

        this._display.destroy();

        mapEl.parentNode.removeChild(mapEl);

        this._mvcRecognizer.watch(false);

        this._evDispatcher.destroy();

        this._b.drag(false);
        this._b.scroll(false);
        // behavior.resize(false);

        const map = this;
        (<any>map).__proto__ = null;
        Object.keys(map).forEach((key) => delete map[key]);
    };

    /**
     * Resize the map with new width and height, take width and height of map contain by default.
     *
     * @expose
     * @function
     * @param {number=} w new width of map display
     * @param {number=} h new height of map display
     * @name here.xyz.maps.Map#resize
     */
    resize(w: number, h: number) {
        const mapEl = this._el;

        if (w == UNDEF || h == UNDEF) {
            w = getElDimension(<HTMLElement>mapEl.parentNode, WIDTH);
            h = getElDimension(<HTMLElement>mapEl.parentNode, HEIGHT);
        }

        const {_w, _h} = this;

        if (_w !== w || _h !== h) {
            mapEl.style.width = w + 'px';
            mapEl.style.height = h + 'px';

            this._display.setSize(w, h);

            this._w = w;
            this._h = h;

            this._cx = w / 2;
            this._cy = h / 2;

            this.updateGrid();

            this._l.trigger('resize', [new MapEvent('resize', {width: w, height: h})]);
        }
    };

    /**
     * Gets current width of view port.
     *
     * @expose
     * @function
     * @name here.xyz.maps.Map#getWidth
     * @return {number} width of view port
     */
    getWidth(): number {
        return this._w;
    };

    /**
     * Gets current height of view port.
     *
     * @expose
     * @function
     * @name here.xyz.maps.Map#getHeight
     * @return {number} height of view port
     */
    getHeight(): number {
        return this._h;
    };

    /**
     * Adds an observer, supported observers: "zoomlevel", "center"
     *
     * @expose
     * @function
     * @param {string} key
     * @param {Function} callback
     // * @param {Object=} context
     * @name here.xyz.maps.Map#addObserver
     */
    addObserver(key: string, callback/* , context*/) {
        if (key == 'zoomLevel') {
            key = 'zoomlevel';
        }
        return this._l.add(key, callback/* , context*/);
    };

    /**
     * Removes an observer
     *
     * @expose
     * @function
     * @param {string} key
     * @param {Function} callback
     // * @param {Object=} context
     * @name here.xyz.maps.Map#removeObserver
     */
    removeObserver(key: string, callback/* , context*/) {
        if (key == 'zoomLevel') {
            key = 'zoomlevel';
        }
        return this._l.remove(key, callback/* , context*/);
    };

    /**
     *  Get DOM element of the map.
     *
     *  @public
     *  @expose
     *  @function
     *  @name here.xyz.maps.Map#getContainer
     *  @return {Node}
     *      map container
     */
    getContainer() {
        return this._el.parentNode;
    };
}

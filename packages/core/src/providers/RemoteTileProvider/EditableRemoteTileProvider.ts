/*
 * Copyright (C) 2019-2020 HERE Europe B.V.
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

import {geotools, JSUtils} from '@here/xyz-maps-common';
import utils from '../../tile/TileUtils';
import LoaderManager from '../../loaders/Manager';
import TileReceiver from './TileReceiver';
import tileUtils from '../../tile/TileUtils';
import {Tile} from '../../tile/Tile';
/* exported Options */

import Options from './RemoteTileProviderOptions';
import {EditableFeatureProvider} from '../EditableFeatureProvider';
import {Feature} from '../../features/Feature';
import {PostProcesserInput, createRemoteProcessor, isPostprocessor} from './processors';
import {GeoJSONFeature} from '../../features/GeoJSON';

const doc = Options; // doc only!

let UNDEF;

type TileLoader = any;

type Navlink = Feature;

type Coordinate = [number, number, number?];

type EditorFeature = { editState: (state?: string, value?) => any };

const METHOD_NOT_IMPLEMENTED = 'Method not implemented.';

class FeatureError extends Error {
    feature: any;

    constructor(message, feature) {
        super(message);
        this.name = 'FeatureError';
        this.feature = feature;
    }
}

/**
 *  Remote tile provider.
 *
 *  @public
 *  @abstract
 *  @class
 *  @expose
 *  @constructor
 *  @extends here.xyz.maps.providers.FeatureProvider
 *  @param {here.xyz.maps.providers.RemoteTileProvider.Options} config configuration of the provider
 *  @name here.xyz.maps.providers.EditableRemoteTileProvider
 */
export abstract class EditableRemoteTileProvider extends EditableFeatureProvider {
    sizeKB = 0;

    staticData: boolean;

    renderer: any;

    name: string;

    level: number;

    clipped: boolean;

    loader: TileLoader;

    private preprocess: (data: any[], cb: (data: GeoJSONFeature[]) => void, tile?: Tile) => void;
    private postprocess: (data: PostProcesserInput, cb: (data: PostProcesserInput) => void) => void;

    constructor(config) {
        super({
            'minLevel': 8,
            'maxLevel': 20,
            'staticData': false
            // ,'indexed' : config.indexed != UNDEF
            //     ? config.indexed
            //     : true
        }, config);

        const provider = this;

        let loader = config.loader;

        if (loader) {
            if (!(loader instanceof LoaderManager)) {
                loader = new LoaderManager(loader);
            }
        } else {
            throw (new Error('no tile loader defined.'));
        }

        provider.loader = loader;

        const {preProcessor} = config;
        provider.preprocess = createRemoteProcessor(preProcessor);
        provider.postprocess = createRemoteProcessor(config.postProcessor);

        if (provider.commit) {
            provider.commit = ((commit) => function(features: PostProcesserInput, onSuccess?, onError?) {
                const {postProcessor} = this;
                const prepareFeatures = (features) => {
                    if (!Array.isArray(features)) {
                        features = [features];
                    }
                    let len = features.length;
                    let feature;
                    let props;

                    while (len--) {
                        feature = features[len] = Feature.prototype.toJSON.call(features[len]);
                        if (props = feature.properties) {
                            delete props['@ns:com:here:editor'];
                        }
                    }
                    return features;
                };

                if (typeof features == 'object') {
                    features.put = prepareFeatures(features.put || []);
                    features.remove = prepareFeatures(features.remove || []);

                    if (isPostprocessor(postProcessor)) {
                        provider.postprocess(features, (data) => commit.call(this, data, onSuccess, onError));
                    }
                }

                return commit.call(this, features, onSuccess, onError);
            })(provider.commit);
        }
    }

    /**
     *  Get features from provider.
     *
     *  @public
     *  @expose
     *  @function
     *  @name here.xyz.maps.providers.EditableRemoteTileProvider#getFeatures
     *  @param {Array.<String>} ids Array of ids, which will be returned by the functions
     *  @param {Object=} options
     *  @param {Boolean=} options.remote force search function to do remote search.
     *  @param {Funtion=} options.onload callback function to return objects.
     *  @return {Array.<here.xyz.maps.providers.FeatureProvider.Feature>} array of features
     *
     *
     *  @also
     *
     *  @public
     *  @expose
     *  @function
     *  @name here.xyz.maps.providers.EditableRemoteTileProvider#getFeatures
     *  @param {Object} options this option should contain at least one of "ids" or "id".
     *  @param {Array.<String>=} options.ids array of ids
     *  @param {String=} options.id a single object id
     *  @param {Boolean=} options.remote force search function to do remote search
     *  @param {Function=} options.onload callback function to return objects
     *  @param {Function=} options.onerror callback function for errors
     *
     *  @return {Array.<here.xyz.maps.providers.FeatureProvider.Feature>} array of features
     */
    getFeatures(ids, options) {
        options = options || {};

        if (!(ids instanceof Array)) {
            if (typeof ids == 'object') {
                if (ids['remote']) {
                    options['remote'] = ids['remote'];
                }
                if (ids['onload']) {
                    options['onload'] = ids['onload'];
                }

                ids = ids['ids'] || ids['id'];
            }

            ids = [].concat(ids);
        }

        const prov = this;
        let cached = true;
        const onload = options['onload'];
        const remote = options['remote'];
        var result = super.getFeatures(ids);

        if (!(result instanceof Array)) {
            result = [result];
        }

        for (let r = 0; r < result.length; r++) {
            if (!result[r]) {
                result[r] = ids[r];
                cached = false;
            }
        }

        function createResult() {
            result = result.map((e) => typeof e == 'object' ? e : UNDEF);

            return result.length == 1
                ? result[0]
                : result;
        }


        if (!cached && remote) {
            ids = result.filter((a) => typeof a != 'object');
            const onerror = (e) => {
                const {onerror} = options;
                if (onerror) {
                    onerror(e);
                }
            };
            prov._requestFeatures(ids,
                (data) => {
                    // QND geometry validation...
                    for (let f of data) {
                        let {geometry} = f;
                        if (!geometry || !geometry.type || !geometry.coordinates) {
                            onerror(new FeatureError(`Invalid geometry`, f));
                            return;
                        }
                    }

                    this.preprocess(data, (data) => {
                        for (let f of data) {
                            result[result.indexOf(f.id)] = prov.addFeature(f);
                        }
                        if (onload) {
                            onload(createResult());
                        }
                    });
                },
                onerror,
                options
            );
        } else {
            var result = createResult();

            if (onload) {
                onload(result);
            }

            return result;
        }
    };

    /**
     *  Cancel a tile request.
     *
     *  @public
     *  @expose
     *  @function
     *  @name here.xyz.maps.providers.EditableRemoteTileProvider#cancel
     *  @param {string | here.xyz.maps.providers.TileProvider.Tile} quadkey
     *      quadkey of the tile or the tile to cancel request
     */
    cancel(quadkey: string | Tile, cb: () => void) {
        const prov = this;
        const storage = prov.storage;
        const strict = cb == UNDEF;
        let dataTiles;
        let tile;

        if (quadkey instanceof this.Tile) {
            tile = quadkey;
        } else {
            tile = storage.get(quadkey);
        }

        if (tile /* && this.isTileVisible( tile )*/) {
            quadkey = tile.quadkey;

            // get loader tile
            dataTiles = this.calcStorageQuads(<string>quadkey);

            for (let i = 0, dTile, dQuad; i < dataTiles.length; i++) {
                dQuad = dataTiles[i];

                // if tile is directly passed it could be possible,
                // that it's removed already from storage (LRU FULL)..
                // so we use the tile directly instead of using the storage.
                dTile = dQuad == quadkey
                    ? tile
                    : storage.get(dQuad);

                if (dTile) {
                    const onLoaded = dTile.onLoaded;
                    let ci;

                    if (onLoaded) {
                        if (strict) {
                            tile.onLoaded.length = 0;
                        } else {
                            if (prov.level && tile.z != prov.level) {
                                ci = onLoaded.indexOf(tile.onLoaded[0]);

                                if (ci != -1) {
                                    if (!onLoaded[ci].remove(cb)) {
                                        onLoaded.splice(ci, 1);
                                    }
                                }
                            } else {
                                onLoaded.splice(onLoaded.indexOf(cb), 1);
                            }
                        }

                        if (!onLoaded.length) {
                            if (prov.loader.abort(dTile)) {
                                storage.remove(dTile);
                            }
                        }
                    }
                }
            }
        }
    };

    /**
     *  Search for feature in provider.
     *
     *  @public
     *  @expose
     *  @function
     *  @name here.xyz.maps.providers.EditableRemoteTileProvider#search
     *  @param {Object} options
     *  @param {String=} options.id Object id.
     *  @param {Array.<String>=} options.ids Array of object ids.
     *  @param {here.xyz.maps.geo.Point=} options.point Center point of the circle for search
     *  @param {number=} options.radius Radius of the circle in meters, it is used in "point" search.
     *  @param {(here.xyz.maps.geo.Rect|Array.<number>)=} options.rect Rect object is either an array: [minLon, minLat, maxLon, maxLat] or Rect object defining rectangle to search in.
     *  @param {Boolean=} options.remote Force the provider to do remote search if objects are not found in cache.
     *  @param {Function=} options.onload callback function of search.
     *  @param {Function=} options.onerror callback function for errors.
     *  @example
     * //searching by id:
     *provider.search({id: 1058507462})
     * //or:
     *provider.search({ids: [1058507462, 1058507464]})
     *@example
     * //searching by point and radius:
     *provider.search({
     *  point: {longitude: 72.84205, latitude: 18.97172},
     *  radius: 100
     *})
     *@example
     * //searching by Rect:
     *provider.search({
     *  rect:  {minLon: 72.83584, maxLat: 18.97299, maxLon: 72.84443, minLat: 18.96876}
     *})
     *@example
     * //remote search:
     *provider.search({
     *  rect:  {minLon: 72.83584, maxLat: 18.97299, maxLon: 72.84443, minLat: 18.96876},
     *  remote: true, // force provider to do remote search if feature/search area is not cached locally
     *  onload: function(e){
     *   // search result is only return in this callback function if no features is found in cache.
     *  }
     *})
     *  @return {Array.<here.xyz.maps.providers.EditableRemoteTileProvider.Feature>} array of features
     */

    // search( { rect: bbox || point: point || id: id || ids:[], radius: 1, onload: function(){}, remote: true } )
    // search( bbox||point||objID, { radius: 1, onload: function(){}, remote: true } )

    // TODO: cleanup and split search and implement remote part here
    search(bbox, options?) {
        const provider = this;
        let geo;
        let searchBBox;

        if (typeof bbox == 'object') {
            if (!options) {
                options = bbox;
            } else {
                for (const opt in bbox) {
                    options[opt] = bbox[opt];
                }
            }
        }

        options = options || {};

        const onload = options['onload'];
        let radius = options['radius'];
        const remote = options['remote'];
        const onerror = options['onerror'];

        if (radius == UNDEF) {
            radius = 1;
        }

        if (bbox instanceof Array) {
            if (bbox.length == 4) { // it's just a point
                searchBBox = bbox; // [ bbox[1], bbox[2], bbox[3], bbox[0] ];
            } else {
                searchBBox = geotools.getPointBBox(<geotools.Point>bbox, radius);
            }
        } else if (typeof bbox == 'number' || typeof bbox == 'string' || !bbox) { // search per ID
            return provider.getFeatures(bbox, options);
        } else if (bbox['longitude'] != UNDEF && bbox['latitude'] != UNDEF) {
            searchBBox = geotools.getPointBBox(
                [bbox['longitude'], bbox['latitude']],
                radius
            );
        } else if (
            bbox['minLon'] != UNDEF &&
            bbox['minLat'] != UNDEF &&
            bbox['maxLon'] != UNDEF &&
            bbox['maxLat'] != UNDEF
        ) {
            searchBBox = [bbox['minLon'], bbox['minLat'], bbox['maxLon'], bbox['maxLat']];
        } else if (geo = bbox['point'] || bbox['rect'] || bbox['viewport']) {
            return provider.search(geo, options);
        } else if (bbox['id'] || bbox['ids']) {
            return provider.getFeatures(
                bbox['id'] || bbox['ids'],
                options
            );
        }

        searchBBox = {
            minX: searchBBox[0],
            minY: searchBBox[1],
            maxX: searchBBox[2],
            maxY: searchBBox[3]
        };

        if (remote) {
            // var tiles = utils.getTilesInRect.apply(
            //     tileUtils,
            //     searchBBox.concat( provider.level )
            // );
            const tiles = utils.getTilesInRect(
                searchBBox.minX,
                searchBBox.minY,
                searchBBox.maxX,
                searchBBox.maxY,
                provider.level
            );

            let error;
            const tileReceiver = (tile: Tile) => {
                tiles.splice(tiles.indexOf(tile.quadkey), 1);

                error = error || tile.error;

                if (!tiles.length) {
                    // all tile are loaded -> callback is ready to be executed..
                    if (error) {
                        onerror(error);
                    } else if (onload) {
                        onload(provider._s(searchBBox));
                    }
                }
            };

            // filter out tiles that are already cached
            for (let t = 0; t < tiles.length; t++) {
                const qk = tiles[t];
                const cTile = provider.getCachedTile(qk);
                if (cTile && cTile.isLoaded()) {
                    if (cTile.error) {
                        if (onerror) {
                            onerror(cTile.error);
                        }
                        return;
                    }
                    tiles.splice(t--, 1);
                } else {
                    // tile needs to be loaded...
                    provider.getTile(qk, tileReceiver);
                }
            }

            // wait for all required tiles being loaded.
            if (tiles.length) {
                return;
            }
        }

        const result = provider._s(searchBBox);
        // var result =  provider.tree.search( searchBBox );

        if (onload) {
            onload(result);
        }

        return result;
    };


    // setUrl( url )
    // {
    //     this.loader.setUrl( url );
    // };

    getLoader() {
        return this.loader;
    };

    config(cfg) {
        return super.config(cfg);
    };

    clear(tile?) {
        if (arguments.length == 0) {// full wipe!
            this.loader.clear();
        }
        // TODO: add support for partial loader clearance
        super.clear.apply(this, arguments);
    };

    // reset(qk) {
    //     this.storage.resetData(qk);
    // };


    calcStorageQuads(quadkey: string) {
        return utils.getTilesOfLevel(quadkey, this.level);
    };

    /**
     *  create tile.
     *
     *  @public
     *  @expose
     *  @function
     *  @name here.xyz.maps.providers.TileProvider#createTile
     *  @param {String} quadkey
     *  @__param {String} dataType datatype can be "json" or "image" etc.
     *  @return {here.xyz.maps.providers.TileProvider.Tile} created tile
     */
    createTile(quadkey: string /* ,dataType*/) {
        const tile = super.createTile(quadkey);
        const tileLevel = tile.z;
        const cacheLevel = this.level;
        let cacheQuad;
        let depQuads;

        if (
            cacheLevel &&
            tileLevel != cacheLevel
        ) {
            if (tileLevel > cacheLevel) {
                cacheQuad = quadkey.substr(0, cacheLevel);

                depQuads = this.dep[cacheQuad];

                if (!depQuads) {
                    depQuads = this.dep[cacheQuad] = [];
                }

                depQuads[depQuads.length] = tile;
            } else if (tileLevel < cacheLevel) {
                const cacheQuads = tileUtils.getTilesOfLevel(quadkey, cacheLevel);

                for (let q = 0, len = cacheQuads.length; q < len; q++) {
                    cacheQuad = cacheQuads[q];

                    depQuads = this.dep[cacheQuad];

                    if (!depQuads) {
                        depQuads = this.dep[cacheQuad] = [];
                    }
                    depQuads[depQuads.length] = tile;
                }
            }
        }

        return tile;
    };

    execTile(tile) {
        const cbs = tile.onLoaded;
        let cb;

        if (cbs) {
            for (var i = 0, l = cbs.length; i < l; i++) {
                cb = cbs[i];

                if (cb instanceof TileReceiver) {
                    cb.receive(tile);
                } else {
                    cb(tile);
                }
            }
            cbs.length = 0;
        }
    }

    private attachData(tile: Tile, data: any[]) {
        const provider = this;
        const unique = [];
        let len = data.length;
        let prepared;
        let inserted;
        let o;

        for (var i = 0; i < len; i++) {
            prepared = provider.prepareFeature(o = data[i]);

            if (prepared !== false) {
                o = prepared;

                inserted = provider._insert(o, tile);

                // filter out the duplicates!!
                if (inserted) {
                    o = inserted;
                    unique[unique.length] = o;
                } else if (/* provider.indexed &&*/ !provider.tree) { // NEEDED FOR MULTI TREE!
                    unique[unique.length] = provider.getFeature(o.id);
                }
            } else {
                // unkown feature
                console.warn('unkown feature detected..', o.geometry.type, o);
                data.splice(i--, 1);
                len--;
            }
        }


        data = unique;


        tile.loadStopTs = Date.now();

        // if( provider.indexed )
        // {
        if (provider.tree) {
            provider.tree.load(data);
        }
        // }

        tile.data = provider.clipped
            ? data
            : provider.search(tile.getContentBounds());


        if (provider.margin) {
            // additional mark in dep tiles is required because actual data of tile is bigger
            // than received data..It may also contain data of neighbour tiles
            for (var d = 0, l = tile.data.length; d < l; d++) {
                provider._mark(tile.data[d], tile);
            }
        }

        provider.execTile(tile);
    }

    getTile(quadkey: string, cb: (tile: Tile, error?: any) => void) {
        const provider = this;
        const storage = provider.storage;
        const storageLevel = provider.level;
        let tile;

        if ((tile = storage.get(quadkey)) == UNDEF) {
            tile = provider.createTile(quadkey);
            tile.onLoaded = [];
            tile.data = [];

            storage.set(tile);
        } else {
            if (tile.isLoaded()) {
                // if( tile.expired() ){
                //     console.log('%c Tile expired','background-color:red;color:white');
                //     provider._removeTile( tile, true );
                //     // provider.storage.remove( tile );
                //     tile.data        = null;
                //     tile.loadStopTs  = null;
                //     tile.loadStartTs = null;
                // }else{
                if (cb) {
                    cb(tile, tile.error);
                }
                return tile;
                // }
            }
        }

        if (quadkey.length != storageLevel) {
            const loaderTiles = provider.calcStorageQuads(quadkey);
            let loaderTile;
            let receiver;

            tile.loadStartTs = Date.now();

            if (!tile.onLoaded.length) {
                receiver = new TileReceiver(tile, loaderTiles);

                tile.onLoaded.push(receiver);
            } else {
                receiver = tile.onLoaded[0];
            }

            receiver.add(cb);

            for (let l = 0; l < loaderTiles.length; l++) {
                loaderTile = storage.get(loaderTiles[l]);


                if (loaderTile == UNDEF) {
                    loaderTile = provider.getTile(loaderTiles[l], receiver);
                } else {// if( loaderTile.onLoaded.indexOf(receiver) == -1 )
                    if (loaderTile.isLoaded()) {
                        receiver.receive(loaderTile);
                    } else if (loaderTile.onLoaded.indexOf(receiver) == -1) {
                        loaderTile.onLoaded.push(receiver);
                    }
                }
            }
        } else {
            // attach the callback
            if (cb) {
                if (tile.onLoaded.indexOf(cb) == -1) {
                    tile.onLoaded.push(cb);
                }
            }

            if (!tile.loadStartTs) {
                tile.loadStartTs = Date.now();

                provider.loader.tile(tile, (data, stringByteSize) => {
                    // console.log('----loadtile---',tile.quadkey);

                    provider.sizeKB += stringByteSize / 1024;

                    // provider.preprocess(tile, data, (data) => provider.attachData(tile, data));

                    provider.preprocess(data, (data) => provider.attachData(tile, data), tile);
                },
                (errormsg) => {
                    tile.loadStopTs = Date.now();

                    tile.error = errormsg;

                    provider.execTile(tile);

                    provider.listeners.trigger('error', [errormsg], true);
                });
            }

            // else
            //    if(tile.loadStopTs){
            //        exec(tile);
            //    }
        }
        return tile;
    };

    _removeTile(tile: Tile, triggerEvent) {
        super._removeTile(tile, triggerEvent);

        // if tile hasn't been fully loaded already, request needs to be aborted..
        if (!tile.isLoaded()) {
            this.loader.abort(tile);
        }
    };

    // request individual features from backend
    protected abstract _requestFeatures(ids, onSuccess, onError, opt?);

    abstract commit(features, onSuccess, onError, transactionId?: string);

    /**
     *  Commit modified features to the backend
     *
     *  @public
     *  @expose
     *  @abstract
     *  @function
     *  @name here.xyz.maps.providers.EditableRemoteTileProvider#commit
     *  @param {Object} data the data to commit to the backend
     *  @param {here.xyz.maps.providers.FeatureProvider.Feature|Array.<here.xyz.maps.providers.FeatureProvider.Feature>} data.put features that should be created or updated
     *  @param {here.xyz.maps.providers.FeatureProvider.Feature|Array.<here.xyz.maps.providers.FeatureProvider.Feature>} data.remove features that should be removed
     *  @param {Function=} onSuccess callback function on success
     *  @param {Function=} onError callback function on error
     */
    readDirection(link: Feature): 'BOTH' | 'START_TO_END' | 'END_TO_START' {
        throw new Error(METHOD_NOT_IMPLEMENTED);
        // return 'BOTH';
    }

    readPedestrianOnly(link: Feature): boolean {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    writeTurnRestriction(restricted: boolean, turnFrom: { link: Feature; index: number; }, turnTo: { link: Feature; index: number; }) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    readRoutingProvider(location: Feature, providers?: EditableFeatureProvider[]): string {
        return this.id;
    }

    readRoutingPosition(feature: any): [number, number, number?] {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    readRoutingLink(feature: any): string | number {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    writeRoutingPosition(feature: any, position: [number, number, number?]) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    writeRoutingLink(location: any, link: Feature) {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    readTurnRestriction(turnFrom: { link: Feature; index: number; }, turnTo: { link: Feature; index: number; }): boolean {
        throw new Error(METHOD_NOT_IMPLEMENTED);
    }

    writeRoutingPoint(location, link: Navlink | null, position: Coordinate | null) {
        this.writeRoutingLink(location, link);
        this.writeRoutingPosition(location, position);
    };

    writeEditState(feature, editState: 'created' | 'modified' | 'removed' | 'split') {
    }


    reserveId(createdFeatures, cb: (ids: (string | number)[]) => void) {
        let len = createdFeatures.length;
        const ids = [];
        let id;

        while (len--) {
            id = createdFeatures[len].id;

            if (typeof id == 'string' && id.length > 15) {
                ids.push(createdFeatures[len].id);
            } else {
                ids.push(JSUtils.String.random(16));
            }
        }

        setTimeout(() => {
            cb(ids.reverse());
        }, 0);
    };

    _clearOnCommit = true;

    isDroppable(feature: Feature | EditorFeature) {
        const editStates = (<EditorFeature>feature).editState && (<EditorFeature>feature).editState();
        return !editStates || (
            !editStates.modified &&
            !editStates.removed &&
            !editStates.split
        );
    }
}

// RemoteTileProvider.prototype.staticData = false;

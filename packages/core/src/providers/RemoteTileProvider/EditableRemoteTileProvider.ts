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

import {geotools, JSUtils} from '@here/xyz-maps-common';
import LoaderManager from '../../loaders/Manager';
import TileReceiver from './TileReceiver';
import {tileUtils} from '../../tile/TileUtils';
import {Tile} from '../../tile/Tile';
/* exported Options */

import {EditableRemoteTileProviderOptions} from './EditableRemoteTileProviderOptions';
import {EditableFeatureProvider} from '../EditableFeatureProvider';
import {Feature} from '../../features/Feature';
import {PostProcesserInput, createRemoteProcessor, isPostprocessor} from './processors';
import {GeoJSONBBox, GeoJSONFeature} from '../../features/GeoJSON';
import {GeoPoint, GeoRect} from '@here/xyz-maps-core';

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
 *  EditableRemoteTileProvider is a remote tile provider that can be edited using the {@link editor.Editor} module.
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

    /**
     * @param options - options to configure the provider
     */
    protected constructor(options: EditableRemoteTileProviderOptions) {
        super({
            'minLevel': 8,
            'maxLevel': 20,
            'staticData': false
            // ,'indexed' : config.indexed != UNDEF
            //     ? config.indexed
            //     : true
        }, options);

        const provider = this;

        let loader = options.loader;

        if (loader) {
            if (!(loader instanceof LoaderManager)) {
                loader = new LoaderManager(loader);
            }
        } else {
            throw (new Error('no tile loader defined.'));
        }

        provider.loader = loader;

        const {preProcessor} = options;
        provider.preprocess = createRemoteProcessor(preProcessor || (<any>options).preprocessor);
        provider.postprocess = createRemoteProcessor((<any>options).postProcessor);

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
                        let send;
                        provider.postprocess(features, (data) => {
                            send = commit.call(this, data, onSuccess, onError);
                        });
                        return send;
                    }
                }

                return commit.call(this, features, onSuccess, onError);
            })(provider.commit);
        }
    }


    /**
     *  Gets features from provider by id.
     *
     *  @param ids - array of feature ids to search for.
     *  @param options - search options
     *  @param options.remote -  Force the provider to do remote search if no result is found in local cache.
     *  @param options.onload - Callback function for "remote" search.
     *
     *  @return if just a single feature is found its getting returned otherwise an array of features or undefined if none is found.
     */
    getFeatures(ids: number[] | string[], options?: {
        remote?: boolean,
        onload?: (result: Feature[] | null) => void
    });
    /**
     *  Gets features from provider by id.
     *
     *  @param ids - array of feature ids to search for.
     *  @param options - search options
     *  @param options.id - search for a single feature by id
     *  @param options.ids - array of ids to search for multiple features
     *  @param options.remote -  Force the provider to do remote search if no result is found in local cache.
     *  @param options.onload - Callback function for "remote" search.
     *
     *  @return if just a single feature is found its getting returned otherwise an array of features or undefined if none is found.
     */
    getFeatures(options: {
        id?: number | string,
        ids?: number[] | string[],
        remote?: boolean,
        onload?: (result: Feature[] | null) => void
    });
    getFeatures(ids, options?) {
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
            result = (<any[]>result).map((e) => typeof e == 'object' ? e : UNDEF);

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
                            result[(<any[]>result).indexOf(f.id)] = prov.addFeature(f);
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
     * Cancel ongoing request(s) of a tile.
     * The tile will be dropped.
     *
     * @param quadkey - the quadkey of the tile that should be canceled and removed.
     */
    cancel(quadkey: string): void;
    /**
     * Cancel ongoing request(s) of a tile.
     * The tile will be dropped.
     *
     * @param tile - the tile that should be canceled and removed.
     */
    cancel(tile: Tile): void;

    cancel(quadkey: string | Tile, cb?: () => void) {
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
     * Search for feature(s) in the provider.
     *
     * @param options - configure the search
     * @param options.id - search feature by id.
     * @param options.ids - Array of feature ids to search.
     * @param options.point - Geographical center point of the circle to search in. options.radius must be defined.
     * @param options.radius - Radius of the circle in meters, it is used in "point" search.
     * @param options.rect - Geographical Rectangle to search in. [minLon, minLat, maxLon, maxLat] | GeoRect.
     * @param options.remote - Force the data provider(s) to do remote search if no result is found in local cache.
     * @param options.onload - Callback function for "remote" search.
     * @example
     * ```
     * // searching by id:
     * provider.search({id: 1058507462})
     * // or:
     * provider.search({ids: [1058507462, 1058507464]})
     *
     * // searching by point and radius:
     * provider.search({
     * point: {longitude: 72.84205, latitude: 18.97172},
     * radius: 100
     * })
     *
     * // searching by Rect:
     * provider.search({
     *  rect:  {minLon: 72.83584, maxLat: 18.97299, maxLon: 72.84443, minLat: 18.96876}
     * })
     *
     * // remote search:
     * provider.search({
     * rect:  {minLon: 72.83584, maxLat: 18.97299, maxLon: 72.84443, minLat: 18.96876},
     * remote: true, // force provider to do remote search if feature/search area is not cached locally
     * onload: function(result){
     *  // search result is only return in this callback function if features are not found in cache.
     * }
     * })
     * ```
     * @return array containing the searched features
     */
    search(options: {
        id?: number | string,
        ids?: number[] | string[],
        point?: GeoPoint,
        radius?: number,
        rect?: GeoRect | GeoJSONBBox
        remote?: boolean,
        onload?: (result: Feature[] | null) => void
    }): Feature[];

    /**
     * Point Search for feature(s) in provider.
     * @param point - Geographical center point of the point to search in. options.radius must be defined.
     * @param options - configure the search
     * @param options.radius - "radius" is mandatory for point search.
     * @param options.remote - Force the data provider(s) to do remote search if no result is found in local cache.
     * @param options.onload - Callback function for "remote" search.
     *
     * @example
     * ```
     * layer.search({longitude: 72.84205, latitude: 18.97172},{
     *  radius: 100
     * })
     * // or:
     * layer.search([72.84205, 18.97172], {
     *  radius: 100
     * })
     * ```
     */
    search(point: GeoPoint, options?: {
        radius: number,
        remote?: boolean,
        onload?: (result: Feature[] | null) => void
    }): Feature[];

    /**
     * Rectangle Search for feature(s) in the provider.
     * @param rect - Geographical Rectangle to search in. [minLon, minLat, maxLon, maxLat] | GeoRect.
     * @param options - configure the search
     * @param options.remote - Force the data provider(s) to do remote search if no result is found in local cache.
     * @param options.onload - Callback function for "remote" search.
     *
     * @example
     * ```
     * provider.search({minLon: 72.83584, maxLat: 18.97299, maxLon: 72.84443, minLat: 18.96876})
     * // or:
     * provider.search([72.83584, 18.96876, 72.84443,18.97299])
     *
     * // remote search:
     * provider.search(
     * {minLon: 72.83584, maxLat: 18.97299, maxLon: 72.84443, minLat: 18.96876},
     * {
     * remote: true, // force provider to do remote search if search area is not cached locally
     * onload: function(e){
     *  // search result is only return in this callback function if features are not found in cache.
     * }
     * })
     * ```
     */
    search(rect: GeoRect | GeoJSONBBox, options?: {
        remote?: boolean,
        onload?: (result: Feature[] | null) => void
    }): Feature[];

    /**
     * Search for feature by id in the provider.
     *
     * @param id - id of the feature to search for
     * @param options - configure the search
     * @param options.remote - Force the data provider(s) to do remote search if no result is found in local cache.
     * @param options.onload - Callback function for "remote" search.
     *
     * @example
     * ```
     * provider.search(1058507462)
     *
     * // remote search:
     * provider.search(1058507462,{
     * remote: true, // force provider to do remote search if search area is not cached locally
     * onload: function(feature){
     *  // search result is only return in this callback function if features are not found in cache.
     * }
     * })
     *
     */
    search(id: string | number, options?: {
        radius: number,
        remote?: boolean,
        onload?: (result: Feature) => void
    }): Feature[];

    search(bbox, options?): Feature | Feature[] {
        // TODO: cleanup and split search and implement remote part here
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
            // var tiles = tileUtils.getTilesInRect.apply(
            //     tileUtils,
            //     searchBBox.concat( provider.level )
            // );
            const tiles = tileUtils.getTilesInRect(
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
        return tileUtils.getTilesOfLevel(quadkey, this.level);
    };

    /**
     *  Create a new Tile.
     *
     *  @param quadkey - the quadkey of the tile to create
     */
    createTile(quadkey: string) {
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

    /**
     * Get a tile by quadkey.
     * If the tile is not cached already, it will be created and stored automatically.
     * Data will be fetched from remote data-sources and attached to tile automatically
     *
     * @param quadkey - quadkey of the tile
     * @param callback - will be called as soon as tile is ready for consumption
     * @returns the Tile
     */
    getTile(quadkey: string, callback: (tile: Tile, error?: any) => void) {
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
                if (callback) {
                    callback(tile, tile.error);
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

            receiver.add(callback);

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
            if (callback) {
                if (tile.onLoaded.indexOf(callback) == -1) {
                    tile.onLoaded.push(callback);
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

    /**
     *  Commit modified/removed features to the remote backend.
     *
     *  @param data - the data that should be commit to the remote.
     *  @param data.put - features that should be created or updated
     *  @param data.remove - features that should be removed
     *  @param onSuccess - callback function that will be called when data has been commit successfully
     *  @param onError - callback function that will be called when an error occurs
     */
    abstract commit(data: { put?: GeoJSONFeature[], remove?: GeoJSONFeature[] }, onSuccess?, onError?, transactionId?: string);

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

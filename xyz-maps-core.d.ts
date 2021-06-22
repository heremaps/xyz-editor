import * as common from '@here/xyz-maps-common';
import { GeoJSONFeature as GeoJSONFeature_2 } from '@here/xyz-maps-core';
import { Listener } from '@here/xyz-maps-common';

/**
 *  Detailed Information about the build.
 */
export declare const build: {
    /**
     * the name of the api
     */
    readonly name: string;
    /**
     * the date when the build was created
     */
    readonly date: DOMTimeStamp;
    /**
     * the git version used for the build.
     */
    readonly revision: string;
    /**
     * the version of the build.
     * uses: Semantic Versioning
     */
    readonly version: string;
};

/**
 * EditableFeatureProvider is an abstract FeatureTileProvider that can be edited using the {@link Editor} module.
 */
export declare abstract class EditableFeatureProvider extends FeatureProvider {
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
}

/**
 *  EditableRemoteTileProvider is a remote tile provider that can be edited using the {@link Editor} module.
 */
export declare abstract class EditableRemoteTileProvider extends EditableFeatureProvider {
    
    
    
    
    
    
    
    
    
    /**
     * @param options - options to configure the provider
     */
    protected constructor(options: EditableRemoteTileProviderOptions);
    /**
     * Gets features from provider by id.
     *
     * @param ids - array of feature ids to search for.
     * @param options - search options
     *
     * @returns if just a single feature is found its getting returned otherwise an array of features or undefined if none is found.
     */
    getFeatures(ids: number[] | string[], options?: {
        /**
         * Force the provider to do remote search if no result is found in local cache.
         */
        remote?: boolean;
        /**
         * Callback function for "remote" search.
         * @param result - array of Features containing the search result.
         */
        onload?: (result: Feature[] | null) => void;
    }): any;
    /**
     * Gets features from provider by id.
     *
     * @param options - search options
     *
     * @returns if just a single feature is found its getting returned otherwise an array of features or undefined if none is found.
     */
    getFeatures(options: {
        /**
         * search for a single feature by id
         */
        id?: number | string;
        /**
         * array of ids to search for multiple features
         */
        ids?: number[] | string[];
        /**
         * Force the provider to do remote search if no result is found in local cache
         */
        remote?: boolean;
        /**
         * Callback function for "remote" search
         * @param result - Result array of features
         */
        onload?: (result: Feature[] | null) => void;
    }): any;
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
    /**
     * Search for feature(s) in the provider.
     *
     * @param options - configure the search
     *
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
     * @returns array containing the searched features
     */
    search(options: {
        /**
         * search feature by id.
         */
        id?: number | string;
        /**
         * Array of feature ids to search.
         */
        ids?: number[] | string[];
        /**
         * Geographical center point of the circle to search in. options.radius must be defined.
         */
        point?: GeoPoint | GeoJSONCoordinate;
        /**
         * Radius of the circle in meters, it is used in "point" search.
         */
        radius?: number;
        /**
         * Geographical Rectangle to search in. [minLon, minLat, maxLon, maxLat] | GeoRect.
         */
        rect?: GeoRect | GeoJSONBBox;
        /**
         * Force the data provider(s) to do remote search if no result is found in local cache.
         */
        remote?: boolean;
        /**
         * Callback function for "remote" search.
         * @param result - Array of Features containing the search results.
         */
        onload?: (result: Feature[] | null) => void;
    }): Feature[];
    /**
     * Point Search for feature(s) in provider.
     * @param point - Geographical center point of the point to search in. options.radius must be defined.
     * @param options - configure the search
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
        /**
         * the radius of the circular area in meters to search in
         */
        radius: number;
        /**
         * Force the data provider(s) to do remote search if no result is found in local cache.
         */
        remote?: boolean;
        /**
         * Callback function for "remote" search.
         * @param result - Array of Features containing the search results.
         */
        onload?: (result: Feature[] | null) => void;
    }): Feature[];
    /**
     * Rectangle Search for feature(s) in the provider.
     * @param rect - Geographical Rectangle to search in. [minLon, minLat, maxLon, maxLat] | GeoRect.
     * @param options - configure the search
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
        /**
         * Force the data provider(s) to do remote search if no result is found in local cache.
         */
        remote?: boolean;
        /**
         * Callback function for "remote" search.
         * @param result - Array of Features containing the search results.
         */
        onload?: (result: Feature[] | null) => void;
    }): Feature[];
    /**
     * Search for feature by id in the provider.
     *
     * @param id - id of the feature to search for
     * @param options - configure the search
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
     * ```
     */
    search(id: string | number, options?: {
        /**
         * Force the data provider(s) to do remote search if no result is found in local cache.
         */
        remote?: boolean;
        /**
         * Callback function for "remote" search.
         * @param result - Array of Features containing the search results.
         */
        onload?: (result: Feature) => void;
    }): Feature[];
    
    
    
    
    /**
     *  Create a new Tile.
     *
     *  @param quadkey - the quadkey of the tile to create
     */
    createTile(quadkey: string): Tile;
    
    
    /**
     * Get a tile by quadkey.
     * If the tile is not cached already, it will be created and stored automatically.
     * Data will be fetched from remote data-sources and attached to tile automatically
     *
     * @param quadkey - quadkey of the tile
     * @param callback - will be called as soon as tile is ready for consumption
     * @returns the Tile
     */
    getTile(quadkey: string, callback: (tile: Tile, error?: any) => void): any;
    
    
    /**
     *  Commit modified/removed features to the remote backend.
     *
     *  @param data - the data that should be commit to the remote.
     *  @param onSuccess - callback function that will be called when data has been commit successfully
     *  @param onError - callback function that will be called when an error occurs
     */
    abstract commit(data: {
        /**
         * features that should be created or updated
         */
        put?: GeoJSONFeature[];
        /**
         * features that should be removed
         */
        remove?: GeoJSONFeature[];
    }, onSuccess?: any, onError?: any, transactionId?: string): any;
    
    
    
    
    
    
    
    
    
    
    
    
    
    
}

/**
 *  Configuration options of a EditableRemoteTileProvider.
 *
 */
declare interface EditableRemoteTileProviderOptions extends RemoteTileProviderOptions {
    /**
     *  Allow or prevent editing by the {@link editor.Editor} module.
     *
     *  @defaultValue false
     */
    editable?: boolean;
}

/**
 *  represents a Feature in GeoJSON Feature format.
 */
export declare class Feature implements GeoJSONFeature {
    /**
     *  id of the feature.
     */
    id: string | number;
    /**
     *  The properties associated with the feature.
     */
    properties: {
        [name: string]: any;
    } | null;
    
    /**
     *  A geometry is a object where the type member's value is one of: "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon" or "MultiPolygon".
     *  A geometry object must have a member with the name "coordinates".
     *  The value of the coordinates member is always an array (referred to as the coordinates array below).
     *  The structure for the elements in this array are determined by the type of geometry.
     *
     *  For type "Point", each element in the coordinates array is a number representing the point coordinate in one dimension.
     *      There must be at least two elements, and may be more.
     *      The order of elements must follow x, y, z order (or longitude, latitude, altitude for coordinates in a geographic coordinate reference system).
     *
     *  For type "MultiPoint", each element in the coordinates array is a coordinates array as described for type "Point".
     *
     *  For type "LineString", each element in the coordinates array is a coordinates array as described for type "Point".
     *      The coordinates array for a LineString must have two or more elements.
     *      A LinearRing is a special case of type LineString where the first and last elements in the coordinates array are equivalent (they represent equivalent points).
     *      Though a LinearRing is not explicitly represented as a geometry type, it is referred to in the Polygon geometry type definition.
     *
     *  For type "MultiLineString", each element in the coordinates array is a coordinates array as described for type "LineString".
     *
     *  For type "Polygon", each element in the coordinates array is a coordinates array as described for type "LineString".
     *      Furthermore, each LineString in the coordinates array must be a LinearRing.
     *      For Polygons with multiple LinearRings, the first must be the exterior ring and any others must be interior rings or holes.
     *
     *  For type "MultiPolygon", each element in the coordinates array is a coordinates array as described for type "Polygon".
     *
     *
     * ```
     * Point:
     * {
     *     "type": "Point",
     *     "coordinates": [100.0, 0.0]
     * }
     *
     * Polygon:
     * {
     *     "type": "Polygon",
     *     "coordinates": [
     *         [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]
     *     ]
     * }
     *```
     */
    geometry: {
        type: 'Point' | 'MultiPoint' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon' | string;
        coordinates: any[];
    };
    /**
     *  Bounding box of the feature.
     *  The value of the bbox member is an array of length 4, with all axes of the most southwesterly point followed by all axes of the more northeasterly point.
     *  The "bbox" values define shapes with edges that follow lines of constant longitude and latitude.
     */
    bbox?: [number, number, number, number];
    
    
    
    /**
     * Get the Feature as a JSON Object.
     */
    toJSON(): GeoJSONFeature;
    /**
     * Get The FeatureProvider where the Feature is stored in.
     */
    getProvider(): FeatureProvider;
    
}

/**
 *  Feature provider.
 *
 */
export declare class FeatureProvider extends TileProvider {
    
    
    
    
    
    
    /**
     *  @param options - options to configure the provider
     */
    constructor(options: TileProviderOptions);
    /**
     * Add a feature to the provider.
     *
     * @param feature - the feature to be added to the provider
     *
     * @example
     * ```
     * // add a feature to the provider.
     * provider.addFeature({
     *    type: "Feature"
     *    geometry: {
     *        coordinates: [[-122.49373, 37.78202], [-122.49263, 37.78602]],
     *        type: "LineString"
     *    }
     * });
     * ```
     */
    addFeature(feature: GeoJSONFeature | Feature): Feature;
    /**
     * Add multiple features to the provider.
     *
     * @param feature - the features to be added to the provider
     *
     * @example
     * ```
     * // add multiple features to the provider.
     * provider.addFeature([{
     *    type: "Feature"
     *    geometry: {
     *        coordinates: [[-122.49373, 37.78202], [-122.49263, 37.78602]],
     *        type: "LineString"
     *    }
     * },{
     *    type: "Feature"
     *    geometry: {
     *        coordinates: [[-122.49375, 37.78203], [-122.49265, 37.78604]],
     *        type: "LineString"
     *    }
     * }]);
     * ```
     */
    addFeature(feature: GeoJSONFeatureCollection | GeoJSONFeature[]): Feature[];
    /**
     * Add an EventListener to the provider.
     * Valid events: "featureAdd", "featureRemove", "featureCoordinatesChange", "clear" and "error"
     *
     * The detail property of the Event gives additional information about the event.
     * detail.provider is a reference to the provider onto which the event was dispatched and is set for all events.
     *
     * @param type - A string representing the event type to listen for
     * @param listener - the listener function that will be called when an event of the specific type occurs
     */
    addEventListener(type: string, listener: (e: CustomEvent) => void, _c?: any): boolean;
    /**
     * Remove an EventListener from the provider.
     * Valid events: "featureAdd", "featureRemove", "featureCoordinatesChange", "clear" and "error"
     *
     * @param type - A string which specifies the type of event for which to remove an event listener.
     * @param listener - The listener function of the event handler to remove from the provider.
     */
    removeEventListener(type: string, listener: (event: CustomEvent) => void, _c?: any): boolean;
    /**
     * Get all the features that are currently present in the provider.
     */
    all(): Feature[];
    /**
     *  Gets a feature from the provider by id.
     *
     *  @param id - the id of the feature
     *
     *  @returns the found feature or undefined if feature is not present.
     */
    getFeature(id: string | number): Feature | undefined;
    /**
     *  Gets features from provider by id.
     *
     *  @param ids - array of feature ids to search for.
     *  @returns if just a single feature is found its getting returned otherwise an array of features or undefined if none is found.
     */
    getFeatures(ids: string[] | number[]): Feature[] | Feature | undefined;
    /**
     * Get a tile by quadkey.
     * If the tile is not cached already, it will be created and stored automatically.
     *
     * @param quadkey - quadkey of the tile
     * @param callback - the callback function
     * @returns the Tile
     */
    getTile(quadkey: string, callback?: (tile: Tile) => void): Tile | undefined;
    
    
    
    
    /**
     * Search for feature(s) in the provider.
     *
     * @param options - configure the search
     *
     * @example
     * ```typescript
     * // searching by id:
     * layer.search({id: 1058507462})
     * // or:
     * layer.search({ids: [1058507462, 1058507464]})
     *
     * // searching by point and radius:
     * layer.search({
     *  point: { longitude: 72.84205, latitude: 18.97172 },
     *  radius: 100
     * })
     *
     * // searching by Rect:
     * layer.search({
     *  rect:  { minLon: 72.83584, maxLat: 18.97299, maxLon: 72.84443, minLat: 18.96876 }
     * })
     * ```
     * @returns array of features
     */
    search(options: {
        /**
         * search feature by id.
         */
        id?: number | string;
        /**
         * Array of feature ids to search.
         */
        ids?: number[] | string[];
        /**
         * Geographical center point of the point to search in. options.radius must be defined.
         */
        point?: GeoPoint;
        /**
         * Radius of the point in meters, it is used in "point" search.
         */
        radius?: number;
        /**
         * Geographical Rectangle to search in. [minLon, minLat, maxLon, maxLat] | GeoRect.
         */
        rect?: GeoRect | GeoJSONBBox;
    }): Feature[];
    /**
     * Point Search for feature(s) in provider.
     * @param point - Geographical center point of the point to search in. options.radius must be defined.
     * @param options - configure the search
     *
     * @example
     * ```typescript
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
        /**
         * The radius of the circular area in meters to search in.
         */
        radius: number;
    }): Feature[];
    /**
     * Rectangle Search for feature(s) in provider.
     * @param rect - Geographical Rectangle to search in. [minLon, minLat, maxLon, maxLat] | GeoRect.
     *
     * @example
     * ```
     * layer.search({minLon: 72.83584, maxLat: 18.97299, maxLon: 72.84443, minLat: 18.96876})
     * // or:
     * layer.search([72.83584, 18.96876, 72.84443,18.97299])
     * ```
     */
    search(rect: GeoRect | GeoJSONBBox): Feature[];
    /**
     * Search for feature by id in the provider.
     *
     * @param id - id of the feature to search for
     *
     * @example
     * ```
     * layer.search(1058507462)
     * ```
     */
    search(id: string | number): Feature[];
    /**
     *  Validate if a feature is stored in the local provider cache.
     *
     *  @param feature - Object literal containing "id" property.
     *  @returns the {@link Feature} if it is found, otherwise undefined
     */
    exists(feature: {
        id: number | string;
    }): Feature;
    /**
     * Modify coordinates of a feature in the provider.
     *
     * @param feature - the Feature whose coordinates should be modified/updated
     * @param coordinates - the modified coordinates to set. The coordinates must match features geometry type.
     */
    setFeatureCoordinates(feature: Feature, coordinates: GeoJSONCoordinate | GeoJSONCoordinate[] | GeoJSONCoordinate[][] | GeoJSONCoordinate[][][]): void;
    /**
     * Remove feature(s) from the provider.
     *
     * @param feature - features that should be removed from the provider
     */
    removeFeature(feature: GeoJSONFeature | Feature | GeoJSONFeatureCollection | GeoJSONFeature[]): any[] | Feature | GeoJSONFeature | GeoJSONFeatureCollection;
    /**
     *  Clear all tiles and features of a given bounding box or do a full wipe if no parameter is given.
     *
     *  @param bbox - array of geographical coordinates [minLon, minLat, maxLon, maxLat] defining the area to clear.
     */
    clear(bbox?: number[]): void;
    
    
    
    
    
    
    
    
    
    
    
    
    
}

/**
 * Provides basic geocode and reverse geocode functionality that allows you to:
 * - Obtain geocoordinates for addresses
 * - Obtain addresses or administrative areas for locations
 * - Obtain geocoordinates for known landmarks
 *
 * Uses the HERE Geocoder API.
 * @see https://developer.here.com/documentation/geocoder/dev_guide/topics/what-is.html
 */
export declare class GeoCoder {
    /**
     *  the url to the geocode service.
     */
    private readonly url;
    /**
     *  the url to the reverse geocode service.
     */
    private readonly reverseUrl;
    /**
     *  Current set config of the Geocoder.
     */
    private cfg;
    /**
     *  @param options - Options to configure the GeoCoder.
     */
    constructor(options: GeoCoderOptions);
    /**
     *  create the request url.
     *
     *  @param baseUrl - the url to geocoder service (normal or reverse)
     *  @param params - additional params for request url
     *  @returns the request url
     */
    private createUrl;
    /**
     *  Reuquest the Geocoder Resource.
     *  {@link https://developer.here.com/documentation/geocoder/dev_guide/topics/resource-geocode.html}
     *
     *  @param params - additional parameters for geocode request
     *  @param onSuccess - success callback
     *  @param onError - error callback
     */
    geocode(params: {
        [name: string]: string | string[] | number | number[];
    }, onSuccess: (data: any) => void, onError?: (error: any) => void): void;
    /**
     *  Request the reverse Geocode Resource.
     *  {@link https://developer.here.com/documentation/geocoder/dev_guide/topics/resource-reverse-geocode.html}
     *
     *  @param params - additional parameters for reverse geocode request
     *  @param onSuccess - success callback
     *  @param onError - error callback
     */
    reverseGeocode(params: {
        [name: string]: string | string[] | number | number[];
    }, onSuccess: (data: any) => void, onError: (error: any) => void): void;
    /**
     *  Request reverse geocode request to receive ISO country code for a geographical position.
     *
     *  @param position - it is either an array [longitude, latitude] or an object literal \{longitude: number, latitude: number\}
     *  @param onSuccess - success callback which contains the iso country code.
     *  @param onError - error callback
     */
    getIsoCountryCode(position: number[] | GeoPoint, onSuccess: (isocc: string, data: any) => void, onError: (error: any) => void): void;
}

/**
 *  Options to configure the GeoCoder.
 */
export declare interface GeoCoderOptions {
    /**
     * the app id required for authentication.
     *
     */
    app_id: string;
    /**
     * the app code required for authentication.
     */
    app_code: string;
    /**
     * The url to the Geocoder host.
     *
     * @defaultValue 'geocoder.api.here.com'
     */
    host?: string;
    /**
     * the used Geocoder version.
     *
     * @defaultValue '6.2'
     */
    version?: string;
}

/**
 * Defines a geographical rectangle.
 * The values of a GeoJSONBBox array are "[west: number, south: number, east: number, north: number]"
 */
export declare type GeoJSONBBox = [number, number, number, number];

/**
 * A GeoJSON Geometry coordinate is a array of coordinates.
 * The array must contain two or three elements [longitude, latitude, altitude?] / [x, y, z?].
 */
export declare type GeoJSONCoordinate = number[];

/**
 * A GeoJSON Feature object.
 */
export declare interface GeoJSONFeature {
    /**
     *  id of the feature.
     */
    id?: string | number;
    /**
     * Type of a GeoJSONFeature is 'Feature'
     */
    type: 'Feature' | string;
    bbox?: GeoJSONBBox;
    /**
     *  The properties associated with the feature.
     */
    properties?: {
        [name: string]: any;
    } | null;
    /**
     *  A geometry is a object where the type member's value is one of: "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon" or "MultiPolygon".
     *  A geometry object must have a member with the name "coordinates".
     *  The value of the coordinates member is always an array (referred to as the coordinates array below).
     *  The structure for the elements in this array are determined by the type of geometry.
     *
     *  For type "Point", each element in the coordinates array is a number representing the point coordinate in one dimension.
     *      There must be at least two elements, and may be more.
     *      The order of elements must follow x, y, z order (or longitude, latitude, altitude for coordinates in a geographic coordinate reference system).
     *
     *  For type "MultiPoint", each element in the coordinates array is a coordinates array as described for type "Point".
     *
     *  For type "LineString", each element in the coordinates array is a coordinates array as described for type "Point".
     *      The coordinates array for a LineString must have two or more elements.
     *      A LinearRing is a special case of type LineString where the first and last elements in the coordinates array are equivalent (they represent equivalent points).
     *      Though a LinearRing is not explicitly represented as a geometry type, it is referred to in the Polygon geometry type definition.
     *
     *  For type "MultiLineString", each element in the coordinates array is a coordinates array as described for type "LineString".
     *
     *  For type "Polygon", each element in the coordinates array is a coordinates array as described for type "LineString".
     *      Furthermore, each LineString in the coordinates array must be a LinearRing.
     *      For Polygons with multiple LinearRings, the first must be the exterior ring and any others must be interior rings or holes.
     *
     *  For type "MultiPolygon", each element in the coordinates array is a coordinates array as described for type "Polygon".
     *
     *
     * ```
     * Point:
     * {
     *     "type": "Point",
     *     "coordinates": [100.0, 0.0]
     * }
     *
     * Polygon:
     * {
     *     "type": "Polygon",
     *     "coordinates": [
     *         [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]
     *     ]
     * }
     *```
     */
    geometry: {
        type: 'Point' | 'MultiPoint' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon' | string;
        coordinates: GeoJSONCoordinate | GeoJSONCoordinate[] | GeoJSONCoordinate[][] | GeoJSONCoordinate[][][];
    };
}

/**
 * A GeoJSONFeatureCollection is a collection of {@link GeoJSONFeature | GeoJSONFeatures}.
 */
export declare interface GeoJSONFeatureCollection {
    /**
     * The type of a GeoJSONFeatureCollection must be a string "FeatureCollection".
     */
    type: 'FeatureCollection' | string;
    /**
     * An array of {@link GeoJSONFeature | GeoJSONFeatures}.
     */
    features: GeoJSONFeature[];
}

/**
 *  GeoJSONProvider is a remote HTTPProvider designed to work with GeoJSON data.
 */
export declare abstract class GeoJSONProvider extends HTTPProvider {
    /**
     * @param options - options to configure the provider
     */
    constructor(options: HTTPProviderOptions);
}

/**
 *  A GeoPoint represents a geographical point.
 */
export declare class GeoPoint {
    /**
     *  the longitude in degrees
     */
    longitude: number;
    /**
     *  the latitude in degrees
     */
    latitude: number;
    /**
     *  @param longitude - the longitude in degrees
     *  @param latitude - the latitude in degrees
     */
    constructor(longitude: number, latitude: number);
}

/**
 *  A GeoRect represents a rectangular geographical area.
 *  The area is defined by two longitudes (west, east) and two latitudes (north, south).
 */
export declare class GeoRect {
    /**
     *  minimum longitude, the west-most longitude in degrees of the rectangular area
     */
    minLon: number;
    /**
     *  minimum latitude, the south-most latitude in degrees of the rectangular area
     */
    minLat: number;
    /**
     *  maximum longitude, the east-most longitude in degrees of the rectangular area
     */
    maxLon: number;
    /**
     *  maximum latitude, the north-most latitude in degrees of the rectangular area
     */
    maxLat: number;
    /**
     *  @param minLon - minimum longitude (west)
     *  @param minLat - minimum latitude (south)
     *  @param maxLon - maximum longitude (east)
     *  @param maxLat - maximum latitude (north)
     */
    constructor(minLon: number, minLat: number, maxLon: number, maxLat: number);
}

/**
 *  The HTTPProvider fetches data from remote HTTP data-sources.
 */
declare abstract class HTTPProvider extends EditableRemoteTileProvider {
    
    
    
    /**
     * @param options - options to configure the provider
     */
    constructor(options: HTTPProviderOptions);
    /**
     *  Get a specific request-header being added to all requests handled by the provider.
     *
     *  @param name - The name of header to retrieve
     *
     *  @returns value of the request header or null if the header does not exist
     */
    getHeader(name: string): string | null;
    /**
     *  Get the request-headers being added to all requests handled by the provider.
     *
     *  @returns Map of key value pairs. the key represents the header name
     */
    getHeaders(): {
        [name: string]: string;
    };
    /**
     *  Set request-header that should be added to all request handled by the provider.
     *
     *  @param name - The name of the header whose value is to be set.
     *  @param value - The value to set as the body of the header.
     */
    setHeader(name: string, value: string): void;
    /**
     *  Set request-headers that should be added to all request handled by the provider.
     *
     *  @param map - Map of key value pairs. the key represents the header name.
     */
    setHeaders(headers: {
        [name: string]: string;
    }): void;
    /**
     *  Get the request-parameters that are being added by the provider to all requests.
     *
     *  @returns Map of key value pairs. the key represents the parameter name.
     */
    getParams(): {
        [name: string]: string;
    };
    /**
     *  Get a specific request-parameter that's being added by the provider to all requests.
     *
     *  @param name - The name of parameter to retrieve
     *
     *  @returns value of the request parameter or null if the parameter does not exist
     */
    getParam(name: string): string | null;
    /**
     *  Set request-parameters that should be added to all request handled by provider.
     *
     *  @param map - A map of key value pairs. the key represents the parameter name. Possible value types are string, string[] or undefined. If undefined is used parameter get's cleared/removed.
     */
    setParams(parameters: {
        [name: string]: string | string[] | undefined;
    }): void;
    /**
     * Set a specific request-parameter that should be added to all request handled by provider.
     * If undefined is set the parameter get's cleared/removed.
     *
     * @param name - The name of the parameter whose value is to be set.
     * @param value - The value(s) of the parameter.
     */
    setParam(name: string, value: string | string[] | undefined): void;
    /**
     * update config options of the provider.
     *
     * @param options - options to configure the provider
     */
    config(options: HTTPProviderOptions): this;
    
    /**
     *  Get URL feature specific requests.
     *
     *  @param layer - the id of the layer
     *  @param featureId - id of the feature the provider want's to request
     *
     *  @returns url string to receive the feature resource of the remote http backend
     */
    abstract getFeatureUrl(layer: string, featureId: string | number): string;
    /**
     *  Get URL for layer specific requests.
     *
     *  @param layer - the id of the layer
     *  @returns url string to receive a layer resource of the remote http backend
     */
    abstract getLayerUrl(layer: string): string;
    /**
     *  Get URL for tile specific requests.
     *
     *  @param layer - the id of the layer
     *  @returns url string to receive a tile resource of the remote http backend
     */
    abstract getTileUrl(layer: string): string;
    
    
    
}

/**
 *  Options to configuration of HTTPProvider.
 */
declare interface HTTPProviderOptions extends EditableRemoteTileProviderOptions {
    /**
     * url for requesting tiles.
     *
     * It is either a string which may contain following flags that will be replaced by provider:
     * - \{SUBDOMAIN_CHAR\}: subdomain id(a, b, c and d) for balancing the load
     * - \{SUBDOMAIN_INT\}: subdomain id(0,1,2 and 3) for balancing the load
     * - \{SUBDOMAIN_INT_1_4\}: subdomain id(1,2,3 and 4) for balancing the load
     * - \{QUADKEY\}: quadkey of the tile to be requested
     * - \{Z\}:  z of the tile to be requested
     * - \{X\}:  x of the tile to be requested
     * - \{Y\}:  y of the tile to be requested
     *
     * or a callback function that's called with the following parameters x,y,z,quadkey and need to returns the url for requesting tiles.
     * The callback function needs to handle custom parameters by its own.
     *
     * @example
     * ```
     * // string
     * url: 'https://xyz.api.here.com/hub/spaces/mySpace/tile/quadkey/{QUADKEY}?access_token=myAccessToken'
     * // callback function
     * url: (z, y, x, quadkey) => {
     *     return 'https://xyz.api.here.com/hub/spaces/mySpace/tile/quadkey/' + quadkey + '?access_token=myAccessToken';
     * }
     * ```
     */
    url?: string | ((z: number, y: number, x: number, quadkey: string) => string);
    /**
     * Indicates if requests are made with credentials.
     *
     * @defaultValue false
     */
    withCredentials?: boolean;
    /**
     * Indicates if the requests should be made with https.
     *
     * @defaultValue true
     */
    https?: boolean;
    /**
     * Set custom url service headers.
     * Custom headers will be applied to all request done by provider.
     */
    headers?: {
        [header: string]: string;
    };
    /**
     * Set custom url parameters.
     * Custom parameters will be applied to all request done by provider.
     */
    params?: {
        [paramter: string]: string;
    };
}

/**
 *  Tile Provider for Image/Raster data.
 *  eg: Satellite Tiles.
 */
export declare class ImageProvider extends TileProvider {
    
    
    /**
     *  The opacity with which the image data should be displayed.
     */
    private opacity;
    
    /**
     *  @param options - options to configure the provider
     */
    constructor(options: any);
    /**
     * Get a tile by quadkey.
     *
     * @param quadkey - quadkey of the tile
     * @param callback - the callback function
     * @returns the Tile is returned if its already cached locally
     */
    getTile(quadkey: string, cb: (tile: Tile) => void): any;
    
    
    /**
     *  Clear tiles in a given bounding box or all tiles called without parameter.
     *
     *  @param bbox - array of geographical coordinates [minLon, minLat, maxLon, maxLat] defining the area to clear.
     */
    clear(bbox?: number[]): void;
    /**
     * Cancel ongoing request(s) and drop the tile.
     *
     * @param quadkey - the quadkey of the tile that should be canceled and removed.
     */
    cancel(quadkey: string): void;
    /**
     * Cancel ongoing request(s) and drop the tile.
     *
     * @param tile - the tile that should be canceled and removed.
     */
    cancel(tile: Tile): void;
}

/**
 *  An IMLProvider is a remote HTTPProvider designed to work with HERE Interactive Map layer.
 *  @see https://developer.here.com/documentation/data-api/data_dev_guide/rest/getting-data-interactive.html
 *  @see https://interactive.data.api.platform.here.com/openapi/
 */
export declare class IMLProvider extends SpaceProvider {
    
    
    
    
    /**
     * @param options - options to configure the provider
     * @example
     * ```ts
     * const provider = new IMLProvider({
     *     level: 10,
     *     layer: 'boston-liquor',
     *     catalog: 'hrn:here:data::olp-here:dh-showcase',
     *     credentials: {
     *         apiKey: "YOUR_API_KEY",
     *     }
     * });
     * ```
     */
    constructor(options: IMLProviderOptions);
    
    
    
    
}

/**
 *  Options to configure the IMLProvider.
 */
declare interface IMLProviderOptions extends HTTPProviderOptions {
    /**
     * Name of the Interactive Map Layer.
     */
    layer: string;
    /**
     * Name of the catalog of the Interactive Map Layer.
     */
    catalog: string;
    /**
     * User credential of the provider
     */
    credentials: {
        /**
         * apiKey for read access
         */
        apiKey: string;
        /**
         * token for write access
         */
        token?: string;
    };
    /**
     * Indicates the tag(s) that should be set in the requests.
     *
     * @defaultValue false
     */
    tags?: false | string | string[];
    /**
     * Indicates if result geometry of tile requests should be clipped.
     *
     * @defaultValue false
     */
    clip?: boolean;
    /**
     * URL of the Interactive Map Layer endpoint.
     *
     * @defaultValue "https://interactive.data.api.platform.here.com/interactive/v1"
     */
    url?: string;
    /**
     * define property search query to enable remote filtering by property search.
     *
     * @see https://interactive.data.api.platform.here.com/openapi/#/Read%20Features
     *
     * @defaultValue null
     */
    propertySearch?: {
        [name: string]: {
            operator: '=' | '!=' | '>' | '>=' | '<' | '<=';
            value: any | any[];
        };
    };
}

/**
 * This is an interface to describe how certain features should be rendered within a layer.
 * @example
 * ```typescript
 * {
 *  styleGroups: {
 *    "myLineStyle": [
 *      {zIndex: 0, type: "Line", opacity: 1, stroke: "#BE6B65", strokeWidth: 16},
 *      {zIndex: 1, type: "Line", opacity: 1, stroke: "#E6A08C", strokeWidth: 12},
 *      {zIndex: 2, type: "Text", fill: "#000000", "textRef": "properties.name"}
 *    ]
 *  },
 *  assign: function(feature: Feature, zoomlevel: number){
 *    return "myLineStyle";
 *  }
 * }
 * ```
 */
export declare interface LayerStyle {
    /**
     * @deprecated define strokeWidth style property using a "StyleZoomRange" value instead.
     * @hidden
     */
    strokeWidthZoomScale?: (level: number) => number;
    /**
     * the color for the background of the layer
     */
    backgroundColor?: string;
    /**
     *  This object contains key/styleGroup pairs.
     *  A styleGroup is an array of {@link Style}, that exactly defines how a feature should be rendered.
     */
    styleGroups: {
        [key: string]: Array<Style>;
    };
    /**
     *  The function returns a key that is defined in the styleGroups map.
     *  This function will be called for each feature being rendered by the display.
     *  The display expects this method to return the key for the styleGroup of how the feature should be rendered for the respective zoomlevel.
     *
     *  @param feature - the feature to which style is applied
     *  @param zoomlevel - the zoomlevel of the tile the feature should be rendered in
     *
     *  @returns the key/identifier of the styleGroup in the styleGroupMap
     */
    assign: (feature: Feature, zoomlevel: number) => string;
}

/**
 *  Local feature tile provider.
 */
export declare class LocalProvider extends EditableFeatureProvider {
    /**
     * @param options - options to configure the provider
     */
    constructor(options?: LocalProviderOptions);
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
}

/**
 *  Options to configure the Provider.
 */
declare interface LocalProviderOptions {
    /**
     * Name of the provider.
     */
    name?: string;
    /**
     * Tile margin of the provider.
     */
    margin?: number;
    /**
     *  Allow or prevent editing by the {@link editor.Editor} module.
     *
     *  @defaultValue false
     */
    editable?: boolean;
    
}

/**
 * The MVTLayer is a TileLayer designed to work with remote datasources that are delivering {@link https://github.com/mapbox/vector-tile-spec | MVT encoded} vector tiles.
 * @example
 * ```
 * const myLayer = new MVTLayer({
 *     remote: {
 *         url: 'https://xyz.api.here.com/tiles/osmbase/512/all/{z}/{x}/{y}.mvt?access_token=' + YOUR_ACCESS_TOKEN
 *         tileSize : 512
 *     },
 *     min: 1,
 *     max: 20
 * })
 * ```
 */
export declare class MVTLayer extends TileLayer {
    
    /**
     * @param options - options to configure the TileLayer
     */
    constructor(options: MVTLayerOptions);
    
    
}

/**
 *  Options to configure a MVTLayer.
 */
declare interface MVTLayerOptions extends TileLayerOptions {
    /**
     * options to configure the remote MVT datasource
     */
    remote: {
        /**
         * url to the remote mvt endpoint
         */
        url: string;
        /**
         * The maximum zoom level for loading map tiles
         * @defaultValue 16
         */
        max?: number;
        /**
         * The minimum zoom level for loading map tiles
         * @defaultValue 1
         */
        min?: number;
        /**
         * defines the size of the mvt tile data in pixel.
         * @defaultValue 512
         */
        tileSize?: number;
    };
    /**
     * enable or disable pointer-event triggering for all features of all layers.
     * @defaultValue false
     */
    pointerEvents?: boolean;
}

/**
 *  A PixelPoint represents a point in pixel.
 */
export declare class PixelPoint {
    /**
     *  x coordinate of the point in pixel.
     */
    x: number;
    /**
     *  y coordinate of the point in pixel.
     */
    y: number;
    /**
     *
     *  @param x - the x coordinate of the point
     *  @param y - the y coordinate of the point
     */
    constructor(x: number, y: number);
}

/**
 *  A PixelRect represents a rectangular area in pixels.
 */
export declare class PixelRect {
    /**
     *  minimum x, the left-most x coordinate of the rectangular area.
     */
    minX: number;
    /**
     *  maximum y, the top-most y coordinate of the rectangular area.
     */
    minY: number;
    /**
     *  max x, the right-most x coordinate of the rectangular area.
     */
    maxX: number;
    /**
     *  max y, the bottom-most y coordinate of the rectangular area.
     */
    maxY: number;
    /**
     *  @param minX - minimum x coordinate
     *  @param minY - minimum y coordinate
     *  @param maxX - maximum x coordinate
     *  @param maxY - maximum y coordinate
     */
    constructor(minX: number, minY: number, maxX: number, maxY: number);
}

/**
 *  A remote tile provider fetches data from remote data-sources.
 */
export declare class RemoteTileProvider extends FeatureProvider {
    
    
    
    
    
    
    
    
    /**
     * @param options - options to configure the provider
     */
    constructor(options: RemoteTileProviderOptions);
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
    
    
    
    
    
    /**
     *  Create a new Tile.
     *
     *  @param quadkey - the quadkey of the tile to create
     */
    createTile(quadkey: string): Tile;
    
    
    /**
     * Get a tile by quadkey.
     * If the tile is not cached already, it will be created and stored automatically.
     * Data will be fetched from remote data-sources and attached to tile automatically
     *
     * @param quadkey - quadkey of the tile
     * @param callback - will be called as soon as tile is ready for consumption
     * @returns the Tile
     */
    getTile(quadkey: string, callback: (tile: Tile, error?: any) => void): any;
    
}

/**
 *  Configuration options of a RemoteTileProvider.
 */
declare interface RemoteTileProviderOptions extends TileProviderOptions {
    /**
     * The zoomlevel at which tiles should be loaded from remote and a local index gets created.
     */
    level: number;
    /**
     * PreProcessor for remote data sources.
     * The PreProcessor will be executed just after Features are received from remote backend.
     * If the processor function is returning the processed data then its treated as a synchronous processor.
     * If the processor function does not return any value (undefined) or a Promise then its treated as asynchronous processor.
     * An asynchronous processor that's not using a Promise MUST call the input.ready(..) callback when data processing is finished.
     *
     * Due to the execution of the processor in a separate worker thread the processor function must be scope independent.
     * The processor must be a "standalone function/class" that only depends on its own scope and only accesses its own local variables.
     * No references to the outer scope of the processor function are allowed.
     *
     * @example
     * ```
     * // PreProcessor:
     *  ({data: any[], ready: (GeoJsonFeature[]) => void, tile?:{x:number,y:number,z:number}) => GeoJsonFeature[] | Promise<GeoJsonFeature[]>
     * ```
     */
    preProcessor?(input: {
        data: any[];
        ready: (features: GeoJSONFeature[]) => void;
        tile?: {
            x: number;
            y: number;
            z: number;
        };
    }): GeoJSONFeature[] | Promise<GeoJSONFeature[]>;
    /**
     * PostProcessor for remote data sources.
     * The PostProcessor will be executed just before created/modified or removed Features will be sent to the remote backend.
     * If the processor function is returning the processed data then its treated as a synchronous processor.
     * If the processor function does not return any value (undefined) or a Promise then its treated as asynchronous processor.
     * An asynchronous processor that's not using a Promise MUST call the input.ready(..) callback when data processing is finished.
     *
     * Due to the execution of the processor in a separate worker thread the processor function must be scope independent.
     * The processor must be a "standalone function/class" that only depends on its own scope and only accesses its own local variables.
     * No references to the outer scope of the processor function are allowed.
     *
     *  @example
     * ```
     * // PostProcessorData:
     *  {put: GeoJsonFeature[],remove: GeoJsonFeature[]}
     * // PostProcessor:
     *  ({data: PostProcessorData, ready: (data) => void}) => PostProcessorData | Promise<GeoJsonFeature[]>
     * ```
     */
    postProcessor?(input: {
        data: {
            put: GeoJSONFeature[];
            remove: GeoJSONFeature[];
        };
        ready: (data: any) => void;
    }): {
        put: GeoJSONFeature[];
        remove: GeoJSONFeature[];
    } | Promise<{
        put: GeoJSONFeature[];
        remove: GeoJSONFeature[];
    }>;
    loader?: any;
}

/**
 * A SpaceProvider is a remote HTTPProvider designed to work with XYZ-Hub remote backend.
 * @see {@link https://xyz.api.here.com/hub/static/redoc/}
 */
export declare class SpaceProvider extends GeoJSONProvider {
    
    
    
    
    /**
     * Base URL of the SpaceProvider.
     * It points to a XYZ-Hub space endpoint.
     *
     * @defaultValue "https://xyz.api.here.com/hub/spaces"
     */
    readonly url: string;
    /**
     * @param options - options to configure the provider
     */
    constructor(options: SpaceProviderOptions);
    /**
     * update config options of the provider.
     *
     * @param options - options to configure the provider
     */
    config(options: SpaceProviderOptions): this;
    /**
     * Commit modified/removed features to the remote backend.
     *
     * @param data - the data that should be commit to the remote.
     * @param onSuccess - callback function that will be called when data has been commit successfully
     * @param onError - callback function that will be called when an error occurs
     */
    commit(data: {
        /**
         * features that should be created or updated
         */
        put?: GeoJSONFeature_2[];
        /**
         * features that should be removed
         */
        remove?: GeoJSONFeature_2[];
    }, onSuccess?: any, onError?: any): void;
    /**
     * Get URL for layer specific requests.
     *
     * @param space - Name of the XYZ-Hub Space.
     * @returns url string to receive a layer resource of the remote http backend
     */
    getLayerUrl(space: string): string;
    /**
     * Get URL for tile specific requests.
     *
     * @param space - Name of the XYZ-Hub Space.
     * @returns url string to receive a tile resource of the remote http backend
     */
    getTileUrl(space: string): string;
    /**
     * Get the URL for feature specific requests.
     *
     * @param space - Name of the XYZ-Hub Space.
     * @param ids - id(s) of the feature(s) the provider want's to request
     *
     * @returns url string to receive the feature resource of the remote http backend
     */
    getFeatureUrl(space: string, ids: FeatureId | FeatureId[]): string;
    
    
    
    
    
    /**
     * Set tags to filtering results based on tags in Hub backend.
     * After setting tags, provider will clear all features and data will be
     * requested from hub including the new tag filter.
     *
     * @param tags - the tag(s) that will be send to xyz-hub endpoint
     */
    setTags(tags: string | string[]): void;
    /**
     * Sets result filtering based on properties search in Hub backend.
     * {@link https://www.here.xyz/api/devguide/propertiessearch/}
     *
     * After setting the property search, the provider will clear all features and data will be
     * requested from hub using the property search filter.
     * The response will contain only the features matching all conditions in the query.
     * If function is called without arguments all filters will be cleared.
     *
     *
     * @param key - the name of property
     * @param operator - the operator used
     * @param value - value the value to be matched
     *
     * @example
     * ``` javascript
     * // response will only contain features that have a property called 'name' with 'FirstName' as it's value
     * provider.setPropertySearch('name','=','FirstName')
     * ```
     *
     */
    setPropertySearch(key: string, operator: '=' | '!=' | '>' | '>=' | '<' | '<=', value: string | number | boolean | string[] | number[] | boolean[]): void;
    /**
     *
     * Sets result filtering based on properties search in Hub backend.
     * {@link https://www.here.xyz/api/devguide/propertiessearch/}
     * After setting the property search, the provider will clear all features and data will be
     * requested from hub using the property search filter.
     * The response will contain only the features matching all conditions in the query.
     * If propertySearchMap is set to null or none is passed all previous set filters will be cleared.
     *
     * @param propertySearchMap - A Map of which the keys are the property names and its values are Objects
     * defining the operator ( '=', '!=', '\>', '\>=', '\<', '\<=' ) and the value to be matched.
     *
     * @example
     * ``` javascript
     * // set multiple conditions
     * // provider will only contain features that have a property called name with the value Max OR Peter
     * // AND a property called age with value less than 32
     * provider.setPropertySearch({
     *     'name': {
     *         operator: '=',
     *         value: ['Max','Petra']
     *     },
     *    'age': {
     *         operator: '<',
     *         value: 32
     *    }
     * })
     * ```
     *
     * @example
     * ``` javascript
     * // clear previous set filters
     * provider.setPropertySearch(null)
     * ```
     */
    setPropertySearch(propertySearchMap: {
        [name: string]: {
            operator: '=' | '!=' | '>' | '>=' | '<' | '<=';
            value: any | any[];
        };
    }): void;
    
    
    
    
    
    
}

/**
 *  Options to configure the XYZ SpaceProvider.
 */
declare interface SpaceProviderOptions extends HTTPProviderOptions {
    
    /**
     * Name of the XYZ-Hub Space.
     * {@link https://xyz.api.here.com/hub/static/swagger/#/Read%20Spaces/getSpace}
     */
    space: string;
    /**
     * User credential of the provider, a valid credential needs to contain the "access_token".
     */
    credentials: {
        /**
         * the token to access the space of XYZ Hub endpoint.
         * You can get a token by following the instructions in this {@link https://www.here.xyz/api/getting-token/ | guide}.
         */
        access_token: string;
    };
    /**
     * Indicates the tag(s) that should be set in the requests.
     *
     * @defaultValue false
     */
    tags?: false | string | string[];
    /**
     * Indicates if result geometry of tile requests should be clipped.
     *
     * @defaultValue false
     */
    clip?: boolean;
    /**
     * Base URL of the SpaceProvider.
     * It should point to a XYZ-Hub space endpoint.
     *
     * @defaultValue "https://xyz.api.here.com/hub/spaces"
     */
    url?: string;
    /**
     * define property search query to enable remote filtering by property search.
     *
     * @see {@link https://www.here.xyz/api/devguide/propertiessearch/}
     *
     * @defaultValue null
     */
    propertySearch?: {
        [name: string]: {
            operator: '=' | '!=' | '>' | '>=' | '<' | '<=';
            value: any | any[];
        };
    };
}

/**
 * Style object represents supported style attributes of Features. It indicates how a symbolizer in feature should be rendered.
 *
 * A style object should always include "zIndex" and "type" attributes, and each type of symbolizer should include its own type-specific attributes:
 * - Circle: "radius" must be included and either "fill" or "stroke" should be included.
 * - Rect: "width" must be included and "height" will be set with the same value as "width" if only "width" is present. Either "fill" or "stroke" should be included
 * - Text: "text" or "textRef" should be included and "fill" or "stroke" should also be included for text color
 * - Image: "src" and "width" must be included. "height" will be set with the same value as "width" if only "width" is present.
 * - Line: "stroke" must be included.
 * - Polygon: "fill" or "stroke" must be included.
 *
 * @example
 * ```typescript
 * // example of Circle:
 * {zIndex:0, type:"Circle", radius:16, fill:"#FFFF00"}
 *
 * // example of Rect:
 * {zIndex:0, type:"Rect", fill:"#4C9EEF", stroke:"#0156BB", width:20, height:20}
 *
 * // example of Text:
 * {zIndex:1, type:"Text", fill:"#FFFFFF", text:"HERE", font:"normal 12px Arial"}
 *
 * // example of Image:
 * {zIndex:0, type:"Image", src:"./here.png", width:20, height:20}
 *
 * // example of Line:
 * {zIndex:0, type:"Line", opacity:0.5, stroke:"#BE6B65", strokeLinecap:"round", strokeLinejoin:"round", strokeWidth:16}
 *
 * // example of Polygon:
 * {zIndex:0, type:"Polygon", opacity:0.5, stroke:"#BE6B65", fill:"#FFFFFF"}
 * ```
 */
export declare interface Style {
    /**
     * Indicates type of the shape to render.
     * Its value must be one of the following: "Circle", "Rect", "Text", "Image", "Line" or "Polygon".
     */
    type: 'Circle' | 'Rect' | 'Image' | 'Text' | 'Line' | 'Polygon' | string;
    /**
     * Indicates the drawing order within a layer.
     * Styles with larger zIndex value are rendered above those with smaller values.
     * The zIndex is defined relative to the "zLayer" property.
     * If "zLayer" is defined all zIndex values are relative to the "zLayer" value.
     */
    zIndex: number | StyleValueFunction<number> | StyleZoomRange<number>;
    /**
     * Indicates drawing order across multiple layers.
     * Styles using zLayer with a high value are rendered on top of zLayers with a low value.
     * If no zLayer is defined the zLayer depends on the display layer order.
     * The first (lowest) layer has a zLayer value of 1.
     *
     * @example \{...zLayer: 2, zIndex: 5\} will be rendered on top of \{...zLayer: 1, zIndex: 10\}
     */
    zLayer?: number | StyleValueFunction<number>;
    /**
     * Specifies the URL of an image.
     * It can be either absolute or relative path.
     * It is only required by "Image".
     */
    src?: string | StyleValueFunction<string> | StyleZoomRange<string>;
    /**
     * Sets the color to fill the shape.
     * This attribute is valid for Circle, Rect, Text and Polygon.
     */
    fill?: string | StyleValueFunction<string> | StyleZoomRange<string>;
    /**
     * Sets the stroke color of the shape.
     * This attribute is valid for Circle, Rect, Line, Text and Polygon.
     */
    stroke?: string | StyleValueFunction<string> | StyleZoomRange<string>;
    /**
     * Sets the width of the stroke.
     * This attribute is valid for Circle, Rect, Line, Text and Polygon.
     * The unit of strokeWidth is defined in pixels.
     * For Styles of type Line the strokeWidth can also be defined in meters by using a string: "$\{width\}m".
     * @example
     * ```typescript
     * // define a Line that has a with of 1 meter
     * {
     *     zIndex: 0,
     *     type: "Line",
     *     stroke: "blue",
     *     strokeWidth: "1m"
     * }
     * // define a Line that has a with of 16 pixel
     * {
     *     zIndex: 0,
     *     type: "Line",
     *     stroke: "green",
     *     strokeWidth: "16
     * }
     * ```
     * @example
     * ```typescript
     * // define a Text style with a strokeWidth of 8px
     * {
     *     zIndex: 0,
     *     type: "Text",
     *     text: "doc",
     *     fill: "white",
     *     stroke: "black,
     *     strokeWidth: 8
     * }
     * ```
     */
    strokeWidth?: number | string | StyleValueFunction<number | number> | StyleZoomRange<string | number>;
    /**
     * This controls the shape of the ends of lines. there are three possible values for strokeLinecap:
     * - "butt" closes the line off with a straight edge that's normal (at 90 degrees) to the direction of the stroke and crosses its end.
     * - "square" has essentially the same appearance, but stretches the stroke slightly beyond the actual path. The distance that the stroke goes beyond the path is half the strokeWidth.
     * - "round" produces a rounded effect on the end of the stroke. The radius of this curve is also controlled by the strokeWidth.
     * This attribute is valid for Line styles only.
     */
    strokeLinecap?: string | StyleValueFunction<string> | StyleZoomRange<string>;
    /**
     * The joint where the two segments in a line meet is controlled by the strokeLinejoin attribute, There are three possible values for this attribute:
     * - "miter" extends the line slightly beyond its normal width to create a square corner where only one angle is used.
     * - "round" creates a rounded line segment.
     * - "bevel" creates a new angle to aid in the transition between the two segments.
     * This attribute is valid for Line styles only.
     */
    strokeLinejoin?: string | StyleValueFunction<string> | StyleZoomRange<string>;
    /**
     * The strokeDasharray attribute controls the pattern of dashes and gaps used to stroke paths.
     * It's an array of <length> that specify the lengths of alternating dashes and gaps. If an odd number of values is provided,
     * then the list of values is repeated to yield an even number of values. Thus, 5,3,2 is equivalent to 5,3,2,5,3,2.
     * This attribute is valid for Line styles only.
     */
    strokeDasharray?: number[] | StyleValueFunction<number[]> | StyleZoomRange<number[]> | 'none';
    /**
     * Defines the opacity of the style.
     * The value must be between 0.0 (fully transparent) and 1.0 (fully opaque).
     * It is valid for all style types.
     * @defaultValue 1
     */
    opacity?: number | StyleValueFunction<number> | StyleZoomRange<number>;
    /**
     * The Radius of the Circle.
     * It is required by styles of type "Circle".
     * The default unit is pixels.
     * To define the radius in meters a string can be used: "$\{width\}m".
     * @example
     * ```typescript
     * // define a Circle with a radius of 1 meter
     * {
     *     zIndex: 0,
     *     type: "Circle",
     *     fill: "red",
     *     radius: "1m"
     * }
     * // define a Circle with a radius of 16 pixel
     * {
     *     zIndex: 0,
     *     type: "Circle",
     *     fill: "red",
     *     radius: 16
     * }
     * ```
     */
    radius?: number | StyleValueFunction<number> | StyleZoomRange<number>;
    /**
     * Width of the style in pixels.
     * It is only required by Rect and Image.
     * The maximum supported width for "Image" is 64 pixels.
     * The unit of width is defined in pixels.
     * For styles of type "Rect" the width can also be defined in meters by using a string: "$\{width\}m".
     * @example
     * ```typescript
     * // define a Rect that has a width (and height) of 2.2 meter
     * {
     *     zIndex: 0,
     *     type: "Line",
     *     stroke: "blue",
     *     width: "2.2m"
     * }
     * ```
     * @example
     * ```typescript
     * // define a Rect that has a width (and height) of 16 pixel
     * {
     *     zIndex: 0,
     *     type: "Line",
     *     stroke: "green",
     *     width: 16
     * }
     * ```
     */
    width?: number | StyleValueFunction<number> | StyleZoomRange<number>;
    /**
     * Height of the style in pixels.
     * It is only required by Rect and Image.
     * The maximum supported height for "Image" is 64 pixels.
     * The unit of height is defined in pixels.
     * For styles of type "Rect" the height can also be defined in meters by using a string: "$\{width\}m".
     * @example
     * ```typescript
     * // define a Rect that has a width of 2 meter and a height of 1 meter.
     * {
     *     zIndex: 0,
     *     type: "Line",
     *     stroke: "blue",
     *     width: "2m",
     *     height: "1m"
     * }
     * ```
     * @example
     * ```typescript
     * // define a Rect that has a width of 20 pixel and a height of 28 pixel.
     * {
     *     zIndex: 0,
     *     type: "Line",
     *     stroke: "green",
     *     width: 20,
     *     height: 28
     * }
     * ```
     * @example
     * ```typescript
     * // define a Image/Icon style with/height of 32pixel
     * {
     *     zIndex: 0,
     *     type: "Image",
     *     src: "urlToMyImageResource",
     *     width: 32
     * }
     * ```
     */
    height?: number | StyleValueFunction<number> | StyleZoomRange<number>;
    /**
     * CSS font string for texts.
     * It is only valid for Text.
     *
     * @defaultValue “normal 12px Arial”
     */
    font?: string | StyleValueFunction<string> | StyleZoomRange<string>;
    /**
     * Text is either a string or a function that generates the string that should be displayed.
     * It is valid for Text style only.
     *
     * @example
     * ```typescript
     * // display the name property of a feature in uppercase
     * ...
     * text: function(feature){
     *   return feature.properties.name.toUpperCase();
     * }
     * ```
     */
    text?: string | number | boolean | StyleValueFunction<string | number | boolean> | StyleZoomRange<string | number | boolean>;
    /**
     * "textRef" Reference to an attribute of an feature that's value should be displayed as text.
     * If both "text" and "textRef" are set, "text" prevails.
     * It is only required by Text.
     * @example
     * ```typescript
     * // display the property "name" of the feature's properties
     * ...
     * textRef: "properties.name"
     * ```
     * @example
     * ```typescript
     * // display the id of the featurre
     * ...
     * textRef: "id"
     * ```
     */
    textRef?: string | StyleValueFunction<string> | StyleZoomRange<string>;
    /**
     * Define the starting position of a segment of the entire line in %.
     * A Segment allows to display and style parts of the entire line individually.
     * The value must be between 0 and 1.
     * The Default is 0.
     * Applies to Line style only.
     *
     * @example
     * from: 0.0 // -\> 0%, the segment has the same starting point as the entire line
     * from:  0.5 // -\> 50%, the segment starts in the middle of the entire line
     */
    from?: number | StyleValueFunction<number> | StyleZoomRange<number>;
    /**
     * Define the end position of a segment of the entire line in %.
     * A Segment allows to display and style parts of the entire line individually.
     * The value must be between 0 and 1.
     * The Default is 1.
     * Applies to Line style only.
     *
     * @example
     * to: 0.5 // -\> 50%, the segment ends in the middle of the entire line
     * to: 1.0 // -\> 100%, the segment has the same end point as the entire line
     */
    to?: number | StyleValueFunction<number> | StyleZoomRange<number>;
    /**
     * Offset the shape in pixels on x-axis.
     * It is valid for Circle, Rect, Text and Image.
     * A positive value offsets to the right, a negative value to the left.
     * The default unit is pixels.
     *
     * Style of type Circle and Rect also support an offset in meters. e.g offsetX: "1m"
     *
     * @example
     * ```typescript
     * // offset Image by 8px to the right.
     * { type: "Image", zIndex: 0, src: '...', offsetX: 8}
     *
     * // offset Circle by 1m to the left
     * { type: "Circle", zIndex: 0, fill:'blue', radius: 4, offsetX: "-1m"}
     * ```
     */
    offsetX?: number | string | StyleValueFunction<number | string> | StyleZoomRange<number | string>;
    /**
     * Offset the shape in pixels on y-axis.
     * It is valid for Circle, Rect, Text and Image.
     * A positive value offsetY offsets downwards, a negative value upwards.
     * The default unit is pixels.
     *
     * Style of type Circle and Rect also support an offset in meters. e.g offsetY: "1m"
     *
     * @example
     * ```typescript
     * // offset Image by 8px to the bottom
     * { type: "Image", zIndex: 0, src: '...', offsetY: 8}
     *
     * // offset Circle by 1m to the top
     * { type: "Circle", zIndex: 0, fill:'blue', radius: 4, offsetY: "-1m"}
     * ```
     */
    offsetY?: number | StyleValueFunction<number> | StyleZoomRange<number>;
    /**
     * Offset a line to the left or right side in pixel or meter.
     * A positive values offsets to the right side, a negative value offsets to the left.
     * The side is defined relative to the direction of the line geometry.
     * The default unit is pixels.
     * To define the offset in meters a string that contains the offset value and ends with "m" must be used.
     * Applies to Line style only.
     * @example
     * ```typescript
     * // offset line by 8px
     * { type: "Line", zIndex: 0, stroke:'blue', strokeWidth: 4, offset: 8}
     *
     * // offset line by 2m
     * { type: "Line", zIndex: 0, stroke:'blue', strokeWidth: 4, offset: "2m"}
     * ```
     */
    offset?: number | string | StyleValueFunction<number | string> | StyleZoomRange<number | string>;
    /**
     * Alignment for styles of type "Circle", "Rect", "Image" and "Text".
     * Possible values are: "map" and "viewport".
     * "map" aligns to the plane of the map and "viewport" aligns to the plane of the viewport/screen.
     * Default alignment for Text based on point geometries is "viewport" while "map" is the default for line geometries.
     */
    alignment?: 'map' | 'viewport' | StyleValueFunction<string> | StyleZoomRange<string>;
    /**
     * Rotate the shape of the style to the angle in degrees.
     * This attribute is validate for Rect and Image.
     */
    rotation?: number | StyleValueFunction<number> | StyleZoomRange<number>;
    /**
     * In case of label collision, Text with a higher priority (lower value) will be drawn before lower priorities (higher value).
     * If the collision detection is enabled for multiple Styles within the same StyleGroup, the highest priority (lowest value)
     * is used.
     */
    priority?: number | StyleValueFunction<number> | StyleZoomRange<number>;
    /**
     * Minimum distance in pixels between repeated style-groups on line geometries.
     * Applies per tile only.
     *
     * @defaultValue 256 (pixels)
     */
    repeat?: number | StyleValueFunction<number> | StyleZoomRange<number>;
    /**
     * Enable oder Disable line wrapping for styles of type "Text".
     * The line wrapping for text on (Multi)Linestring geometry with anchor set to "Line" is disabled by default,
     * otherwise it's 14 characters.
     *
     * - number: Maximum number of characters per line [Default 14 characters]
     * - false: disable line wrapping
     * - true: enable line wrapping [Default 14 characters]
     *
     * @defaultValue 14
     */
    lineWrap?: number | StyleValueFunction<number> | StyleZoomRange<number>;
    /**
     * Sets the anchor point for styles of type "Circle", "Rect", "Image" and "Text" used with Line geometry.
     * Possible values are "Coordinate" and "Line".
     *
     * - "Coordinate": the respective style is displayed at each coordinate of the polyline.
     * - "Line": the respective style is displayed on the shape of the polyline when there is enough space. See {@link checkLineSpace} to disable the space ckeck.
     *
     *
     * @defaultValue: "Line" for styles of type "Text", "Coordinate" for styles of type "Circle", "Rect" or "Image".
     */
    anchor?: 'Line' | 'Coordinate';
    /**
     * Enable or disable the space check for point styles on line geometries.
     * Only applies to "Circle", "Rect", "Image" and "Text" styles with {@link anchor} set to "Line".
     * If check checkLineSpace is enabled the respective style is only displayed if there is enough space on the line,
     * otherwise it is not displayed.
     *
     * @defaultValue: true
     */
    checkLineSpace?: boolean;
    /**
     * Enable or disable collision detection.
     * Works for styles of type "Circle", "Rect", "Image" and "Text".
     * If the collision detection is enabled for multiple Styles within the same StyleGroup, the respective Styles are
     * handled as a single Object ("CollisionGroup") where the combined bounding-box is determined automatically.
     *
     * - true: collision are allowed, Collision detection is disabled.
     * - false: avoid collisions, Collision detection is enabled.
     *
     * @defaultValue: false for "Text", true for all other.
     */
    collide?: boolean | StyleValueFunction<boolean> | StyleZoomRange<boolean>;
    /**
     * Extrude a Polygon or MultiPolygon geometry in meters.
     * This attribute is validate for Polygon only.
     */
    extrude?: number | StyleValueFunction<number> | StyleZoomRange<number>;
}

/**
 * A StyleValueFunction is a function that returns the desired value for the respective style property.
 * It's especially useful for data driven styling.
 *
 * @param feature - the feature for which the style is to be obtained
 * @param zoom - the zoomlevel of the style
 *
 * @example
 * ```typescript
 * text: (feature, zoom) => feature.properties.name
 * ```
 */
export declare type StyleValueFunction<Type> = (feature: Feature, zoom?: number) => Type | undefined;

/**
 * A StyleZoomRange is a Map\<number,any\> with zoomlevel as its keys and the value for the respective {@link Style | Style Property} at the respective zoomlevel.
 * Values for intermediate zoom levels are interpolated linearly.
 *
 * @example
 * ```typescript
 * strokeWidth: {
 *     // 2px for zoomlevel 1 to 12
 *     13: 2,  // 2px at zoomlevel 13
 *     // 10px for zoomlevel 14 (linear interpolation)
 *     15: 18, // 18px at zoomlevel 15
 *     // 27px for zoomlevel 16 (linear interpolation)
 *     17: 36  // 36px at zoomlevel 20
 *     // 36px for zoomlevels 18 to 20
 * }
 * ```
 */
export declare type StyleZoomRange<Type> = {
    [zoom: number]: Type;
};

/**
 *  This Class represents a WebMercator Tile.
 */
export declare class Tile {
    
    /**
     *  quadkey of the tile.
     */
    quadkey: string;
    /**
     *  z (zoonlevel) of the tile.
     */
    z: number;
    /**
     *  y of the tile.
     */
    y: number;
    /**
     *  x of the tile.
     */
    x: number;
    /**
     *  type of the tile.
     */
    type: string;
    /**
     *  Geographical Bounding box has the coordinates in order: [minLon, minLat, maxLon, maxLat].
     */
    bounds: Bounds;
    
    
    
    
    
    
    
    
    
    
    /**
     *  Checks if tile expires at given point of time.
     *
     *  @returns true when tile has expired, otherwise false.
     */
    expired(ts: number): boolean;
    /**
     *  add a feature to the tile.
     *
     *  @param feature - the Feature to add
     */
    add(feature: Feature): void;
    /**
     *  remove feature to the tile.
     *
     *  @param feature - the Feature to remove
     */
    remove(feature: Feature): void;
    
    /**
     *  check if the tile  has been fully loaded
     */
    isLoaded(): boolean;
    /**
     *  get tile bound including margin.
     *  @returns the bounding box with geographical coordinates [minLon, minLat, maxLon, maxLat]
     */
    getContentBounds(): [number, number, number, number];
    
    
    
    
}

/**
 * TileLayer
 */
export declare class TileLayer {
    
    
    
    
    
    
    /**
     * default tile margin in pixel
     */
    protected margin: number;
    /**
     * id of the Layer.
     */
    readonly id: string;
    /**
     * Name of the Layer
     */
    name: string;
    /**
     * minimum zoom level at which data from the Layer is displayed.
     */
    min: number;
    /**
     * maximum zoom level at which data from the Layer will be displayed.
     */
    max: number;
    
    
    /**
     * @param options - options to configure the TileLayer
     */
    constructor(options: TileLayerOptions);
    /**
     * Get provider(s) of this layer.
     */
    getProvider(level?: number): TileProvider;
    /**
     * Add an EventListener to the layer.
     * Valid events: "featureAdd", "featureRemove", "featureCoordinatesChange", "clear", "styleGroupChange", "styleChange", and "viewportReady"
     *
     * The detail property of the Event gives additional information about the event.
     * detail.layer is a reference to the layer onto which the event was dispatched and is set for all events.
     *
     * @param type - A string representing the event type to listen for
     * @param listener - the listener function that will be called when an event of the specific type occurs
     */
    addEventListener(type: string, listener: (event: CustomEvent) => void): any;
    /**
     * Remove an EventListener from the layer.
     * Valid events: "featureAdd", "featureRemove", "featureCoordinatesChange", "clear", "styleGroupChange", "styleChange", and "viewportReady"
     *
     * @param type - A string which specifies the type of event for which to remove an event listener.
     * @param listener - The listener function of the event handler to remove from the TileLayer.
     */
    removeEventListener(type: string, listener: (event: CustomEvent) => void): any;
    
    
    /**
     * Modify coordinates of a feature in the layer.
     *
     * @param feature - the Feature whose coordinates should be modified
     * @param coordinates - the modified coordinates to set. The coordinates must match features geometry type.
     */
    setFeatureCoordinates(feature: Feature, coordinates: GeoJSONCoordinate | GeoJSONCoordinate[] | GeoJSONCoordinate[][] | GeoJSONCoordinate[][][]): void;
    /**
     * Add a feature to the layer.
     *
     * @param feature - the feature to be added to the layer
     * @param style - optional style the feature should be displayed with.
     *
     * @example
     * ```
     * // add a feature that will be displayed with the default style of the layer.
     * layer.addFeature({
     *    type: "Feature"
     *    geometry: {
     *        coordinates: [[-122.49373, 37.78202, 0], [-122.49263, 37.78602, 0]],
     *        type: "LineString"
     *    }
     * });
     * ```
     * @example
     * ```
     * // add a feature that will be displayed with a specific style.
     * layer.addFeature({
     *    type: "Feature"
     *    geometry: {
     *        coordinates: [[-122.49373, 37.78202, 0], [-122.49263, 37.78602, 0]],
     *        type: "LineString"
     *    }
     * }, [{
     *    zIndex: 0, type: "Line", stroke: "#DDCB97", "strokeWidth": 18
     * }]);
     * ```
     */
    addFeature(feature: GeoJSONFeature | Feature, style?: Style[]): Feature;
    /**
     * Add features to the layer.
     *
     * @param feature - the features to be added to the layer
     * @param style - optional style the features should be displayed with.
     *
     * @example
     * ```
     * // add multiple features to the layer.
     * layer.addFeature([{
     *    type: "Feature"
     *    geometry: {
     *        coordinates: [[-122.49373, 37.78202], [-122.49263, 37.78602]],
     *        type: "LineString"
     *    }
     * },{
     *    type: "Feature"
     *    geometry: {
     *        coordinates: [[-122.49375, 37.78203], [-122.49265, 37.78604]],
     *        type: "LineString"
     *    }
     * }]);
     * ```
     */
    addFeature(feature: GeoJSONFeatureCollection | GeoJSONFeature[], style?: Style[]): Feature[];
    /**
     * Remove feature(s) from the layer.
     *
     * @param feature - features that should be removed from the layer
     */
    removeFeature(feature: GeoJSONFeature | Feature | GeoJSONFeatureCollection | GeoJSONFeature[]): any[] | Feature | GeoJSONFeature | GeoJSONFeatureCollection;
    /**
     * Set StyleGroup the feature should be rendered with.
     * Pass styleGroup = false|null to hide the feature.
     * If no styleGroup is passed, custom feature style will be cleared and layer default style will be set.
     *
     * @param feature - the feature that's styleGroup should be set
     * @param styleGroup - the styleGroup that feature should be displayed with
     */
    setStyleGroup(feature: Feature, styleGroup?: Style[] | false | null): void;
    /**
     * Get styleGroup for the feature.
     *
     * @param feature - the feature to get style
     * @param zoomlevel - specify the zoomlevel for the feature style
     *
     */
    getStyleGroup(feature: any, zoomlevel?: number, layerDefault?: boolean): Style[];
    /**
     * Search for feature(s) in the layer.
     *
     * @param options - configure the search
     * @example
     * ```
     * // searching by id:
     * layer.search({id: 1058507462})
     * // or:
     * layer.search({ids: [1058507462, 1058507464]})
     *
     * // searching by point and radius:
     * layer.search({
     * point: {longitude: 72.84205, latitude: 18.97172},
     * radius: 100
     * })
     *
     * // searching by Rect:
     * layer.search({
     *  rect:  {minLon: 72.83584, maxLat: 18.97299, maxLon: 72.84443, minLat: 18.96876}
     * })
     *
     * // remote search:
     * layer.search({
     * rect:  {minLon: 72.83584, maxLat: 18.97299, maxLon: 72.84443, minLat: 18.96876},
     * remote: true, // force layer to do remote search if feature/search area is not cached locally
     * onload: function(result){
     *  // search result is only return in this callback function if features are not found in cache.
     * }
     * })
     * ```
     * @returns array of features
     */
    search(options: {
        /**
         * search a feature by id.
         */
        id?: number | string;
        /**
         * Array of feature ids to search.
         */
        ids?: number[] | string[];
        /**
         * Geographical center point of the circle to search in. options.radius must be defined.
         */
        point?: GeoPoint;
        /**
         * Radius of the circle in meters, it is used in "point" search.
         */
        radius?: number;
        /**
         * Geographical Rectangle to search in. [minLon, minLat, maxLon, maxLat] | GeoRect.
         */
        rect?: GeoRect | GeoJSONBBox;
        /**
         * Force the data provider(s) to do remote search if no result is found in local cache.
         */
        remote?: boolean;
        /**
         * Callback function for "remote" search.
         */
        onload?: (result: Feature[] | null) => void;
    }): Feature | Feature[];
    /**
     * Rectangle Search for feature(s) in the layer.
     * @param rect - Geographical Rectangle to search in. [minLon, minLat, maxLon, maxLat] | GeoRect.
     * @param options - configure the search
     *
     * @example
     * ```
     * layer.search({minLon: 72.83584, maxLat: 18.97299, maxLon: 72.84443, minLat: 18.96876})
     * // or:
     * layer.search([72.83584, 18.96876, 72.84443,18.97299])
     *
     * // remote search:
     * layer.search(
     * {minLon: 72.83584, maxLat: 18.97299, maxLon: 72.84443, minLat: 18.96876},
     * {
     * remote: true, // force layer to do remote search if search area is not cached locally
     * onload: function(e){
     *  // search result is only return in this callback function if features are not found in cache.
     * }
     * })
     * ```
     */
    search(rect: GeoRect | GeoJSONBBox, options?: {
        /**
         * Force the data provider(s) to do remote search if no result is found in local cache.
         */
        remote?: boolean;
        /**
         * Callback function for "remote" search.
         */
        onload?: (result: Feature[] | null) => void;
    }): Feature[];
    /**
     * Circle Search for feature(s) in the layer.
     * @param point - Geographical center point of the circle to search in. options.radius must be defined.
     * @param options - configure the search
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
     *
     * // remote search:
     * layer.search([72.84205, 18.97172], {
     *  radius: 100,
     *  remote: true, // force layer to do remote search if search area is not cached locally
     *  onload: function(result){
     *   // search result is only return in this callback function if features are not found in cache.
     *  }
     * })
     * ```
     */
    search(point: GeoPoint, options: {
        /**
         * the radius is mandatory for circle search.
         */
        radius?: number;
        /**
         * Force the data provider(s) to do remote search if no result is found in local cache.
         */
        remote?: boolean;
        /**
         * Callback function for "remote" search.
         */
        onload?: (result: Feature) => void;
    }): Feature[];
    /**
     * Search for feature by id in the layer.
     *
     * @param id - id of the feature to search for
     * @param options - configure the search
     *
     * @example
     * ```typescript
     * layer.search(1058507462)
     *
     * // remote search:
     * layer.search(1058507462,{
     * remote: true, // force layer to do remote search if search area is not cached locally
     * onload: function(feature){
     *  // search result is only return in this callback function if features are not found in cache.
     * }
     * })
     * ```
     */
    search(id: string | number, options?: {
        /**
         * Force the data provider(s) to do remote search if no result is found in local cache.
         */
        remote?: boolean;
        /**
         * Callback function for "remote" search.
         */
        onload?: (result: Feature) => void;
    }): Feature;
    /**
     * Get a tile by quadkey.
     *
     * @param quadkey - quadkey of the tile
     * @param callback - callback function
     * @returns the Tile is returned if its already cached locally
     */
    getTile(quadkey: string, callback: (tile: Tile) => void): Tile | undefined;
    
    /**
     * Get a locally cached tile by quadkey.
     *
     * @param quadkey - the quadkey of the tile
     */
    getCachedTile(quadkey: string): Tile;
    /**
     * Set layer with given style.
     *
     * @param layerStyle - the layerStyle
     * @param keepCustom - keep and reuse custom set feature styles that have been set via layer.setStyleGroup(...)
     */
    setStyle(layerStyle: LayerStyle, keepCustom?: boolean): void;
    /**
     * Get the current layerStyle.
     */
    getStyle(): LayerStyle;
    
    /**
     * Set the tile margin in pixel.
     *
     * @param tileMargin - the tileMargin
     */
    setMargin(tileMargin?: number): number;
    /**
     * enable or disable pointer-event triggering for all features of all layers.
     *
     * @param active - boolean to enable or disable posinter-events.
     *
     * @returns boolean indicating if pointer-event triggering is active or disabled.
     */
    pointerEvents(active?: boolean): boolean;
    
}

/**
 *  Configuration options for a TileLayer.
 */
declare interface TileLayerOptions {
    /**
     * Name of the TileLayer.
     */
    name?: string;
    /**
     * minimum zoom level at which data from the TileLayer will be displayed.
     */
    min?: number;
    /**
     * maximum zoom level at which data from the TileLayer will be displayed.
     */
    max?: number;
    /**
     * The data provider for the TileLayer.
     */
    provider?: TileProvider;
    
    /**
     * Style for rendering features in this layer.
     */
    style?: LayerStyle;
    /**
     * tileMargin that should be applied to all providers of the layer.
     */
    margin?: number;
    /**
     * the size of the tile data in pixel.
     * @defaultValue 512
     */
    tileSize?: number;
    /**
     * enable or disable pointer-event triggering for all features of all layers.
     * @defaultValue true
     */
    pointerEvents?: boolean;
}

/**
 * The TileProvider is an abstract Provider that serves map-data partitioned in {@link Tiles}.
 */
declare abstract class TileProvider {
    
    /**
     * The id of the Provider
     */
    id?: string;
    /**
     * The name of the Provider.
     */
    name?: string;
    /**
     * default tile margin.
     */
    margin?: number;
    
    
    
    
    
    
    
    
    
    
    /**
     * Get a tile by quadkey.
     *
     * @param quadkey - quadkey of the tile
     * @param callback - the callback function
     * @returns the Tile is returned if its already cached locally
     */
    abstract getTile(quadkey: string, callback: (tile: Tile, error?: any) => void): any;
    /**
     * @param options - options to configure the provider
     */
    constructor(options: TileProviderOptions);
    
    
    /**
     * Add an EventListener to the provider.
     * Valid events: "clear" and "error"
     *
     * The detail property of the Event gives additional information about the event.
     * detail.provider is a reference to the provider onto which the event was dispatched and is set for all events.
     *
     * @param type - A string representing the event type to listen for
     * @param listener - the listener function that will be called when an event of the specific type occurs
     */
    addEventListener(type: string, listener: (e: CustomEvent) => void, _c?: any): boolean;
    /**
     * Remove an EventListener from the provider.
     * Valid events:  "clear" and "error"
     *
     * @param type - A string which specifies the type of event for which to remove an event listener.
     * @param listener - The listener function of the event handler to remove from the provider.
     */
    removeEventListener(type: string, listener: (e: CustomEvent) => void, _c?: any): boolean;
    /**
     * Clear all features in.
     */
    clear(bbox?: any): void;
    /**
     * Get a locally cached tile by quadkey.
     *
     * @param quadkey - the quadkey of the tile
     */
    getCachedTile(quadkey: string): Tile;
    /**
     * Set the tile margin in pixel.
     *
     * @param tileMargin - the tileMargin
     */
    setMargin(tileMargin?: number): void;
    /**
     * get cached tile by bounding box.
     *
     * @param bbox - array of coordinates in order: [minLon, minLat, maxLon, maxLat]
     * @param zoomlevel - get tiles at specified tileMargin
     * @returns array of {@link Tiles}
     */
    getCachedTilesOfBBox(bbox: number[], zoomlevel?: number): Tile[];
    /**
     * Set config for provider.
     *
     * @param options - options to set
     */
    config(options: TileProviderOptions): this;
    /**
     * Create a new Tile.
     *
     * @param quadkey - the quadkey of the tile to create
     */
    createTile(quadkey: string): Tile;
}

/**
 *  Options to configure the Provider.
 */
declare interface TileProviderOptions {
    /**
     * optional id to identify the provider.
     */
    id?: string;
    /**
     * Name of the provider.
     */
    name?: string;
    /**
     * Tile margin of the provider.
     */
    margin?: number;
    
}

export { }

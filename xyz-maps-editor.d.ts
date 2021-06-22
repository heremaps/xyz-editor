import { Area as Area_2 } from '@here/xyz-maps-editor';
import { EditableFeatureProvider } from '@here/xyz-maps-core';
import { EditableRemoteTileProvider } from '@here/xyz-maps-core';
import { Feature as Feature_2 } from '@here/xyz-maps-editor';
import { Feature as Feature_3 } from '@here/xyz-maps-core';
import { FeatureProvider } from '@here/xyz-maps-core';
import { GeoJSONBBox } from '@here/xyz-maps-core';
import { GeoJSONCoordinate } from '@here/xyz-maps-core';
import { GeoJSONFeature } from '@here/xyz-maps-core';
import { GeoPoint } from '@here/xyz-maps-core';
import { GeoRect } from '@here/xyz-maps-core';
import { Line as Line_2 } from '@here/xyz-maps-editor';
import { Map as Map_2 } from '@here/xyz-maps-display';
import { Navlink as Navlink_2 } from '@here/xyz-maps-editor';
import { PixelPoint } from '@here/xyz-maps-core';
import { Style } from '@here/xyz-maps-core';
import { TileLayer } from '@here/xyz-maps-core';

/**
 * The Address Feature is a generic editable Feature with "Point" geometry.
 * In addition to the Marker Feature, the Place feature must have a "routing point" located on a Navlink geometry.
 * A Address must be linked/associated with a Navlink Feature.
 *
 * The Feature can be edited with the {@link Editor}.
 */
export declare class Address extends Location_2 {
    /**
     *  The feature class of an Address Feature is "ADDRESS".
     */
    readonly class: 'ADDRESS';
    
    
    
    
}

/**
 * The Area Feature is a generic editable Feature with "Polygon" or "MultiPolygon" geometry.
 */
export declare class Area extends Feature {
    /**
     *  The feature class of an Area Feature is "AREA".
     */
    readonly class: 'AREA';
    
    /**
     * Add a new shape point / coordinate to the area.
     *
     * @param point - the coordinate of the new shape to add
     * @param polygonIndex - the index of the polygon where the new shape/coordinate should be inserted.
     * @param index - the index position in the coordinate array of the polygon where the new shape point should be inserted.
     *
     * @returns index of the shape or false if shape could not be added
     */
    addShape(point: GeoPoint | PixelPoint, polygonIndex?: number, index?: number): number | false;
    /**
     * Add a rectangular hole to the polygon geometry at the provided position.
     * The position must be located in the exterior of the polygon.
     * The size of the hole is calculated with respect to the polygon geometry.
     *
     * @param point - the center of the rectangular hole to be created
     *
     * @returns boolean that indicates if the hole has been added successfully.
     */
    addHole(point: GeoPoint | PixelPoint | GeoJSONCoordinate): boolean;
    /**
     * Set the behavior options.
     * @experimental
     */
    behavior(options: {
        /**
         * Snap coordinates to polygon geometry nearby.
         */
        snapCoordinates?: boolean;
    }): void;
    /**
     * Set the value of a specific behavior option.
     * @experimental
     */
    behavior(name: string, value: boolean): void;
    /**
     * Get the value of a specific behavior option.
     * @experimental
     */
    behavior(option: string): any;
    /**
     * Get the behavior options.
     * @experimental
     */
    behavior(): {
        /**
         * Snap coordinates to polygon geometry nearby.
         */
        snapCoordinates: boolean;
    };
    /**
     *  Get the geographical coordinate(s) of the Area feature.
     */
    coord(): [number, number, number?][][] | [number, number, number?][][][];
    /**
     *  Set the geographical coordinate(s) of the Area feature.
     *
     *  @param coordinates - the geographical coordinates that should be set.
     */
    coord(coordinates: [number, number, number?][][] | [number, number, number?][][][]): any;
}

/**
 * The AreaShape represents a shape-point / coordinate of a Area feature.
 * The AreaShape is only existing if the corresponding Area feature is "selected" and user based geometry editing with touch/mouse interaction is activated.
 * @see {@link Area.select}
 */
export declare class AreaShape extends Feature_3 {
    /**
     * The feature class of an AreaShape Feature is "AREA_SHAPE".
     */
    readonly class: 'AREA_SHAPE';
    
    
    
    /**
     * Get the Area feature to which the ShapeShape belongs.
     *
     * @returns the Area feature
     */
    getArea(): Area;
    /**
     * Removes the shape point from the polygon geometry of the Area feature.
     */
    remove(): any;
    /**
     * Get the index of the shape point in the coordinates array of the polygon of respective Area feature.
     *
     * @returns The index of the shape point.
     */
    getIndex(): number;
    
}

/**
 *
 * The Crossing represents the intersection point of 2 Navlink geometries.
 * A Crossing feature is an indication for a Road Intersection an can be used to detect and create missing intersections in a road network.
 * In case of 2 Navlink geometries are located very close to each other (but not intersecting), the Crossing represents a "CROSSING_CANDIDATE".
 * The threshold for the candidate detection can be configured with {@link EditorOptions.intersectionScale}
 */
export declare class Crossing implements GeoJSONFeature {
    
    /**
     *  the feature class of the crossing. Can be either CROSSING or CROSSING_CANDIDATE.
     */
    readonly class: xClass.CROSSING | xClass.CROSSING_CANDIDATE;
    /**
     * the x coordinate of the crossing on screen in pixel.
     * @deprecated use display.geoToPixel to project the geographical coordinates of the crossing to pixels on screen.
     */
    readonly x: number;
    /**
     * the y coordinate of the crossing on screen in pixel.
     * @deprecated use display.geoToPixel to project the geographical coordinates of the crossing to pixels on screen.
     */
    readonly y: number;
    /**
     * The distance between two points which will be connected on current and related links.
     */
    readonly distance: number;
    /**
     * The geometry of the Crossing feature.
     */
    geometry: {
        /**
         * The type of the geometry.
         * For "CROSSINGS" the type is "Point", for "CROSSING_CANDIDATE" its "LineString".
         */
        type: 'Point' | 'LineString';
        /**
         * The coordinates of the crossing feature.
         */
        coordinates: GeoJSONCoordinate | GeoJSONCoordinate[];
    };
    
    
    
    
    /**
     * Get the Navlink feature which is the crossed or treated as a crossing candidate.
     */
    getRelatedLink(): Navlink_2;
    /**
     * Connects the related Navlink features and creates an intersection.
     *
     * @returns Resulting array of new Crossing due to road network changes or false if none crossing is detected.
     */
    connect(): Crossing[] | false;
    /**
     * Show the crossing on the map.
     */
    show(): void;
    /**
     * Hide the crossing on the map.
     */
    hide(): void;
    /**
     * Get the Navlink feature of which the crossing belongs to.
     */
    getLink(): Navlink_2;
    /**
     * Get all connected Navlink features which are connected (Intersection) to the related link that is treated as crossing candidate.
     * This method affects Crossings of type "CROSSING_CANDIDATE" only.
     */
    getConnectedLinks(): Navlink_2[];
}

/**
 *  The DrawingBoard is a tool to easily enable the user to draw the geometry for a feature by user interaction with mouse/touch "taps" on the screen.
 *  A feature based on the drawn geometry and custom properties can be created when the drawing operation is done.
 */
declare class DrawingBoard {
    
    
    
    
    /**
     * Add a shape-point to the feature.
     *
     * @param position - the coordinate in pixels relative to the screen that should be added to the coordinates of the feature.
     * @param Navlink - pass this parameter in case of a Navlink feature is drawn that should start on the geometry of another Navlink, to split it's geometry automatically.
     */
    addShape(position: PixelPoint | GeoPoint, navlink?: Navlink_2): DrawingShape;
    /**
     * Remove a shape-point.
     * If no index is defined, the last added shape-point will be removed.
     *
     * @param index - the index of the shape-point to be removed.
     */
    removeShape(index?: number): void;
    /**
     * Get the total number of coordinates / shape-points of the currently drawn feature.
     *
     * @returns Number of coordinates
     */
    getLength(): number;
    /**
     * Cancel the current drawing operation.
     */
    cancel(): void;
    /**
     * Set properties of the feature.
     *
     * @param properties - properties the feature will be created with.
     */
    setProperties(properties: any): void;
    /**
     * @deprecated - use setProperties instead.
     */
    setAttributes(p: any): void;
    /**
     * Finish current drawing operation and create the drawn feature.
     *
     * @param properties - properties the feature will be created with.
     *
     * @returns the create Feature including the drawn geometry/coordinates
     */
    create(properties?: any): Line_2 | Navlink_2 | Area_2;
    /**
     * Start a new drawing operation to shape/draw the geometry a feature by user interaction with mouse/touch "taps" on the screen.
     *
     * @param options - options to configure the drawing operation
     */
    start(options: {
        /**
         * the type of feature that should be drawn.
         */
        mode?: 'Area' | 'Line' | 'Navlink';
        /**
         * for custom draw styling.
         */
        styleGroup?: Style[];
        /**
         * defines the first coordinate /the starting position.
         */
        position?: PixelPoint | GeoPoint;
        /**
         * the Navlink feature to which the drawn Navlink should connect.
         */
        connectTo?: Navlink_2;
        /**
         * the layer where the feature should be created in.
         */
        layer?: TileLayer;
        /**
         * event listener that's called for each shape-point that's being added by user interaction. The target of the event is the drawn shape-point {@link DrawingShape}
         */
        onShapeAdd?: (event: EditorEvent) => void;
        /**
         * function that's called for each shape-point that's being removed by user interaction. The target of the event is the drawn shape-point {@link DrawingShape}
         */
        onShapeRemove?: (event: EditorEvent) => void;
    }): boolean;
    /**
     * Get the active state of the drawing board.
     *
     * @returns true when active, otherwise false
     */
    isActive(): boolean;
    /**
     * Get the geometry of the currently drawn feature.
     */
    getGeometry(): ({
        type: 'LineString' | 'MultiPolygon' | string;
        coordinates: GeoJSONCoordinate[] | GeoJSONCoordinate[][][];
    });
    /**
     * Set the geometry of the currently drawn feature.
     *
     * If the geometry of an area (MultiPolygon) is specified, only the first exterior is processed.
     */
    setGeometry(geomtry: {
        type: 'LineString' | 'MultiPolygon' | string;
        coordinates: GeoJSONCoordinate[] | GeoJSONCoordinate[][][];
    }): void;
}

/**
 * The DrawingShape represents a coordinate (shape-point) of the geometry that's drawn in the current drawing operation of the DrawingBoard utility.
 * {@link editor.DrawingBoard}
 */
declare class DrawingShape extends Feature_3 {
    
    /**
     * the feature class of the drawing shape point, either LINE_SHAPE, NAVLINK_SHAPE or AREA_SHAPE
     */
    readonly class: FeatureShapeClass;
    
    
    
    /**
     * Removes the shape point from the geometry of the current drawing operation.
     */
    remove(): void;
    /**
     * Get the total number of coordinates / shape-points of the currently drawn feature.
     *
     * @returns Number of coordinates
     */
    getLength(): number;
    /**
     * Returns the index of the shape point in the coordinate array of the currently drawn feature.
     *
     * @returns the index position in the coordinate array.
     */
    getIndex(): any;
}

/**
 * The Editor is an API for editing map data that can be used to easily access, add, remove and edit various types of map data.
 * Changes can be automatically synchronized with various remote backends services.
 * It offers various tools for manipulating map-data through user interaction.
 */
export declare class Editor {
    
    /**
     * The HTMLElement used by the Map Editor.
     */
    container: HTMLElement;
    /**
     * @param display - the map display to be used with the map editor.
     * @param options - options to customize the map editor.
     *
     * @example
     * ```
     *  import {Map} from '@here/xyz-maps-display';
     *  import {Editor} from '@here/xyz-maps-editor';
     *
     *  //create map display
     *  const display = new Map( mapDiv, {
     *      zoomLevel : 19,
     *      center: {
     *          longitude: 8.53422,
     *          latitude: 50.16212
     *      },
     *      // add layers to display
     *      layers: layers
     *  });
     *
     * // create the map editor
     * editor = new Editor( display, {
     *      // add the layers that should be edited
     *     layers: layers
     * });
     * ```
     */
    constructor(display: Map_2, options?: EditorOptions);
    /**
     * enable or disable the editor.
     *
     * @param active - true to enable or false to disable the editor
     *
     * @returns the current active state
     */
    active(active?: boolean): boolean;
    /**
     * Add an EventListener to the editor.
     * Valid Events are: "tap", "dbltap", "pointerup", "pointerenter", "pointerleave", "featureUnselected", "error", "dragStart", "dragStop".
     *
     * Additional details about the different events:
     * - "tap", "pointerup", "dbltap": These events are thrown when the user taps (or double taps) on any feature or the map itself.
     * - "pointerenter", "pointerleave": Occurs when a pointer enters or leaves the hit test area of a map feature.
     * - "featureUnselected": This event is fired when a feature gets unselected automatically by the Editor ( eg: automatic linksplit ).
     * - "error": The event is fired when error occurs.
     * - "dragStart": The event is fired when the user starts dragging an Address, Place, Marker or a shape-point of a Navlink/Area.
     * - "dragStop": The event is fired when the user finishes dragging of a Address, Place, Marker or a shape-point of a Navlink/Area.
     *
     * @param type - A string representing the event type to listen for.
     * @param listener - the listener function that will be called when an event of the specific type occurs
     */
    addEventListener(type: string, listener: (event: EditorEvent) => void): any;
    /**
     * Add an Error EventListener to the editor.
     * @param type - the EventListener type is "error"
     * @param listener - the listener function that will be called when an Error occurs
     */
    addEventListener(type: 'error', listener: (event: Error) => void): any;
    /**
     * Remove an EventListener from the layer.
     * Valid Events are: "tap", "dbltap", "pointerup", "pointerenter", "pointerleave", "featureUnselected", "error", "dragStart", "dragStop".
     *
     * @param type - A string which specifies the type of event for which to remove an event listener.
     * @param listener - The listener function of the event handler to remove from the editor.
     */
    removeEventListener(type: string, listener: (event: EditorEvent | Error) => void): void;
    /**
     *  Add a feature to the editor.
     *
     *  @param feature - the feature to be added to the map.
     *  @param layer - the layer the feature should be added to.
     *  @param origin - offsets the geometry of the feature.
     *
     *  @returns the feature that was successfully added to the map
     */
    addFeature(feature: GeoJSONFeature | Feature, layer?: TileLayer, origin?: GeoPoint | PixelPoint): Address | Area | Marker | Place | Line | Navlink;
    /**
     *  Add features to the editor.
     *
     *  @param features - the features to be added to the map.
     *  @param layer - the layer the features should be added to.
     *  @param origin - offsets the geometry of the features.
     *
     *  @returns the features that were successfully added to the map
     */
    addFeature(features: GeoJSONFeature | Feature | (GeoJSONFeature | Feature)[], layer?: TileLayer, origin?: GeoPoint | PixelPoint): Address | Area | Marker | Place | Line | Navlink | FeatureContainer;
    /**
     *  Add features to map editor.
     *
     *  @param layerMap - a map where the layerId is the key and the value are the feature(s) that should be added to the respective layer.
     *  @param origin - allows to translate features by origin offset.
     *
     *  @returns the feature(s) that were successfully added to map
     */
    addFeature(layerMap: {
        [layerId: string]: GeoJSONFeature | Feature | (GeoJSONFeature | Feature)[];
    }, layer?: TileLayer, origin?: GeoPoint | PixelPoint): Address | Area | Marker | Place | Line | Navlink | FeatureContainer;
    /**
     * Get a feature by id and layer.
     *
     * @param featureId - the id of the feature
     * @param layerId - the id of the layer or the layer itself to which the feature belongs.
     *
     * @returns the found feature in the map, otherwise null.
     */
    getFeature(featureId: string | number, layerId: string | TileLayer): any;
    /**
     * Create a FeatureContainer.
     *
     * @returns feature container
     */
    createFeatureContainer(...features: Feature[]): FeatureContainer;
    /**
     * Clears the current selected feature.
     *
     * @returns the cleared Feature or null of none is selected.
     */
    clearFeatureSelection(): Feature | null;
    
    /**
     * Search for feature(s) in the provider.
     *
     * @param options - configure the search
     *
     * @example
     * ```typescript
     * // searching by id:
     * provider.search({id: 1058507462})
     * // or:
     * provider.search({ids: [1058507462, 1058507464]})
     *
     * // searching by point and radius:
     * provider.search({
     *  point: {longitude: 72.84205, latitude: 18.97172},
     *  radius: 100
     * })
     *
     * // searching by Rect:
     * provider.search({
     *  rect:  {minLon: 72.83584, maxLat: 18.97299, maxLon: 72.84443, minLat: 18.96876}
     * })
     *
     * // remote search:
     * provider.search({
     *  rect:  {
     *    minLon: 72.83584,
     *    maxLat: 18.97299,
     *    maxLon: 72.84443,
     *    minLat: 18.96876
     *  },
     *  remote: true, // force provider to do remote search if feature/search area is not cached locally
     *  onload: function(result){
     *   // search result is only return in this callback function if features are not found in cache.
     *  }
     * })
     * ```
     * @returns array containing the found features
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
        /**
         * function for optional result filtering.
         */
        filter?: (feature: Feature[]) => boolean;
        /**
         * Layers to search in.
         */
        layers?: TileLayer[];
    }): Feature[];
    /**
     * add a TileLayer to the editor and enable editing of its map data.
     * @param layer - the layer to be added to editor.
     *
     * @returns true indicates layer has been added successfully, otherwise false.
     */
    addLayer(layer: TileLayer): boolean;
    /**
     * Get all layers that are added to the editor.
     *
     * @returns Array if layers that are added to the editor.
     */
    getLayers(): TileLayer[];
    /**
     * Get a specific Layer at the index in the layer list of the editor.
     *
     * @returns the respective layer at index
     */
    getLayers(index: number): TileLayer;
    /**
     * Remove a layer from the editor.
     *
     * layer - the layer to be removed from the map editor.
     * Editing get disabled for the layer.
     *
     * @returns true indicates layer is removed successfully, otherwise false.
     */
    removeLayer(layer: TileLayer): boolean;
    /**
     * This method registers an observer for the property named by the caller.
     * Supported observables: 'active', 'ready', 'history.current', 'history.length', 'changes.length'
     *
     * @param name - The name of the property to observe.
     *
     * @param observer - the observer function that is called when the value of the observable changes.
     */
    addObserver(name: 'active' | 'ready' | 'history.current' | 'history.length' | 'changes.length', observer: (
    /**
     * the name of the property that was modified, created or deleted
     */
    name: 'active' | 'ready' | 'history.current' | 'history.length' | 'changes.length', 
    /**
     * the new value of the observable property
     */
    value: any, 
    /**
     * the old/previous value of the observable property
     */
    prevValue: any) => void): void;
    /**
     * This method retrieves the current value of a observable property.
     *
     * @param key - The name of the property whose value is to be retrieved
     * @returns value - The retrieved value of the property or undefined if no such property exists
     */
    get(key: 'active' | 'ready' | 'history.current' | 'history.length' | 'changes.length'): any;
    /**
     * This method removes the observer for the property.
     * Supported observables: 'active', 'ready', 'history.current', 'history.length', 'changes.length'
     *
     * @param name - The name of the property that should no longer be observed
     * @param observer - The observer function to be removed
     */
    removeObserver(name: 'active' | 'ready' | 'history.current' | 'history.length' | 'changes.length', observer: (
    /**
     * the name of the property that was modified, created or deleted
     */
    name: 'active' | 'ready' | 'history.current' | 'history.length' | 'changes.length', 
    /**
     * the new value of the observable property
     */
    value: any, 
    /**
     * the old/previous value of the observable property
     */
    prevValue: any) => void): void;
    /**
     * Destroy the map editor
     */
    destroy(): void;
    /**
     * Sets the desired zoomLevel.
     *
     * @deprecated - use the map display directly {@link display.Map.setZooomlevel}
     * @param zoomLevel - The zoomlevel that the map should zoom to.
     */
    setZoomLevel(zoomlevel: number): void;
    /**
     * Get the current zoomLevel.
     *
     * @deprecated - use the map display directly {@link display.Map.getZoomlevel}
     * @returns The current zoomLevel of the map.
     */
    getZoomLevel(): number;
    /**
     * Convert a pixel position relative to the current mapview on screen to a geographical coordinate.
     *
     * @param coordinate - The coordinate on screen in pixels.
     * @returns the geographical coordinate
     */
    pixelToGeo(coordinate: PixelPoint | [number, number, number?]): GeoPoint;
    /**
     * Convert geographical coordinate to a pixel coordinate relative to the current mapview on screen.
     *
     * @param coordinate - the geographical coordinate
     * @returns The pixel coordinate.
     */
    geoToPixel(coordinate: GeoPoint | [number, number, number?]): PixelPoint;
    /**
     * Revert changes, fetch data from repository.
     */
    revert(): void;
    /**
     * get the DrawingBoard to enable mouse/touch based drawing of the geometry for Line, Navlink or Area features.
     */
    getDrawingBoard(): DrawingBoard;
    /**
     * get the tool for selecting zones/sides on Navlink features.
     */
    getZoneSelector(): ZoneSelector;
    /**
     * Returns the overlay TileLayer used for user interaction with the editable map features.
     *
     * @returns the TileLayer containing all "UI" features used for user interaction with the map features.
     */
    getOverlay(): TileLayer;
    /**
     * Undo the latest change operation(s).
     * One change operation can contain multiple feature modifications.
     * The changes are stored and managed locally.
     *
     * Submitting {@link Editor.submit} modified Feature(s) to the remote will clear the local change history.
     *
     * @param steps - the number of change operations to undo.
     */
    undo(steps?: number): void;
    /**
     * Redo the latest change operation(s).
     * One change operation can contain multiple feature modifications.
     *
     * The changes are stored and managed locally.
     * Submitting {@link Editor.submit} modified Feature(s) to the remote will clear the local change history.
     *
     * @param steps - the number of change operations to redo.
     */
    redo(steps?: number): void;
    /**
     * Submit changes, return object Ids of submitted objects. Reload and render objects.
     *
     * @param options - submit options
     *
     * @returns true, if there are changes to be submitted, false otherwise.
     */
    submit(options: {
        /**
         * callback function which returns additional information about the commit process.
         */
        onSuccess?: (data: any) => void;
        /**
         * callback function that gets called in case of an error.
         */
        onError?: (Error: any) => void;
        /**
         * transactionId that will be attached to all features of the submit operation.
         */
        transactionId?: string;
    }): boolean;
    /**
     * Get information of all modified Features of the editor.
     *
     * @returns Array of modified objects.
     */
    info(): Feature[];
    /**
     * Export data of all modified features.
     *
     * @returns A JSON encoded string containing all modified features and its respective layer information.
     */
    export(): string;
    /**
     * Import Features to the editor that have previously been exported with {@link Editor.export}.
     *
     * @param json - A JSON encoded string containing all modified features and its respective layer information.
     */
    import(json: string): void;
    /**
     * Convert a PixelPoint on the screen or a GeoPoint to a geographical Coordinate in GeoJSON format [number,number,number?].
     *
     * @example
     * ```typescript
     * // create a Feature at a specific position of the current mapview on the screen.
     * editor.addFeature({
     *     type: 'Feature',
     *     geometry: {
     *         type: 'Point',
     *         coordinates: editor.toGeoJSONCoordinates({x: 300, y:300})
     *     }
     * })
     * ```
     *
     * @param coordinates - the pixel and/or geographical coordinate(s) to convert.
     */
    toGeoJSONCoordinates(coordinates: PixelPoint | GeoPoint | GeoJSONCoordinate): GeoJSONCoordinate;
    /**
     * Convert PixelPoints or a GeoPoints to a geographical Coordinates in GeoJSON format [number,number,number?].
     *
     * @example
     * ```typescript
     * // create a Feature at a specific position of the current mapview on the screen.
     * editor.addFeature({
     *     type: 'Feature',
     *     geometry: {
     *         type: 'LineString',
     *         coordinates: editor.toGeoJSONCoordinates([{x: 300, y:300},{longitude:50.1, latitude:8.5}])
     *     }
     * })
     * ```
     *
     * @param coordinates - the pixel and/or geographical coordinate(s) to convert.
     */
    toGeoJSONCoordinates(coordinates: (PixelPoint | GeoPoint | GeoJSONCoordinate)[]): GeoJSONCoordinate[];
    /**
     * Convert PixelPoints or a GeoPoints to a geographical Coordinates in GeoJSON format [number,number,number?].
     *
     * @example
     * ```
     * // create a Feature at a specific position of the current mapview on the screen.
     * editor.addFeature({
     *   type: 'Feature',
     *     geometry: {
     *       type: 'Polygon',
     *         coordinates: editor.toGeoJSONCoordinates([
     *           [{x:10, y:10}, {longitude:50.1, latitude:8.5}, {x:90, y:90}, {x:10,y:90}, {x:10, y:10}]
     *         ])
     *     }
     * })
     * ```
     * @param coordinates - the pixel and/or geographical coordinate(s) to convert.
     */
    toGeoJSONCoordinates(coordinates: (PixelPoint | GeoPoint | GeoJSONCoordinate)[][]): GeoJSONCoordinate[][];
    /**
     * Convert PixelPoints or a GeoPoints to a geographical Coordinates in GeoJSON format [number,number,number?].
     *
     * @example
     * ```typescript
     * // create a Feature at a specific position of the current mapview on the screen.
     * editor.addFeature({
     *     type: 'Feature',
     *     geometry: {
     *         type: 'MultiPolygon',
     *         coordinates: editor.toGeoJSONCoordinates([
     *           [
     *             [{x:10, y:10}, {longitude:50.1, latitude:8.5}, {x:90, y:90}, {x:10,y:90}, {x:10, y:10}]
     *           ]
     *         ])
     *     }
     * })
     * ```
     * @param coordinates - the pixel and/or geographical coordinate(s) to convert.
     */
    toGeoJSONCoordinates(coordinates: (PixelPoint | GeoPoint | GeoJSONCoordinate)[][][]): GeoJSONCoordinate[][][];
}

/**
 * The EditorEvent represents an event which takes place in the editor.
 * An event can be triggered by user interaction e.g. tapping on the map, or generated to represent the progress of an asynchronous task.
 */
export declare class EditorEvent {
    /**
     * The type of the event.
     * Supported events: "tap", "dbltap", "pointerup", "pointerenter", "pointerleave", "featureUnselected", "error", "dragStart", "dragStop".
     */
    readonly type: string;
    /**
     * This property specifies the time at which the event was created in milliseconds relative to 1970-01-01T00:00:00Z.
     */
    readonly timeStamp: DOMTimeStamp;
    /**
     * Gives the x coordinate relative to the map HTMLElement in pixels.
     * This property is only set when created by user interaction with native mouse/touch/pointer events.
     */
    readonly mapX?: number;
    /**
     * Gives the y coordinate relative to the map HTMLElement in pixels.
     * This property is only set when created by user interaction with native mouse/touch/pointer events.
     */
    readonly mapY?: number;
    /**
     * The underlying native Mouse-, Pointer- or Touch-event generated by the browser.
     * This property will be null if the Event was not directly generated from a native event.
     */
    readonly nativeEvent?: MouseEvent | TouchEvent | PointerEvent | null;
    /**
     * This property indicates which button was pressed on the mouse to trigger the event.
     *
     * Possible values:
     * - 0: Main button pressed, usually the left button or the un-initialized state
     * - 2: Secondary button pressed, usually the right button
     *
     * @defaultValue 0
     */
    readonly button: number;
    /**
     * The feature on the map this event relates to.
     * e.g. User clicks/taps on a specific Feature on the map.
     * If the event does not refer to any feature, the property is null.
     */
    readonly target?: Place | Address | Marker | Area | AreaShape | Line | LineShape | Navlink | NavlinkShape | Crossing | Feature | null;
    /**
     * optional event detail data depending on the type of the event.
     */
    readonly detail: {
        /**
         * the layer the event relates to.
         */
        layer?: TileLayer;
    };
    
}

/**
 * Options to configure the map editor ({@link editor.Editor}).
 */
declare interface EditorOptions {
    /**
     * define the TileLayers that should be edited with the {@link editor.Editor}
     */
    layers?: TileLayer[];
    /**
     * Callback that's being called before certain edit-operations are executed.
     * A operation can be restricted or allowed, controlled by the respective return value.
     *
     * @param feature - the map feature
     * @param restrictionMask - restrictionMask represents a bitmask for the desired edit operations.
     *     1  -\> GEOMETRY CHANGE
     *     2  -\> REMOVE
     *
     * @returns true -\> Allow operation(s) and execute edits. false -\> forbid operation(s). No edit gets executed.
     *
     * @defaultValue
     */
    editRestrictions?: (feature: Feature_2, restrictionMask: number) => boolean;
    /**
     * Define the pixel radius of the area within a shape point of a Navlink Feature can be moved by mouse/touch interaction.
     *
     * @deprecated geoFence not supported.
     * @defaultValue false - deactivated by default.
     */
    geoFence?: number | false;
    /**
     * Minimum distance in meters between two shape points for creating new Navlink Features.
     *
     * @defaultValue 2
     */
    minShapeDistance?: number;
    /**
     * If the distance (meters) between two shape-points of two separate Navlink features is smaller or equal than the "autoConnectShapeDistance",
     * the shape-points will be connected automatically.
     *
     * @defaultValue 2
     */
    autoConnectShapeDistance?: number;
    /**
     * Defines the coordinate precision for the automatic intersection detection.
     * Number of decimal points of the WGS coordinates that must match.
     *
     * @defaultValue 5
     */
    intersectionScale?: number;
    /**
     * Maximum variance for crossing candidate detection of Navlink Features in meters.
     *
     * @defaultValue 2
     */
    XTestMaxDistance?: number;
    /**
     * The distance in meters between the two shape-points when two Navlink Features get disconnected.
     *
     * @defaultValue 3
     */
    disconnectShapeDistance?: number;
    /**
     * Keep features selected after mapview-change or click on the "ground" of the map.
     * if set to false -\> will be cleared after viewport change and click on ground.
     * if set to "viewportChange" -\> will only be cleared on ground click.
     * if set to true -\> no clear at all.
     *
     * @defaultValue "viewportChange"
     */
    keepFeatureSelection?: string | boolean;
    /**
     * Select a feature by default on tap/pointerup event.
     *
     * @defaultValue true
     */
    featureSelectionByDefault?: boolean;
    /**
     * The maximum allowed distance of the "Routing Point" to the Address/Place itself in meters.
     *
     * @defaultValue 1000 - 1000 meters
     */
    maxRoutingPointDistance?: number;
    /**
     * Enable or disable "auto snap" to the existing Navlink network when a shape of a Navlink Feature has been dragged.
     *
     * @defaultValue false
     */
    autoSnapShape?: boolean;
    /**
     * Optional service settings.
     */
    services?: {
        /**
         * define reverseGeocoder service/functionality to request the address for a geographical position.
         */
        reverseGeocoder?: {
            /**
             * Get the iso country code for a geographical position.
             * If "getISOCC" is defined, the iso country code will be attached to all newly created features before sending to remote datasource.
             *
             * @example
             * ```typescript
             * {
             *     reverseGeocoder:
             *     {
             *         getISOCC(lon: number, lat: number, callback:(isocc:string)=>void){
             *             // do a reverse geocode request to get the isocc value
             *             const isocc = "theIsoCountryCode";
             *
             *             callback(isocc);
             *         }
             *     }
             * }
             * ```
             */
            getISOCC?(longitude: number, latitude: number, callback: (isoCC: string) => void): string | undefined;
        };
    };
    
}

/**
 * The Editor Properties give a more detailed insight into the current state of the feature.
 */
export declare interface EditorProperties {
    /**
     *  Creation timestamp of the feature, in milliseconds.
     */
    created: number | boolean;
    /**
     *  Timestamp when the feature has been modified/updated, otherwise false.
     */
    modified: number | boolean;
    /**
     *  Timestamp when the feature has been removed, otherwise false.
     */
    removed: number | boolean;
    /**
     *  Timestamp when the feature has been split, otherwise false.
     *  The property is on relevant for "Navlink" features.
     */
    split: number | boolean;
    /**
     *  True if this feature is currently selected, otherwise false.
     */
    selected: boolean;
    /**
     *  True if this feature is currently hovered, otherwise false.
     */
    hovered: boolean;
}

/**
 * A generic editable map feature with one of the following geometry types: 'Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'.
 * The Feature can be edited with the {@link Editor}.
 */
export declare class Feature extends Feature_3 {
    
    
    /**
     * The Properties of the feature
     */
    properties: FeatureProperties;
    
    /**
     * The Feature class of the feature.
     * The value must be one of "NAVLINK", "ADDRESS", "PLACE", "AREA" or "MARKER".
     */
    class: string;
    
    
    
    
    
    
    /**
     * Get default or current style of the feature.
     *
     * @deprecated - use layer.setStyleGroup instead
     * @defaultValue "default"
     * @param type - indicates which style to return. "default" -\> layer default style for the feature or the "current" applied style.
     *
     * @returns the style of the feature
     */
    style(type: 'default' | 'current'): Style[];
    /**
     * Apply style to the feature.
     *
     * @deprecated - use layer.setStyleGroup instead
     * @param style - the style to set for the feature
     */
    style(style: Style[]): any;
    /**
     * Get a deep copy of the properties of the feature
     */
    prop(): {
        [name: string]: any;
    };
    /**
     * Get the value of an specific property
     *
     * @param property - name of the property
     *
     * @returns the value of the specific property
     */
    prop(property: string): any;
    /**
     * Set the value for an specific property
     *
     * @param property - name of the property
     * @param value - the value that should be set for the property
     */
    prop(property: string, value: any): void;
    /**
     * Set one or more properties of the object.
     * @param properties - the properties object literal that should be merged with the existing properties.
     */
    prop(properties: {
        [name: string]: any;
    }): void;
    
    /**
     * Get the coordinate(s) of the feature.
     */
    coord(): GeoJSONCoordinate | GeoJSONCoordinate[] | GeoJSONCoordinate[][] | GeoJSONCoordinate[][][] | GeoJSONCoordinate[][][][];
    /**
     * Set the coordinate(s) of the feature.
     *
     * @param coordinates - the coordinates that should be set. The coordinates must match features geometry type.
     */
    coord(coordinates: GeoJSONCoordinate | GeoJSONCoordinate[] | GeoJSONCoordinate[][] | GeoJSONCoordinate[][][] | GeoJSONCoordinate[][][][]): any;
    /**
     * Define if the feature should be editable by the Editor module or not.
     *
     * @param editable - True, the feature can be edited, otherwise false.
     *
     * @deprecated
     * @example
     * ```
     * // prevent the feature from being modified by the editor module
     * object.editable(false);
     * ```
     */
    editable(editable: boolean): this;
    /**
     * Select and highlight the feature.
     * Selected features geometry is displayed and can easily be modified by mouse/touch interaction.
     */
    select(): void;
    /**
     * Unselect the feature.
     */
    unselect(): void;
    /**
     * Enable Transform Utility to allow easy geometry transformation of the feature (move/scale/rotate) by mouse/touch interaction.
     */
    transform(): void;
    /**
     * Remove the feature.
     */
    remove(): void;
}

/**
 * A FeatureContainer is a array-like collection of Features.
 * It enables editing operations to be carried out for all features of the FeatureContainer at the same time.
 */
declare interface FeatureContainer {
    /**
     *  The type of the container is 'CONTAINER'
     */
    type: 'CONTAINER';
    /**
     *  The number of features in the container
     */
    length: number;
    /**
     *  Add the given feature(s) to the container.
     *
     *  @param feature - The feature(s) to add to the end of the container.
     *  @param layer - layer the feature(s) should be added.
     *
     *  @returns length of the containing features
     *
     */
    push(feature: Feature | Feature[], layer?: TileLayer): number;
    /**
     * Executes a provided function once per container feature
     *
     * @param fnc - function to be called for the objects in container
     */
    forEach(fnc: (feature: Feature, index: number) => void): any;
    /**
     * Receive all Features of the Container as a native Array
     */
    toArray(): Feature[];
    /**
     * Highlights all features in the container
     */
    highlight(): any;
    /**
     * Removes all features of the container from the map.
     */
    remove(): any;
    /**
     * Enable the Transform Utility to allow easy geometry transformations (move/scale/rotate) of all the feature of the container by mouse/touch interaction.
     */
    transform(): any;
    /**
     * UnHighlight all features of the container
     */
    unHighlight(): any;
    /**
     * Pops out the last feature that has been added to the container
     *
     * @returns the last added Feature
     */
    pop(): Feature;
}

/**
 *  The properties of a editable Features.
 */
declare interface FeatureProperties {
    /**
     * generic key - value map / object literal.
     */
    [name: string]: any;
    /**
     *  Properties to indicate current state of this feature.
     */
    readonly '@ns:com:here:editor': EditorProperties;
}

/**
 * The Line Feature is a generic editable Feature with "LineString" geometry.
 * The Feature can be edited with the {@link Editor}.
 */
export declare class Line extends Feature {
    /**
     *  The feature class of a Line Feature is "LINE".
     */
    readonly class: 'LINE';
    /**
     * Add a new shape point / coordinate to the line.
     *
     * @param point - the coordinate to add
     * @param index - the index position in the coordinate array where the new shape point should be inserted.
     *
     * @returns index of the shape or false if shape could not be added
     */
    addShape(point: PixelPoint | GeoPoint, index?: number): boolean | number;
    /**
     * Get the geographical coordinate(s) of the Line feature.
     */
    coord(): [number, number, number?][];
    /**
     * Set the geographical coordinate(s) of the Line feature.
     *
     * @param coordinates - the geographical coordinates that should be set.
     */
    coord(coordinates: [number, number, number?][]): any;
}

/**
 * The LineShape represents a shape-point / coordinate of a Line feature.
 * The LineShape is only existing if the corresponding Line feature is "selected" and user based geometry editing with touch/mouse interaction is activated.
 * @see {@link Line.select}
 */
export declare class LineShape extends Feature_3 {
    
    /**
     * The feature class of a LineShape Feature is "LINE_SHAPE".
     */
    class: string;
    
    
    
    /**
     * Get the Line feature to which the LineShape belongs.
     *
     * @returns the Line feature
     */
    getLine(): Line;
    /**
     *  Get the total number of coordinates of the line
     *
     *  @returns Number of coordinates
     */
    getLength(): number;
    /**
     * Get the index of the shape point in the coordinates array of the respective Line feature.
     *
     * @returns The index of the shape point.
     */
    getIndex(): number;
    /**
     * Removes the shape point from the geometry of the Line feature.
     */
    remove(): void;
    
    
    
}

/**
 * @hidden
 */
declare class Location_2 extends Feature {
    
    
    /**
     *  Get the coordinate(s) of the feature.
     */
    coord(): GeoJSONCoordinate;
    /**
     *  Set the coordinate(s) of the feature.
     *
     *  @param coordinates - the coordinates that should be set.
     */
    coord(coordinate: GeoJSONCoordinate): any;
    
    /**
     *  Get the Navlink Feature that the feature is linked to/ associated with.
     *
     *  @returns The Navlink Feature or null if the feature is not linked to a Navlink (floating).
     */
    getLink(): Navlink | null;
}

/**
 * The Marker Feature is a generic editable Feature with "Point" geometry.
 * The Feature can be edited with the {@link Editor}.
 */
export declare class Marker extends Feature {
    /**
     *  The feature class of a Marker Feature is "MARKER".
     */
    readonly class: 'MARKER';
}

/** ********************************************************************************************************************/
/**
 * The Navlink Feature is a generic editable Feature with "LineString" geometry.
 * In addition to the Line Feature, the Navlink feature can be linked/associated with other Navlink Features.
 * A Navlink Feature also can be referenced by Addresses and Places.
 * A Navlink is part of a "road nertwork".
 *
 * The Feature can be edited with the {@link Editor}.
 */
export declare class Navlink extends Feature {
    /**
     * The feature class of an Navlink Feature is "NAVLINK".
     */
    readonly class: 'NAVLINK';
    /**
     * Get the geographical coordinate(s) of the Navlink feature.
     */
    coord(): [number, number, number?][];
    /**
     * Set the geographical coordinate(s) of the Navlink feature.
     *
     * @param coordinates - the geographical coordinates that should be set.
     */
    coord(coordinates: [number, number, number?][]): any;
    /**
     * Checks for possible crossing geometry with other Navlink features.
     *
     * @param option - options to configure the crossing check.
     *
     * @returns array of found crossings
     *
     * @example
     * ```typescript
     * crossing.checkCrossings({
     *    type: "CROSSING",
     *        styles: {
     *            connector1: {fill: 'black'},
     *            connector2: {stroke: '#FBF'}
     *        }
     * })
     * ```
     */
    checkCrossings(option: {
        /**
         * Class of the crossing to check for. If no class is defined 'CROSSING' and 'CROSSING_CANDIDATE' is checked for.
         */
        class?: 'CROSSING' | 'CROSSING_CANDIDATE';
        /**
         * Style of the crossings they should be displayed with. 6 configurable styling objects('connector1', 'connector2', 'connector3', 'search1', 'search2', 'found') comprise a crossing.
         */
        styles?: {
            connector1?: Style;
            connector2?: Style;
            connector3?: Style;
            search1?: Style;
            search2?: Style;
            found?: Style;
        };
    }): Crossing[];
    /**
     * Show or hide the direction hint on the Navlink feature.
     * If the function is called without arguments, the hint will be hidden.
     *
     * @param dir - direction of the Navlink, possible value: "BOTH"|"START_TO_END"|"END_TO_START"
     * @param hideShapes - indicates if the Start and End shapepoints of the Navlink should be displayed or not
     */
    showDirectionHint(dir?: 'BOTH' | 'START_TO_END' | 'END_TO_START', hideShapes?: boolean): void;
    /**
     * Sets the radius of the geofence.
     *
     * @deprecated - geofence not supported
     * @param radius - The geofence radius in pixel.
     *
     */
    setGeoFence: (radius: number) => void;
    /**
     * Add a new shape-point / coordinate to the Navlink.
     *
     * @param point - the coordinate of the new shape to add.
     * @param index - the index position in the coordinate array of the LineString where the new shape point should be inserted.
     *
     * @returns index of the shape or false if shape could not be added
     */
    addShape(point: GeoPoint | PixelPoint, index?: number): boolean;
    /**
     * Get connected Navlink Features for the node.
     * A node is either the Start or End coordinate of the Navlink (LineString) geometry.
     *
     * @param index - coordinate index for shape/node. 0 -\> "start node", or index of last coordinate for the "end node".
     *
     * @returns Array that's containing the connected Navlink Features.
     */
    getConnectedLinks(index: number): Navlink[];
    /**
     * Get connected Navlink Features for the node.
     * A node is either the Start or End coordinate of the Navlink (LineString) geometry.
     *
     * @param index - coordinate index for shape/node. 0 -\> "start node", or index of last coordinate for the "end node".
     * @param details - flag to enable detailed information of the connected Navlinks.
     *
     * @returns Array of detailed connected Navlink information including the shape/node index of connected link.
     */
    getConnectedLinks(index: number, details: true): {
        link: Navlink;
        index: number;
    }[];
    /**
     * Get the z-levels for the coordinates of the Navlink feature.
     *
     * @param index - the index of the shape to get z-level for the specific shape only
     *
     * @returns The Array of z-levels for the coordinates of the Navlink or the specific z-level at shape index.
     *
     */
    getZLevels(index?: number): number[] | number;
    /**
     * Set the z-levels for the coordinates of the Navlink Feature.
     * For each coordinate of the Navlink, the respective z-level must be provided.
     *
     * @param zLevels - The z-levels to be set for the coordinates of the Navlink.
     *
     * @example
     * ```
     * // modify the zLevel of the second coordinate.
     * let zlevels = navlink.getZLevels();
     * zlevels[1] = -4;
     * navlink.setZLevels(zlevels);
     * ```
     */
    setZLevels(zLevels: number[]): void;
    /**
     * Displays and allows editing of the "turn restrictions" for the node/shape-point at the "index" of the Navlink feature.
     * The index must be the respective index in the coordinates array of the first (0) or last coordinate of the Navlink.
     *
     * @param index - the index of the node to display the turn restrictions for.
     *
     * @returns the TurnRestrictionEditor for the respective shape/node.
     */
    editTurnRestrictions(index: number): TurnRestrictionEditor;
    /**
     * Displays and allows editing of all "turn restrictions" for the start and end node of the Navlink feature.
     *
     * @returns Array containing the TurnRestrictionEditor for the start-node and end-node (shape-points).
     */
    editTurnRestrictions(): TurnRestrictionEditor[];
    
    
    
    
}

/**
 * The NavlinkShape represents a shape-point / coordinate of a Navlink feature.
 * The NavlinkShape is only existing if the corresponding Navlink feature is "selected" and user based geometry editing with touch/mouse interaction is activated.
 * @see {@link Navlink.select}
 */
export declare class NavlinkShape extends Feature_3 {
    /**
     * The feature class of an NavlinkShape Feature is "NAVLINK_SHAPE".
     */
    class: 'NAVLINK_SHAPE';
    
    
    
    /**
     * Get the Navlink feature to which the NavlinkShape belongs.
     *
     * @returns the Navlink
     */
    getLink(): Navlink;
    /**
     * Checks if shape is start or end shape (Node) of the Navlink feature.
     *
     * @returns true if its start or end shape (Node), otherwise false
     */
    isNode(): boolean;
    /**
     * Checks if shape is overlapping with an existing shape/coordinate of another Navlink feature.
     *
     * @returns true if it overlaps with another shape, false otherwise.
     */
    isOverlapping(): any;
    /**
     * Get the index of the shape point in the coordinates array of the respective Navlink feature.
     *
     * @returns The index of the shape point.
     */
    getIndex(): number;
    /**
     * Show the turn restrictions of the shape and enable editing of the turn-restrictions.
     * Turn restrictions are only available if the shape is a node (start or end point) and part of an intersection with other Navlink features involved.
     */
    editTurnRestrictions(): TurnRestrictionEditor;
    /**
     * Get an array of Navlink features that are connected to this shape point.
     * Navlinks are "connected" with each other if they share the same coordinate location of start or end shape-point.
     *
     * @returns An array of Navlink Features with coordinates located at the same position as the shape.
     */
    getConnectedLinks(): Navlink[];
    /**
     * Removes the shape point from the geometry of the Navlink feature.
     */
    remove(): void;
    /**
     * Disconnect the Navlink from other connected Navlink features at this shape point.
     * The Intersection is resolved by moving the position of the shape(node).
     *
     * @see {@link EditorOptions.disconnectShapeDistance} to configure the default offset used for offsetting the shape in meters.
     */
    disconnect(): void;
    /**
     * Splits the Navlink at the position of the NavlinkShape into two new "child" Navlinks.
     * The coordinate of the NavlinkShape will be the start and end positions of the resulting Navlinks.
     * The "parent" Navlink itself gets deleted after the split operation is done.
     *
     * ```
     * @example
     * let links = shapePoint.splitLink();
     * ```
     *
     * @returns An array containing the two newly created Navlink features.
     */
    splitLink(): [Navlink, Navlink];
}

/**
 * The Place Feature is a generic editable Feature with "Point" geometry.
 * In addition to the Marker Feature, the Place feature can have a "routing point" located on a Navlink geometry.
 * A Place can be linked/associated with a Navlink Feature.
 *
 * The Feature can be edited with the {@link Editor}.
 *
 */
export declare class Place extends Location_2 {
    /**
     *  The feature class of a Place Feature is "PLACE".
     */
    readonly class: 'PLACE';
    
    /**
     *  Find the nearest routing point and assign it to the Place Feature.
     */
    createRoutingPoint(): void;
    /**
     *  Remove the existing routing point from the Place Feature.
     */
    removeRoutingPoint(): void;
    
    
    
    
}

declare function Transformer_2(HERE_WIKI: any): void;

/**
 * The TurnRestrictionEditor allows to visualize and edit all TurnRestrictions of an intersection.
 */
declare interface TurnRestrictionEditor {
    /**
     *  Show all turn restrictions of the road intersection.
     */
    show(): any;
    /**
     *  Hide all turn restrictions of the road intersection.
     */
    hide(): any;
    /**
     *  Indicates if TurnRestrictionEditor are displayed and editing by user interaction is enabled.
     */
    isActive(): boolean;
}

declare enum xClass {
    CROSSING = "CROSSING",
    CROSSING_CANDIDATE = "CROSSING_CANDIDATE"
}

/**
 * A zone represents a part/subsegment on a line geometry or multiple line geometries.
 * Its used by the ZoneSelector utility. {@link editor.ZoneSelector}
 */
declare interface Zone {
    /**
     * Optional identifier of the Zone
     */
    id?: string | number;
    /**
     * Side of the Zone. Relative to the direction of travel of the line geometry.
     * "L" | "R" | "B" -\> Left, Right or Both sides.
     *
     * @defaultValue "B"
     */
    side?: 'L' | 'R' | 'B';
    /**
     * Relative start position on the line geometry.
     * 0 -\> 0% -\> start, 0.5 -\> 50% -\> middle, 1 -\> 100% -\> end
     * @defaultValue 0.0
     */
    from?: number;
    /**
     * Relative end position on the line geometry.
     * 0.5 -\> 50% -\> middle, 1 -\> 100% -\> end
     * @defaultValue 1.0
     */
    to?: number;
    /**
     * lock the zone and prevent dragging/editing of the Zone.
     */
    locked?: boolean;
    /**
     * Apply custom styling of Zone.
     * Objects of key value pairs.
     */
    style?: any;
    /**
     * Set an event listener that will be called when a zone drag starts.
     *
     * @param event - The respective event.
     * The {@link Zone} is provided in the detail property of the event. (event.detail.zone)
     */
    dragStart?: (event: EditorEvent) => void;
    /**
     * Set an event listener that will be called when a zone is dragged.
     *
     * @param event - The respective event.
     * The {@link Zone} is provided in the detail property of the event. (event.detail.zone)
     */
    dragMove?: (event: EditorEvent) => void;
    /**
     * Set an event listener that will be called when a zone drag has been finished.
     *
     * @param event - The respective event.
     * The {@link Zone} is provided in the detail property of the event. (event.detail.zone)
     */
    dragStop?: (event: EditorEvent) => void;
    /**
     * A zone can consist of several segments.
     * A Segment provides detailed information on the affected Navlinks:
     * @example
     * ```
     * {
     *  navlink: Navlink;
     *  from: number;
     *  to: number;
     *  reversed: boolean;
     * }
     * ```
     */
    readonly segments?: ZoneSegment[];
    markerStyle?: any;
    lineStyle?: any;
}

/**
 * A ZoneSegment is the part of a "Zone" that's located at a specific Navlink.
 */
declare type ZoneSegment = {
    /**
     * The Navlink the ZoneSegment is located at.
     */
    navlink: Navlink;
    /**
     * Relative start position on the geometry of the Navlink.
     * 0 -\> 0% -\> start, 0.5 -\> 50% -\> middle, 1 -\> 100% -\> end
     */
    from: number;
    /**
     * Relative end position on the geometry of the Navlink.
     * 0.5 -\> 50% -\> middle, 1 -\> 100% -\> end
     */
    to: number;
    /**
     * The indicates if the direction of travel of the Navlink is in reverse order, compared to the direction of travel of the first Navlink that's has been added of the ZoneSelector.
     */
    reversed: boolean;
};

/**
 * The ZoneSelector is a tool to create and modify Zones on a single geometry or multiple line geometries.
 * A Zone represents a part/subsegment on a line geometry or multiple line geometries and allows separate attribution.
 */
declare class ZoneSelector {
    
    
    
    /**
     * Add Navlink(s) to ZoneSelector tool.
     *
     * @param links - a single or multiple Navlinks to add. Multiple Navlinks must be linked.
     *
     */
    add(navlink: Navlink | Navlink[]): void;
    /**
     * Add and show a Zone. A Zone can be located on a single or multiple Navlink(s).
     *
     * @param zone - The zone that should be displayed.
     */
    show(...zones: Zone[]): any;
    /**
     * hides all Zones and the Zoneselecor tool itself.
     */
    hide(): void;
    /**
     * detailed information about all zones and its segments.
     *
     * @returns An array of Zones providing detailed information for each Zone.
     */
    info(): Zone[];
    
}

export { }

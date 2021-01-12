/*
 * Copyright (C) 2019-2021 HERE Europe B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
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

import {JSUtils} from '@here/xyz-maps-common';
import {TileLayer} from '@here/xyz-maps-core';
import {Feature} from '@here/xyz-maps-editor';


/**
 * Options to configure the map editor ({@link editor.Editor}).
 */
interface EditorOptions {
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
     *     1  -> GEOMETRY CHANGE
     *     2  -> REMOVE
     *
     * @returns true -> Allow operation(s) and execute edits. false -> forbid operation(s). No edit gets executed.
     *
     * @default
     */
    editRestrictions?: (feature: Feature, restrictionMask: number) => boolean;

    /**
     * Define the pixel radius of the area within a shape point of a Navlink Feature can be moved by mouse/touch interaction.
     *
     * @deprecated
     * @default false - deactivated by default.
     */
    geoFence?: number | false;

    /**
     * Minimum distance in meters between two shape points for creating new Navlink Features.
     *
     * @default 2
     */
    minShapeDistance?: number;

    /**
     * If the distance (meters) between two shape-points of two separate Navlink features is smaller or equal than the "autoConnectShapeDistance",
     * the shape-points will be connected automatically.
     *
     * @optional
     * @default 2
     */
    autoConnectShapeDistance?: number;

    /**
     * Defines the coordinate precision for the automatic intersection detection.
     * Number of decimal points of the WGS coordinates that must match.
     *
     * @default 5
     */
    intersectionScale?: number;

    /**
     * Maximum variance for crossing candidate detection of Navlink Features in meters.
     *
     * @default 2
     */
    XTestMaxDistance?: number;


    /**
     * The distance in meters between the two shape-points when two Navlink Features get disconnected.
     *
     * @default 3
     */
    disconnectShapeDistance?: number;

    /**
     * Keep features selected after mapview-change or click on the "ground" of the map.
     * if set to false -> will be cleared after viewport change and click on ground.
     * if set to "viewportChange" -> will only be cleared on ground click.
     * if set to true -> no clear at all.
     *
     * @default "viewportChange"
     */
    keepFeatureSelection?: string | boolean;

    /**
     * Select a feature by default on tap/pointerup event.
     *
     * @default true
     */
    featureSelectionByDefault?: boolean;

    /**
     * The maximum allowed distance of the "Routing Point" to the Address/Place itself in meters.
     *
     * @default 1000 - 1000 meters
     */
    maxRoutingPointDistance?: number;

    /**
     * Enable or disable "auto snap" to the existing Navlink network when a shape of a Navlink Feature has been dragged.
     *
     * @default false
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
             * ```
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
        }
    };

    enableHover: boolean;

    destination: string;

    debug: boolean;
};


const defaultOptions: EditorOptions = {
    'debug': true,
    'editRestrictions': function() {
        // NO RESTRICTIONS PER DEFAULT FOR NOW
        return false;
        //    var restrictions = properties['protected'] ? 3 : 0;
        //    return !!(restrictions & checkMask);
    },
    'services': {
        'reverseGeocoder':
            {
                //  'getISOCC': function(lon, lat, callback){
                //      return 'ISOCC';
                //  }
            }

    },
    'destination': (function getBasePath(name) {
        if (!(name instanceof Array)) name = [name];
        const scripts = document.getElementsByTagName('script');
        const tlc = 'toLowerCase';
        let path = '';
        for (let k = 0; k < name.length; k++) {
            for (let i = scripts.length - 1; i >= 0; --i) {
                const src = scripts[i].src[tlc]();
                const index = src.indexOf(name[k][tlc]());
                if (index >= 0) {
                    path = src.substr(0, index);
                    return path;
                }
            }
        }
        return path;
    })(['mapedit.js']),

    'geoFence': false,
    'minShapeDistance': 2, // 4meters
    // 'minShapeDistance': 4e-5, // 4meters
    'autoConnectShapeDistance': 2,
    // 'ShapeSnapTolerance': 4e-5, //8
    'intersectionScale': 5,
    'XTestMaxDistance': 2,
    'disconnectShapeDistance': 3,
    'keepFeatureSelection': 'viewportChange',
    'featureSelectionByDefault': true,
    'enableHover': true,
    'maxRoutingPointDistance': 1000,
    'autoSnapShape': false
};


const mergeOptions = (options): EditorOptions => {
    const merged = JSUtils.extend(true, {}, defaultOptions);

    for (const c in options) {
        switch (c) {
        case 'services':
            JSUtils.extend(true, merged[c], options[c]);
            break;

        case 'editRestrictions':
            if (typeof options[c] !== 'function') {
                break;
            }

        default:
            merged[c] = options[c];
        }
    }

    return merged;
};


export {defaultOptions, EditorOptions, mergeOptions};

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

import {GeoPoint, TileLayer} from '@here/xyz-maps-core';

/**
 *  Configuration of map display.
 */
export interface MapOptions {
    /**
     * Configure visibility and position of ui components
     */
    ui?: {}
    /**
     * zoomlevel of the map.
     *
     * @default 18
     */
    zoomlevel?: number
    /**
     * Center coordinate of the map.
     *
     * @default {longitude: 8.534, latitude: 50.162}
     */
    center?: GeoPoint
    /**
     * add layers to display.
     *
     */
    layers?: TileLayer[]
    /**
     * maximum zoomlevel of displaying the map overlay
     *
     * @default 20
     */
    maxLevel?: number
    /**
     * minimum zoomlevel of displaying the map overlay
     *
     * @default 2
     */
    minLevel?: number
    /**
     * enable or disable debug tile grid
     *
     * @default false
     */
    debug?: boolean
    /**
     * minimum threshold in pixel for enabling pan map gesture
     *
     * @default 4
     */
    minPanMapThreshold?: number

    /**
     *  Behavior options of the map.
     *  Allow user to "drag" / "rotate" / "pitch" or "zoom" the map by mouse/touch interaction.
     *
     *  "drag" / "rotate" and "pitch" are booleans indicating if user interaction is possible or not.
     *  Possible values for "zoom" property are
     */
    behavior?: {
        /**
         * configure map zoom behavior:
         *  - false: disable zoom
         *  - true: enable zoom ("float")
         *  - "fixed": fixed zoom animation to next integer zoomlevel. floating zoomlevels are not allowed (eg 14.4)
         *  - "float": allow floating zoomlevels [default]
         * @default 'float'
         */
        zoom?: true | false | 'fixed' | 'float',
        /**
         * enable or disable dragging the map
         * @default true
         */
        drag?: boolean;
        /**
         * enable or disable pitching the map
         * @default false
         */
        pitch?: boolean;
        /**
         * enable or disable rotating the map
         * @default falses
         */
        rotate?: boolean;
    }
    /**
     * initial rotation of the map in degree.
     *
     * @default 0
     */
    rotate?: number
    /**
     * initial pitch (tilt) of the map in degree.
     *
     * @default 0
     */
    pitch?: number

    zoomAnimationMs?: number

    maxPitch?: number
};

export const defaultOptions: MapOptions = {

    ui: {},

    behavior: {
        drag: true,
        pitch: false,
        rotate: false
    },

    rotate: 0,
    pitch: 0,
    zoomlevel: 18,
    center: {longitude: 8.534, latitude: 50.162},
    layers: null,
    maxLevel: 20,
    minLevel: 2,
    debug: false,
    minPanMapThreshold: 4,
    zoomAnimationMs: 100,
    maxPitch: 50
};

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

import {TileLayer} from '@here/xyz-maps-core';

const NULL = null;

/**
 * The EditorEvent represents an event which takes place in the editor.
 * An event can be triggered by user interaction e.g. tapping on the map, or generated to represent the progress of an asynchronous task.
 */
export class EditorEvent {
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
    readonly target?: any;

    /**
     * optional event detail data depending on the type of the event.
     */
    readonly detail: {
        /**
         * the layer the event relates to.
         */
        layer?: TileLayer;
    };

    constructor(type: string, mapX, mapY, nativeEvent, button, target, detail) {
        this.type = type;

        this.timeStamp = Date.now();

        this.mapX = mapX;

        this.mapY = mapY;

        this.nativeEvent = nativeEvent;

        this.button = button;

        this.target = target;

        this.detail = detail;
    }
}


const EvProto = <any>EditorEvent.prototype;

EvProto.nativeEvent = NULL;

EvProto.detail = NULL;

EvProto.target = NULL;

EvProto.mapX = NULL;

EvProto.mapY = NULL;

EvProto.type = NULL;

EvProto.button = NULL;

EvProto.timeStamp = NULL;

EvProto.toString = function() {
    return 'EditorEvent ' + this.type;
};


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

/**
 *  A class representing a point in pixel.
 *
 *  @class
 *  @public
 *  @expose
 *  @constructor
 *  @param x {number} pixel coordinate on x axis
 *  @param y {number} pixel coordinate on y axis
 *  @name here.xyz.maps.pixel.Point
 */
export class PixelPoint {
    constructor(x: number, y: number) {
        this.x = x;

        this.y = y;
    }

    /**
     *  x coordinate in pixel.
     *
     *  @public
     *  @expose
     *  @type {number}
     *  @name here.xyz.maps.pixel.Point#x
     */
    x: number;

    /**
     *  y coordinate in pixel.
     *
     *  @public
     *  @expose
     *  @type {number}
     *  @name here.xyz.maps.pixel.Point#y
     */
    y: number;
}

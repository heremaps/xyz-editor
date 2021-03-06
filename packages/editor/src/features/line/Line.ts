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

import {Feature} from '../feature/Feature';
import tools from './LineTools';
import {GeoPoint, PixelPoint} from '@here/xyz-maps-core';

const throwError = (msg) => {
    throw new Error(msg);
};

/**
 * The Line Feature is a generic editable Feature with "LineString" geometry.
 * The Feature can be edited with the {@link Editor}.
 */
class Line extends Feature {
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
    addShape(point: PixelPoint | GeoPoint, index?: number): boolean | number {
        const line = this;
        const coordinate = line._e().map.getGeoCoord(point);

        if (!coordinate) {
            throwError('Invalid coordinate');
            return false;
        } else if (index = tools.addCoord(line, coordinate, index)) {
            tools.markAsModified(line);
        }
        return index;
    }

    /**
     * Get the geographical coordinate(s) of the Line feature.
     */
    coord(): [number, number, number?][];
    /**
     * Set the geographical coordinate(s) of the Line feature.
     *
     * @param coordinates - the geographical coordinates that should be set.
     */
    coord(coordinates: [number, number, number?][]);

    coord(coordinates?: [number, number, number?][]): [number, number, number?][] {
        return super.coord(coordinates);
    }
}

(<any>Line).prototype.class = 'LINE';

export {Line};

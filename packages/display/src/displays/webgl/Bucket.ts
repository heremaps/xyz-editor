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

import GLTile from './GLTile';
import BasicBucket from '../BasicBucket';
import {LRU} from '@here/xyz-maps-common';
import {GeometryBuffer} from './buffer/GeometryBuffer';


class Bucket extends BasicBucket {
    onDrop: (data: GeometryBuffer[], layerIndex: number) => void | null;

    tiles: LRU<GLTile>;

    constructor(size: number) {
        super(size);
    }

    create(quadkey: string, layers: any[]): GLTile {
        const {tiles, onDrop} = this;
        let tile = tiles.get(quadkey);
        let dropTile;
        let dropData;

        if (!tile) {
            tile = new GLTile(quadkey, layers, onDrop);

            dropTile = tiles.set(quadkey, tile);

            if (dropTile && (dropData = dropTile.data)) {
                for (let i = 0; i < dropData.length; i++) {
                    dropTile.setData(i, null);
                    dropTile.preview(i, null);
                }
                dropTile.data = null;
            }
        }
        return tile;
    }

    // get(quadkey: string, skipTrack: boolean): GLTile | null {
    //     return
    // }
}

export default Bucket;

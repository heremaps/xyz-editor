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

import {Tile, tileUtils} from '@here/xyz-maps-core';
import Display from './Display';
import {Attribute} from './buffer/Attribute';
import {Layer} from '../Layers';
import {FlexAttribute} from './buffer/templates/TemplateBuffer';

type BBox = { minX: number, maxX: number, minY: number, maxY: number };
type Collision = { rendered: any[]; neighbours: BBox[] }


export class CollisionHandler {
    tiles: Map<string, Collision>;

    tileCollision: Collision;
    updated: boolean;

    private display: Display;
    private layerIndex: number;

    constructor(display) {
        this.tiles = new Map();
        this.display = display;
    }

    private intersects(box1: BBox, data: BBox[], i: number = 0) {
        // for (let bbox2 of data) {
        for (let len = data.length, bbox2; i < len; i++) {
            bbox2 = data[i];
            if (bbox2 != null &&
                box1.minX <= bbox2.maxX && bbox2.minX <= box1.maxX && box1.minY <= bbox2.maxY && bbox2.minY <= box1.maxY) {
                return true;
            }
        }
    }

    removeLayer(index: number) {
        this.tiles.forEach((collisionTile) => {
            const {rendered} = collisionTile;
            let i = rendered.length;
            let r;

            while (r = rendered[--i]) {
                if (r.li > index) {
                    r.li--;
                }
            }
        });
    }

    init(quadkey: string, tileX: number, tileY: number, tileZ: number, layer: Layer) {
        // console.time(quadkey);

        let collisionData = this.tiles.get(quadkey);

        if (!collisionData) {
            const neighbours = [];

            for (let y = -1; y < 2; y++) {
                for (let x = -1; x < 2; x++) {
                    if (x != 0 || y != 0) {
                        let qk = tileUtils.tileXYToQuadKey(tileZ, tileY + y, tileX + x);
                        // let dtile = <GLTile> this.display.buckets.get(qk, true);
                        // let qk = tileUtils.tileXYToQuadKey(tile.z, tile.y + y, tile.x + x);
                        // let neighbour = provider.getCachedTile(qk);
                        // if (neighbour && neighbour.collision) {
                        //     let ren = neighbour.collision.rendered;
                        let collisions = this.tiles.get(qk);
                        if (collisions) {
                            let ren = collisions.rendered;
                            for (let o of ren) {
                                neighbours[neighbours.length] = o;
                            }
                        }
                    }
                }
            }

            this.tiles.set(quadkey, collisionData = {
                rendered: [],
                neighbours: neighbours
            });
        }

        // this.pending.length;

        this.tileCollision = collisionData;

        this.layerIndex = layer.index;

        this.updated = false;
    }

    collides(
        cx: number,
        cy: number,
        width: number,
        height: number,
        tile: Tile,
        tileSize: number,
        bufferOffsetStart: number,
        bufferOffsetEnd: number,
        attributeBuffer: Attribute | FlexAttribute,
        priority: number = Number.MAX_SAFE_INTEGER
    ) {
        // const estimatedTextWidth = fontInfo.getTextWidth(text);
        // const estimatedTextWidth = fontInfo.avgCharWidth * text.length / 2;
        let tileX = tile.x * tileSize;
        let tileY = tile.y * tileSize;
        const collisionInfo = this.tileCollision;
        const rendered = collisionInfo.rendered;
        const x1 = tileX + cx - width;
        const x2 = tileX + cx + width;
        const y1 = tileY + cy - height;
        const y2 = tileY + cy + height;

        // align to 512er tile-grid
        if (tileSize == 256) {
            cx -= (tile.x * .5 ^ 0) * 512 - tileX;
            cy -= (tile.y * .5 ^ 0) * 512 - tileY;
            // tileX = (tile.x * .5 ^ 0) * 512;
            // tileY = (tile.y * .5 ^ 0) * 512;
        }

        const bbox = {
            minX: x1,
            maxX: x2,
            minY: y1,
            maxY: y2,
            // tileX: tileX,
            // tileY: tileY,
            cx: cx,
            cy: cy,
            bos: bufferOffsetStart,
            boe: bufferOffsetEnd,
            li: this.layerIndex,
            attr: attributeBuffer,
            priority: priority
        };

        this.updated = true;

        if (this.intersects(bbox, rendered) || this.intersects(bbox, collisionInfo.neighbours)) {
            return true;
        }

        rendered.push(bbox);
    }

    private rx: number;
    private rz: number;
    private s: number;

    enforce() {
        if (this.updated) {
            // force next update
            this.rx = this.rz = this.s = null;
        }
    }

    clear(quadkey: string, layerIndex: number) {
        const cInfo = this.tiles.get(quadkey);

        if (cInfo) {
            let empty = true;
            for (let i = 0; i < cInfo.rendered.length; i++) {
                let r = cInfo.rendered[i];
                if (r) {
                    if (r.li == layerIndex) {
                        cInfo.rendered[i] = null;
                    } else {
                        empty = false;
                    }
                }
            }

            if (empty) {
                this.tiles.delete(quadkey);
            }
        }
    }

    update(tiles, rotX: number, rotZ: number, scale: number) {
        if (!(this.rx != rotX || this.rz != rotZ || this.s != scale)) {
            // no view changes.. no need to recalculate collision
            return;
        }

        this.rx = rotX;
        this.rz = rotZ;
        this.s = scale;

        console.time('update-collisions');

        const {display} = this;
        let rendered = [];

        for (let screentile of tiles) {
            let quadkey = screentile.quadkey;

            let collisions = this.tiles.get(quadkey);

            if (collisions) {
                for (let i = 0, _rendered = collisions.rendered; i < _rendered.length; i++) {
                    let bbox = _rendered[i];

                    // could have been cleared because of LRU drop or layer removed
                    if (!bbox) continue;

                    let attribute = bbox.attr;

                    if (attribute) {
                        let {minX, maxX, minY, maxY} = bbox;
                        let halfWidth = (maxX - minX) * .5;
                        let halfHeight = (maxY - minY) * .5;
                        let screenX = screentile.x + bbox.cx;
                        let screenY = screentile.y + bbox.cy;
                        // let screenX = screentile.x + minX - bbox.tileX + halfWidth;
                        // let screenY = screentile.y + minY - bbox.tileY + halfHeight;
                        let ac = display.project(screenX, screenY, 0, 0); // 0,0 for unscaled world pixels

                        rendered.push({
                            minX: ac[0] - halfWidth, // minX
                            maxX: ac[0] + halfWidth, // maxX
                            minY: ac[1] - halfHeight, // minY
                            maxY: ac[1] + halfHeight, // maxY
                            bos: bbox.bos,
                            boe: bbox.boe,
                            attr: attribute,
                            priority: bbox.priority
                        });
                    }
                }
            }
        }

        let r = 0;
        // sort by collision priority
        rendered.sort((a, b) => b.priority - a.priority);

        while (r < rendered.length) {
            let bbox = rendered[r];
            let attribute = bbox.attr;
            let {data, size} = attribute;
            let i = bbox.bos;
            let stop = bbox.boe;
            let visible = (data[i] & 1) == 1;
            let intersects = this.intersects(bbox, rendered, ++r);

            if (
                // hide all glyphs
                (intersects && visible) ||
                // show all glyphs again (previously hidden)..
                (!intersects && !visible)
            ) {
                while (i < stop) {
                    data[i] ^= 1; // toggle LSB
                    i += size;
                }
                attribute.dirty = true;
            }
        }

        console.timeEnd('update-collisions');
    }
}

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

import {Tile} from '@here/xyz-maps-core';
import {PixelCoordinateCache} from './LineFactory';
import {isInBox, intersectBBox} from '../../../geometry';

export type Cap = 'round' | 'butt' | 'square';
export type Join = 'round' | 'bevel' | 'miter' | 'none';

const CAP_JOIN_ROUND = 'round';
const CAP_BUTT = 'butt';
const CAP_SQUARE = 'square';
const JOIN_MITER = 'miter';
const JOIN_BEVEL = 'bevel';
const SCALE = 8192;
// const SCALE = 1;

export const isOnTileBounds = (x1: number, y1: number, x2: number, y2: number, tileSize: number, tolerance: number = 1): boolean => {
    return (
        // onTileTop
        Math.abs(y1) < tolerance && Math.abs(y2) < tolerance ||
        // onTileRight
        Math.abs(x1 - tileSize) < tolerance && Math.abs(x2 - tileSize) < tolerance ||
        // onTileBottom
        Math.abs(y1 - tileSize) < tolerance && Math.abs(y2 - tileSize) < tolerance ||
        // onTileLeft
        Math.abs(x1) < tolerance && Math.abs(x2) < tolerance
    );
};


const normalize = (p) => {
    let x = p[0];
    let y = p[1];
    let len = x * x + y * y;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        // len = 127 / Math.sqrt(len);
        // len = SCALE / Math.sqrt(len);
        // len = 32767 / Math.sqrt(len);
        p[0] = x * len;
        p[1] = y * len;
    }
    return p;
};

const addCap = (cap: Cap, x: number, y: number, nx: number, ny: number, vertex: number[], normal: number[], dir = 1) => {
    if (cap == CAP_JOIN_ROUND) {
        vertex.push(x, y, x, y, x, y);

        nx *= Math.SQRT2 * dir;
        ny *= Math.SQRT2 * dir;

        normal.push(
            nx << 1 | 0, ny << 1 | 1, nx << 1 | 0, ny << 1 | 1, // p1.1
            nx << 1 | 1, ny << 1 | 0, nx << 1 | 1, ny << 1 | 0, // p1.2
            ny << 1 | 1, nx << 1 | 1, ny << 1 | 1, nx << 1 | 1 // p1.0
        );
    } else if (cap == CAP_SQUARE) {
        // -----------
        // | \       |
        // |   \     |
        // |     \   |
        // |       \ |
        // -----------
        vertex.push(x, y, x, y, x, y, x, y, x, y, x, y);

        let sqNx = ny - nx;
        let sqNy = nx + ny;

        normal.push(
            nx << 1 | 0, ny << 1 | 1, 0, 0, // p1.2
            sqNy << 1 | 1, sqNx << 1 | 0, 0, 0, // p1.0
            nx << 1 | 1, ny << 1 | 0, 0, 0, // p1.1

            sqNx << 1 | 1, sqNy << 1 | 1, nx << 1 | 1, ny << 1 | 1, // p1.0
            sqNy << 1 | 1, sqNx << 1 | 0, nx << 1 | 1, ny << 1 | 1, // p1.0
            nx << 1 | 0, ny << 1 | 1, 0, 0, // p1.2
        );
    }
};

const addLineString = (
    vertex: number[],
    normal: number[],
    coordinates: PixelCoordinateCache,
    tile: Tile,
    tileSize: number,
    removeTileBounds: boolean,
    cap: Cap,
    join: Join,
    strokeWidth: number,
    lengthToVertex?: number[],
    offset?: number,
    relStart = 0,
    relStop = 0
) => {
    strokeWidth *= .5;

    const totalLineLength = coordinates.lineLength;
    let absStart = relStart * totalLineLength;
    let absStop = relStop * totalLineLength;
    let _inside = true;
    let length = 0;
    let pixels = coordinates.data;
    let vLength = coordinates.length;
    let cuSegIndex = null;
    let _x;
    let _y;
    let c;

    if (absStart && absStop && relStop < relStart) {
        const flip = absStart;
        absStart = absStop;
        absStop = flip;
    }

    if (offset) {
        cap = CAP_BUTT;
        // line offset currently only works with none or meter joins
        if (join != 'none') {
            join = JOIN_MITER;
            // return addSegments(vertex, normal, pixels, 0, vLength, tile, tileSize,
            //     cap, join, strokeWidth, lengthToVertex, length, absStart, absStop, offset
            // );
        }
    }
    if (lengthToVertex) {
        cap = 'butt';
        if (!offset) {
            // keep meter join for offset dashed lines
            join = 'none';
        }
    }

    for (c = 0; c < vLength; c += 2) {
        let x = pixels[c];
        let y = pixels[c + 1];
        let inside = isInBox(x, y, 0, 0, tileSize, tileSize);

        if (inside) {
            if (!_inside) {
                cuSegIndex = c - 2;
            } else {
                if (cuSegIndex == null) {
                    cuSegIndex = c;
                }
            }
        } else if (c) {
            if (_inside) {
                length = addSegments(vertex, normal, pixels, cuSegIndex, c + 2, tile, tileSize,
                    cap, join, strokeWidth, lengthToVertex, length, absStart, absStop, offset
                );
                cuSegIndex = null;
            } else {
                // check for tile intersection
                let minX = x;
                let maxX = _x;
                let minY = y;
                let maxY = _y;

                if (_x < x) {
                    minX = _x;
                    maxX = x;
                }
                if (_y < y) {
                    minY = _y;
                    maxY = y;
                }

                if (intersectBBox(minX, maxX, minY, maxY, 0, tileSize, 0, tileSize) &&
                    (!removeTileBounds || !isOnTileBounds(_x, _y, x, y, tileSize))
                ) {
                    length = addSegments(vertex, normal, pixels, c - 2, c + 2, tile, tileSize,
                        cap, join, strokeWidth, lengthToVertex, length, absStart, absStop, offset
                    );

                    cuSegIndex = null;
                } else if (lengthToVertex || relStart || relStop) {
                    let dx = _x - x;
                    let dy = _y - y;
                    length += Math.sqrt(dx * dx + dy * dy);
                }
            }
        }
        _inside = inside;
        _x = x;
        _y = y;
    }

    if (cuSegIndex != null) {
        addSegments(vertex, normal, pixels, cuSegIndex, c, tile, tileSize,
            cap, join, strokeWidth, lengthToVertex, length, absStart, absStop, offset
        );
    }
};

const addSegments = (
    vertex: number[],
    normal: number[],
    coordinates: Float32Array,
    start,
    end,
    tile: Tile,
    tileSize: number,
    cap: Cap,
    join: Join,
    strokeWidth: number,
    lengthToVertex?: number[],
    lengthSoFar: number = 0,
    absStart?: number,
    absStop?: number,
    offset?: number
) => {
    let vLength = end;
    let x1 = coordinates[start];
    let y1 = coordinates[start + 1];
    let prevNUp;
    let prevNDown;
    let curJoin;
    let x2;
    let y2;
    let dx;
    let dy;
    let nx;
    let ny;
    let x3 = null;
    let y3 = null;
    let ex;
    let ey;
    let prevEx;
    let prevEy;
    let nUp;
    let p1Up;
    let p2Up;
    let nDown;
    let p1Down;
    let p2Down;
    let prevBisectorExceeds;
    let prevBisectorLength = 0;
    let prevLeft;
    let nextDx = null;
    let nextDy = null;
    let nextNx = null;
    let nextNy = null;
    let first = null;
    let prevX2 = null;
    let prevY2 = null;
    let prevJoin;
    let n;

    if (absStop && absStop < lengthSoFar) {
        // we can skip because of absolute stop.
        return lengthSoFar;
    }


    for (let c = start + 2; c < vLength; c += 2) {
        x2 = coordinates[c];
        y2 = coordinates[c + 1];

        let last = c == vLength - 2;
        let left;
        let nextNormal = null;
        let bisectorExceeds = false;
        let bisectorLength;

        curJoin = join;

        dx = x1 - x2;
        dy = y1 - y2;

        n = normalize([dx, dy]);
        nx = n[1];
        ny = n[0];


        first = first == null;


        length = Math.sqrt(dx * dx + dy * dy);

        let totalSegmentLength = length;
        let prevLengthSoFar = lengthSoFar;

        // length so far including current segment
        lengthSoFar += length;

        if (absStop) {
            if (absStop < lengthSoFar) {
                if (absStop > prevLengthSoFar) {
                    const relStopSegment = (absStop - prevLengthSoFar) / totalSegmentLength;

                    x2 = x1 - dx * relStopSegment;
                    y2 = y1 - dy * relStopSegment;

                    length *= relStopSegment;

                    // if (offset) {
                    //     // optimize if relative stop position is located in dead section of offset line..
                    //     // ..and line would run in opposite direction
                    //     const relStartSegment = (absStart - prevLengthSoFar) / totalSegmentLength;
                    //     // start is not on same segment
                    //     if (relStartSegment < 0) {
                    //         if (prevLeft) {
                    //             if (length + offset < 0) return prevLengthSoFar;
                    //         } else {
                    //             if (length + offset > 0) return prevLengthSoFar;
                    //         }
                    //     }
                    // }

                    last = true;
                    // we can skip the following coordinates
                    vLength = 0;
                }
            }
        }


        if (absStart) {
            if (absStart < lengthSoFar) {
                if (absStart > prevLengthSoFar) {
                    const relStartSegment = (absStart - prevLengthSoFar) / totalSegmentLength;
                    x1 = x1 - dx * relStartSegment;
                    y1 = y1 - dy * relStartSegment;

                    length *= (1 - relStartSegment);
                    first = true;
                }
            } else {
                x1 = x2;
                y1 = y2;
                continue;
            }
        }


        if (first && last) {
            // single segment line -> we can skip joins
            join = 'none';
        }

        //          p1.1                        p2.1
        //         / *---------------------------* \
        //       /   ^             ^             |   \
        //      /    |n1           |n            |     \
        //     /     |             |             |      \
        // p1.0 --- p1 ------------------------- p2 --- p2.0
        //     \     |                           |     /
        //      \    |n2                         |    /
        //       \   v                           |   /
        //         \ *---------------------------* /
        //          p1.2                        p2.2


        if (!last) {
            x3 = coordinates[c + 2];
            y3 = coordinates[c + 3];
            nextDx = x2 - x3;
            nextDy = y2 - y3;
            nextNormal = normalize([nextDx, nextDy]);
            nextNx = nextNormal[1];
            nextNy = nextNormal[0];

            ex = nextNx + nx;
            ey = -nextNy - ny;

            left = dx * nextDy - dy * nextDx < 0;
            // left = -nx * nextDx + ny * nextDy <0;

            const bisector = [ex, ey];
            // dot product
            bisectorLength = 1 / (bisector[0] * nx - bisector[1] * ny);

            if (bisectorLength == Infinity) {
                // parallel
                bisectorExceeds = true;
                ex = 2;
                ey = 2;
            } else {
                // if angle is to sharp and bisector length goes to infinity we cut the cone
                // bisectorLength > 10 behaves exactly like canvas2d..
                // ..but we cut earlier to prevent "cone explosion"
                if (join == JOIN_MITER) {
                    if (bisectorLength > 2) {
                        curJoin = JOIN_BEVEL;
                    }
                }

                ex = bisector[0] * bisectorLength;
                ey = bisector[1] * bisectorLength;

                // >2 -> >90deg
                let b = Math.sqrt(ex * ex + ey * ey) / 2;
                bisectorExceeds = b > 1;

                if (bisectorExceeds) {
                    ex /= b;
                    ey /= b;
                }
            }

            ex *= -SCALE;
            ey *= -SCALE;
        }

        nx *= SCALE;
        ny *= SCALE;

        nUp = [-nx << 1 | 1, ny << 1 | 1];
        nDown = [nUp[0] ^ 1, nUp[1] ^ 1];

        p1Down = nDown;
        p2Down = nDown;
        p1Up = nUp;
        p2Up = nUp;

        if (join != 'none') {
            if (!last && curJoin == JOIN_MITER && vLength > 4) {
                p2Down = [ex << 1 | 0, ey << 1 | 0];
                p2Up = [ex << 1 | 1, ey << 1 | 1];
            }

            if (!first && !prevBisectorExceeds) {
                if (prevLeft) {
                    p1Up = [prevEx << 1 | 1, prevEy << 1 | 1];
                    if (join == 'miter') {
                        p1Down = [prevEx << 1 | 0, prevEy << 1 | 0]; // miter
                    }
                } else {
                    p1Down = [prevEx << 1 | 0, prevEy << 1 | 0];
                    if (join == 'miter') {
                        p1Up = [prevEx << 1 | 1, prevEy << 1 | 1]; // miter
                    }
                }
            }


            if (!bisectorExceeds && !last) {
                if (join != JOIN_MITER) {
                    let aEx = strokeWidth * ex / -SCALE;
                    let aEy = strokeWidth * ey / -SCALE;

                    if (left) {
                        aEx *= -1;
                        aEy *= -1;
                    }

                    let s = n[0] * aEx + n[1] * aEy;

                    if (length < s) {
                        bisectorExceeds = true;
                    } else if (left) {
                        p2Up = [ex << 1 | 1, ey << 1 | 1];
                    } else {
                        p2Down = [ex << 1 | 0, ey << 1 | 0];
                    }
                }
            }


            if ((!first || last) && lengthSoFar) {
                if (join == CAP_JOIN_ROUND) {
                    if (prevLeft) {
                        // Cone
                        // 1---2
                        //  \ /
                        //   3
                        normal.push(
                            prevNDown[0], prevNDown[1], prevNDown[0], prevNDown[1],
                            p1Down[0], p1Down[1], p1Down[0], p1Down[1],
                            prevEx << 1 | 0, prevEy << 1 | 0, prevEx << 1 | 0, prevEy << 1 | 0
                        );
                    } else {
                        // Cone
                        //   1
                        //  / \
                        // 3---2
                        normal.push(
                            prevEx << 1 | 1, prevEy << 1 | 1, prevEx << 1 | 1, prevEy << 1 | 1,
                            p1Up[0], p1Up[1], p1Up[0], p1Up[1],
                            prevNUp[0], prevNUp[1], prevNUp[0], prevNUp[1]
                        );
                    }

                    vertex.push(prevX2, prevY2, prevX2, prevY2, prevX2, prevY2);
                }

                if (!first) {
                    if (!prevBisectorExceeds) {
                        if (join != JOIN_MITER) {
                            let an = normalize([prevEx, prevEy]); // alias normal
                            an[0] *= SCALE;
                            an[1] *= SCALE;

                            if (prevLeft) {
                                //   1
                                //  / \
                                // 3---2
                                if (join == JOIN_BEVEL) {
                                    // allow antialias for bevel join
                                    normal.push(
                                        prevEx << 1 | 1, prevEy << 1 | 1, an[0] << 1 | 1, an[1] << 1 | 1,
                                        p1Down[0], p1Down[1], an[0] << 1 | 0, an[1] << 1 | 0,
                                        prevNDown[0], prevNDown[1], an[0] << 1 | 0, an[1] << 1 | 0
                                    );
                                } else {
                                    normal.push(
                                        prevEx << 1 | 1, prevEy << 1 | 1, an[0] << 1 | 1, an[1] << 1 | 1,
                                        p1Down[0], p1Down[1], p1Down[0], p1Down[1],
                                        prevNDown[0], prevNDown[1], prevNDown[0], prevNDown[1]
                                    );
                                }
                            } else {
                                // 3---1
                                //  \ /
                                //   2
                                if (join == JOIN_BEVEL) {
                                    // allow antialias for bevel join
                                    normal.push(
                                        p1Up[0], p1Up[1], an[0] << 1 | 1, an[1] << 1 | 1,
                                        prevEx << 1 | 0, prevEy << 1 | 0, an[0] << 1 | 0, an[1] << 1 | 0,
                                        prevNUp[0], prevNUp[1], an[0] << 1 | 1, an[1] << 1 | 1
                                    );
                                } else {
                                    normal.push(
                                        p1Up[0], p1Up[1], p1Up[0], p1Up[1],
                                        prevEx << 1 | 0, prevEy << 1 | 0, an[0] << 1 | 0, an[1] << 1 | 0,
                                        prevNUp[0], prevNUp[1], prevNUp[0], prevNUp[1]
                                    );
                                }
                            }

                            vertex.push(prevX2, prevY2, prevX2, prevY2, prevX2, prevY2);
                        }
                    } else if (!offset) {
                        // alias normal: no alias for round joins
                        let anX = 0;
                        let anY = 0;

                        if (join != CAP_JOIN_ROUND) {
                            let an = normalize([ex, ey]);
                            anX = an[0] * SCALE;
                            anY = an[1] * SCALE;
                        }

                        anX = anX << 1 | 1;
                        anY = anY << 1 | 1;

                        if (prevLeft) {
                            normal.push(
                                0, 0, 0, 0,
                                nDown[0], nDown[1], anX, anY,
                                prevNDown[0], prevNDown[1], anX, anY
                            );
                        } else {
                            normal.push(
                                0, 0, 0, 0,
                                nUp[0], nUp[1], anX, anY,
                                prevNUp[0], prevNUp[1], anX, anY
                            );
                        }

                        vertex.push(prevX2, prevY2, prevX2, prevY2, prevX2, prevY2);
                    }
                }
            }
        }

        normal.push(
            // 1up -> 2down -> 1down
            //
            // 1
            // | >.
            // 1  2
            p1Up[0], p1Up[1], nUp[0], nUp[1],
            p2Down[0], p2Down[1], nDown[0], nDown[1],
            p1Down[0], p1Down[1], nDown[0], nDown[1],
            // 1up -> 2up -> 2down
            //
            // 1  2
            // °< |
            //    2
            p1Up[0], p1Up[1], nUp[0], nUp[1],
            p2Up[0], p2Up[1], nUp[0], nUp[1],
            p2Down[0], p2Down[1], nDown[0], nDown[1]
        );

        // add vertex data
        vertex.push(
            x1, y1,
            x2, y2,
            x1, y1,

            x1, y1,
            x2, y2,
            x2, y2
        );

        if (first) {
            addCap(cap, x1, y1, nx, ny, vertex, normal);
        }

        if (last) {
            addCap(cap, x2, y2, -nx, -ny, vertex, normal);
        }


        if (lengthToVertex) {
            const prevLengthSoFar = lengthSoFar - length;
            lengthToVertex.push(
                prevLengthSoFar, lengthSoFar, prevLengthSoFar,
                prevLengthSoFar, lengthSoFar, lengthSoFar
            );
        }

        prevNUp = nUp;
        prevNDown = nDown;
        prevEx = ex;
        prevEy = ey;

        prevX2 = x2;
        prevY2 = y2;

        x1 = x2;
        y1 = y2;

        prevLeft = left;
        prevBisectorExceeds = bisectorExceeds;
        prevBisectorLength = bisectorLength;
        prevJoin = curJoin;
    }

    return lengthSoFar;
};


export {addLineString, normalize};

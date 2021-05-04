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

import {TaskManager} from '@here/xyz-maps-common';
import {GeometryBuffer} from './GeometryBuffer';
import {getValue, parseStyleGroup} from '../../styleTools';
import {Tile, webMercator, StyleGroup, Feature, TileLayer} from '@here/xyz-maps-core';
import {Layer} from '../../Layers';
import {FeatureFactory, CollisionCandidate} from './FeatureFactory';
import {TemplateBuffer} from './templates/TemplateBuffer';
import {GlyphTexture} from '../GlyphTexture';

const PROCESS_FEATURE_BUNDLE_SIZE = 16;
const EXCLUSIVE_TIME_MS = 4;
const PRIORITY = 4;

const taskManager = TaskManager.getInstance();
const TO_RAD = Math.PI / 180;
const COLOR_UNDEFINED = new Float32Array([-1.0, -1.0, -1.0, -1.0]);

let UNDEF;

const handlePolygons = (
    factory: FeatureFactory,
    feature: Feature,
    coordinates: number[][],
    styleGroup: StyleGroup,
    lsScale: number,
    tile: Tile,
    multiIndex: number = 0
): boolean => {
    const zoom = factory.z;
    let ready = true;

    for (let style of styleGroup) {
        const styleType = style.type;
        const type = getValue('type', style, feature, zoom);
        if (type == 'Polygon' || type == 'Line') {
            if (getValue('stroke', style, feature, zoom)) {
                style.type = 'Line';
                for (let linestring of coordinates) {
                    ready = ready && factory.create(feature, 'LineString', linestring, [style], lsScale, tile.clipped);
                }
                style.type = styleType;
            }
        } else if (multiIndex == 0) {
            const {bounds} = tile;
            const {bbox} = feature;
            const center = [bbox[0] + (bbox[2] - bbox[0]) / 2, bbox[1] + (bbox[3] - bbox[1]) / 2];
            const [cx, cy] = center;

            if (cx >= bounds[0] && cy >= bounds[1] && cx < bounds[2] && cy < bounds[3]) {
                ready = ready && factory.create(feature, 'Point', center, [style], lsScale);
            }
        }
    }
    return ready;
};

type TaskData = [Tile, Feature[], number, number, number, TileLayer, number, boolean | CollisionCandidate[]];

const createBuffer = (
    data: Feature[],
    renderLayer: Layer,
    tileSize: number,
    tile: Tile,
    factory: FeatureFactory,
    onInit: () => void,
    onDone: (data: GeometryBuffer[], imagesLoaded: boolean) => void
) => {
    const {layer} = renderLayer;
    const groups = {};
    let allIconsReady = true;

    const task = taskManager.create({

        time: EXCLUSIVE_TIME_MS,

        priority: PRIORITY,

        init: function(): TaskData {
            const zoom = tile.z + layer.levelOffset;
            const layerStyles = layer.getStyle();
            let lsZoomScale = 1; // DEFAULT_STROKE_WIDTH_ZOOM_SCALE;

            if (layerStyles) {
                const layerScale = layerStyles['strokeWidthZoomScale'] || layerStyles['LineStringZoomScale'];
                if (layerScale) {
                    lsZoomScale = layerScale(zoom);
                }
            }

            if (onInit) {
                onInit();
            }

            factory.init(tile, groups, tileSize, zoom);


            return [
                tile,
                data,
                lsZoomScale,
                0, // featureIndex
                PROCESS_FEATURE_BUNDLE_SIZE,
                layer,
                zoom,
                false
            ];
        },

        name: 'createBuffer',

        onDone: function(taskData: TaskData) {
            const zoomLevel = taskData[6];
            let extrudeScale = Math.pow(2, 17 - zoomLevel);
            const meterToPixel = 1 / webMercator.getGroundResolution(zoomLevel);
            let buffers = [];
            let geoBuffer: GeometryBuffer;
            let grpBuffer: TemplateBuffer;
            let zGroup;
            let grp;
            let type;
            let shared;
            let stroke;
            let strokeWidth;
            let vertexType;

            let zIndex: string | number;
            for (zIndex in groups) {
                zGroup = groups[zIndex];

                if (zGroup) {
                    for (let g = 0; g < zGroup.length; g++) {
                        grp = zGroup[g];
                        type = grp.type;
                        shared = grp.shared;
                        stroke = shared.stroke;
                        strokeWidth = shared.strokeWidth;
                        vertexType = type;
                        grpBuffer = grp.buffer;

                        if (vertexType == 'Text') {
                            if (!grp.texture) { // TODO: CLEANUP!!
                                continue;
                            }
                        }

                        if (!grpBuffer || grpBuffer.isEmpty()) {
                            // nothing to render..no need to create empty buffers -> skip.
                            continue;
                        }

                        if (grpBuffer.hasIndex()) {
                            const index = grpBuffer.index();
                            if (!index.length) continue;

                            geoBuffer = new GeometryBuffer(index, type, grpBuffer.i32);
                        } else {
                            geoBuffer = new GeometryBuffer({
                                first: grpBuffer.first,
                                count: grpBuffer.count()
                            }, type);
                        }

                        const {attributes} = grpBuffer;

                        for (let name in attributes) {
                            let attr = attributes[name];
                            if (attr.data.length) {
                                geoBuffer.addAttribute(name, grpBuffer.trimAttribute(attr));
                            }
                        }

                        buffers.push(geoBuffer);

                        if (type == 'Line') {
                            if (shared.strokeDasharray) {
                                geoBuffer.type = 'DashedLine';
                                geoBuffer.texture = grp.texture;
                                geoBuffer.addUniform('u_texWidth', grp.texture.width);
                                geoBuffer.addUniform('u_pattern', 0);
                            }
                            geoBuffer.addUniform('u_fill', stroke);

                            geoBuffer.addUniform('u_strokeWidth', [strokeWidth * .5, shared.unit == 'm' ? meterToPixel : 0]);

                            geoBuffer.addUniform('u_offset', [shared.offsetX,
                                shared.offsetUnit == 'm' ? meterToPixel : 0
                            ]);

                            geoBuffer.alpha = true;
                            // geoBuffer.blend = true;
                        } else if (type == 'Polygon' || type == 'Extrude') {
                            geoBuffer.addUniform('u_fill', shared.fill);

                            if (type == 'Extrude') {
                                geoBuffer.addUniform('u_zoom', extrudeScale);
                                geoBuffer.scissor = false;
                            }
                        } else {
                            if (type == 'Text' || type == 'Icon') {
                                geoBuffer.scissor = grpBuffer.scissor;
                                geoBuffer.texture = grp.texture;
                                if (type == 'Text') {
                                    (<GlyphTexture>geoBuffer.texture).sync();
                                    geoBuffer.addUniform('u_fillColor', shared.fill || COLOR_UNDEFINED);
                                    geoBuffer.addUniform('u_strokeColor', shared.stroke || COLOR_UNDEFINED);
                                } else {
                                    geoBuffer.addUniform('u_opacity', shared.opacity);
                                }
                                geoBuffer.addUniform('u_texture', 0);
                                geoBuffer.addUniform('u_atlasScale', 1 / geoBuffer.texture.width);
                                geoBuffer.addUniform('u_alignMap', shared.alignment == 'map');

                                geoBuffer.addUniform('u_offset', [shared.offsetX, shared.offsetY]);
                            } else if (type == 'Rect' || type == 'Circle') {
                                geoBuffer.scissor = grpBuffer.scissor;

                                const fill = shared.fill || COLOR_UNDEFINED;

                                geoBuffer.addUniform('u_fill', fill);

                                if (stroke) {
                                    geoBuffer.addUniform('u_stroke', stroke);
                                    if (strokeWidth == UNDEF) strokeWidth = 1;
                                }
                                geoBuffer.addUniform('u_strokeWidth', strokeWidth ^ 0);

                                const toPixel = shared.unit == 'm' ? meterToPixel : 0;

                                if (type == 'Circle') {
                                    // geoBuffer.addUniform('u_radius', shared.radius);
                                    geoBuffer.addUniform('u_radius', [shared.width, toPixel]);
                                } else {
                                    if (fill == COLOR_UNDEFINED) {
                                        // use blend to enable shader to not use discard (faster)
                                        geoBuffer.alpha = true;
                                        geoBuffer.blend = true;
                                    }

                                    geoBuffer.addUniform('u_size', [shared.width, toPixel, shared.height, toPixel]);
                                }
                                geoBuffer.addUniform('u_alignMap', shared.alignment == 'map');

                                geoBuffer.addUniform('u_offset', [
                                    shared.offsetX, shared.offsetUnit[0] == 'm' ? meterToPixel : 0,
                                    shared.offsetY, shared.offsetUnit[1] == 'm' ? meterToPixel : 0
                                ]);
                            }
                        }

                        const fillOpacity = shared.fill && shared.fill[3];
                        const strokeOpacity = shared.stroke && shared.stroke[3];
                        const hasAlphaColor = fillOpacity < 1 || strokeOpacity < 1;

                        if (hasAlphaColor) {
                            geoBuffer.alpha = true;
                            geoBuffer.blend = true;
                            geoBuffer.depth = true;
                        }

                        geoBuffer.addUniform('u_rotation', shared.rotation * TO_RAD);


                        let {zLayer} = grp;

                        // convert zIndex:'top' (deprecated) to zLayer
                        if (zIndex == 'top') {
                            zLayer = Infinity;
                            zIndex = 0;
                        }

                        zIndex = Number(zIndex);

                        geoBuffer.flat = grpBuffer.isFlat();

                        renderLayer.addZ(zIndex, !geoBuffer.flat);
                        geoBuffer.zIndex = zIndex;

                        geoBuffer.zLayer = typeof zLayer == 'number' ? Math.ceil(zLayer) : null;

                        if (geoBuffer.scissor == UNDEF) {
                            // scissoring is slow. we can skip if source data is already clipped on tile edges.
                            geoBuffer.scissor = !tile.clipped || layer.getMargin() > 0 || hasAlphaColor;
                        }
                    }
                }
            }

            onDone(buffers.reverse(), allIconsReady);
        },

        exec: function(taskData: TaskData) {
            const timeStart = performance.now();

            let tile = taskData[0];
            let data = taskData[1];
            const lsScale = taskData[2];
            let displayLayer = taskData[5];
            let dataLen = data.length;

            const level = taskData[6];
            let styleGroups;
            let feature;
            let geom;
            let geomType;
            let notDone = false;

            if (!taskData[7]) {
                while (taskData[4]--) {
                    if (feature = data[taskData[3]++]) {
                        styleGroups = displayLayer.getStyleGroup(feature, level);

                        if (styleGroups) {
                            geom = feature.geometry;
                            geomType = geom.type;

                            if (!styleGroups.length) {
                                styleGroups = [styleGroups];
                            }

                            parseStyleGroup(styleGroups);

                            // const coordinates = geom.coordinates;
                            const coordinates = feature.getProvider().decCoord(feature);

                            let imgReady = true;

                            if (geomType == 'MultiLineString' || geomType == 'MultiPoint') {
                                const simpleType = geomType == 'MultiPoint' ? 'Point' : 'LineString';

                                for (let coords of coordinates) {
                                    imgReady = imgReady && factory.create(feature, simpleType, coords, styleGroups, lsScale);
                                }
                            } else if (geomType == 'MultiPolygon') {
                                imgReady = factory.create(feature, 'Polygon', coordinates, styleGroups, lsScale);

                                for (let p = 0; p < coordinates.length; p++) {
                                    let polygon = coordinates[p];
                                    // for (let polygon of coordinates) {
                                    imgReady = imgReady && handlePolygons(factory, feature, polygon, styleGroups, lsScale, tile, p);
                                }
                            } else {
                                imgReady = factory.create(feature, geomType, coordinates, styleGroups, lsScale);

                                if (geomType == 'Polygon') {
                                    imgReady = imgReady && handlePolygons(factory, feature, coordinates, styleGroups, lsScale, tile);
                                }
                            }

                            allIconsReady = allIconsReady && imgReady;
                        }
                    } else {
                        // feature count < bundle size -> next
                        break;
                    }
                }

                notDone = taskData[3] < dataLen;
            }

            // handle pending collisions...
            if (!notDone && factory.pendingCollisions.length) {
                if (!taskData[7]) {
                    // sort collision data by priority
                    taskData[7] = factory.pendingCollisions.sort((a, b) => a.priority - b.priority);
                    // reset/reuse feature index
                    taskData[3] = 0;
                }
                let cData = taskData[7];
                let candidate;

                if (taskData[4] >= 0) {
                    console.log('--------- handle collisions ---------');

                    // const styleGrp = [];
                    while (taskData[4]--) {
                        if (candidate = cData[taskData[3]++]) {
                            const {coordinates, offsetX, offsetY, width, height, priority, geomType} = candidate;

                            // collisionBox = (4) [-94.728515625, -13, 94.728515625, 13]
                            if (geomType == 'Point' || geomType == 'LineString') {
                                const iconsReady = factory.create(
                                    candidate.feature,
                                    geomType,
                                    coordinates,
                                    candidate.styleGrp,
                                    lsScale,
                                    false,
                                    priority,
                                    candidate
                                );
                                allIconsReady = allIconsReady && iconsReady;
                            }

                            // const {coordinates, offsetX, offsetY, width, height, priority, geomType} = candidate;
                            // let bbox;
                            //
                            // if (geomType == 'Point') {
                            //     const cx = tile.lon2x(coordinates[0], tileSize);
                            //     const cy = tile.lat2y(coordinates[1], tileSize);
                            //
                            //     bbox = tile.isInside(coordinates) && factory.collisions.insert(
                            //         cx, cy,
                            //         offsetX, offsetY,
                            //         width, height,
                            //         tile, tileSize,
                            //         priority
                            //     );
                            //
                            //     if (!bbox) continue;
                            // } else if (geomType != 'LineString') {
                            //     continue;
                            // }else{
                            //
                            // }
                            //
                            // console.log(width,height,candidate);
                            //
                            // const iconsReady = factory.create(
                            //     candidate.feature,
                            //     geomType,
                            //     coordinates,
                            //     candidate.styleGrp,
                            //     lsScale,
                            //     false,
                            //     priority,
                            //     bbox
                            // );
                            // allIconsReady = allIconsReady && iconsReady;
                        } else {
                            break;
                        }
                    }
                }
                notDone = taskData[3] < (<CollisionCandidate[]>cData).length;
            }

            taskData[4] = PROCESS_FEATURE_BUNDLE_SIZE;


            window._totalTileProcessTime = (window._totalTileProcessTime || 0) + performance.now() - timeStart;

            return notDone;
        }
        // icb(groups);
    });

    taskManager.start(task);
    return task;
}
;

export {createBuffer};

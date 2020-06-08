/*
 * Copyright (C) 2019-2020 HERE Europe B.V.
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

import {getCanvasPixelColor, prepare} from 'utils';
import {Map} from '@here/xyz-maps-display';
import dataset from './polygon_render_spec.json';

describe('validate polygon rendering', function() {
    const expect = chai.expect;

    let mapContainer;
    let layer;

    before(async function() {
        let preparedData = await prepare(dataset);
        window.display = new Map(document.getElementById('map'), {
            renderOptions: {
                preserveDrawingBuffer: true
            },
            center: {longitude: 76.565789, latitude: 8.89169},
            zoomLevel: 18,
            layers: preparedData.getLayers()
        });
        mapContainer = display.getContainer();
        display.setBehavior('zoom', 'fixed');
        layer = preparedData.getLayers('areaLayer');

        let f1 = {
            geometry: {
                coordinates: [[
                    [76.563825, 8.892185],
                    [76.564032, 8.892715],
                    [76.56424, 8.892185],
                    [76.563825, 8.892185]
                ]],
                type: 'Polygon'
            },
            properties: {},
            type: 'Feature'
        };
        layer.addFeature(f1, {'zIndex': 0, 'type': 'Polygon', 'opacity': 1, 'fill': '#000000', 'strokeWidth': 5});

        let f2 = {
            geometry: {
                coordinates: [
                    [[
                        [76.564347, 8.892185],
                        [76.564554, 8.892715],
                        [76.564762, 8.892185],
                        [76.564347, 8.892185]
                    ]], [[
                        [76.564869, 8.892185],
                        [76.565076, 8.892715],
                        [76.565283, 8.892185],
                        [76.564869, 8.892185]
                    ]]
                ],
                type: 'MultiPolygon'
            },
            properties: {},
            type: 'Feature'
        };
        layer.addFeature(f2, {'zIndex': 0, 'type': 'Polygon', 'opacity': 1, 'fill': '#00ffff', 'stroke': '#ff0000', 'strokeWidth': 5});
    });

    after(async function() {
        display.destroy();
    });

    it('validate polygon and multipolygon are rendered', async function() {
        await new Promise((resolve) => {
            setTimeout(()=>{
                // validate polygon is displayed
                let color = getCanvasPixelColor(mapContainer, 70, 170);
                expect(color).to.equal('#000000');

                // validate multipolygon is displayed
                let color1 = getCanvasPixelColor(mapContainer, 170, 170);
                expect(color1).to.equal('#00ffff');

                // validate multipolygon is displayed
                let color2 = getCanvasPixelColor(mapContainer, 270, 170);
                expect(color2).to.equal('#00ffff');

                resolve();
            }, 100);
        });
    });
});

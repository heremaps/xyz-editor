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

import {waitForViewportReady} from 'displayUtils';
import {getCanvasPixelColor, prepare} from 'utils';
import {Map} from '@here/xyz-maps-display';
import dataset from './setstylegroup_point_circle.json';

describe('setStyleGroup Point with circle', function() {
    const expect = chai.expect;

    let paLayer;
    let display;
    let mapContainer;
    let feature;

    before(async function() {
        let preparedData = await prepare(dataset);
        display = new Map(document.getElementById('map'), {
            renderOptions: {
                preserveDrawingBuffer: true
            },
            center: {longitude: 73.549401, latitude: 19.815739},
            zoomlevel: 18,
            layers: preparedData.getLayers()
        });
        await waitForViewportReady(display);

        mapContainer = display.getContainer();
        paLayer = preparedData.getLayers('paLayer');

        // get a feature
        feature = preparedData.getFeature('paLayer', '123');
    });

    after(async function() {
        display.destroy();
    });

    it('style feature and validate', async function() {
        // set style for the added feature
        paLayer.setStyleGroup(
            feature, [
                {'zIndex': 0, 'type': 'Circle', 'radius': 14, 'opacity': 1, 'fill': '#000000'},
                {'zIndex': 1, 'type': 'Circle', 'radius': 10, 'opacity': 1, 'fill': '#ff0000'}
            ]);

        // validate features have new style
        // get color of inner circle
        // get color at left border
        // get color at right border
        // get color at top border
        // get color of bottom border
        let colors = await getCanvasPixelColor(mapContainer, [{x: 400, y: 300}, {x: 388, y: 300}, {x: 412, y: 300}, {x: 400, y: 288}, {x: 400, y: 312}]);

        expect(colors[0]).to.equal('#ff0000');
        expect(colors[1]).to.equal('#000000');
        expect(colors[2]).to.equal('#000000');
        expect(colors[3]).to.equal('#000000');
        expect(colors[4]).to.equal('#000000');
    });

    it('style feature with offsetX and validate', async function() {
        // set style for the added feature
        paLayer.setStyleGroup(
            feature, [
                {'zIndex': 0, 'type': 'Circle', 'radius': 14, 'opacity': 1, 'fill': '#000000'},
                {'zIndex': 1, 'type': 'Circle', 'radius': 10, 'opacity': 1, 'offsetX': 4, 'fill': '#ff0000'}
            ]);

        // validate features have new style
        // get color of inner circle
        // get color at left border
        // get color at right border
        // get color at top border
        // get color of bottom border
        let colors = await getCanvasPixelColor(mapContainer, [{x: 400, y: 300}, {x: 388, y: 300}, {x: 412, y: 300}, {x: 400, y: 288}, {x: 400, y: 312}]);

        expect(colors[0]).to.equal('#ff0000');
        expect(colors[1]).to.equal('#000000');
        expect(colors[2]).to.equal('#ff0000');
        expect(colors[3]).to.equal('#000000');
        expect(colors[4]).to.equal('#000000');
    });

    it('style feature with offsetX again and validate', async function() {
        // set style for the added feature
        paLayer.setStyleGroup(
            feature, [
                {'zIndex': 0, 'type': 'Circle', 'radius': 14, 'opacity': 1, 'fill': '#000000'},
                {'zIndex': 1, 'type': 'Circle', 'radius': 10, 'opacity': 1, 'offsetX': -4, 'fill': '#ff0000'}
            ]);

        // validate features have new style
        // get color of inner circle
        // get color at left border
        // get color at right border
        // get color at top border
        // get color of bottom border
        let colors = await getCanvasPixelColor(mapContainer, [{x: 400, y: 300}, {x: 388, y: 300}, {x: 412, y: 300}, {x: 400, y: 288}, {x: 400, y: 312}]);

        expect(colors[0]).to.equal('#ff0000');
        expect(colors[1]).to.equal('#ff0000');
        expect(colors[2]).to.equal('#000000');
        expect(colors[3]).to.equal('#000000');
        expect(colors[4]).to.equal('#000000');
    });

    it('style feature with offsetY and validate', async function() {
        // set style for the added feature
        paLayer.setStyleGroup(
            feature, [
                {'zIndex': 0, 'type': 'Circle', 'radius': 14, 'opacity': 1, 'fill': '#000000'},
                {'zIndex': 1, 'type': 'Circle', 'radius': 10, 'opacity': 1, 'offsetY': 4, 'fill': '#ff0000'}
            ]);

        // validate features have new style
        // get color of inner circle
        // get color at left border
        // get color at right border
        // get color at top border
        // get color of bottom border
        let colors = await getCanvasPixelColor(mapContainer, [{x: 400, y: 300}, {x: 388, y: 300}, {x: 412, y: 300}, {x: 400, y: 288}, {x: 400, y: 312}]);

        expect(colors[0]).to.equal('#ff0000');
        expect(colors[1]).to.equal('#000000');
        expect(colors[2]).to.equal('#000000');
        expect(colors[3]).to.equal('#000000');
        expect(colors[4]).to.equal('#ff0000');
    });

    it('style feature with offsetY again and validate', async function() {
        // set style for the added feature
        paLayer.setStyleGroup(
            feature, [
                {'zIndex': 0, 'type': 'Circle', 'radius': 14, 'opacity': 1, 'fill': '#000000'},
                {'zIndex': 1, 'type': 'Circle', 'radius': 10, 'opacity': 1, 'offsetY': -4, 'fill': '#ff0000'}
            ]);

        // validate features have new style
        // get color of inner circle
        // get color at left border
        // get color at right border
        // get color at top border
        // get color of bottom border
        let colors = await getCanvasPixelColor(mapContainer, [{x: 400, y: 300}, {x: 388, y: 300}, {x: 412, y: 300}, {x: 400, y: 288}, {x: 400, y: 312}]);

        expect(colors[0]).to.equal('#ff0000');
        expect(colors[1]).to.equal('#000000');
        expect(colors[2]).to.equal('#000000');
        expect(colors[3]).to.equal('#ff0000');
        expect(colors[4]).to.equal('#000000');
    });

    it('style feature with fill and stroke color', async function() {
        // set style for the added feature
        paLayer.setStyleGroup(
            feature, [
                {'zIndex': 0, 'type': 'Circle', 'radius': 14, 'opacity': 1, 'fill': '#000000', 'stroke': '#ffff00', 'strokeWidth': 7},
                {'zIndex': 1, 'type': 'Circle', 'radius': 10, 'opacity': 1, 'fill': '#ff0000'}
            ]);

        // validate features have new style

        // get color of inner circle
        // get color at left border
        // get color at right border
        // get color at top border
        // get color of bottom border
        let colors = await getCanvasPixelColor(mapContainer, [{x: 400, y: 300}, {x: 388, y: 300}, {x: 412, y: 300}, {x: 400, y: 288}, {x: 400, y: 312}]);

        expect(colors[0]).to.equal('#ff0000');
        expect(colors[1]).to.equal('#ffff00');
        expect(colors[2]).to.equal('#ffff00');
        expect(colors[3]).to.equal('#ffff00');
        expect(colors[4]).to.equal('#ffff00');
    });
});

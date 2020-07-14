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
import dataset from './setstylegroup_link_spec.json';

describe('setStyleGroup Link', function() {
    const expect = chai.expect;

    let preparedData;
    let linkLayer;
    let display;
    let mapContainer;
    let feature;

    before(async function() {
        preparedData = await prepare(dataset);

        display = new Map(document.getElementById('map'), {
            renderOptions: {
                preserveDrawingBuffer: true
            },
            center: {longitude: 73.707821, latitude: 21.189023},
            zoomlevel: 18,
            layers: preparedData.getLayers()
        });
        await waitForViewportReady(display);
        mapContainer = display.getContainer();
        linkLayer = preparedData.getLayers('linkLayer');

        feature = preparedData.getFeature('linkLayer', '123');
    });

    after(async function() {
        display.destroy();
    });

    it('style feature, validate its new style', async function() {
        // validate link style
        let color1 = await getCanvasPixelColor(mapContainer, {x: 448, y: 300}); // get link color
        // default color is red
        expect(color1).to.equal('#ff0000');

        // set link style
        linkLayer.setStyleGroup(
            feature,
            {'zIndex': 0, 'type': 'Line', 'opacity': 1, 'stroke': '#be6b65', 'strokeWidth': 16}
        );

        // validate new link style
        let color2 = await getCanvasPixelColor(mapContainer, {x: 448, y: 300}); // get link color
        expect(color2).to.equal('#be6b65');

        // reset link style
        linkLayer.setStyleGroup(
            feature
        );

        // validate link style is reset
        let color3 = await getCanvasPixelColor(mapContainer, {x: 448, y: 300}); // get link color
        expect(color3).to.equal('#ff0000');
    });

    it('style feature, validate its new style', async function() {
        // set link style
        linkLayer.setStyleGroup(
            feature, [
                {'zIndex': 0, 'type': 'Line', 'opacity': 1, 'stroke': '#be6b65', 'strokeWidth': 5},
                {'zIndex': 1, 'type': 'Line', 'opacity': 1, 'stroke': '#ffffff', 'strokeWidth': 16}
            ]);

        // validate new link style
        // get color at position of inline
        // get color at position of outline
        let colors1 = await getCanvasPixelColor(mapContainer, [{x: 448, y: 300}, {x: 448, y: 307}]);
        expect(colors1[0]).to.equal('#ffffff');
        expect(colors1[1]).to.equal('#ffffff');

        // set link style
        linkLayer.setStyleGroup(
            feature, [
                {'zIndex': 1, 'type': 'Line', 'opacity': 1, 'stroke': '#be6b65', 'strokeWidth': 5},
                {'zIndex': 0, 'type': 'Line', 'opacity': 1, 'stroke': '#ffffff', 'strokeWidth': 16}
            ]);

        // validate new link style
        // get color at position of inline
        // get color at position of outline
        let colors2 = await getCanvasPixelColor(mapContainer, [{x: 448, y: 300}, {x: 448, y: 307}]);
        expect(colors2[0]).to.equal('#be6b65');
        expect(colors2[1]).to.equal('#ffffff');
    });

    it('style feature with text, validate its new style', async function() {
        // set link style
        linkLayer.setStyleGroup(
            feature, [
                {'zIndex': 0, 'type': 'Line', 'stroke': '#000000', 'strokeWidth': 38},
                {'zIndex': 1, 'type': 'Text', 'fill': '#ffffff', 'text': 'HERE', 'font': 'bold 50px Arial,Helvetica,sans-serif'}
            ]);

        // validate new link style
        // get color of link
        // get color of first character H (left side)
        // get color between bars of character H
        // get color of first character H (right side)
        // get link color between first H and E
        let colors = await getCanvasPixelColor(mapContainer, [{x: 420, y: 308}, {x: 431, y: 308}, {x: 443, y: 308}, {x: 452, y: 308}, {x: 461, y: 308}]);

        expect(colors[0]).to.equal('#000000');
        expect(colors[1]).to.equal('#ffffff');
        expect(colors[2]).to.equal('#000000');
        expect(colors[3]).to.equal('#ffffff');
        expect(colors[4]).to.equal('#000000');
    });
});


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
import {prepare} from 'utils';
import {waitForEditorReady} from 'editorUtils';
import {drag} from 'triggerEvents';
import {Map} from '@here/xyz-maps-core';
import {features, Editor} from '@here/xyz-maps-editor';
import dataset from './poi_autoconnect_spec.json';

describe('poi routing point connects to links automatically', function() {
    const expect = chai.expect;

    let editor;
    let display;
    let preparedData;
    let mapContainer;
    let poi;
    let link;
    let placeLayer;

    before(async function() {
        preparedData = await prepare(dataset);
        display = new Map(document.getElementById('map'), {
            center: {longitude: 77.07066531017313, latitude: 12.952694430251995},
            zoomLevel: 18,
            layers: preparedData.getLayers()
        });
        editor = new Editor(display, {
            layers: preparedData.getLayers()
        });
        await waitForEditorReady(editor);

        mapContainer = display.getContainer();

        link = preparedData.getFeature('linkLayer', -189170);
        placeLayer = preparedData.getLayers('placeLayer');
    });

    after(async function() {
        editor.destroy();
        display.destroy();
        await preparedData.clear();
    });

    it('create an poi object and connect to a link, validate pois routingPoint value', async function() {
        let p = new features.Place({x: 300, y: 250}, {featureClass: 'PLACE'});
        poi = editor.addFeature(p, placeLayer);

        expect(poi.prop()).to.deep.include({
            'featureClass': 'PLACE'
        });

        poi.createRoutingPoint();

        expect(poi.prop()).to.deep.include({
            'routingLink': link.id+''
        });
        expect(poi.prop('routingPoint')).to.deep.equal([77.06959, 12.95322, 0]);
    });

    it('drag routing point and validate again', async function() {
        poi.select();
        await drag(mapContainer, {x: 200, y: 200}, {x: 200, y: 160});

        expect(poi.prop()).to.deep.include({
            'routingLink': link.id+''
        });
        expect(poi.prop('routingPoint')).to.deep.equal([77.06959, 12.95343, 0]);

        poi.unselect();
    });
});

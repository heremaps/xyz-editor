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
import {prepare} from 'testUtils';
import {waitForEditorReady} from 'editorTests';
import {drag, click} from 'utilEvents';
import {features, Editor} from '@here/xyz-maps-editor';
import {Map} from '@here/xyz-maps-core';
import dataset from './address_routingpoint_spec.json';

describe('routing point of address objects should always exists', function() {
    const expect = chai.expect;

    let preparedData;
    let editor;
    let display;
    let mapContainer;
    let link1;
    let link2;
    let address;

    before(async function() {
        preparedData = await prepare(dataset);

        display = new Map(document.getElementById('map'), {
            center: {longitude: 77.030443, latitude: 12.943037},
            zoomLevel: 18,
            layers: preparedData.getLayers()
        });
        editor = new Editor(display, {layers: preparedData.getLayers()});

        await waitForEditorReady(editor);

        mapContainer = display.getContainer();

        link1 = preparedData.getFeature('linkLayer', -188824);
        link2 = preparedData.getFeature('linkLayer', -188825);
        address = preparedData.getFeature('paLayer', -47937);
    });

    after(async function() {
        editor.destroy();
        display.destroy();

        await preparedData.clear();
    });

    it('validate created Address object connects to created link', function() {
        expect(address.prop()).to.deep.include({
            'routingLink': link1.id + '',
            'routingPoint': [77.02937, 12.94356, 0]
        });
    });

    it('validate address after removing its connected link', function() {
        link1.remove();

        expect(address.prop()).to.deep.include({
            'routingLink': link1.id + ''
        });
    });

    it('create a link object and click on the address object, address object connects to the new link', async function() {
        let l3 = new features.Navlink([{x: 200, y: 400}, {x: 100, y: 500}], {featureClass: 'NAVLINK'});
        let link3 = editor.addFeature(l3);

        await click(mapContainer, 200, 100);

        expect(address.prop()).to.deep.include({
            'routingLink': link2.id + '',
            'routingPoint': [77.02937, 12.94304, 0]
        });
    });


    it('drag address navigation point, address has its routing point changed', async function() {
        await drag(mapContainer, {x: 200, y: 300}, {x: 150, y: 350});

        expect(address.prop()).to.deep.include({
            'routingLink': link2.id + '',
            'routingPoint': [77.0291, 12.94278, 0]
        });
    });

    it('drag connected link, address has its routing point changed', async function() {
        await click(mapContainer, 200, 300);
        await drag(mapContainer, {x: 200, y: 300}, {x: 200, y: 400});

        expect(address.prop()).to.deep.include({
            'routingLink': link2.id + '',
            'routingPoint': [77.0291, 12.94251, 0]
        });
    });
});

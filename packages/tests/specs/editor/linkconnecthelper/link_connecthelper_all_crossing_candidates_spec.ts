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
import {prepare} from 'utils';
import {waitForEditorReady} from 'editorUtils';
import {Map} from '@here/xyz-maps-display';
import {Editor} from '@here/xyz-maps-editor';
import dataset from './link_connecthelper_all_crossing_candidates_spec.json';

describe('link connect helper connect all crossings candidates', function() {
    const expect = chai.expect;

    let editor;
    let display;
    let preparedData;
    let link1;

    before(async function() {
        preparedData = await prepare(dataset);
        display = new Map(document.getElementById('map'), {
            center: {longitude: 80.69297278785734, latitude: 16.799272986590253},
            zoomlevel: 18,
            layers: preparedData.getLayers()
        });
        editor = new Editor(display, {
            layers: preparedData.getLayers()
        });
        await waitForEditorReady(editor);

        link1 = preparedData.getFeature('linkLayer', -189122);
    });

    after(async function() {
        editor.destroy();
        display.destroy();
        await preparedData.clear();
    });

    it('validate there are crossings found', function() {
        let crossings = link1.checkCrossings();
        expect(crossings).to.have.lengthOf(3);
    });

    it('get crossings and connect', async function() {
        let crossings = link1.checkCrossings();

        crossings.forEach((c)=>{
            c.connect();
        });
        crossings.forEach((c)=>{
            c.connect();
        });

        expect(editor.info()).to.have.lengthOf(10);
    });
});

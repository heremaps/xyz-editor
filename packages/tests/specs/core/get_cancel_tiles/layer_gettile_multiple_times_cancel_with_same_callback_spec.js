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
import {getTileOnLayer} from 'coreTests';
import dataset from './layer_gettile_multiple_times_cancel_with_same_callback_spec.json';

describe('layer get one tile multiple times and cancel with same callback', function() {
    const expect = chai.expect;

    var placeLayer;

    var qk1;
    var qk2;
    var qk3;
    var qk4;

    before(async function() {
        let preparedData = await prepare(dataset);
        placeLayer = preparedData.getLayers('placeLayer'); // placeLayer.level.length == 16

        qk1 = '3112301320032300'; // length 16
        qk2 = '3112301320032301'; // length 16
        qk3 = '3112301320032302'; // length 16
        qk4 = '3112301320032303'; // length 16
    });

    this.timeout(10000);

    // Sydney, AUS
    it('get one tile for multiple times and dont cancel', function(done) {
        // qk1     = '3112301320032300' // length 16
        getTileOnLayer({
            layer: placeLayer,
            quadkeys: [qk1, qk1, qk1],
            sameCallback: true,
            onFinish: function(requests, callbackResults) {
                // 1 request(s) sent, 1 callback(s) called
                expect(requests.length).to.equal(1);
                expect(callbackResults.length).to.equal(1);

                let cancelledRequests = 0;
                for (let r in requests) {
                    if (requests[r].status == 0) {
                        cancelledRequests++;
                    }
                }

                expect(cancelledRequests).to.equal(0);


                done();
            }
        });
    });


    it('get one tile for multiple times and cancel once', function(done) {
        // qk2     = '3112301320032301' // length 16
        getTileOnLayer({
            layer: placeLayer,
            quadkeys: [qk2, qk2, qk2],
            sameCallback: true,
            cancel: {
                layer: placeLayer,
                quadkeys: [qk2],
                withCallback: true
            },
            onFinish: function(requests, callbackResults) {
                // 1 request(s) sent, 0 callback(s) called
                expect(requests.length).to.equal(1);
                expect(callbackResults.length).to.equal(0);

                let cancelledRequests = 0;
                for (let r in requests) {
                    if (requests[r].status == 0) {
                        cancelledRequests++;
                    }
                }

                expect(cancelledRequests).to.equal(1);


                done();
            }
        });
    });


    it('get one tile for multiple times and cancel two times', function(done) {
        // qk3     = '3112301320032302' // length 16
        getTileOnLayer({
            layer: placeLayer,
            quadkeys: [qk3, qk3, qk3],
            sameCallback: true,
            cancel: {
                layer: placeLayer,
                quadkeys: [qk3, qk3],
                withCallback: true
            },
            onFinish: function(requests, callbackResults) {
                // 1 request(s) sent, 0 callback(s) called
                expect(requests.length).to.equal(1);
                expect(callbackResults.length).to.equal(0);

                let cancelledRequests = 0;
                for (let r in requests) {
                    if (requests[r].status == 0) {
                        cancelledRequests++;
                    }
                }

                expect(cancelledRequests).to.equal(1);


                done();
            }
        });
    });


    it('get one tile for multiple times and cancel all', function(done) {
        // qk4     = '3112301320032303' // length 16
        getTileOnLayer({
            layer: placeLayer,
            quadkeys: [qk4, qk4, qk4],
            sameCallback: true,
            cancel: {
                layer: placeLayer,
                quadkeys: [qk4, qk4, qk4],
                withCallback: true
            },
            onFinish: function(requests, callbackResults) {
                // 1 request(s) sent, 0 callback(s) called
                expect(requests.length).to.equal(1);
                expect(callbackResults.length).to.equal(0);

                let cancelledRequests = 0;
                for (let r in requests) {
                    if (requests[r].status == 0) {
                        cancelledRequests++;
                    }
                }

                expect(cancelledRequests).to.equal(1);


                done();
            }
        });
    });
});


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
import {getTileOnProvider} from 'coreTests';
import dataset from './basic_get_cancel_tile_spec.json';

describe('basic get and cancel tiles', function() {
    const expect = chai.expect;
    var placeProvider; // placeProvider.level.length == 16

    var qk1;

    var qk2;

    var qk31;
    var qk32;

    var qk41;
    var qk42;

    var qk51;
    var qk52;

    var qk61;
    var qk62;
    var qk63;

    var qk71;
    var qk72;
    var qk73;

    var qk81;
    var qk82;
    var qk83;


    before(async function() {
        let preparedData = await prepare(dataset);
        placeProvider = preparedData.getLayers('placeLayer').getProvider();

        qk1 = '3112301330002101'; // length 16

        qk2 = '3112301330002102'; // length 16

        qk31 = '3112301330002111'; // length 16
        qk32 = '3112301330002112'; // length 16

        qk41 = '3112301330002121'; // length 16
        qk42 = '3112301330002122'; // length 16

        qk51 = '3112301330002131'; // length 16
        qk52 = '3112301330002132'; // length 16

        qk61 = '3112301330002200'; // length 16
        qk62 = '3112301330002201'; // length 16
        qk63 = '3112301330002202'; // length 16

        qk71 = '3112301330002210'; // length 16
        qk72 = '3112301330002211'; // length 16
        qk73 = '3112301330002212'; // length 16

        qk81 = '3112301330002220'; // length 16
        qk82 = '3112301330002221'; // length 16
        qk83 = '3112301330002222'; // length 16
    });

    this.timeout(10000);

    // Sydney, AUS
    it('get one tile and dont cancel', function(done) {
        // qk1     = '3112301330002101' // length 16
        getTileOnProvider({
            provider: placeProvider,
            quadkeys: [qk1],
            sameCallback: false,
            onFinish: function(requests, callbackResults) {
                // one request sent one callback is called
                expect(requests.length).to.equal(1);
                expect(callbackResults.length).to.equal(1);

                // one request is not cancelled
                expect(requests[0]).to.deep.include({
                    readyState: 4,
                    status: 200
                });

                done();
            }
        });
    });


    it('get one tile and cancel', function(done) {
        // qk2     = '3112301330002102' // length 16
        getTileOnProvider({
            provider: placeProvider,
            quadkeys: [qk2],
            sameCallback: false,
            onFinish: function(requests, callbackResults) {
                // one request sent one callback is not called
                expect(requests.length).to.equal(1);
                expect(callbackResults.length).to.equal(0);

                // one request is cancelled
                expect(requests[0]).to.deep.include({
                    readyState: 4,
                    status: 0
                });

                done();
            },
            cancel: {
                provider: placeProvider,
                quadkeys: [qk2],
                withCallback: true
            }
        });
    });


    it('get two tile and dont cancel', function(done) {
        // qk31    = '3112301330002111' // length 16
        // qk32    = '3112301330002112' // length 16
        getTileOnProvider({
            provider: placeProvider,
            quadkeys: [qk31, qk32],
            sameCallback: false,
            onFinish: function(requests, callbackResults) {
                // two requests sent two callback are called
                expect(requests.length).to.equal(2);
                expect(callbackResults.length).to.equal(2);

                // two request are not cancelled
                expect(requests[0]).to.deep.include({
                    readyState: 4,
                    status: 200
                });
                expect(requests[1]).to.deep.include({
                    readyState: 4,
                    status: 200
                });

                done();
            }
        });
    });


    it('get two tile and cancel first request', function(done) {
        // qk41    = '3112301330002121' // length 16
        // qk42    = '3112301330002122' // length 16
        getTileOnProvider({
            provider: placeProvider,
            quadkeys: [qk41, qk42],
            sameCallback: false,
            onFinish: function(requests, callbackResults) {
                // two requests sent one callback is called
                expect(requests.length).to.equal(2);
                expect(callbackResults.length).to.equal(1);

                // one request is cancelled
                let cancelledRequests = 0;
                for (let r in requests) {
                    if (requests[r].status == 0) {
                        // qk41 is cancelled
                        expect(requests[r].openURL.indexOf(qk41)).to.above(-1);

                        cancelledRequests++;
                    }
                }

                expect(cancelledRequests).to.equal(1);

                done();
            },
            cancel: {
                provider: placeProvider,
                quadkeys: [qk41],
                withCallback: true
            }
        });
    });


    it('get two tile and cancel both requests', function(done) {
        // qk51    = '3112301330002131' // length 16
        // qk52    = '3112301330002132' // length 16
        getTileOnProvider({
            provider: placeProvider,
            quadkeys: [qk51, qk52],
            sameCallback: false,
            onFinish: function(requests, callbackResults) {
                // two requests sent callback is not called
                expect(requests.length).to.equal(2);
                expect(callbackResults.length).to.equal(0);

                // one request is cancelled
                expect(requests[0]).to.deep.include({
                    readyState: 4,
                    status: 0
                });

                expect(requests[1]).to.deep.include({
                    readyState: 4,
                    status: 0
                });

                done();
            },
            cancel: {
                provider: placeProvider,
                quadkeys: [qk51, qk52],
                withCallback: true
            }
        });
    });


    it('get three tiles and dont cancel requests', function(done) {
        // qk61    = '3112301330002200' // length 16
        // qk62    = '3112301330002201' // length 16
        // qk63    = '3112301330002202' // length 16
        getTileOnProvider({
            provider: placeProvider,
            quadkeys: [qk61, qk62, qk63],
            sameCallback: false,
            onFinish: function(requests, callbackResults) {
                // three requests sent callback are called
                expect(requests.length).to.equal(3);
                expect(callbackResults.length).to.equal(3);

                // one request is cancelled
                expect(requests[0]).to.deep.include({
                    readyState: 4,
                    status: 200
                });

                expect(requests[1]).to.deep.include({
                    readyState: 4,
                    status: 200
                });

                expect(requests[2]).to.deep.include({
                    readyState: 4,
                    status: 200
                });

                done();
            }
        });
    });

    it('get three tiles and cancel two requests', function(done) {
        // qk71    = '3112301330002210' // length 16
        // qk72    = '3112301330002211' // length 16
        // qk73    = '3112301330002212' // length 16
        getTileOnProvider({
            provider: placeProvider,
            quadkeys: [qk71, qk72, qk73],
            sameCallback: false,
            onFinish: function(requests, callbackResults) {
                // three requests sent callback are called
                expect(requests.length).to.equal(3);
                expect(callbackResults.length).to.equal(1);


                // two requests are cancelled
                let cancelledRequests = 0;
                for (let r in requests) {
                    if (requests[r].status == 0) {
                        cancelledRequests++;
                    }
                }

                expect(cancelledRequests).to.equal(2);


                done();
            },
            cancel: {
                provider: placeProvider,
                quadkeys: [qk71, qk72],
                withCallback: true
            }
        });
    });

    it('get three tiles and cancel three requests', function(done) {
        // qk81    = '3112301330002220' // length 16
        // qk82    = '3112301330002221' // length 16
        // qk83    = '3112301330002222' // length 16
        getTileOnProvider({
            provider: placeProvider,
            quadkeys: [qk81, qk82, qk83],
            sameCallback: false,
            onFinish: function(requests, callbackResults) {
                // 3 request(s) sent, 0 callback(s) called
                expect(requests.length).to.equal(3);
                expect(callbackResults.length).to.equal(0);

                // all requests are cancelled
                let cancelledRequests = 0;
                for (let r in requests) {
                    if (requests[r].status == 0) {
                        cancelledRequests++;
                    }
                }

                expect(cancelledRequests).to.equal(3);


                done();
            },
            cancel: {
                provider: placeProvider,
                quadkeys: [qk81, qk82, qk83],
                withCallback: true
            }
        });
    });
});

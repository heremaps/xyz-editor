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

import {JSUtils} from '@here/xyz-maps-common';
import HTTPProvider from './HTTPProvider/HTTPProvider';


export class GeoJSONProvider extends HTTPProvider {
    /**
     *  GeoJSON provider
     *
     *  @public
     *  @expose
     *  @constructor
     *  @extends here.xyz.maps.providers.HTTPProvider
     *  @param {here.xyz.maps.providers.HTTPProvider.Options} config configuration of the provider
     *  @name here.xyz.maps.providers.GeoJSONProvider
     */
    constructor(config) {
        config.level = config.level || 13;

        config.headers = JSUtils.extend({
            'Accept': 'application/geo+json'
        }, config.headers || {});

        super(config);
    }

    // delete( feature ) {
    //     this.tree.remove( feature );
    // }
};

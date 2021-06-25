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

import MarkerTools from './marker/MarkerTools';
import AreaTools from './area/PolygonTools';
import LineTools from './line/LineTools';
import NavlinkTools from './link/NavlinkTools';
import LocationTools from './location/LocationTools';
import {Feature} from './feature/Feature';

const tools = {
    MARKER: MarkerTools,
    AREA: AreaTools,
    LINE: LineTools,
    NAVLINK: NavlinkTools,
    PLACE: LocationTools,
    ADDRESS: LocationTools
};

// avoid circular dependencies
LocationTools.setLinkTools(NavlinkTools);


const getObjectTools = (feature: Feature) => {
    return tools[feature.class];
};


const createProxy = (p: string) => {
    return function(feature: Feature) {
        const featureClass = feature.class;
        const tool = tools[featureClass][p];
        if (tool) {
            return tool.apply(tool, arguments);
        }
        console.warn('No Tool', p, 'defined for', featureClass);
    };
};


type FeatureTools = {
    getTool(feature: Feature, name: string): (...args) => any;
    private(...args): any;
    getEventListener(feature: Feature, type: string);

    // proxies
    highlight?(feature: Feature);
    deHighlight?(feature: Feature);
    _editable?(feature: Feature, editable: boolean);
    _select?(feature: Feature);
    _setCoords?(feature: Feature, coordinates);
    markAsRemoved?(feature: Feature, animation?: boolean);
    markAsModified?(feature: Feature, saveView?: boolean, visualize?: boolean);
}

const oTools: FeatureTools = {

    getTool: function(obj, name) {
        const tools = getObjectTools(obj);

        return tools && name ? tools[name] : tools;
    },

    private: createProxy('private'),

    getEventListener: function(obj, type) {
        const tools = getObjectTools(obj);

        if (tools) {
            return tools._evl[type] || tools.private(obj, type);
        }
        // fallback for overlay objects
        // @ts-ignore
        return obj.__ && obj.__[type] || obj[type];
    }
};

for (const type in tools) {
    for (const t in tools[type]) {
        if (!oTools[t]) {
            oTools[t] = createProxy(t);
        }
    }
}

export default oTools;

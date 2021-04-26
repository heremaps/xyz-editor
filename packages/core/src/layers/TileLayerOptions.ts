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

import TileProvider from '../providers/TileProvider/TileProvider';
import {LayerStyle} from '../styles/LayerStyle';


/**
 *  Configuration options for a TileLayer.
 */
export interface TileLayerOptions {
    /**
     * Name of the TileLayer.
     */
    name?: string;

    /**
     * minimum zoom level at which data from the TileLayer will be displayed.
     */
    min?: number;

    /**
     * maximum zoom level at which data from the TileLayer will be displayed.
     */
    max?: number;

    /**
     * The data provider for the TileLayer.
     */
    provider?: TileProvider;
    /**
     * @internal
     */
    providers?: any;

    /**
     * Style for rendering features in this layer.
     */
    style?: LayerStyle;

    /**
     * tileMargin that should be applied to all providers of the layer.
     */
    margin?: number;
    /**
     * the size of the tile data in pixel.
     * @defaultValue 512
     */
    tileSize?: number;

    /**
     * enable or disable pointer-event triggering for all features of all layers.
     * @defaultValue true
     */
    pointerEvents?: boolean
}

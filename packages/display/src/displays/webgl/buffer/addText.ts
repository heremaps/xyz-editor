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

import {createTextData} from './createText';
import {GlyphAtlas} from '../GlyphAtlas';

const extentScale = 64;

const DEFAULT_LINE_WRAP = 14;


export const wrapText = (text: string, textWrap?: number) => {
    textWrap = textWrap || DEFAULT_LINE_WRAP;

    const lines = [];
    let lineStartIndex = 0;
    let lastSpaceIndex = -1;

    for (let i = 0, line, length = text.length; i < length; i++) {
        let c = text.charAt(i);
        if (c == ' ') {
            lastSpaceIndex = i;
        }
        let lineLength = i - lineStartIndex;

        if (lineLength >= textWrap) {
            if (lineStartIndex <= lastSpaceIndex) {
                line = text.substring(lineStartIndex, lastSpaceIndex);
                lineStartIndex = lastSpaceIndex + 1;
                lines.push(line);
            }
        }
        // is last character
        if (i == length - 1) {
            if (lineStartIndex <= i) {
                line = text.substring(lineStartIndex, i + 1);
                lines.push(line);
            }
        }
    }
    return lines;
};


const addText = (
    text: string | string[],
    point: number[],
    vertex: number[],
    texcoord: number[],
    glyphAtlas: GlyphAtlas,
    cx: number,
    cy: number,
    offsetX?: number,
    offsetY?: number,
    textWrap?: number
) => {
    const lines = typeof text == 'string'
        ? wrapText(text, textWrap)
        : text;

    const lineCnt = lines.length;
    const lineHeight = glyphAtlas.letterHeight;

    let ty = glyphAtlas.baselineOffset - offsetY;

    ty += (lineCnt - 1) * lineHeight * .5;

    for (let text of lines) {
        const textData = createTextData(text, glyphAtlas);
        const textVertex = textData.position;
        const textTextCoords = textData.texcoord;
        const tx = textData.width * glyphAtlas.scale / 2 - offsetX;

        for (let v = 0; v < textVertex.length; v += 2) {
            point.push(
                textVertex[v] - tx,
                textVertex[v + 1] - ty,
                0
            );
            vertex.push(
                cx * extentScale,
                cy * extentScale
            );

            texcoord.push(textTextCoords[v], textTextCoords[v + 1]);
        }

        ty -= lineHeight;
    }
};


export {addText};

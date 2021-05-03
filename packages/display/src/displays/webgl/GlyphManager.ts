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
import {getDirection} from './unicode';
import {FontStyle} from './GlyphTexture';
import {initFont, determineFontHeight, drawCharacter} from '../textUtils';

const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_FONT = 'normal 12px Arial';
const DEFAULT_TEXT_ALIGN = 'start';

const GLYPH_FILL = '#fff';
const GLYPH_STROKE = '#000';

export const createCanvas = (width: number, height: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

export type Glyph = {
    width: number;
    char: string,
    data: ImageData,
    advanceX: number;
    direction: number; // 1(LTR)|0(NEUTRAL)|-1(RTL)
}

class GlyphManager {
    fonts = {};

    static instance: GlyphManager;

    static getInstance() {
        return this.instance = this.instance || new GlyphManager();
    }

    constructor() {

    }

    private getFontId(style: FontStyle) {
        return `${style.font || DEFAULT_FONT}${style.strokeWidth || DEFAULT_STROKE_WIDTH}${style.textAlign || DEFAULT_TEXT_ALIGN}`;
    }

    initFont(style: FontStyle, scale: number = 1) {
        const {fonts} = this;
        const styleId = this.getFontId(style);

        if (!fonts[styleId]) {
            console.log('init font', styleId);
            const size = 96 * scale;
            const canvas = createCanvas(size, size);
            const ctx = canvas.getContext('2d');

            ctx.textBaseline = 'bottom';
            const letterHeightBottom = determineFontHeight(ctx, style, 'gM').height;

            ctx.textBaseline = 'top';
            const letterHeight = determineFontHeight(ctx, style, 'gM').height;

            initFont(ctx, style, GLYPH_FILL, GLYPH_STROKE);

            // determine font height on scaled canvas is less precise
            // so we determine unscaled and scale afterwards
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
            // ctx.textAlign = 'start'; // 'center'
            // ctx.textBaseline = 'top'; // 'middle'

            const {lineWidth} = ctx;
            const paddingX = Math.floor(lineWidth);
            const paddingY = Math.floor(/* 2* */lineWidth);
            const rowHeight = (letterHeight + 2 * paddingY);

            fonts[styleId] = {
                name: styleId,
                size: 0,
                glyphs: new Map<string, Glyph>(),
                paddingX: paddingX,
                paddingY: paddingY,
                canvas,
                ctx,
                width: size,
                offsetX: 2 * lineWidth * scale,
                scale: scale,
                style,
                charWidthCache: new Map<string, number>(),
                rowHeight: rowHeight * scale,
                letterHeightBottom: letterHeightBottom,
                letterHeight: letterHeight,
                spaceWidth: ctx.measureText(' ').width * scale,
                baselineOffset: scale * ((letterHeight - letterHeightBottom) / 2 + paddingY) // middle
                // this.baselineOffset = 0; // top
                // this.baselineOffset = (letterHeight - letterHeightBottom); // bottom
            };
        }
        return fonts[styleId];
    }

    hasGlyph(char: string, font) {
        return font.glyphs.has(char);
    }

    getGlyph(char: string, font): Glyph {
        let glyph = font.glyphs.get(char);

        if (!glyph) {
            let size = font.canvas.width;
            let {offsetX, scale} = font;

            font.ctx.clearRect(0, 0, size, size);

            drawCharacter(font.ctx, char, font.paddingX, font.paddingY, font.style);

            let charWidth = font.charWidthCache.get(char);
            if (charWidth == undefined) {
                charWidth = font.ctx.measureText(char).width;
            } else {
                font.charWidthCache.delete(char);
            }


            let width = Math.round((charWidth || 0) + 2 * font.paddingX) * scale;

            // debug only
            // let lw = font.ctx.lineWidth;
            // font.ctx.lineWidth = 2;
            // font.ctx.strokeStyle = 'black';
            // font.ctx.strokeRect(0, 0, width / scale, font.rowHeight / scale);
            // font.ctx.lineWidth = lw;
            // font.ctx.strokeStyle = GLYPH_STROKE;

            let imgData = font.ctx.getImageData(0, 0, width, font.rowHeight);

            glyph = {
                char: char,
                width: charWidth,
                data: imgData,
                direction: getDirection(char.charCodeAt(0)),
                advanceX: charWidth ? imgData.width - offsetX : 0
            };

            font.glyphs.set(char, glyph);
            font.size++;
        }

        return glyph;
    }

    // getTextWidth(text: string, font) {
    //     const {ctx} = font;
    //     // 2x linewidth is roughly estimated but good enough
    //     return ctx.measureText(text).width; // + 2 * ctx.lineWidth;
    // }

    getTextWidth(text: string, font) {
        const {ctx} = font;
        let width = 0;
        for (let char of text) {
            let glyph = font.glyphs.get(char);
            if (glyph) {
                width += glyph.width;
            } else {
                let w = font.charWidthCache.get(char);
                if (w == undefined) {
                    w = ctx.measureText(char).width;
                    font.charWidthCache.set(char, w);
                }
                width += w;
            }
        }
        return width; // + 2 * ctx.lineWidth;
    }
}

export {GlyphManager};

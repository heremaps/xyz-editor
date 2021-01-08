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

import BasicRender from '../BasicRender';
import {TileLayer, Tile} from '@here/xyz-maps-core';
import GLTile from './GLTile';
import {IconManager} from './IconManager';
import {toRGB, RGBA} from './color';

import RectProgram from './program/Rect';
import CircleProgram from './program/Circle';
import LineProgram from './program/Line';
import DashedLineProgram from './program/DashedLine';
import PolygonProgram from './program/Polygon';
import ImageProgram from './program/Image';
import TextProgram from './program/Text';
import IconProgram from './program/Icon';
import ExtrudeProgram from './program/Extrude';
import Program from './program/Program';

import {createGridTextBuffer, createGridTileBuffer, createTileBuffer} from './buffer/debugTileBuffer';
import {GeometryBuffer} from './buffer/GeometryBuffer';

import {GLStates} from './program/GLStates';
import {TileBufferData} from './Display';

import {transformMat4} from 'gl-matrix/vec3';
import {
    create,
    lookAt,
    multiply,
    perspective,
    rotateX,
    rotateZ,
    translate,
    scale,
    clone,
    copy,
    invert,
    identity
} from 'gl-matrix/mat4';
import BasicTile from '../BasicTile';

const mat4 = {create, lookAt, multiply, perspective, rotateX, rotateZ, translate, scale, clone, copy, invert, identity};


const FIELD_OF_VIEW = 45 * Math.PI / 180;

const unclip = (v, dim) => Math.round((v + 1) / 2.0 * dim);

const EXTENSION_OES_ELEMENT_INDEX_UINT = 'OES_element_index_uint';

const DEBUG_GRID_FONT = {
    font: 'bold 14px Arial',
    stroke: 'red',
    fill: 'white',
    strokeWidth: 3
    // textAlign : 'start',
    // textBaseline : 'alphabetic'
};

// const DEBUG_GRID_FONT = {fill:'#ff0000', stroke:'#ffff00', strokeWidth: 2 };

export type RenderOptions = WebGLContextAttributes;


export class GLRender implements BasicRender {
    icons: IconManager;
    private vMat: Float32Array; // view matrix
    private pMat: Float32Array; // projection matrix
    private invPMat: Float32Array; // inverse projection matrix
    screenMat: Float32Array;
    invScreenMat: Float32Array;

    private tilePreviewTransform: {
        m: Float32Array; // tile transformation matrix,
        tx: number; // translate x
        ty: number; // translate y
        s: number; // scale
    }

    private scale: number;
    private rz: number;
    private rx: number;
    private programs: { [name: string]: Program };
    private gridTextBuf = new WeakMap();
    // private dLayer: { z: number, z3d: number };
    private zIndex: number; // current zIndex buffer should be drawn
    private min3dZIndex: number; // min zIndex containing 3d/extruded data

    tileGrid: boolean = false;
    tileSize: number = 256;

    private dpr: number; // devicePixelRatio
    private w: number;
    private h: number;

    private dbgTile = {
        256: createGridTileBuffer(256),
        512: createGridTileBuffer(512)
    };

    private stencilTile: GeometryBuffer;

    private depthFnc: GLenum;
    private pass: 'opaque' | 'alpha';

    buffers = new WeakMap();
    gl: WebGLRenderingContext;
    private ctxAttr: WebGLContextAttributes;
    fixedView: number;

    constructor(renderOptions: RenderOptions) {
        this.ctxAttr = {
            alpha: true,
            antialias: false,
            depth: true,
            stencil: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            ...renderOptions
        };


        this.pMat = mat4.create();
        this.vMat = mat4.create();
        this.invPMat = mat4.create();
        this.screenMat = mat4.create();
        this.invScreenMat = mat4.create();

        this.tilePreviewTransform = {
            m: mat4.create(),
            tx: 0,
            ty: 0,
            s: 0
        };

        const stencilTile = createTileBuffer(1);
        // will only draw in alpha pass!
        stencilTile.alpha = true; // this.pass == 'alpha';
        // need to be set to enable stencil test in program init.
        stencilTile.blend = true;
        this.stencilTile = stencilTile;
    }

    setPass(pass: 'opaque' | 'alpha') {
        // console.log(`-------- ${pass} pass --------`);
        const {gl} = this;
        this.pass = pass;

        this.depthFnc = pass == 'alpha'
            ? gl.LEQUAL // enable alpha blending within same z-level.
            : gl.LESS;
    }

    convertColor(color: string | RGBA) {
        return toRGB(color);
    }

    setBackgroundColor(color: RGBA) {
        // this.clearColor = color;
        if (this.gl) {
            this.gl.clearColor(color[0], color[1], color[2], 1.0);
        }
    }

    setScale(scale: number, sx: number, sy: number) {

    }

    setRotation(rz: number, rx: number) {
    }

    clear(clearColor?): void {
        const {gl} = this;

        if (clearColor) {
            this.setBackgroundColor(clearColor);
        }
        // gl.clearDepth(1.0);
        gl.colorMask(true, true, true, true);
        gl.disable(gl.SCISSOR_TEST);
        gl.depthMask(true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        gl.colorMask(true, true, true, false);
    }

    init(canvas: HTMLCanvasElement, devicePixelRation: number): void {
        this.dpr = devicePixelRation;

        const gl = <WebGLRenderingContext>canvas.getContext('webgl', this.ctxAttr);

        // @ts-ignore
        gl.dpr = devicePixelRation;

        if (!gl.getExtension(EXTENSION_OES_ELEMENT_INDEX_UINT)) {
            console.warn(EXTENSION_OES_ELEMENT_INDEX_UINT + ' not supported!');
        }
        // gl.frontFace(gl.CCW);
        // gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.SCISSOR_TEST);
        // gl.enable(gl.BLEND);
        // gl.enable(gl.DEPTH_TEST);

        gl.clearStencil(0);

        const texUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);

        this.icons = new IconManager(gl, texUnits - 2);

        this.programs = {
            Rect: new RectProgram(gl, devicePixelRation),
            Line: new LineProgram(gl, devicePixelRation),
            DashedLine: new DashedLineProgram(gl, devicePixelRation),
            Text: new TextProgram(gl, devicePixelRation),
            Image: new ImageProgram(gl, devicePixelRation),
            Circle: new CircleProgram(gl, devicePixelRation),
            Polygon: new PolygonProgram(gl, devicePixelRation),
            Extrude: new ExtrudeProgram(gl, devicePixelRation),
            Icon: new IconProgram(gl, devicePixelRation)
        };

        // gl.depthFunc(gl.LESS);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

        this.gl = gl;
    }

    grid(show: boolean): void {
        this.tileGrid = show;
    }

    applyTransform() {

    }

    initView(pixelWidth: number, pixelHeight: number, scale: number, rotX: number, rotZ: number) {
        const projectionMatrix = this.pMat;
        const viewMatrix = this.vMat;

        //                                . alpha°
        //                         d2 . ´     .°|
        //                        . ´       .°  |
        //                    . ´         .°    |
        //                 .´ |         .°      |
        //           d1 .´\   | hPH   .°        |
        //           .´    \  |     .°          |
        //        .´      h \ |rx°.°            |
        //    . ´            \| .°              |
        // hFov° -------------|-----------------|
        // <--   targetZ   -->
        // <--               zfar            -->

        const hFOV = FIELD_OF_VIEW * .5;
        const centerPixelX = pixelWidth * .5;
        // hPH
        const centerPixelY = pixelHeight * .5;
        // one texel equals one pixel
        const targetZ = centerPixelY / Math.tan(hFOV);
        const cosHFOV = Math.cos(hFOV);
        // h
        const height = Math.sin(hFOV) * targetZ;
        const alpha = Math.PI * .5 - hFOV + rotX;
        const d1 = cosHFOV * targetZ;
        const d2 = height / Math.tan(alpha);
        const zNear = targetZ * .25;
        let zFar = cosHFOV * (d1 + d2);
        // avoid precision issues...
        zFar *= 1.005;

        // clear tile preview matrix cache
        this.tilePreviewTransform.tx = null;
        this.tilePreviewTransform.ty = null;
        this.tilePreviewTransform.s = null;

        this.w = pixelWidth;
        this.h = pixelHeight;
        this.rz = rotZ;
        this.rx = rotX;
        this.scale = scale;

        this.gl.viewport(0, 0, pixelWidth * this.dpr, pixelHeight * this.dpr);

        mat4.perspective(projectionMatrix, FIELD_OF_VIEW, pixelWidth / pixelHeight, zNear, zFar);

        // {mat4} mat4.lookAt(out, eye, center, up)
        mat4.lookAt(viewMatrix, [centerPixelX, centerPixelY, -targetZ], [centerPixelX, centerPixelY, 0], [0, -1, 0]);
        mat4.translate(viewMatrix, viewMatrix, [centerPixelX, centerPixelY, 0]);
        mat4.rotateX(viewMatrix, viewMatrix, rotX);
        mat4.rotateZ(viewMatrix, viewMatrix, rotZ);
        mat4.scale(viewMatrix, viewMatrix, [scale, scale, scale]);
        mat4.translate(viewMatrix, viewMatrix, [-centerPixelX, -centerPixelY, 0]);

        mat4.multiply(projectionMatrix, projectionMatrix, viewMatrix);

        invert(this.invPMat, this.pMat);

        // convert from clipspace to screen.
        let screenMatrix = mat4.identity(this.screenMat);
        mat4.scale(screenMatrix, screenMatrix, [centerPixelX, -centerPixelY, 1]);
        mat4.translate(screenMatrix, screenMatrix, [1, -1, 0]);
        mat4.multiply(screenMatrix, screenMatrix, this.pMat);

        invert(this.invScreenMat, screenMatrix);

        // // used for debug only...
        // let s05 = mat4.clone(this.pMat);
        // mat4.translate(s05, s05, [centerPixelX, centerPixelY, 0]);
        // mat4.scale(s05, s05, [.5, .5,.5]);
        // mat4.translate(s05, s05, [-centerPixelX, -centerPixelY, 0]);
        // this.pMat = s05;
    }


    initBuffers(attributes) {
        const gl = this.gl;
        let attr;
        let buf;

        for (let name in attributes) {
            attr = attributes[name];
            buf = this.buffers.get(attr);

            if (!buf) {
                buf = gl.createBuffer();
                this.buffers.set(attr, buf);
            }
            if (attr.dirty) {
                attr.dirty = false;
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, attr.data, gl.STATIC_DRAW);
                // delete attr.data;
            }
        }
    }

    private prog: Program;

    useProgram(prog): boolean {
        const activeProgam = this.prog;

        if (activeProgam != prog) {
            const gl = this.gl;

            if (activeProgam) {
                // disable bound Attributes from previous program.
                const activeAttributes = activeProgam.attributes;
                for (let name in activeAttributes) {
                    gl.disableVertexAttribArray(activeAttributes[name]);
                }
            }

            gl.useProgram(prog.prog);
            this.prog = prog;
            return true;
        }
        return false;
    }

    drawGrid(x: number, y: number, dTile: GLTile, tileSize: number | string) {
        const curPass = this.pass;

        this.pass = 'alpha';
        // this.pass = 'opaque';
        this.drawBuffer(this.dbgTile[tileSize], x, y, null, null); // , {depth: false, scissor: false});

        let textBuffer: GeometryBuffer = this.gridTextBuf.get(dTile);

        if (!textBuffer) {
            textBuffer = createGridTextBuffer(dTile.quadkey, this.gl, DEBUG_GRID_FONT);

            this.gridTextBuf.set(dTile, textBuffer);
        }

        // gl.enable(gl.BLEND);
        // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        // gl.depthMask(false);
        // this.pass = 'alpha';
        this.drawBuffer(textBuffer, x + 4, y + 4);

        // reset pass
        this.pass = curPass;

        // gl.depthMask(true);
        // gl.disable(gl.BLEND);
        // gl.enable(gl.DEPTH_TEST);
    }

    deleteBuffer(buffer: GeometryBuffer) {
        const {buffers, gl} = this;
        const {attributes, texture, index} = buffer;

        if (texture) {
            texture.destroy();
        }

        for (let name in attributes) {
            let attr = attributes[name];
            let glBuffer = buffers.get(attr);
            gl.deleteBuffer(glBuffer);
        }

        if (index) {
            gl.deleteBuffer(buffers.get(index));
        }
    }

    private zFilter: (z: number) => boolean;

    setZFilter(filter?: (z: number) => boolean) {
        this.zFilter = filter;
    }

    private drawBuffer(
        buffer: GeometryBuffer,
        x: number,
        y: number,
        pMat?: Float32Array,
        dZoom?: number,
        stencilSize?: number
    ): void {
        const gl = this.gl;
        const buffers = this.buffers;
        const renderPass = this.pass;
        let bufAttributes;
        let program: Program;
        let uLocation;

        program = this.programs[buffer.type];

        if (program) {
            let pass = program.pass(renderPass);

            dZoom = dZoom || 1;

            const zIndex = this.zIndex;
            const isOnTopOf3d = zIndex > this.min3dZIndex;

            if (buffer.alpha || isOnTopOf3d) {
                pass = renderPass == 'alpha';
            }

            if (pass) {
                if (this.stencilVal && buffer.alpha) {
                    const refVal = this.stencilVal;
                    this.stencilVal = null;
                    this.drawStencil(refVal);
                }

                bufAttributes = buffer.getAttributes();
                this.initBuffers(bufAttributes);

                this.useProgram(program);
                // initialise pass default
                gl.depthFunc(this.depthFnc);

                const depth = 1 - (1 + zIndex) / (1 << 16);

                gl.depthRange(buffer.flat ? depth : 0, depth);

                program.init(<GLStates>buffer, renderPass,
                    // only use stencil when needed.. no need if map is untransformed
                    Boolean(this.rx || this.rz)
                );

                if (isOnTopOf3d) {
                    gl.disable(this.gl.DEPTH_TEST);
                }

                program.initAttributes(bufAttributes, buffers);

                program.initUniforms(buffer.uniforms);

                uLocation = program.uniforms;


                gl.uniform1i(uLocation.u_fixedView, this.fixedView);
                gl.uniform1f(uLocation.u_rotate, this.rz);
                gl.uniform2f(uLocation.u_resolution, this.w, this.h);
                gl.uniform1f(uLocation.u_scale, this.scale * dZoom);
                gl.uniform2f(uLocation.u_topLeft, x, y);
                gl.uniform1f(uLocation.u_tileScale, stencilSize || 1);
                gl.uniformMatrix4fv(uLocation.u_matrix, false, pMat || this.pMat);

                program.draw(buffer, buffers);
            }
        }
        // else console.warn('no program found', group.type);
    }


    private stencilVal: number;
    private stencilSize: number;
    private stencilX: number;
    private stencilY: number;

    initStencil(refValue: number, x, y, tileSize: number) {
        this.stencilVal = refValue;
        this.stencilSize = tileSize;
        this.stencilX = x;
        this.stencilY = y;
    };

    drawStencil(refVal: number) {
        // return this.gl.stencilFunc(this.gl.ALWAYS, 0, 0);
        if (this.rx || this.rz) {
            const {gl, stencilTile} = this;
            const x = this.stencilX;
            const y = this.stencilY;

            gl.stencilFunc(gl.ALWAYS, refVal, 0xff);
            gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
            // disable color buffer
            gl.colorMask(false, false, false, false);

            const grpFilter = this.zFilter;
            this.zFilter = null;

            this.drawBuffer(
                stencilTile,
                x, y,
                null,
                // layerZ / Infinity -> always draw stencil at z0 to avoid artifacts on tile boundaries
                Infinity,
                this.stencilSize
            );

            this.zFilter = grpFilter;
            gl.stencilFunc(gl.EQUAL, refVal, 0xff);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
            // enable color buffer again
            gl.colorMask(true, true, true, false);
        }
    }


    private scissorX: number;
    private scissorY: number;
    private scissorSize: number;

    private initScissor(buffer, x: number, y: number, width: number, height: number): boolean {
        if (buffer.scissor) {
            const {gl} = this;
            const w = gl.canvas.width;
            const h = gl.canvas.height;

            if (this.scale > 4.0) {
                // workaround: precision issues for 22+ zooms -> disable scissor
                gl.scissor(0, 0, w, h);
                this.scissorX = null;
                return true;
            }

            if (this.scissorX != x || this.scissorY != y || this.scissorSize != width) {
                this.scissorX = x;
                this.scissorY = y;
                this.scissorSize = width;

                const x2 = x + width;
                const y2 = y + height;
                const lowerLeft = [x, y2, 0];
                const lowerRight = [x2, y2, 0];
                const upperLeft = [x, y, 0];
                const upperRight = [x2, y, 0];

                let xmin = Infinity;
                let xmax = -xmin;
                let ymin = xmin;
                let ymax = xmax;

                for (let p of [lowerLeft, lowerRight, upperLeft, upperRight]) {
                    p = transformMat4([], p, this.pMat);
                    let x = unclip(p[0], w);
                    let y = unclip(p[1], h);
                    if (x < xmin) xmin = x;
                    if (x > xmax) xmax = x;
                    if (y < ymin) ymin = y;
                    if (y > ymax) ymax = y;
                }
                gl.scissor(xmin, ymin, xmax - xmin, ymax - ymin);
            }
            return true;
        }
    }

    draw(data: TileBufferData, min3dZIndex: number): void {
        let scissored = false;
        let stenciled = false;
        let bufferData = data;
        let screenTile = bufferData.tile;
        let dTile = <GLTile>screenTile.tile;
        let tileSize = screenTile.size;
        let x = screenTile.x;
        let y = screenTile.y;
        let buffer = bufferData.b;
        let {preview} = bufferData;
        let qk;
        let sx;
        let sy;
        let sWidth;
        let dx;
        let dy;
        let dWidth;
        let scale;
        let dZoom;
        let px;
        let py;

        if (this.zFilter && !this.zFilter(bufferData.z)) return;

        this.zIndex = bufferData.z;
        this.min3dZIndex = min3dZIndex;

        if (preview) {
            let previewTile = bufferData.previewTile;

            qk = preview[0];
            sx = preview[1];
            sy = preview[2];
            sWidth = preview[3];
            dx = preview[5];
            dy = preview[6];
            dWidth = preview[7];
            scale = dWidth / sWidth;
            dZoom = Math.pow(2, dTile.quadkey.length - qk.length);
            px = dx / scale - sx;
            py = dy / scale - sy;

            this.initScissor(buffer, x + dx, y + dy, dWidth, dWidth);
            // this.gl.scissor(0, 0, 4096, 4096);

            // this.gl.stencilFunc(this.gl.ALWAYS, 0, 0);
            // this.initStencil(px,py, tileSize, Math.random()*255 +1 ^0 );
            // this.initStencil( px -  (x + dx), py - (y + dy), tileSize, previewTile.i, tileScaleMatrix);
            // mat4.scale(tileScaleMatrix, tileScaleMatrix, [1, 1, 1]);
            // this.initStencil(0,0, tileSize, Math.random()*255 +1 ^0, tileScaleMatrix );
            // works for zoom in preview // this.initStencil(x, y, tileSize, dTile.i); //this.drawBuffer(buf, px, py, tileScaleMatrix, dZoom);
            // this.initStencil(x,y, tileSize, dTile.i);

            if (dZoom < 1) {
                // this.gl.clear(this.gl.STENCIL_BUFFER_BIT);
                this.initStencil(previewTile.i, x + dx, y + dy, tileSize * dZoom);
                // this.gl.stencilFunc(this.gl.ALWAYS, 0, 0);
            } else if (!stenciled) {
                stenciled = true;
                this.initStencil(dTile.i, x, y, tileSize);
            }
            const previewTransformMatrix = this.initPreviewMatrix(x, y, scale);

            this.drawBuffer(buffer, px, py, previewTransformMatrix, dZoom);
        } else {
            if (!scissored) {
                scissored = this.initScissor(buffer, x, y, tileSize, tileSize);
            }

            if (!stenciled) {
                this.initStencil(dTile.i, x, y, tileSize);
                stenciled = true;
            }

            this.drawBuffer(buffer, x, y);
        }
    }

    private initPreviewMatrix(tx: number, ty: number, s: number): Float32Array {
        const {tilePreviewTransform} = this;
        const {m} = tilePreviewTransform;
        if (
            tilePreviewTransform.tx != tx ||
            tilePreviewTransform.ty != ty ||
            tilePreviewTransform.s != s
        ) {
            mat4.copy(m, this.pMat);
            mat4.translate(m, m, [tx, ty, 0]);
            mat4.scale(m, m, [s, s, s]);

            tilePreviewTransform.tx = tx;
            tilePreviewTransform.ty = ty;
            tilePreviewTransform.s = s;
        }
        return m;
    }

    destroy(): void {
        this.icons.destroy();
    }

    prepare(INSTRUCTIONS: any, tile: Tile, layer: TileLayer, display: any, dTile: BasicTile, cb: () => void): void {
    }
}

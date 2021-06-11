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

// @ts-ignore
import vertexShader from '../glsl/text_vertex.glsl';
// @ts-ignore
import fragmentShader from '../glsl/text_fragment.glsl';

import Program from './Program';
import {GLStates, PASS} from './GLStates';

class TextProgram extends Program {
    name = 'Text';

    glStates = new GLStates({
        blend: true,
        scissor: false,
        depth: true
    });

    constructor(gl: WebGLRenderingContext, devicePixelRation: number) {
        super(gl, gl.TRIANGLES, vertexShader, fragmentShader, devicePixelRation);
    }

    pass(pass: PASS) {
        // draw text in alpha pass only
        return pass == PASS.ALPHA;
    }

    init(options: GLStates, pass: PASS, stencil: boolean) {
        const {gl} = this;
        super.init(options, pass, stencil);
        // using LEQUAL and write to depthbuffer used as default in alpha pass will
        // lead to lost context on some systems (driverbug?!)
        // this issues is also related to overlapping (atlas.spacing) of characters
        gl.depthMask(false);
        // gl.depthFunc(gl.LESS);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }

    draw(group, buffers) {
        const {gl, uniforms} = this;

        gl.uniform1f(uniforms.u_strokeOnly, 1);
        super.draw(group, buffers);

        gl.uniform1f(uniforms.u_strokeOnly, 0);
        super.draw(group, buffers);
    }
}

export default TextProgram;

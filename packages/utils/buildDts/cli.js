#!/usr/bin/env node

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


const {join} = require('path');
const build = require('./index');

const argv = require('yargs/yargs')(process.argv.slice(2))
    .options({
        path: {
            alias: 'p',
            describe: 'root path of the module',
            demandOption: true,
            type: 'string'
        }
    })
    .help()
    .argv;

const apiExtractorJsonPath = join(__dirname, 'config', 'api-extractor.json');

build(argv.path, apiExtractorJsonPath);

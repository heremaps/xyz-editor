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

import {Crossing} from '../API/MCrossing';
import {intersectLineLine} from '../geometry';
import {geotools as geoTools} from '@here/xyz-maps-common';
import linkTools from '../features/link/NavlinkTools';
import {Navlink} from '@here/xyz-maps-editor';
import InternalEditor from '../IEditor';
import {GeoJSONCoordinate, Style} from '@here/xyz-maps-core';

let UNDEF;

const connectionsContainIds = (connections, ids) => {
    for (const i in connections) {
        if (ids.indexOf(connections[i].link.id) != -1) {
            return true;
        }
    }
    return false;
};

function calcPathIntersections(
    path1: GeoJSONCoordinate[],
    path2: GeoJSONCoordinate[]
): { point: GeoJSONCoordinate, s1: number, s2: number }[] {
    const results = [];
    for (let i = 0; i < path1.length - 1; i++) {
        for (let k = 0; k < path2.length - 1; k++) {
            const point = intersectLineLine(path1[i], path1[i + 1], path2[k], path2[k + 1], true);
            if (point) {
                results.push({
                    point,
                    s1: i + 1,
                    s2: k + 1
                });
                // result = {x,y,
                //  // // check if line segments are "connected"
                //  // // this is a indication for overlapping shape..
                //  // // ..which results results in crossing detected multiple times
                //  // connected:
                //  //  // crossing at existing geo1
                //  //  ( ua == 0.0 || ua == 1.0 )       ||
                //  //  // crossing at existing geo2
                //  //  ( x == g2_1[0] && y == g2_1[1] ) ||
                //  //  ( x == g2_2[0] && y == g2_2[1] )
                // }
            }
        }
    }
    return results;
}

const HERE_CROSSING = 'CROSSING';
const HERE_CROSSING_CANDIDATE = HERE_CROSSING + '_CANDIDATE';


class CrossingTester {
    createTS: DOMTimeStamp;
    iEditor: InternalEditor;

    private linkOrig: Navlink;
    private relatedLink: Navlink[];
    private searchType: string;
    private maxDistance: number;
    private shapeThreshold: number;
    private cStyles: { [name: string]: Style[] };
    private foundCrossings: Crossing[] = [];
    private simpleCrossings: Crossing[] = [];


    constructor(internalEditor: InternalEditor, navlink: Navlink) {
        this.iEditor = internalEditor;
        this.setRelatedLink(navlink);
    }

    clear() {
        const {foundCrossings, simpleCrossings} = this;

        simpleCrossings.forEach((e) => {
            e.hide && e.hide();
        });
        foundCrossings.length = 0;
        simpleCrossings.length = 0;

        this.createTS = 0;
    };

    private checkRealCrossing(link: Navlink, objs: Navlink[]) {
        let pCons: Crossing[] = [];
        const linkPath = link.coord();


        const getCrossings = (l2: Navlink, cLinks: { link: Navlink, index: number }[]) => {
            let isCLink = false;
            const pcons = [];
            const intersections = calcPathIntersections(linkPath, l2.coord());

            // filter out crossing duplicates. e.g. overlapping shapes.
            for (var i = 0, j = 0, len = intersections.length; i < len - 1; i++, j = i) {
                const isec = intersections[i];
                const {point} = isec;
                let nextIsec;

                while (++j < len) {
                    nextIsec = intersections[j];
                    const nextPoint = nextIsec.point;
                    if (
                        // !isec.connected &&
                        point[0] == nextPoint[0] && point[1] == nextPoint[1] &&
                        Math.abs(nextIsec.s1 - isec.s1) <= 1 && Math.abs(nextIsec.s2 - isec.s2) <= 1
                    ) {
                        intersections.splice(j--, 1);
                        len--;
                    }
                }
            }

            // filter out connected links...
            for (var i = 0; i < intersections.length; i++) {
                const {point} = intersections[i];
                isCLink = false;
                // filter out connected links!
                for (let c = 0, clink; c < cLinks.length; c++) {
                    clink = cLinks[c];


                    if (
                        clink.link.id == l2.id &&
                        linkTools.isIntersection(this.iEditor, point, clink.link.coord()[clink.index])
                    ) {
                        isCLink = true;
                        break;
                    }
                }

                if (!isCLink) {
                    pcons.push(
                        new Crossing(this, link, l2, point.slice(0, 2))
                        // index: intersections[i]['s1']-1,
                        // index2: intersections[i]['s2']-1
                    );
                }
            }

            return pcons;
        };

        // if the link doesn't exist anymore, we have to skip/ignore it.
        if (!link.editState('removed')) {
            const cLinks = link.getConnectedLinks(0, true)
                .concat(
                    link.getConnectedLinks(linkPath.length - 1, true)
                );

            // check for real crossings
            objs.forEach((el) => {
                pCons = pCons.concat(getCrossings(el, cLinks));
            });
        }
        return pCons;
    };

    private getNearestLineCandidate(link: Navlink, shape: number, lines: Navlink[], skipIds?: (string | number)[]) {
        if (skipIds === UNDEF) {
            skipIds = [link.id];
            const cLinks = link.getConnectedLinks(shape, true);
            for (const i in cLinks) {
                skipIds.push(cLinks[i].link.id);
            }
        }
        const path = link.coord();
        const nline = this.iEditor.objects.getNearestLine(path[shape], lines, {
            ignore: skipIds,
            maxDistance: this.maxDistance, // search radius in meter
            shapeThreshold: this.shapeThreshold, // shapeThreshold,
            onlyExsitingShape: false // (j == 0 || j == path.length-1) ? false : true
        });

        if (nline != null) {
            const cons = nline.line.getConnectedLinks(nline.shpIndex, true);

            if (connectionsContainIds(cons, skipIds)) {
                skipIds.push(nline.line.id);

                return this.getNearestLineCandidate(link, shape, lines, skipIds);
            }
        }
        return nline;
    }

    private calculateCrossings(links: Navlink | Navlink[], searchType: string) {
        let foundX: Crossing[] = [];
        let candidate;

        // create timestamp shared by all crossings
        this.createTS = +new Date;

        (Array.isArray(links) ? links : [links]).forEach((link) => {
            // if the link doesn't exist anymore, we have to skip/ignore it.
            if (!link.editState('removed')) {
                if (!searchType || searchType == HERE_CROSSING || searchType == HERE_CROSSING_CANDIDATE) {
                    const bbox = geoTools.extendBBox(link.getBBox(), this.maxDistance);
                    const features = this.iEditor.objects.getInBBox(bbox, link.getProvider());
                    const linkIndex = features.indexOf(link);

                    if (linkIndex != -1) {
                        features.splice(linkIndex, 1);
                    }

                    if (searchType != HERE_CROSSING_CANDIDATE) {
                        foundX = foundX.concat(this.checkRealCrossing(link, features));
                    }
                    // check for possible crossings (candidates)
                    if (searchType != HERE_CROSSING) {
                        link.coord().forEach((c, i) => {
                            if (candidate = this.getNearestLineCandidate(link, i, features)) {
                                const {point} = candidate;
                                if (c[0] != point[0] || c[1] != point[1]) {
                                    foundX.push(
                                        new Crossing(this, link, candidate.line, c, point)
                                    );
                                }
                            }
                        });
                    }
                }
            }
        });

        // // filter/remove for possible duplicates (overlapping existing shapes)
        // for (let i = 0, j; i < (j = foundX.length); i++) {
        //     while (i < --j) {
        //         if (
        //             foundX[i].getRelatedLink() == foundX[j].getRelatedLink() &&
        //             foundX[j].distance == 0 &&
        //             foundX[j].class == 'CROSSING_CANDIDATE' &&
        //             // foundX[j].geometry.coordinates[0][0] == foundX[j].geometry.coordinates[1][0] &&
        //             // foundX[j].geometry.coordinates[0][1] == foundX[j].geometry.coordinates[1][1]
        //             // foundX[i].geometry.coordinates[0] == foundX[j].geometry.coordinates[0][0] &&
        //             // foundX[i].geometry.coordinates[1] == foundX[j].geometry.coordinates[0][1]
        //             foundX[i].x == foundX[j].x &&
        //             foundX[i].y == foundX[j].y
        //         ) {
        //             // foundX.splice(j, 1);
        //         }
        //     }
        // }
        return foundX;
    }

    getRelatedLink(): Navlink {
        return this.linkOrig;
    }

    getCrossings(option) {
        const that = this;

        option = option || {};

        // clear
        this.setRelatedLink(UNDEF);

        if (!option.links) {
            // if new search type or maxDistance is different from previous type, force to recalculate crossings
            if (
                this.searchType != option['class'] ||
                this.maxDistance != option['maxDistance']
            ) {
                that.createTS = 0;
            }

            this.cStyles = option['styles'] || {};
            this.searchType = option['class'];
        } else if (option.croLink && option.links.length) {
            // check if option.links is not empty, then remove the split link and add new links to related links array
            this.relatedLink = this.relatedLink.concat(option.links);
        }

        this.maxDistance = option['maxDistance'] || this.iEditor._config['XTestMaxDistance'] || 3;
        this.shapeThreshold = this.iEditor._config['minShapeDistance'];

        // calculate crossings if it is never calculated or link is modified after the calculation
        // if links is given, then force to do a calculating with the given links
        if (!that.createTS || this.linkOrig.editState('modified') > that.createTS || option.links) {
            that.clear();

            this.foundCrossings = this.calculateCrossings(this.relatedLink, this.searchType);
        }

        return this.getSimplifiedCrossings();
    };

    private getSimplifiedCrossings(): Crossing[] {
        this.simpleCrossings.length = 0;
        for (let crossing of this.foundCrossings) {
            this.simpleCrossings.push(crossing);
        }
        return this.simpleCrossings;
    }


    setRelatedLink(l: Navlink) {
        if (l) {
            this.linkOrig = l;
            this.relatedLink = [l];
        }
    };

    getStyle() {
        return this.cStyles;
    }
}

export default CrossingTester;

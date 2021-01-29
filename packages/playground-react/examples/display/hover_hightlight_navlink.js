import {MVTLayer, TileLayer, SpaceProvider} from '@here/xyz-maps-core';
import {Map} from '@here/xyz-maps-display';

/** setup the Map **/
var bgLayer = new MVTLayer({
    name: 'background layer',
    min: 1,
    max: 20,
    remote: {
        url: 'https://xyz.api.here.com/tiles/osmbase/512/all/{z}/{x}/{y}.mvt?access_token=' + YOUR_ACCESS_TOKEN
    }
});
var navlinkLayer = new TileLayer({
    name: 'my Navlink Layer',
    min: 14,
    max: 20,
    provider: new SpaceProvider({
        id: 'navlinks',
        level: 14,
        space: '6HMU19KY',
        credentials: {
            access_token: YOUR_ACCESS_TOKEN
        }
    }),

    style: {
        styleGroups: {
            myStyle: [
                {zIndex: 0, type: 'Line', stroke: '#A88E71', strokeWidth: 18},
                {zIndex: 1, type: 'Line', stroke: '#FEAD9D', strokeWidth: 12},
                {zIndex: 2, type: 'Text', fill: '#000000', textRef: 'properties.name'}
            ]
        },
        assign: function(feature) {
            return 'myStyle';
        }
    }
});

// setup the Map Display
const display = new Map(document.getElementById('map'), {
    zoomLevel: 17,
    center: {
        longitude: -122.254537, latitude: 37.796982
    },
    // add layers to display
    layers: [bgLayer, navlinkLayer]
});
/** **/


// new feature style
var hoverStyle = [
    {zIndex: 1, type: 'Line', stroke: '#CB668E', strokeWidth: 34},
    {zIndex: 2, type: 'Line', stroke: '#F090B3', strokeWidth: 14},
    {zIndex: 3, type: 'Text', fill: '#000000', text: 'Playground Road'}
];

// add event listener to pointerenter
display.addEventListener('pointerenter', function(evt) {
    // set feature style when pointer enters feature in space layer
    if (evt.target && evt.target.getProvider().id == 'navlinks') {
        navlinkLayer.setStyleGroup(evt.target, hoverStyle);
    }
});

// add event listener to pointerleave
display.addEventListener('pointerleave', function(evt) {
    // restore feature style when pointer leaves feature in space layer
    if (evt.target && evt.target.getProvider().id == 'navlinks') {
        navlinkLayer.setStyleGroup(evt.target);
    }
});


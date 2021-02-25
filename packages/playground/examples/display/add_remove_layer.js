import {MVTLayer, TileLayer, SpaceProvider} from '@here/xyz-maps-core';
import {Map} from '@here/xyz-maps-display';

/** setup the Map **/
// configure layers
var layers = [
    new MVTLayer({
        name: 'background layer',
        min: 1,
        max: 20,
        remote: {
            url: 'https://xyz.api.here.com/tiles/osmbase/512/all/{z}/{x}/{y}.mvt?access_token=' + YOUR_ACCESS_TOKEN
        }
    })
];
// setup the Map Display
const display = new Map(document.getElementById('map'), {
    zoomlevel: 17,
    center: {
        longitude: -122.226136, latitude: 37.777699
    },

    // add layers to display
    layers: layers
});
/** **/

// Create a TileLayer with my line data
var myNavlinkLayer = new TileLayer({
    min: 14,
    max: 20,
    provider: new SpaceProvider({
        level: 14,
        space: '6HMU19KY',
        credentials: {
            access_token: YOUR_ACCESS_TOKEN
        }
    })
});

// Create a TileLayer with my place data
var myPlaceLayer = new TileLayer({
    min: 14,
    max: 20,
    provider: new SpaceProvider({
        level: 14,
        space: '6CkeaGLg',
        credentials: {
            access_token: YOUR_ACCESS_TOKEN
        }
    })
});

let navlinkLayerAdded = false;

// add a onclick event handler to the myLinesButton
document.querySelector('#myLinesButton').onclick = function() {
    if (!navlinkLayerAdded) {
        display.addLayer(myNavlinkLayer);
        this.innerText = 'Remove MyLines';
        navlinkLayerAdded = true;
    } else {
        display.removeLayer(myNavlinkLayer);
        this.innerText = 'Add MyLines';
        navlinkLayerAdded = false;
    }
};

var placeLayerAdded = false;
// add a onclick event handler to the myPlacesButton
document.querySelector('#myPlacesButton').onclick = function() {
    if (!placeLayerAdded) {
        display.addLayer(myPlaceLayer);

        this.innerText = 'Remove MyPlaces';

        placeLayerAdded = true;
    } else {
        display.removeLayer(myPlaceLayer);

        this.innerText = 'Add MyPlaces';

        placeLayerAdded = false;
    }
};


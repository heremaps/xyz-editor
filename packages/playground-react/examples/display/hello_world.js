import {MVTLayer} from '@here/xyz-maps-core';
import {Map} from '@here/xyz-maps-display';

// setup the Map Display
const display = new Map(document.getElementById('map'), {
    zoomLevel: 17,
    center: {
        longitude: -122.48024,
        latitude: 37.77326
    },
    // add layers to the map
    layers: [
        new MVTLayer({
            name: 'background layer',
            min: 1,
            max: 20,
            remote: {
                url: 'https://xyz.api.here.com/tiles/osmbase/512/all/{z}/{x}/{y}.mvt?access_token=' + YOUR_ACCESS_TOKEN
            }
        })
    ]
});

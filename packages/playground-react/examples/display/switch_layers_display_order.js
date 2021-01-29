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
    }),
    new TileLayer({
        name: 'Building Layer',
        min: 15,
        max: 20,
        provider: new SpaceProvider({
            name: 'BuildingProvider',
            level: 15,
            space: 'XhxKLZGL',
            credentials: {
                access_token: YOUR_ACCESS_TOKEN
            }
        }),
        style: {
            styleGroups: {
                style: [
                    {zIndex: 1, type: 'Polygon', fill: '#008800', opacity: 0.8}
                ]
            },
            assign: function(feature) {
                return 'style';
            }
        }
    }),
    new TileLayer({
        name: 'Place Layer',
        min: 14,
        max: 20,
        provider: new SpaceProvider({
            id: 'PlaceProvider',
            level: 14,
            space: '6CkeaGLg',
            credentials: {
                access_token: YOUR_ACCESS_TOKEN
            }
        }),
        style: {
            styleGroups: {
                style: [
                    {
                        'zIndex': 0,
                        'type': 'Circle',
                        'radius': 12,
                        'strokeWidth': 2,
                        'stroke': '#FFFFFF',
                        'fill': '#1188DD'
                    }
                ]
            },
            assign: function(feature) {
                return 'style';
            }
        }
    })
];
// setup the Map Display
const display = new Map(document.getElementById('map'), {
    zoomLevel: 18,
    center: {
        longitude: -122.227145, latitude: 37.779873
    },
    // add layers to display
    layers: layers
});
/** **/

document.querySelector('#switchlayerbutton').onclick = function() {
    // Get layer to switch display order
    var addedLayer = display.getLayers(1);
    // remove this layer from current map display
    display.removeLayer(addedLayer);
    // add this layer to map display, this layer is above all other layers
    display.addLayer(addedLayer);


    // Get current top layer
    var topLayer = display.getLayers(2);
    document.querySelector('#info').innerText = 'Top layer: ' + topLayer.name;
};

import {MVTLayer, TileLayer, LocalProvider} from '@here/xyz-maps-core';
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
var pointLayer = new TileLayer({
    name: 'my Point Layer',
    min: 4,
    max: 15,
    provider: new LocalProvider({
        name: 'my Point Provider'
    }),
    style: {
        styleGroups: {
            style: [
                {zIndex: 0, type: 'Circle', stroke: '#FFFFFF', fill: '#6B6B6B', radius: 3},
                {
                    zIndex: 1,
                    type: 'Text',
                    textRef: 'properties.name',
                    fill: '#111',
                    offsetY: 12,
                    font: 'bold 13px ariel'
                }
            ]
        },
        assign: function(feature) {
            return 'style';
        }
    }
});

// setup the Map Display
const display = new Map(document.getElementById('map'), {
    zoomLevel: 6,
    center: {
        longitude: 9.610305, latitude: 51.067713
    },

    // add layers to display
    layers: [bgLayer, pointLayer]
});
/** **/

var AddedPoints = [];

// click "Add Points"to add point features, click "Remove Points" to remove the added points
document.querySelector('#pointbutton').onclick = function() {
    if (!AddedPoints.length) {
        // Add point Feature
        AddedPoints = pointLayer.addFeature(Points);

        this.innerText = 'Remove Points';
    } else {
        // Remove the added point Feature
        AddedPoints.forEach(function(point) {
            pointLayer.removeFeature(point);
        });
        AddedPoints = [];

        this.innerText = 'Add Points';
    }
};

// collection of points
var Points = {
    'features': [{
        geometry: {
            coordinates: [13.404954, 52.520008, 0],
            type: 'Point'
        },
        properties: {
            name: 'Berlin'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [11.576124, 48.137154, 0],
            type: 'Point'
        },
        properties: {
            name: 'Munich'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [8.806422, 53.073635, 0],
            type: 'Point'
        },
        properties: {
            name: 'Bremen'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [11.061859, 49.460983, 0],
            type: 'Point'
        },
        properties: {
            name: 'Nuremberg'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [9.993682, 53.551086, 0],
            type: 'Point'
        },
        properties: {
            name: 'Hamburg'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [7.589907, 50.360023, 0],
            type: 'Point'
        },
        properties: {
            name: 'Koblenz'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [9.735603, 52.373920, 0],
            type: 'Point'
        },
        properties: {
            name: 'Hanover'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [8.682127, 50.110924, 0],
            type: 'Point'
        },
        properties: {
            name: 'Frankfurt'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [13.737262, 51.050407, 0],
            type: 'Point'
        },
        properties: {
            name: 'Dresden'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [6.953101, 50.935173, 0],
            type: 'Point'
        },
        properties: {
            name: 'Cologne'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [8.672434, 49.398750, 0],
            type: 'Point'
        },
        properties: {
            name: 'Heidelberg'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [7.468429, 51.514244, 0],
            type: 'Point'
        },
        properties: {
            name: 'Dortmund'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [8.403653, 49.006889, 0],
            type: 'Point'
        },
        properties: {
            name: 'Karlsruhe'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [9.177023, 48.782321, , 0],
            type: 'Point'
        },
        properties: {
            name: 'Stuttgart'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [12.387772, 51.343479, 0],
            type: 'Point'
        },
        properties: {
            name: 'Leipzig'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [9.680845, 50.555809, 0],
            type: 'Point'
        },
        properties: {
            name: 'Fulda'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [12.101624, 49.013432, 0],
            type: 'Point'
        },
        properties: {
            name: 'Regensburg'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [11.323544, 50.979492, 0],
            type: 'Point'
        },
        properties: {
            name: 'Weimar'
        },
        type: 'Feature'
    }],
    'type': 'FeatureCollection'
};

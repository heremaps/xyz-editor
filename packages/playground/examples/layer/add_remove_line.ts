import {MVTLayer, TileLayer, LocalProvider} from '@here/xyz-maps-core';
import {Map} from '@here/xyz-maps-display';

/** setup the Map **/
let backgroundLayer = new MVTLayer({
    min: 1,
    max: 20,
    remote: {
        url: 'https://xyz.api.here.com/tiles/osmbase/512/all/{z}/{x}/{y}.mvt?access_token=' + YOUR_ACCESS_TOKEN
    }
});
var myLayer = new TileLayer({
    min: 15,
    max: 20,
    provider: new LocalProvider({}),
    style: {
        styleGroups: {
            navlinkStyle: [
                {zIndex: 0, type: 'Line', stroke: '#C799E8', strokeWidth: 12, opacity: 0.9}
            ]
        },
        assign: function(feature) {
            return 'navlinkStyle';
        }
    }
});

// setup the Map Display
const display = new Map(document.getElementById('map'), {
    zoomlevel: 18,
    center: {
        longitude: -117.145577, latitude: 32.707129
    },

    // add layers to display
    layers: [backgroundLayer, myLayer]
});
/** **/

let addedLines = [];

// click button to add/remove lines to the TileLayer
document.querySelector('#linebutton').onclick = function() {
    if (!addedLines.length) {
        // add the line features if they have not been added already
        addedLines = myLayer.addFeature(Lines);

        this.innerText = 'Remove Lines';
    } else {
        // Remove the line features
        myLayer.removeFeature(addedLines);

        addedLines = [];

        this.innerText = 'Add Lines';
    }
};

// the lines that should be added to the TileLayer
var Lines = {
    'features': [{
        geometry: {
            coordinates: [[-117.14666, 32.70627, 0], [-117.1458, 32.70628, 0]],
            type: 'LineString'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [[-117.1458, 32.70628, 0], [-117.1458, 32.70732, 0]],
            type: 'LineString'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [[-117.14486, 32.70628, 0], [-117.14486, 32.70731, 0]],
            type: 'LineString'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [[-117.1458, 32.70732, 0], [-117.1458, 32.70836, 0]],
            type: 'LineString'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [[-117.14486, 32.70731, 0], [-117.14488, 32.70836, 0]],
            type: 'LineString'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [[-117.14486, 32.70731, 0], [-117.1458, 32.70732, 0]],
            type: 'LineString'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [[-117.14667, 32.70732, 0], [-117.1458, 32.70732, 0]],
            type: 'LineString'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [[-117.14486, 32.70731, 0], [-117.14397, 32.70732, 0]],
            type: 'LineString'
        },
        type: 'Feature'
    }, {
        geometry: {
            coordinates: [[-117.1458, 32.70628, 0], [-117.14551, 32.70628, 0], [-117.14526, 32.70628, 0], [-117.14486, 32.70628, 0]],
            type: 'LineString'
        },
        type: 'Feature'
    }],
    'type': 'FeatureCollection'
};
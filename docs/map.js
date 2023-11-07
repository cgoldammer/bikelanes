L_NO_TOUCH = false;
L_DISABLE_3D = false;

const getBounds = () => {
    // Return map bounds, rounded to two digits
    const bounds = map.getBounds();
    const res = {
        northEast: {
            lat: bounds._northEast.lat.toFixed(2),
            lng: bounds._northEast.lng.toFixed(2),
        },
        southWest: {
            lat: bounds._southWest.lat.toFixed(2),
            lng: bounds._southWest.lng.toFixed(2),
        },
    };

    // Add the zoom level to the response if it's defined
    if (map.getZoom() !== undefined) {
        res.zoom = map.getZoom();
    }

    return res;
}

y = 40.75;
x = -73.95;


startLocation = [y,x];

var map = L.map('map').setView(startLocation, 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const baselineScaler = 5;
const height = 0.0005 * baselineScaler;
const quad_scalar = 1.8
const width = height*quad_scalar;

const addImage = (location, x ,y, point_google) => {
    imageBounds = [[y - height/2,x-width/2], [y + height/2, x + width/2]];
    L.imageOverlay(location, imageBounds).addTo(map);
}

const clearImages = () => {
    /* Remove all image overlays */
    map.eachLayer((layer) => {
        if (layer instanceof L.ImageOverlay) {
            map.removeLayer(layer);
        }
    });
}

var imageJson = [];

const imagesAfterFilter = () => {
    
    if (imageJson.length == 0) {
        return [];
    }

    const maxImages = 500;
    
    // Take random sample of size maxImages
    const imagesSelected = imageJson.sort(() => Math.random() - Math.random()).slice(0, maxImages);

    /* Selected car is the value of the selected buttonCar */
    const buttons = [
        ['buttonCar', 'obstruct_car', 'boolean'],
        ['buttonLane', 'lane_max', 'string']
    ];

    const getFilter = (buttonName, filterName, filterType) => {
        let selectedButton = document.querySelector(`.${buttonName}.selected`);
        if (selectedButton == null) {
            return null;
        }
        let value = selectedButton.value;
        if (value == 'all') {
            return null;
        }

        if (filterType == 'boolean') {
            return value == 'yes' ? true : false;
        } else {
            return value;
        }
    }

    

    const filterList = buttons.map(button => getFilter(button[0], button[1], button[2]));
    console
    console.log(filterList)
    /* Apply the filters to the images */
    const filteredImages = imagesSelected.filter(image => {
        for (let i = 0; i < filterList.length; i++) {
            if (filterList[i] != null && image[buttons[i][1]] != filterList[i]) {
                return false;
            }
        }
        return true;
    });

    console.log("Length after filtering: " + filteredImages.length)
    console.log(filteredImages)

    return filteredImages;
}

const updateDisplay = () => {
    displayImages(imagesAfterFilter());
}


var filters = document.querySelectorAll('.buttonFilter');
    // Add the onclick event to each filter
filters.forEach(filter => {
    filter.onclick = () => {
        
        value = filter.value; 
        
        /* Set this button to selected and all other buttons in the same class to not selected */
        filter.classList.add('selected');
        document.querySelectorAll(`.${filter.classList[1]}`).forEach(otherFilter => {
            if (otherFilter != filter) {
                otherFilter.classList.remove('selected');
            }

        });

        updateDisplay();
    }
});


const displayImages = (json) => {
    clearImages();
    console.log("Updating display with number of images: " + json.length)
    json.forEach(row => {
        addImage(row.s3_location, row.x, row.y, row.point_google);
    });
}


const storeImages = (json) => {
    imageJson = json;
    updateDisplay();
}
    

fetch('nyc_bikeroutes_small.geojson')
.then((response) => response.json())
.then((json) => L.geoJSON(json).addTo(map));


fetch('images.json')
    .then((response) => response.json())
    .then((json) => storeImages(json));

/* Upon map movement, print the bounds to the console as a formatted string */
map.on('moveend', () => {
    const bounds = getBounds();
    // Print the bounds in a formatted string
    console.log(`Map moved to [${bounds.southWest.lat}, ${bounds.southWest.lng}, ${bounds.northEast.lat}, ${bounds.northEast.lng}]`);
    // Now print the zoom level and the length of each boundary in meters, rounded to two digits
    console.log(`Zoom level: ${bounds.zoom}`);
    console.log(`North boundary length: ${L.latLng(bounds.northEast.lat, bounds.northEast.lng).distanceTo(L.latLng(bounds.northEast.lat, bounds.southWest.lng)).toFixed(2)} meters`);
});
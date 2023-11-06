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
    console.log("Filtering images")
    console.log(imageJson)

    if (imageJson.length == 0) {
        return [];
    }

    const maxImages = 500;
    
    // Take random sample of size maxImages
    const imagesSelected = imageJson.sort(() => Math.random() - Math.random()).slice(0, maxImages);

    /* Selected car is the value of the selected buttonCar */
    let selectedCar = document.querySelector('.selected')
    if (selectedCar == null) {
        return imagesSelected;
    }
    selectedCar = selectedCar.value;
    

    if (selectedCar == 'both') {
        return imagesSelected;
    }

    const requiredValue = selectedCar == 'yes' ? true : false;
    const filterName = 'obstruct_car';
    const rowIsFiltered = (row) => {
        if (row[filterName] != requiredValue) {
            return false;
        }
        return true;
    }

    return imagesSelected.filter(rowIsFiltered);
}

const updateDisplay = () => {
    displayImages(imagesAfterFilter());
}


var filters = document.querySelectorAll('.buttonCar');
    // Add the onclick event to each filter
filters.forEach(filter => {
    filter.onclick = () => {
        console.log(filter)
        value = filter.value; 
        
        /* Set this button to selected and all other buttons to not selected */
        filters.forEach(filter => {
            if (filter.value == value) {
                filter.classList.add('selected');
            } else {
                filter.classList.remove('selected');
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
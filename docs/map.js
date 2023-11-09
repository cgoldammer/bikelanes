

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

startLocation = [40.75,-73.95 ];

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
    /* Apply the filters to the images */
    const filteredImages = imagesSelected.filter(image => {
        for (let i = 0; i < filterList.length; i++) {
            if (filterList[i] != null && image[buttons[i][1]] != filterList[i]) {
                return false;
            }
        }
        return true;
    });
    return filteredImages;
}

const updateDisplay = () => {
    displayImages(imagesAfterFilter());
}

let showDetails = true;

const toggleButton = document.querySelector('#buttonToggle');
const updateDetailsText = () => {
    toggleButton.innerText = showDetails ? "Hide details" : "Show details";
    document.querySelector('#filterToToggle').hidden = !showDetails;
}

updateDetailsText();

/* Add an onclick event to the button with id
buttonToggle to toggle visibility of the filterToToggle div */
document.querySelector('#buttonToggle').onclick = () => {
    showDetails = !showDetails;
    updateDetailsText();
}

var filters = document.querySelectorAll('.buttonFilter');
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

let maxImages = 50;


var slider = document.getElementById("myRange");
slider.value = maxImages;
var output = document.getElementById("maxNumImages");
const updateHtml = () => {
    output.innerHTML = "Max images: " + maxImages
}
updateHtml();

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    maxImages = this.value;
    updateHtml();
}

slider.onchange = function() {
    updateDisplay();
}


const displayImages = (json) => {
    clearImages();
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

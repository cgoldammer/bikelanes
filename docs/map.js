
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
x = -73.98;

startLocation = [y,x];

var map = L.map('map').setView(startLocation, 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const height = 0.0005 * 2;
const quad_scalar = 1.8
const width = height*quad_scalar;

const addImage = (location, x ,y, point_google) => {
    imageBounds = [[y - height/2,x-width/2], [y + height/2, x + width/2]];
    L.imageOverlay(location, imageBounds).addTo(map);

    // Also add a marker at the location and the marker displays the location
    // L.marker([y,x]).addTo(map).bindPopup(`${point_google}`);
}

const handleImages = (json) => {
    json.forEach(row => {
        addImage(row.s3_location, row.x, row.y, row.point_google);
    })
}

fetch('nyc_bikeroutes_small.geojson')
.then((response) => response.json())
.then((json) => L.geoJSON(json).addTo(map));

fetch('images.json')
    .then((response) => response.json())
    .then((json) => handleImages(json));


// var imageUrl = 'content/images/1q2sok3altaab1lcjnosar____466679377744514.jpg',
// imageBounds = [[y,x], [y + width, x + width*quad_scalar]];
// L.imageOverlay(imageUrl, imageBounds).addTo(map);

/* Upon map movement, print the bounds to the console as a formatted string */
map.on('moveend', () => {
    const bounds = getBounds();
    // Print the bounds in a formatted string
    console.log(`Map moved to [${bounds.southWest.lat}, ${bounds.southWest.lng}, ${bounds.northEast.lat}, ${bounds.northEast.lng}]`);
    // Now print the zoom level and the length of each boundary in meters, rounded to two digits
    console.log(`Zoom level: ${bounds.zoom}`);
    console.log(`North boundary length: ${L.latLng(bounds.northEast.lat, bounds.northEast.lng).distanceTo(L.latLng(bounds.northEast.lat, bounds.southWest.lng)).toFixed(2)} meters`);
});
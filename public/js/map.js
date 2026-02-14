// let map_token = mapToken;

// 1. Select the map element
const mapElement = document.getElementById('map');

// 2. Extract data from the attributes we set in EJS
// mapToken and listing are no longer global variables!
const mapToken = mapElement.getAttribute('data-token');
const listing = JSON.parse(mapElement.getAttribute('data-listing'));

// 3. Initialize Mapbox
mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});
// console.log(listing.geometry.coordinates);

const marker1 = new mapboxgl.Marker( { color: "red" } )
.setLngLat(listing.geometry.coordinates)     // listing.geometry.coordinates
.setPopup(
    new mapboxgl.Popup({offset: 25}).setHTML(
        `<h4>${listing.location}</h4><p> Exact Location will be provided after booking </p>`
    )
)
.addTo(map);

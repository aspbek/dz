

let map, marker;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 25, lng: 37.6173 },
        zoom: 2,
    });

    map.addListener('click', function (e) {
        placeMarker(e.latLng);
    });
}
function placeMarker(location) {
    if (marker) {
        marker.setPosition(location);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            marker.setAnimation(null);
        }, 500);
    } else {
        marker = new google.maps.Marker({
            position: location,
            map: map,
            animation: google.maps.Animation.DROP
        });
    }
}
function removeMarker() {
    if (marker) {
        marker.setMap(null);
        marker = null;
        document.querySelector('.info').innerHTML = '';
    }
}
function showLocationInfo() {
    if (marker) {
        let service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
            location: marker.getPosition(),
            radius: 10000,
            type: ['park', 'museum', 'library', 'point_of_interest', 'restaurant', 'cafe', 'store', 'tourist_attraction']
        }, processResults);
    }
}
function processResults(results, status) {
    let infoDiv = document.querySelector('.info');
    if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
        let infoHTML = '<h2 class="htitle">Места поблизости:</h2><ul>';
        if (results[0].photos && results[0].photos.length) {
            let photoUrl = results[0].photos[0].getUrl({ maxWidth: 500, maxHeight: 500 });
            infoHTML += '<img class="image" src="' + photoUrl + '">';
        }
        for (let i = 0; i < results.length; i++) {
            infoHTML += '<li>' + results[i].name + '</li>';
        }
        infoHTML += '</ul>';

        infoDiv.innerHTML = infoHTML;
    } else {
        infoDiv.innerHTML = '<p>Нет информации, попробуйте отметить другую точку.</p>';
    }
}
let autocomplete;
function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('locationInput'),
        { types: ['(cities)'] }
    );
    autocomplete.addListener('place_changed', onPlaceChanged);
}
function onPlaceChanged() {
    let place = autocomplete.getPlace();
    if (!place.geometry) {
        // User entered the name of a Place that was not suggested
        return;
    }
    // Place the marker and show location info using place.geometry.location
    map.setCenter(place.geometry.location);
    placeMarker(place.geometry.location);
    showLocationInfo();
}
function searchLocation() {
    let input = document.getElementById('locationInput').value;
    let errorMessage = document.getElementById('error-message');
    let loader = document.getElementById('loader');

    if (input.trim() !== '') {
        loader.style.display = 'block';
        let geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': input }, function (results, status) {
            if (status === 'OK') {
                if (results[0].geometry.location) {
                    map.setCenter(results[0].geometry.location);
                    placeMarker(results[0].geometry.location);
                    showLocationInfo();
                }
                loader.style.display = 'none';
            } else {
                errorMessage.textContent = 'Вы ввели некорректное название города или страны.';
                loader.style.display = 'none'; // Скрыть индикатор загрузки в случае ошибки
            }
        });
    } else {
        errorMessage.textContent = 'Пожалуйста, введите название страны или города.';
    }
}
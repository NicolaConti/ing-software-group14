// map.js

var longitude = 11.12;
var latitude = 46.07;
var coordinateCliccate;

var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([longitude, latitude]),
        zoom: 13
    })
});

var overlay = new ol.Overlay({
    element: document.getElementById('overlay'),
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});

map.addOverlay(overlay);

map.on('singleclick', function (event) {
    coordinateCliccate = ol.proj.toLonLat(event.coordinate);
    document.getElementById('modal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    overlay.setPosition(event.coordinate);
});

function chiudiModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function aggiungiSegnalazione() {
    const tipo = document.getElementById('tipo').value;
    const commento = document.getElementById('commento').value;

    fetch('/api/segnalazioni', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tipo: tipo,
            commento: commento,
            data: new Date(),
            coordinate: coordinateCliccate
        })
    })
        .then(response => response.json())
        .then(data => {
            aggiungiMarker(data);
            chiudiModal();
        });
}

function aggiungiMarker(segnalazione) {
    // Implementazione dei marker sulla mappa
}

// Altre funzioni per interazioni utente, se necessario

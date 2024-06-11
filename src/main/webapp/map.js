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

var markerLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
});
map.addLayer(markerLayer);

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
    const coordinate = ol.proj.fromLonLat(coordinateCliccate);

    const marker = new ol.Feature({
        geometry: new ol.geom.Point(coordinate),
        tipo: tipo,
        commento: commento
    });

    const iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
            src: 'marker-icon.png',
            scale: getMarkerScale(map.getView().getZoom())
        })
    });

    marker.setStyle(iconStyle);
    markerLayer.getSource().addFeature(marker);

    document.getElementById('modal').style.display = 'none';

    fetch('/api/segnalazioni', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tipo: tipo,
            commento: commento,
            coordinate: coordinateCliccate
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        });
}

function getMarkerScale(zoom) {
    // Calcola la scala dell'icona in base al livello di zoom
    return 0.05 + (zoom - 13) * 0.005; // Scala iniziale ridotta
}

map.getView().on('change:resolution', function() {
    const zoom = map.getView().getZoom();
    markerLayer.getSource().getFeatures().forEach(feature => {
        const iconStyle = feature.getStyle();
        iconStyle.getImage().setScale(getMarkerScale(zoom));
        feature.setStyle(iconStyle);
    });
});

function aggiungiMarker(segnalazione) {
    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(segnalazione.coordinate)),
        tipo: segnalazione.tipo,
        commento: segnalazione.commento,
        id: segnalazione._id
    });

    const iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
            src: 'marker-icon.png',
            scale: getMarkerScale(map.getView().getZoom())
        })
    });

    marker.setStyle(iconStyle);
    markerLayer.getSource().addFeature(marker);
}

// Carica le segnalazioni dal server
fetch('/api/segnalazioni')
    .then(response => response.json())
    .then(data => {
        data.forEach(segnalazione => {
            aggiungiMarker(segnalazione);
        });
    })
    .catch(error => console.error('Errore:', error));

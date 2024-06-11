var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([11.12, 46.07]),
        zoom: 13
    })
});

var coordinateCliccate;

map.on('singleclick', function (event) {
    coordinateCliccate = ol.proj.toLonLat(event.coordinate);
    document.getElementById('modal').style.display = 'block';
    document.getElementById('modal').style.left = event.pixel[0] + 'px';
    document.getElementById('modal').style.top = event.pixel[1] + 'px';
});

function chiudiModal() {
    document.getElementById('modal').style.display = 'none';
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
    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(segnalazione.coordinate)),
        tipo: segnalazione.tipo,
        commento: segnalazione.commento,
        data: segnalazione.data
    });

    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: 'marker-icon.png',
            scale: 0.1 // dimensione costante
        })
    });

    iconFeature.setStyle(iconStyle);

    var vectorSource = new ol.source.Vector({
        features: [iconFeature]
    });

    var markerLayer = new ol.layer.Vector({
        source: vectorSource
    });

    map.addLayer(markerLayer);

    // Aggiungi un click handler per aprire il modal di visualizzazione della segnalazione
    iconFeature.on('click', function() {
        visualizzaDettagliSegnalazione(segnalazione);
    });
}

// Carica i marker esistenti al caricamento della pagina
window.onload = function() {
    fetch('/api/segnalazioni')
        .then(response => response.json())
        .then(data => {
            data.forEach(segnalazione => {
                aggiungiMarker(segnalazione);
            });
        });
};

function visualizzaDettagliSegnalazione(segnalazione) {
    var dettagli = `
        <p><strong>Tipo:</strong> ${segnalazione.tipo}</p>
        <p><strong>Commento:</strong> ${segnalazione.commento}</p>
        <p><strong>Data:</strong> ${new Date(segnalazione.data).toLocaleString()}</p>
    `;
    document.getElementById('dettagliSegnalazione').innerHTML = dettagli;
    document.getElementById('commentModal').style.display = 'block';
}

function chiudiCommentModal() {
    document.getElementById('commentModal').style.display = 'none';
}

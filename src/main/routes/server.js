const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const routes = require('./routes');

// Middleware per il parsing del body delle richieste in JSON
app.use(express.json());

// Connetti a MongoDB
mongoose.connect(url, {
    serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
        dbName: 'ingsoftware_db',
    }
})
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });


// Utilizza le rotte
app.use(routes);

// Serve file statici
app.use(express.static(path.join(__dirname, 'webapp')));

// Gestione della rotta principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'webapp', 'map.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});

const express = require('express');
const app = express();
const routes = require('./routes/routes');  // Importa le rotte
const mongoose = require('mongoose');

// Altri middleware e configurazioni

app.use('/', routes);  // Utilizza le rotte definite in routes.js

// Configurazione del server e avvio

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const routes = require('./routes'); // Assicurati che routes.js sia nel percorso corretto
const app = express();

// Middleware per il parsing del body delle richieste in JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurazione della sessione
app.use(session({
    secret: 'your-secret-key', // Cambia questo con una chiave segreta
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Imposta su true se utilizzi HTTPS
}));

// Connetti a MongoDB
mongoose.connect('mongodb://localhost:27017/segnalazioni', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connesso a MongoDB'))
    .catch(err => console.error('Errore di connessione a MongoDB', err));

// Middleware per controllare l'autenticazione
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    next();
});

// Utilizza le rotte
app.use(routes);

// Serve file statici
app.use(express.static(path.join(__dirname, 'webapp')));

// Gestione della rotta principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'webapp', 'map.html'));
});

// Rotta di login
app.post('/login', (req, res) => {
    // Aggiungi la tua logica di autenticazione qui
    // Esempio: verifica le credenziali dell'utente e imposta la sessione
    const { username, password } = req.body;
    if (username === 'utente' && password === 'password') { // Cambia questa logica in base al tuo sistema di autenticazione
        req.session.isAuthenticated = true;
        res.redirect('/');
    } else {
        res.redirect('/login.html');
    }
});

// Rotta di logout
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});

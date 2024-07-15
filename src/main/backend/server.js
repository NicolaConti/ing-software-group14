//dependencies mongodb, express, routes per segnalazioni
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const routes = require('../routes/routes');
const dotenv = require('dotenv');

//costanti per express e mongodb
const app = express();
const envPath = path.join(__dirname, '../../../.env'); // Adjust the path as needed
// Load environment variables from .env file
dotenv.config({ path: envPath });
const PORT = process.env.PORT || 3000;
const url = process.env.DB_URL;

//modelli e funzioni da models per queries a mongodb
const { getNextSequence } = require('../models/counter');
const RegUser = require('../models/RegUser');
const Admin = require('../models/Admin');
const LoginHistory = require('../models/LoginHistory');
const Segnalazione = require('../models/Segnalazione');

//inizializzazione express.js
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend'), {
    setHeaders: (res, filePath) => {
        if (path.extname(filePath) === '.js') {
            res.setHeader('Content-Type', 'text/javascript');
        }
    }
}));
app.use('/api', routes);

//connessione a mongodb
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

//codice per session
app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: url,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'native',
    }),
    cookie: {
        secure: false,
        maxAge: 14 * 24 * 60 * 60 * 1000
    }
}));

app.use((req, res, next) => {
    console.log("Session Data:", req.session);
    next();
});

//reindirizzamento di default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

//reindirizzamento a login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

//reindirizzamento a map.html
app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/map.html'));
});

//reindirizzamento a registrazione.html
app.get('/registrazione', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/registrazione.html'));
});

//reindirizzamento a admin-login.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin-login.html'));
});

//funzione per verificare corretta formattazione email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

//funzione per verificare corretta formattazione password
function validatePassword(password) {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(String(password));
}

//funzione per generare data e ora correttamente formattate
function getCurrentDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}/${month}/${day} @ ${hours}:${minutes}:${seconds}`;
}

// POST per registrazione nuovo utente
app.post('/SignIn', async (req, res) => {
    const { username, password, email } = req.body;

    //log dati da HTML
    //console.log('Received data:', req.body);

    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Formato email non corretto' });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ message: 'Formato password non corretto' });
    }

    try {
        //check per esistenza username e email nel database
        const existingUsername = await RegUser.findOne({ username }).exec();
        const existingEmail = await RegUser.findOne({ email }).exec();

        if (existingUsername) {
            return res.status(401).json({ message: 'username already taken' });
        }

        if (existingEmail) {
            return res.status(400).json({ message: 'email already taken' });
        }

        //inserimento nuovo utente in mongodb
        const newUser = new RegUser({ username, password, email, suspended: "0" });
        await newUser.save();

        //reindirizzamento automatico a schermata di login
        console.log("Registrazione eseguita con successo");
        res.status(200).json({ redirect: 'login.html' });
    } catch (err) {
        //log eventuale errore per debug e display su pagina HTML
        //console.error("Error registering user:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST per login utente già registrato
app.post('/login', async (req, res) => {
    //recupero dati da HTML
    const { username, password } = req.body;
    try {
        //log dati per debug
        //console.log("Attempting login with:", username, password);
        //query
        const user = await RegUser.findOne({ username, password }).exec();
        //log risultato query per debug
        //console.log("Query result:", user);
        if (user) {
            //se utente sospeso, non può accedere
            if(user.suspended === '1'){
                res.status(401).json( 'Utente sospeso, contattare l\'amministratore' )
            }
            else {
                //creazione session per l'utente
                req.session.username = user.username;
                //console.log("Session after login:", req.session);
                const dateTime = getCurrentDateTime();

                //log accesso utente su DB per visione da parte di admin
                const newLogin = new LoginHistory();
                newLogin.username = username;
                newLogin.date = dateTime;

                //console.log(newLogin);
                await newLogin.save();

                //reindirizzamento a map.html
                res.status(200).json({redirect: 'map.html'});
            }
        } else {
            //console.log("Login failed");
            res.status(401).json('Username o password errati' );
        }
    } catch (err) {
        //console.error("Error during login:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/delete-account', async (req, res) => {
    const { username, email, password } = req.body;

    //console.log('Received delete account request:', req.body);

    try {
        //query
        const user = await RegUser.findOne({ username, email, password }).exec();

        //controllo che la query non ritorni null
        if (!user) {
            return res.status(401).json('Credenziali invalide' );
        }
        //query per cancellare da mongodb
        await RegUser.deleteOne({ _id: user._id });

        res.status(200).json('Account cancellato con successo' );
    } catch (err) {
        //console.error("Error deleting account:", err);
        res.status(500).json('Internal server error' );
    }
});

//
app.get('/api/username', (req, res) => {
    if (req.session.username) {
        res.status(200).json({ username: req.session.username });
    } else {
        res.status(401).json('Not logged in' );
    }
});

// GET per SPECIFICA segnalazione da DB
app.get('/api/segnalazioni/:id', async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findOne({ id: req.params.id }).exec();
        if (!segnalazione) {
            return res.status(404).json({ message: 'Segnalazione non trovata' });
        }
        res.status(200).json(segnalazione);
    } catch (err) {
        //console.error("Errore durante il recupero della segnalazione:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

// GET per TUTTE le segnalazioni da DB
app.get('/api/segnalazioni', async (req, res) => {
    try {
        const segnalazioni = await Segnalazione.find();
        res.status(200).json(segnalazioni);
    } catch (err) {
        //console.error("Errore durante il recupero delle segnalazioni:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

// POST per creazione nuova segnalazione
app.post('/api/segnalazioni', async (req, res) => {
    const { tipo, commento, coordinate, gravity } = req.body;

    try {
        //nuovo id sequenziale da Counter in DB
        const newId = await getNextSequence('segnalazioneId');
        //creazione nuovo document mongodb
        const newSegnalazione = new Segnalazione({
            id: newId,
            tipo,
            commento,
            coordinate,
            gravity,
            feedbacks: []
        });

        await newSegnalazione.save();
        //restituisco la nuova segnalazione
        res.status(201).json(newSegnalazione);
    } catch (err) {
        //restituisco errore
        //console.error("Errore durante la creazione della segnalazione:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

// GET per feedbacks di una specifica segnalazione
app.get('/api/segnalazioni/:id/feedbacks', async (req, res) => {
    //recupero dati da HTML
    const segnalazioneId = Number(req.params.id);
    //controllo che il campo sia compilato correttamente
    if (isNaN(segnalazioneId)) {
        return res.status(400).json({ message: 'ID della segnalazione non valido' });
    }
    //cerco segnalazione nel DB, restituisco i feedbacks o errore
    try {
        const segnalazione = await Segnalazione.findOne({ id: segnalazioneId }).exec();
        if (!segnalazione) {
            return res.status(404).json({ message: 'Segnalazione non trovata' });
        }
        res.status(200).json(segnalazione.feedbacks);
    } catch (err) {
        //console.error("Errore durante il recupero dei feedback:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

// POST per aggiunta feedback a segnalazione
app.post('/api/segnalazioni/:id/feedbacks', async (req, res) => {
    //recupero dati da HTML
    const { username, commento } = req.body;
    const segnalazioneId = Number(req.params.id);

    if (isNaN(segnalazioneId)) {
        return res.status(400).json({ message: 'ID della segnalazione non valido' });
    }
    //cerco segnalazione, aggiungo feedback, restituisco messaggio oppure errore
    try {
        const segnalazione = await Segnalazione.findOne({ id: segnalazioneId }).exec();
        if (!segnalazione) {
            return res.status(404).json({ message: 'Segnalazione non trovata' });
        }
        //creazione nuovo documento sulla base del modello
        const newFeedback = { username, commento };

        segnalazione.feedbacks.push(newFeedback);
        await segnalazione.save();

        res.status(200).json({ message: 'Feedback aggiunto con successo' });
    } catch (err) {
        //console.error("Errore durante l'aggiunta del feedback:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

// POST per logout utente
app.post('/logout', async (req, res) => {
    if(req.session.username){
        req.session.destroy();
        console.log("Logout successful");
        //utente autenticato, devo chiudere la sessione
        res.redirect('login.html');
        //console.log("User " + req.session.username + " logout successful");
    }
    else{
        //utente ospite, solo redirect
        res.redirect('login.html');
        //console.log("Guest user redirect successful");
    }
    //se non entra in nessuno dei due casi, errore
    res.status(500).send('Internal server error');
});

// POST per login amministratore
app.post('/admin-login', async (req, res) => {
    //recupero dati da HTML
    const username = req.body.username;
    const password = req.body.password;
    try {
        //console.log("Attempting login with:", username, password);

        //creazione query
        let query = Admin.findOne();
        query.where('username', username);
        query.where('password', password);

        //esecuzione query
        const admin = await query.exec();

        //console.log("Query result:", admin);
        if (admin) {
            //creo sessione per admin, redirect a admin-dashboard.html
            req.session.username = admin.username;
            //console.log("Admin " + admin.username + " logged in correctly");
            res.status(200).json({ redirect: 'admin-dashboard.html' });
        } else {
            //campi non corretti
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        //console.error("Error during login:", err);
        res.status(500).send('Internal server error');
    }
});

// POST per logout amministratore
app.post('/admin-logout', async (req, res) => {
    if(req.session.username){
        req.session.destroy();
        //chiudo sessione e redirect a pagina default
        //console.log("Admin " + req.session.username + " logout successful");
        alert("Logout successful");
        res.redirect('login.html');
    } else {
        //redirect ma con errore mostrato su pagina
        res.redirect('login.html');
        //console.log("Logout NON avvenuto con successo");
        res.status(500).send('Internal server error');
    }

});

// GET per ricevere la lista di accessi (presa da DB)
app.get('/login-history', async (req, res) => {
    try {
        //esecuzione query
        const loginHistories = await LoginHistory.find().exec();
        const result = loginHistories.map(history => `${history.username}, ${history.date}`);
        //console.log('Processed Result:', result);
        //mando a HTML i dati recuperati per display su pagina
        res.json(result);
    } catch (error) {
        //console.error('Error fetching login history:', error);
        res.status(500).json('Internal Server Error' );
    }
});

// GET per ricevere la lista degli utenti registrati (presa da DB)
app.get('/fetch-users', async (req, res) => {
    try {
        //esecuzione query
        const RegUsers = await RegUser.find().exec();
        //processo i risultati per essere mostrati
        const result = RegUsers.map(history => `${history.username}`);
        //console.log('Processed Result:', result);
        //mando a HTML i risultati formattati della query
        res.json(result);
    } catch (error) {
        //console.error('Error fetching login history:', error);
        res.status(500).json('Internal Server Error' );
    }
});

// POST per sospendere un utente
app.post('/suspend-user', async (req, res) => {
    //recupero parametri da HTML
    const username = req.body.username;
    try {
        //console.log("Attempting to suspend:", username);
        //creazione query
        let query = RegUser.findOne();
        query.where('username', username);

        //esecuzione query
        const user = await query.exec();
        //console.log("Query result:", user);

        if (user) {
            //se utente sospeso, mando messaggio
            if (user.suspended === "1") {
                return res.status(400).send('L\'utente è già sospeso');
            }
            //se utente non sospeso, aggiorno il campo nel DB
            await RegUser.updateOne({ username: user.username }, { $set: { suspended: "1" } });
            //console.log("User suspended successfully");
            //informo a schermo del successo
            res.send('Utente sospeso con successo');
        } else {
            //username non trovato nel DB
            res.status(401).send('Username non valido');
        }
    } catch (err) {
        //console.error("Error during suspension:", err);
        res.status(500).send('Internal server error');
    }
});

// GET per recuperare utenti sospesi (da DB)
app.get('/fetch-suspended', async (req, res) => {
    try {
        //creo ed eseguo query
        const RegUsers = await RegUser.find({suspended: "1"}).exec();
        //formatto output query
        const result = RegUsers.map(history => `${history.username}`);
        //console.log('Processed Result:', result);
        //mando risultato a HTML
        res.json(result);
    } catch (error) {
        //console.error('Error fetching login history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST per togliere sospensione ad un utente
app.post('/unsuspend-user', async (req, res) => {
    //prendo parametri da frontend
    const username = req.body.username;
    try {
        //console.log("Attempting to unsuspend:", username);
        //generazione query per trovare utente
        let query = RegUser.findOne();
        query.where('username', username);
        //esecuzione query
        const user = await query.exec();
        //console.log("Query result:", user);

        if (user) {
            //se ho trovato l'utente, lo sospendo
            await RegUser.updateOne({username: user.username}, {$set: {suspended: "0"}}).exec();
            //console.log("User unsuspended updated successfully");
            res.send('Sospensione rimossa con successo');
        } else {
            //username non trovato nel DB
            res.status(401).send('Username non valido');
        }
    } catch (err) {
        console.error("Error during unsuspend:", err);
        res.status(500).send('Internal server error');
    }
});

// GET per recuperare tutte le segnalazioni
app.get('/fetch-segnalazioni', async (req, res) => {
    try {
        //cerco segnalazioni nel db
        const Segnalaz = await Segnalazione.find().exec();
        //formatto per display su pagina
        const result = Segnalaz.map(history => `${history.id}, ${history.tipo}, ${history.commento}`);
        //console.log('Processed Result:', result);
        //mando a HTML
        res.json(result);
    } catch (error) {
        //console.error('Error fetching login history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST per chiudere una segnalazione, dato l'ID
app.post('/close-segnalazione', async (req, res) => {
    //recupero ID
    const id = req.body.id_segnalazione;
    try {
        //console.log("Attempting to close:", id);
        //cerco segnalazione specifica su DB
        let query = Segnalazione.findOne();
        query.where('id', Number(id));

        const segnalazione = await query.exec();
        //console.log("Query result:", segnalazione);
        if (segnalazione) {
            //se l'ho trovata, la cancello
            await Segnalazione.deleteOne({id: segnalazione.id}).exec();
            //console.log("Segnalazione closed successfully");
            res.send('Segnalazione chiusa con successo');
        } else {
            //altrimenti mando errore
            res.status(401).send('ID segnalazione non valido');
        }
    } catch (err) {
        //console.error("Error during close-segnalazione:", err);
        res.status(500).send('Internal server error');
    }
});

// GET per recuperare tutti i feedback di una segnalazione, dato il suo ID
app.post('/fetch-feedbacks', async (req, res) => {
    const { segnalazione_id } = req.body;

    try {
        const segnalazione = await Segnalazione.findOne({ id: segnalazione_id }).exec();
        if (!segnalazione) {
            return res.status(404).json('Segnalazione non trovata' );
        }

        const feedbacks = segnalazione.feedbacks;
        res.status(200).json(feedbacks);
    } catch (error) {
        //console.error('Error fetching feedback:', error);
        res.status(500).json('Internal Server Error' );
    }
});

// POST per cancellare un feedback da una segnalazione
app.post('/delete-feedback', async (req, res) => {
    const { segnalazione_id, username, commento } = req.body;

    try {
        //console.log('Received delete-feedback request:', req.body); // Log the received request

        const segnalazione = await Segnalazione.findOne({ id: segnalazione_id }).exec();
        if (!segnalazione) {
            //console.log('Segnalazione not found for id:', segnalazione_id); // Log if segnalazione not found
            return res.status(404).json('Segnalazione not found' );
        }

        const feedback = segnalazione.feedbacks.find(f => f.username === username && f.commento === commento);
        if (!feedback) {
            console.log('Feedback not found for username and commento:', username, commento); // Log if feedback not found
            return res.status(404).json({ message: 'Feedback non trovato' });
        }

        segnalazione.feedbacks = segnalazione.feedbacks.filter(f => f._id.toString() !== feedback._id.toString());
        await segnalazione.save();

        console.log('Feedback deleted successfully:', feedback); // Log successful deletion
        res.status(200).json('Feedback cancellato con successo' );
    } catch (error) {
        console.error('Error deleting feedback:', error); // Log the error
        res.status(500).json('Internal Server Error' );
    }
});

//reindirizzamento a login.html per qualsiasi caso non trattato sopra
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/', 'login.html'));
});

// log per sapere la porta del server: http://localhost:${PORT}
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

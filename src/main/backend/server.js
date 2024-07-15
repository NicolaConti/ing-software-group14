const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const routes = require('../routes/routes');

const app = express();
const PORT = process.env.PORT || 3000;
const url = "mongodb+srv://continicolaa:NikyZen01@ingsoftwaredb.nocpa6u.mongodb.net/ingsoftware_db?retryWrites=true&w=majority&appName=IngSoftwareDB";

const { getNextSequence } = require('../models/counter');
const RegUser = require('../models/RegUser');
const Admin = require('../models/Admin');
const LoginHistory = require('../models/LoginHistory');
const Segnalazione = require('../models/Segnalazione');

//let id_segnalazione;

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/map.html'));
});

app.get('/registrazione', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/registrazione.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin-login.html'));
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(String(password));
}

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

app.post('/SignIn', async (req, res) => {
    const { username, password, email } = req.body;

    console.log('Received data:', req.body);

    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'wrong email format' });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ message: 'wrong password format' });
    }

    try {
        const existingUsername = await RegUser.findOne({ username }).exec();
        const existingEmail = await RegUser.findOne({ email }).exec();

        if (existingUsername) {
            return res.status(401).json({ message: 'username already taken' });
        }

        if (existingEmail) {
            return res.status(400).json({ message: 'email already taken' });
        }

        const newUser = new RegUser({ username, password, email, suspended: "0" });
        await newUser.save();

        res.status(200).json({ redirect: 'login.html' });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log("Attempting login with:", username, password);

        const user = await RegUser.findOne({ username, password }).exec();

        console.log("Query result:", user);
        if (user) {
            if(user.suspended === '1'){
                res.status(401).json( { message: 'Utente sospeso, contattare l\'amministratore' } )
            }
            else {
                req.session.username = user.username;
                console.log("Session after login:", req.session);
                const dateTime = getCurrentDateTime();
                const newLogin = new LoginHistory();
                newLogin.username = username;
                newLogin.date = dateTime;
                console.log(newLogin);
                await newLogin.save();
                res.status(200).json({redirect: 'map.html'});
            }
        } else {
            console.log("Login failed");
            res.status(401).json({ message: 'wrong username or password' });
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/delete-account', async (req, res) => {
    const { username, email, password } = req.body;

    console.log('Received delete account request:', req.body);

    try {
        const user = await RegUser.findOne({ username, email, password }).exec();

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        await RegUser.deleteOne({ _id: user._id });

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error("Error deleting account:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/username', (req, res) => {
    if (req.session.username) {
        res.status(200).json({ username: req.session.username });
    } else {
        res.status(401).json({ message: 'Not logged in' });
    }
});

app.get('/api/segnalazioni/:id', async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findOne({ id: req.params.id }).exec();
        if (!segnalazione) {
            return res.status(404).json({ message: 'Segnalazione non trovata' });
        }
        res.status(200).json(segnalazione);
    } catch (err) {
        console.error("Errore durante il recupero della segnalazione:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

app.get('/api/segnalazioni', async (req, res) => {
    try {
        const segnalazioni = await Segnalazione.find();
        res.status(200).json(segnalazioni);
    } catch (err) {
        console.error("Errore durante il recupero delle segnalazioni:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

app.post('/api/segnalazioni', async (req, res) => {
    const { tipo, commento, coordinate } = req.body;

    try {
        const newId = await getNextSequence('segnalazioneId');

        const newSegnalazione = new Segnalazione({
            id: newId,
            tipo,
            commento,
            coordinate,
            feedbacks: []
        });

        await newSegnalazione.save();
        res.status(201).json(newSegnalazione);
    } catch (err) {
        console.error("Errore durante la creazione della segnalazione:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

app.get('/api/segnalazioni/:id/feedbacks', async (req, res) => {
    const segnalazioneId = Number(req.params.id);

    if (isNaN(segnalazioneId)) {
        return res.status(400).json({ message: 'ID della segnalazione non valido' });
    }

    try {
        const segnalazione = await Segnalazione.findOne({ id: segnalazioneId }).exec();
        if (!segnalazione) {
            return res.status(404).json({ message: 'Segnalazione non trovata' });
        }
        res.status(200).json(segnalazione.feedbacks);
    } catch (err) {
        console.error("Errore durante il recupero dei feedback:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

app.post('/api/segnalazioni/:id/feedbacks', async (req, res) => {
    const { username, commento } = req.body;
    const segnalazioneId = Number(req.params.id);

    if (isNaN(segnalazioneId)) {
        return res.status(400).json({ message: 'ID della segnalazione non valido' });
    }

    try {
        const segnalazione = await Segnalazione.findOne({ id: segnalazioneId }).exec();
        if (!segnalazione) {
            return res.status(404).json({ message: 'Segnalazione non trovata' });
        }

        const newFeedback = { username, commento };

        segnalazione.feedbacks.push(newFeedback);
        await segnalazione.save();

        res.status(200).json({ message: 'Feedback aggiunto con successo' });
    } catch (err) {
        console.error("Errore durante l'aggiunta del feedback:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

app.post('/logout', async (req, res) => {
    if(req.session.username){
        res.redirect('login.html');
        console.log("Logout Successful");
        console.log("User " + req.session.username + " logout successful");
        req.session.destroy();
    }
    else{
        res.redirect('login.html');
        console.log("Guest user redirect successful");
    }

});

app.post('/admin-login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        console.log("Attempting login with:", username, password);

        let query = Admin.findOne();
        query.where('username', username);
        query.where('password', password);

        const admin = await query.exec();

        console.log("Query result:", admin);
        if (admin) {
            req.session.username = admin.username;
            console.log("Admin " + admin.username + " logged in correctly");
            res.status(200).json({ redirect: 'admin-dashboard.html' });
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send('Internal server error');
    }
});

app.post('/admin-logout', async (req, res) => {
    if(req.session.username){
        console.log("Logout Successful");
        console.log("Admin " + req.session.username + " logout successful");
        req.session.destroy();
        res.redirect('login.html');
    } else {
        res.redirect('login.html');
        console.log("Logout not correctly executed, check logs");
    }
});

app.get('/login-history', async (req, res) => {
    try {
        const loginHistories = await LoginHistory.find().exec();
        const result = loginHistories.map(history => `${history.username}, ${history.date}`);
        console.log('Processed Result:', result);
        res.json(result);
    } catch (error) {
        console.error('Error fetching login history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/fetch-users', async (req, res) => {
    try {
        const RegUsers = await RegUser.find().exec();
        const result = RegUsers.map(history => `${history.username}`);
        console.log('Processed Result:', result);
        res.json(result);
    } catch (error) {
        console.error('Error fetching login history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/suspend-user', async (req, res) => {
    const username = req.body.username;
    try {
        console.log("Attempting to suspend:", username);
        let query = RegUser.findOne();
        query.where('username', username);

        const user = await query.exec();
        console.log("Query result:", user);

        if (user) {
            if (user.suspended === "1") {
                return res.status(400).send('User is already suspended');
            }

            await RegUser.updateOne({ username: user.username }, { $set: { suspended: "1" } });
            console.log("User suspended successfully");

            res.send('Suspend successful');
        } else {
            res.status(401).send('Invalid username');
        }
    } catch (err) {
        console.error("Error during suspension:", err);
        res.status(500).send('Internal server error');
    }
});

app.get('/fetch-suspended', async (req, res) => {
    try {
        const RegUsers = await RegUser.find({suspended: "1"}).exec();
        const result = RegUsers.map(history => `${history.username}`);
        console.log('Processed Result:', result);
        res.json(result);
    } catch (error) {
        console.error('Error fetching login history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/unsuspend-user', async (req, res) => {
    const username = req.body.username;
    try {
        console.log("Attempting to unsuspend:", username);
        let query = RegUser.findOne();
        query.where('username', username);

        const user = await query.exec();
        console.log("Query result:", user);

        if (user) {
            await RegUser.updateOne({username: user.username}, {$set: {suspended: "0"}}).exec();
            console.log("User unsuspended updated successfully");
            res.send('Unsuspend successful');
        } else {
            res.status(401).send('Invalid username');
        }
    } catch (err) {
        console.error("Error during unsuspend:", err);
        res.status(500).send('Internal server error');
    }
});

app.get('/fetch-segnalazioni', async (req, res) => {
    try {
        const Segnalaz = await Segnalazione.find().exec();
        const result = Segnalaz.map(history => `${history.id}, ${history.tipo}, ${history.commento}`);
        console.log('Processed Result:', result);
        res.json(result);
    } catch (error) {
        console.error('Error fetching login history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/close-segnalazione', async (req, res) => {
    const id = req.body.id_segnalazione;
    try {
        console.log("Attempting to close:", id);
        let query = Segnalazione.findOne();
        query.where('id', Number(id));

        const segnalazione = await query.exec();
        console.log("Query result:", segnalazione);

        if (segnalazione) {
            await Segnalazione.deleteOne({id: segnalazione.id}).exec();
            console.log("Segnalazione close updated successfully");
            res.send('Closing segnalazione successful');
        } else {
            res.status(401).send('Invalid ID');
        }
    } catch (err) {
        console.error("Error during close-segnalazione:", err);
        res.status(500).send('Internal server error');
    }
});

app.post('/fetch-feedbacks', async (req, res) => {
    const { segnalazione_id } = req.body;

    try {
        const segnalazione = await Segnalazione.findOne({ id: segnalazione_id }).exec();
        if (!segnalazione) {
            return res.status(404).json({ message: 'Segnalazione not found' });
        }

        const feedbacks = segnalazione.feedbacks;
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/delete-feedback', async (req, res) => {
    const { segnalazione_id, username, commento } = req.body;

    try {
        console.log('Received delete-feedback request:', req.body); // Log the received request

        const segnalazione = await Segnalazione.findOne({ id: segnalazione_id }).exec();
        if (!segnalazione) {
            console.log('Segnalazione not found for id:', segnalazione_id); // Log if segnalazione not found
            return res.status(404).json({ message: 'Segnalazione not found' });
        }

        const feedback = segnalazione.feedbacks.find(f => f.username === username && f.commento === commento);
        if (!feedback) {
            console.log('Feedback not found for username and commento:', username, commento); // Log if feedback not found
            return res.status(404).json({ message: 'Feedback not found' });
        }

        segnalazione.feedbacks = segnalazione.feedbacks.filter(f => f._id.toString() !== feedback._id.toString());
        await segnalazione.save();

        console.log('Feedback deleted successfully:', feedback); // Log successful deletion
        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Error deleting feedback:', error); // Log the error
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

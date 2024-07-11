const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const routes = require('../routes/routes');
const usernameMiddleware = require('../models/username'); // Import the middleware

const app = express();
const PORT = process.env.PORT || 3000;
const url = "mongodb+srv://continicolaa:NikyZen01@ingsoftwaredb.nocpa6u.mongodb.net/ingsoftware_db?retryWrites=true&w=majority&appName=IngSoftwareDB";

// Importa moduli per MongoDB
const { getNextSequence } = require('../models/counter');
const RegUser = require('../models/RegUser');
const Admin = require('../models/Admin');
const LoginHistory = require('../models/LoginHistory');
const Segnalazione = require('../models/Segnalazione');

// Middleware
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
app.use(usernameMiddleware); // Use the middleware

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Connect to MongoDB
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

// Serve static files
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

app.get('/recovery', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/recovery.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin-login.html'));
});

// Utility functions to validate email and password formats
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
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}/${month}/${day} @ ${hours}:${minutes}:${seconds}`;
}

// Route for user registration
app.post('/SignIn', async (req, res) => {
    const { username, password, email } = req.body;

    console.log('Received data:', req.body);

    // Validate email and password format
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

        const newUser = new RegUser({ username, password, email, auth: "0", suspended: "0" });
        await newUser.save();

        // Log the registration
        const registrationData = `${new Date().toISOString()} - REGISTER - Username: ${username}, Email: ${email}\n`;
        fs.appendFileSync('../frontend/registered_users.txt', registrationData);

        // Send success response
        res.status(200).json({ redirect: 'map.html' });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route for user login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log("Attempting login with:", username, password);

        const user = await RegUser.findOne({ username, password }).exec();

        console.log("Query result:", user);
        if (user) {
            const dateTime = getCurrentDateTime();
            const newLogin = new LoginHistory();
            newLogin.username = username;
            newLogin.date = dateTime;
            console.log(newLogin);
            await newLogin.save();
            RegUser.updateOne({username: user.username}, {$set: {auth: "1"}}).exec().then(() => {
                console.log("User " + user.username + " auth updated successfully (login)");
                res.status(200).json({ redirect: 'map.html' });
            }).catch((err) => {
                console.error("Error updating user " + user.username + " auth (login): ", err);
            });
        } else {
            console.log("Login failed");
            res.status(401).json({ message: 'wrong username or password' });
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Rotte per ottenere i dettagli di una segnalazione e i suoi feedback
app.get('/api/segnalazioni/:id', async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findOne({id: req.params.id}, null, null).exec();
        if (!segnalazione) {
            return res.status(404).json({ message: 'Segnalazione non trovata' });
        }
        res.status(200).json(segnalazione);
    } catch (err) {
        console.error("Errore durante il recupero della segnalazione:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

// Route to create a new segnalazione
app.post('/api/segnalazioni', async (req, res) => {
    const { tipo, commento, coordinate } = req.body;

    try {
        const newId = await getNextSequence('segnalazioneId'); // Utilizza la funzione per ottenere il prossimo ID

        const newSegnalazione = new Segnalazione({
            id: newId, // Usa il nuovo ID generato
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

    // Verifica che l'ID della segnalazione sia un numero valido
    if (isNaN(segnalazioneId)) {
        return res.status(400).json({ message: 'ID della segnalazione non valido' });
    }

    try {
        const segnalazione = await Segnalazione.findOne({ id: segnalazioneId }, null, null).exec();
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

    // Verifica che l'ID della segnalazione sia un numero valido
    if (isNaN(segnalazioneId)) {
        return res.status(400).json({ message: 'ID della segnalazione non valido' });
    }

    try {
        const segnalazione = await Segnalazione.findOne({ id: segnalazioneId }, null, null).exec();
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

// Route per il logout
app.post('/logout', async (req, res) => {
    const username = req.username; // Use the username from the middleware
    if (username) {
        await RegUser.updateOne({username}, {$set: {auth: "0"}}).exec().then(() => {
            res.redirect('login.html');
            console.log("Logout Successful");
            console.log("User " + username + " auth updated successfully (logout)");
        }).catch((err) => {
            console.error("Error updating user " + username + " auth (logout): ", err);
        });
    } else {
        res.redirect('login.html');
        console.log("Guest user redirect successful");
    }
});

app.post('/admin-login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        console.log("Attempting login with:", username, password);

        const admin = await Admin.findOne({ username, password }).exec();

        console.log("Query result:", admin);
        if (admin) {
            await Admin.updateOne({ username }, { $set: { auth: "1" } }).exec();
            console.log("Admin " + username + " auth updated successfully (login)");
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
    const username = req.username; // Use the username from the middleware
    await Admin.updateOne({ username }, { $set: { auth: "0" } }).exec().then(() => {
        console.log("Logout Successful");
        console.log("Admin " + username + " auth updated successfully (logout)");
        res.redirect('login.html');
    }).catch((err) => {
        console.error("Error updating admin " + username + " auth (logout): ", err);
    });
});

app.get('/login-history', async (req, res) => {
    try {
        const loginHistories = await LoginHistory.find().exec();
        const result = loginHistories.map(history => `${history.username}, ${history.date}`);
        console.log('Processed Result:', result); // Log processed result
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
        console.log('Processed Result:', result); // Log processed result
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
        const user = await RegUser.findOne({ username }).exec();
        console.log("Query result:", user);

        if (user) {
            if (user.suspended === "1") {
                return res.status(400).send('User is already suspended');
            }

            await RegUser.updateOne({ username }, { $set: { suspended: "1" } });
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
        const RegUsers = await RegUser.find({ suspended: "1" }).exec();
        const result = RegUsers.map(history => `${history.username}`);
        console.log('Processed Result:', result); // Log processed result
        res.json(result);
    } catch (error) {
        console.error('Error fetching login history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/unsuspend-user', async (req, res) => {
    const username = req.body.username;
    try {
        console.log("Attempting to suspend:", username);
        const user = await RegUser.findOne({ username }).exec();
        console.log("Query result:", user);

        if (user) {
            await RegUser.updateOne({ username }, { $set: { suspended: "0" } }).exec().then(() => {
                console.log("User unsuspended updated successfully");
            }).catch((err) => {
                console.error("Error updating user unsuspended: ", err);
            });
            res.send('Unsuspend successful');
        } else {
            res.status(401).send('Invalid username');
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send('Internal server error');
    }
});

app.get('/fetch-segnalazioni', async (req, res) => {
    try {
        const Segnalaz = await Segnalazione.find().exec();
        const result = Segnalaz.map(history => `${history.id}, ${history.tipo}, ${history.commento}`);
        console.log('Processed Result:', result); // Log processed result
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
        const segnalazione = await Segnalazione.findOne({ id: Number(id) }).exec();
        console.log("Query result:", segnalazione);

        if (segnalazione) {
            await Segnalazione.deleteOne({ id: segnalazione.id }).exec().then(() => {
                console.log("Segnalazione close updated successfully");
            }).catch((err) => {
                console.error("Error closing segnalazione: ", err);
            });
            res.send('Closing segnalazione successful');
        } else {
            res.status(401).send('Invalid ID');
        }
    } catch (err) {
        console.error("Error during close-segnalazione:", err);
        res.status(500).send('Internal server error');
    }
});

// Render comments page and pass username
app.get('/comments', async (req, res) => {
    // Assume the user is authenticated and their ID is stored in the session
    const userId = req.session.userId; // Adjust this according to your authentication logic

    try {
        const user = await RegUser.findById(userId).exec();
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('comments', { username: user.username });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).send('Internal server error');
    }
});

app.get('/api/current-user', async (req, res) => {
    const userId = req.session.userId; // Adjust this according to your authentication logic

    try {
        const user = await RegUser.findById(userId).exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ username: user.username });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

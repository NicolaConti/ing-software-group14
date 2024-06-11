const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;
const url = "mongodb+srv://continicolaa:NikyZen01@ingsoftwaredb.nocpa6u.mongodb.net/ingsoftware_db?retryWrites=true&w=majority&appName=IngSoftwareDB";
let user;

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

// Define the schema for the 'Admin' collection
const adminSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    auth: String,
}, {collection: 'Admin'});

// Define the model for the 'Admin' collection
const Admin = mongoose.model('Admin', adminSchema);

// Define the schema for the 'RegUser' collection
const regUserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    auth: String,
    suspended: String
}, {collection: 'RegisteredUser'});

// Define the model for the 'RegUser' collection
const RegUser = mongoose.model('RegUser', regUserSchema);

const LoginHistorySchema = new mongoose.Schema( {
    username: String,
    date: String
}, {collection: 'LoginHistory'});

const LoginHistory = mongoose.model('LoginHistory', LoginHistorySchema);

const segnalazioniSchema = new mongoose.Schema({
    Id: Number,
    tipo: String,
    commento: String,
    coordinate: Array(2)
}, {collection: 'Segnalazioni'});

const Segnalazioni = mongoose.model('Segnalazioni', segnalazioniSchema);

app.use(cors());
// Middleware to parse JSON body
app.use(bodyParser.json());

// Serve static files from the 'webapp' directory
app.use(express.static(path.join(__dirname), {
    // Set headers to force the correct MIME type for .js files
    setHeaders: (res, filePath) => {
        if (path.extname(filePath) === '.js') {
            res.setHeader('Content-Type', 'text/javascript');
        }
    }
}));

// Define a route handler for the root URL ("/")
app.get('/', (req, res) => {
    // Send the login.html file when the root URL is accessed
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/recovery', (req, res) => {
    // Send the login.html file when the root URL is accessed
    res.sendFile(path.join(__dirname, 'recovery.html'));
});

app.post('/admin-login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        // Log the incoming username and password
        console.log("Attempting login with:", username, password);

        let query = Admin.findOne();
        query.where('username', username);
        query.where('password', password);

        user = await query.exec();

        // Log the result of the query (for debugging)
        console.log("Query result:", user);
        if (user) {
            // User found, login successful

            Admin.updateOne({username: user.username}, {$set: {auth: "1"}}).exec().then(() => {
                console.log("Admin auth updated successfully (login)");
            }).catch((err) => {
                console.error("Error updating Admin auth (login): ", err);
            });

            res.send('Login successful');
        } else {
            // User not found or password incorrect, login failed
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send('Internal server error');
    }
});

app.post('/admin-logout', async (req, res) => {
    await Admin.updateOne({username: user.username}, {$set: {auth: "0"}}).exec().then(() => {
        console.log("Logout Successful");
        console.log("Admin auth updated successfully (logout)");
        res.redirect('/login.html');
    }).catch((err) => {
        console.error("Error updating admin auth (logout): ", err);
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
        let query = RegUser.findOne();
        query.where('username', username);

        user = await query.exec();
        console.log("Query result:", user);

        if (user) {
            // User found
            if (user.suspended === "1") {
                return res.status(400).send('User is already suspended');
            }

            // Update the user's suspended status to "1"
            await RegUser.updateOne({ username: user.username }, { $set: { suspended: "1" } });
            console.log("User suspended successfully");

            res.send('Suspend successful');
        } else {
            // User not found
            res.status(401).send('Invalid username');
        }
    } catch (err) {
        console.error("Error during suspension:", err);
        res.status(500).send('Internal server error');
    }
});

app.get('/fetch-suspended', async (req, res) => {
    try {
        const RegUsers = await RegUser.find({suspended: "1"} ).exec();
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
        let query = RegUser.findOne();
        query.where('username', username);

        user = await query.exec();
        console.log("Query result:", user);

        if (user) {
            // User found
            RegUser.updateOne({username: user.username}, {$set: {suspended: "0"}}).exec().then(() => {
                console.log("User unsuspended updated successfully");
            }).catch((err) => {
                console.error("Error updating user unsuspended: ", err);
            });

            res.send('Unsuspend successful');
        } else {
            // User not found
            res.status(401).send('Invalid username');
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send('Internal server error');
    }
});

app.get('/fetch-segnalazioni', async (req, res) => {
    try {
        const Segnalaz = await Segnalazioni.find().exec();
        const result = Segnalaz.map(history => `${history.Id}, ${history.tipo}, ${history.commento}`);
        console.log('Processed Result:', result); // Log processed result
        res.json(result);
    } catch (error) {
        console.error('Error fetching login history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/close-segnalazione', async (req, res) => {
    const id = req.body.id;
    try {
        console.log("Attempting to close:", id);
        let query = Segnalazioni.findOne();
        query.where('Id', id);

        user = await query.exec();
        console.log("Query result:", user);

        if (user) {
            // User found
            RegUser.deleteOne({Id: user.Id} ).exec().then(() => {
                console.log("Segnalazione close updated successfully");
            }).catch((err) => {
                console.error("Error closing segnalazione: ", err);
            });

            res.send('Closing segnalazione successful');
        } else {
            // User not found or password incorrect, login failed
            res.status(401).send('Invalid ID');
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send('Internal server error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
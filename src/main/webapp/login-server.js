const mongoose = require('mongoose');
const ServerApiVersion  = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

const url = "mongodb+srv://continicolaa:NikyZen01@ingsoftwaredb.nocpa6u.mongodb.net/ingsoftware_db?retryWrites=true&w=majority&appName=IngSoftwareDB";

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

app.use(cors());
// Middleware to parse JSON body
app.use(bodyParser.json());

// Serve static files from the 'webapp' directory
app.use(express.static(path.join(__dirname, 'webapp'), {
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
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login.html', (req, res) => {
    // Send the login.html file when the root URL is accessed
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/map.html', (req, res) => {
    // Send the login.html file when the root URL is accessed
    res.sendFile(path.join(__dirname, 'map.html'));
});

app.get('/registrazione.html', (req, res) => {
    // Send the login.html file when the root URL is accessed
    res.sendFile(path.join(__dirname, 'registrazione.html'));
});

app.get('/recovery.html', (req, res) => {
    // Send the login.html file when the root URL is accessed
    res.sendFile(path.join(__dirname, 'recovery.html'));
});

// Handle POST request to '/login'
app.post('/login', async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
    try {
        // Log the incoming username and password
        console.log("Attempting login with:", username, password);

        let query = RegUser.findOne();
        query.where('username', username);
        query.where('password', password);

        const user = await query.exec();

        // Log the result of the query (for debugging)
        console.log("Query result:", user);
        if (user) {
            // User found, login successful
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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

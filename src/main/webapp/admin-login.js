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

// Define the schema for the 'RegUser' collection
const adminSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    auth: String,
}, {collection: 'Admin'});

// Define the model for the 'RegUser' collection
const Admin = mongoose.model('Admin', adminSchema);

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

app.post('/login', async (req, res) => {
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
                console.log("User auth updated successfully (login)");
            }).catch((err) => {
                console.error("Error updating user auth (login): ", err);
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

app.post('/logout', async (req, res) => {
    await Admin.updateOne({username: user.username}, {$set: {auth: "0"}}).exec().then(() => {
        res.redirect('/admin-login.html');
        console.log("Logout Successful");
        console.log("User auth updated successfully (logout)");
    }).catch((err) => {
        console.error("Error updating user auth (logout): ", err);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
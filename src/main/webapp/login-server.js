var url = "mongodb+srv://continicolaa:NikyZen01@ingsoftwaredb.nocpa6u.mongodb.net/?retryWrites=true&w=majority&appName=IngSoftwareDB"
/** MAIN FUNCTION **/
const path = require('path');
const express = require('express');
const MongoClient = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

    //Making request to mongodb
    MongoClient.connect(url);
    const RegUser = MongoClient.model('RegUser', {
        username: { type: String },
        password: { type: String },
        email: { type: String },
        auth: { type: String },
        suspended: { type: String }
    });

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
        // Send the index.html file when the root URL is accessed
        res.sendFile(path.join(__dirname, 'login.html'));
    });

    // Handle POST request to '/login'
    app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Query MongoDB for user with the provided username and password
    const user = await RegUser.findOne({ username, password });

    if (user) {
        // User found, login successful
        res.send('Login successful');
    } else {
        // User not found or password incorrect, login failed
        res.status(401).send('Invalid username or password');
    }
    });

// Start the server
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });

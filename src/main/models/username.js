// middleware/username.js
module.exports = (req, res, next) => {
    // For demonstration, we'll assume username is sent in headers. Adjust as needed.
    const username = req.headers['x-username'];
    if (username) {
        req.username = username;
    }
    next();
};

module.exports = function (req, res, next) {
    if (req.session && req.session.username) {
        next(); // User is authenticated, proceed to the next middleware or route handler
    } else {
        res.status(401).json({ message: 'Not authorized' }); // User is not authenticated
    }
};

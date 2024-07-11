// authMiddleware.js
module.exports = function(req, res, next) {
    if (req.session && req.session.username) {
        return next(); // User is authenticated, proceed to the next middleware/route handler
    } else {
        return res.status(401).json({ message: 'Not authorized' }); // User is not authenticated
    }
};

// authMiddleware.js
module.exports = (req, res, next) => {
    console.log("AuthMiddleware - Session:", req.session);
    if (req.session.username) {
        console.log("User authenticated:", req.session.username);
        next();
    } else {
        console.log("User not authenticated");
        res.status(401).json({ message: 'Not authorized' });
    }
};

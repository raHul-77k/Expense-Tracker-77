const jwt = require('jsonwebtoken');
const User = require('../models/User');


const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'Authorization header missing' });
        }

        const tokenParts = authHeader.split(' ');

        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(401).json({ success: false, message: 'Invalid token format' });
        }

        const token = tokenParts[1];
        const decoded = jwt.verify(token, 'secretKey');
        const userId = decoded.userId;

        console.log('userId:', userId);

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        // Attach user details to the request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Error in authentication:', error);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = {
    authenticate
};

const jwt = require('jsonwebtoken');
const { User } = require('../models');

const secret = "secret";

const auth = async (req, res, next) => {
    const authHeader = req.header('Authorization')
    if (!authHeader) {
        console.log("header is required");
        return res.status(401).json({ error: 'Token is required' });
    }
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        console.log("token is required");
        return res.status(401).json({ error: 'Token is required' });
    }

    try {
        const data = jwt.verify(token, secret);
        const user = await User.findByPk(data.id);
        if (!user) {
            console.log("Token is invalid");
            return res.status(401).json({ error: 'Token is invalid' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("Token is invalid");
        return res.status(401).json({ error: 'Token is invalid' });
    }
};

module.exports = auth;
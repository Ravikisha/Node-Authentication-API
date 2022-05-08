const jwt = require('jsonwebtoken');
require('dotenv').config();

function jwtgenerator(user_id) {
    const payload = {
        user: user_id
    };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
}

module.exports = jwtgenerator;
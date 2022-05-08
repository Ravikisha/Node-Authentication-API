const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, res, next) => {
    try {
        const token = req.header("token");
        if(!token){
            return res.status(403).json({error: 'You are not Authorized.'});
        }
        try{
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = payload.user;
        next();
        }catch(e){
            console.log("Payload error",e);
        }
    }catch(err) {
        console.log("auth error",err.message);
        return res.status(403).send('Not Unauthorized');
    }
}
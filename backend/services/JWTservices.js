const jwt = require('jsonwebtoken');

const RefreshToken = require('../models/token');

const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = require('../config/index')

class JWTservice{
    // sign access tokens
    static signAccessToken(payload, expiryTime){
        return jwt.sign(payload, ACCESS_TOKEN_SECRET, {expiresIn: expiryTime});
    }
     
    // sign refresh tokens
    static signRefreshToken(payload, expiryTime){
        return jwt.sign(payload, REFRESH_TOKEN_SECRET , {expiresIn: expiryTime});
    }
    // verify access tokens
    static verifyAccessToken(token){
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    }

    // verify refresh tokens
    static verifyRefreshToken(token){
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    }
    // store refresh tokens
    static async storeRefreshToken(token, userID){
        try{
           const newToken = new RefreshToken({
                token: token,
                userID: userID
            });

            // store in DB
            await newToken.save()
        }
        catch(error){
            console.log(error);
        }
    }
}

module.exports = JWTservice;
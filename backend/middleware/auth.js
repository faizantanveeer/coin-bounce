const JWTservice = require('../services/JWTservices');
const User = require('../models/user');
const userDTO = require('../dto/user');
const auth = async (req, res, next ) => {

    try {
      //1. refresh, access token validation
    const {refreshToken, accessToken} = req.cookies;

    if(!refreshToken || !accessToken){
        const error = {
            status: 401,
            message: "unauthorized!"
        }
        return next(error);
    }

    let _id;
    try {
        _id = JWTservice.verifyAccessToken(accessToken);
        
    } catch (error) {
        return next(error);
    }

    let user;
    try {
        user = await User.findOne({_id: _id})
    } catch (error) {
        return next(error);
    }

    const userDto = new userDTO(user);
    req.user = userDto;

    next(); 

    } catch (error) {
        return next(error);
    }
}

module.exports = auth;
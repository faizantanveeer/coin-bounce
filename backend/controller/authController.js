const Joi = require('joi');

const User = require('../models/user');

const bcrypt = require('bcryptjs');

const userDTO = require('../dto/user'); 

const JWTservice = require('../services/JWTservices');  

const RefreshToken = require("../models/token");
const UserDTO = require('../dto/user');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
const authController = { 

    async register(req, res, next) {
        //1. validate user data
        const userRegisterSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(), 
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        })

        const {error} = userRegisterSchema.validate(req.body);

        // 2. if error in validation --> return error via middlevare
        if(error){
            return next(error);
        }

        //3. If email or username is already registered --> return an error
        const {username, name, email, password} = req.body;

        // check email if not already registered
        try {
            const emailInUse = await User.exists({email});

            const usernameInUse = await User.exists({username});

            if(emailInUse){
               const error = {
                status : 409,
                message :'Email already registered! Use another Email!' 
               }

               return next(error);
            }

            if(usernameInUse){
                const error = {
                 status : 409,
                 message :'Username already in Use! Try another Username!' 
                }
 
                return next(error);
             }             
        } catch (error) {
            return next(error);
        }

        //4. Password Hash
        const hashedPassword = await bcrypt.hash(password, 10);

        //5. Store Userdata in Database

        let accessToken;
        let refreshToken;
        let user;
        try {
            const userToRegister = new User({
            username,
            email,
            name,
            password: hashedPassword
        });

        user = await userToRegister.save(); // Sending data to DB

        // token generation
        accessToken = JWTservice.signAccessToken({_id: user._id}, '30m');
        refreshToken = JWTservice.signRefreshToken({_id: user._id}, '60m');

        } catch (error) {
            return next(error);
        }
        
        // store refresh token in DB
        await JWTservice.storeRefreshToken(refreshToken, user._id);
        
        //send tokens in cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,    // expiry Time -> 1 Day
            httpOnly: true
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,    // expiry Time -> 1 Day
            httpOnly: true
        });

        //6. Response Send
        const userDto = new userDTO(user);
        
        return res.status(201).json({user:userDto, auth: true});

    },

    async login(req, res, next) {
        //1. Validate user input

        // we expect the data to be in this shape, if not then show error
        // it is a DTO(Data Transfer Objects) used to decide the format of input and output of data
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passwordPattern).required()
        });

        const {error} = userLoginSchema.validate(req.body);

        //2. if validation error, return error
        if (error) {
            return next(error);
        }

        //3. match username and password

        // const username = req.body.username
        // const password = req.body.password

        // This is same as: 👇👇
        const {username, password} = req.body;
        
        let user;
        try{
            // match username
            user = await User.findOne({username}); // Find in Database

            if(!user){
                const error = {
                    status: 401,
                    message: 'Invalid username!'
                }

                return next(error);
            }

            // match password
            // password stored in database is already hashed
            // req.body.password -> first hash it -> then match it

            const match = await bcrypt.compare(password, user.password);     

            if(!match){
                const error = {
                    status: 401,
                    message: 'Invalid password!'
                }
                
                return next(error);
            }

        }
        catch(error){
            return next(error); 
        }

        //4. return response

        const accessToken = JWTservice.signAccessToken({_id: user._id}, '30m');
        const refreshToken = JWTservice.signRefreshToken({_id: user._id}, '60m');

        // update refresh token in DB   

        try {
            await RefreshToken.updateOne(
                {_id: user._id},
                {token: RefreshToken},
                {upsert: true}
            )

        } catch (error) {
            return next(error);
        }
        
        //send tokens in cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,    // expiry Time -> 1 Day
            httpOnly: true
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,    // expiry Time -> 1 Day
            httpOnly: true
        });
        
        const userDto = new userDTO(user);

        return res.status(200).json({user: userDto, auth: true}) // This step to return response of formated output
    },

    async logout(req, res, next){
        //1. delete refresh token from DB
        const {refreshToken} = req.cookies; 

        try {
            RefreshToken.deleteOne({token: refreshToken});
        } catch (error) {
            return next(error)
        }

        //delete cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        //2. response
        res.status(200).json({user: null, auth: false});
    }, 
    async refresh(req, res, next){

        //1. get refreshToken from cookies
        const originalRefreshToken = req.cookies.refreshToken;
        let id;

        try {
            id = JWTservice.verifyRefreshToken(originalRefreshToken)._id;
        } catch (e) {
            const error = {
                status: 401,
                message: 'Unauthorized!'
            }
            return next(error);
        }
        
        //2. verify refreshTokens
        try {
            const match = RefreshToken.findOne({_id: id, token: originalRefreshToken});
        
            if(!match){
                const error = {
                    status: 401,
                    message: 'Unauthorized!'
                }
                return next(error);
            }
        } catch (e) {
            return next(e);
        }

        //3. generate new tokens
        try {
            const accessToken = JWTservice.signAccessToken({_id: id}, '30m');
            const refreshToken = JWTservice.signRefreshToken({_id: id}, '60m');

            await RefreshToken.updateOne({_id: id}, {token: refreshToken});

            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24, 
                httpOnly: true
            });
            
            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24, 
                httpOnly: true
            });
        } catch (e) {
            return next(e); 
        }

        //4. update DB, return response

        const user = await User.findOne({_id: id});
        const UserDto = new UserDTO(user);
        
        res.status(200).json({user: UserDto, auth: true});
    }
}
 
module.exports = authController;
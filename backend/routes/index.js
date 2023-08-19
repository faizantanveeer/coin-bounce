const express = require('express');
const authController = require('../controller/authController');
const blogController = require('../controller/blogController');
const commentController = require('../controller/commentController');
const auth = require('../middleware/auth');
const router = express.Router();



// ==> user

// register
router.post('/register', authController.register);

// login
router.post('/login', authController.login);

// logout
router.post('/logout', auth, authController.logout);

// refresh
router.get('/refresh', authController.refresh);


// ==> blogs

// create
router.post('/blog', auth, blogController.create);

// read all blogs
router.get('/blog/all', auth, blogController.getAll);

// read all blog by id
router.get( '/blog/:id', auth, blogController.getById);

// update
router.put('/blog', auth, blogController.update);
 
// delete
router.delete('/blog/:id', auth, blogController.delete);

// comments

// create comments
router.post('/comment', auth, commentController.create);

// read comments by blog id
router.get('/comment/:id', auth, commentController.getById);

module.exports = router;
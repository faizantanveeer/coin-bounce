const Joi = require('joi');
const fs = require('fs');
const Blog = require('../models/blogs');
const {BACKEND_SERVER_PATH} = require('../config/index');
const BlogDTO = require('../dto/blog');
const BlogDetailsDTO = require('../dto/blog-details');
const Comment = require('../models/comments');

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {
    async create(req, res, next){
        //1. Validate request body

        //photo from client side -> base64 encoded string -> decode -> store -> save photo path in DB
        const createBlogSchema = Joi.object({
            title: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(), //compare it with regular expression
            content: Joi.string().required(),
            photo:Joi.string().required()
        });

        const {error} = createBlogSchema.validate(req.body);

        if (error){
            return next(error);
        }
 
        const {title, author, content, photo} = req.body;
 
        //2. handle photo storage and naming

        //read as MongoDB Buffer
        const buffer = Buffer.from(photo.replace(/^data: image\/(png|jpg|jpeg); base64,/ , ''), 'base64');

        //allot a random name
        const imagePath = `${Date.now()}-${author}.png`;
        
        //save locally
        try {
            fs.writeFileSync(`storage/${imagePath}`, buffer);
        } catch (error) {
            return next(error);
        }

        //3. Save to DB
        let newBlog;
        try {
            newBlog = new Blog({
                title, 
                author, 
                content,
                photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`
            });

            await newBlog.save();

        } catch (error) {
            return next(error);
        }

        //4. Return response
        const blogDto = new BlogDTO(newBlog);

        return res.status(201).json({blog: blogDto});
    },
    async getAll(req, res, next){
        try{
            const blogs = await Blog.find({});

            const blogsDTO = [];

            for(let i=0; i<blogs.length; i++){
                const dto = new BlogDTO(blogs[i]); 
                blogsDTO.push(dto);
            }

            return res.status(200).json({blogs: blogsDTO});
        }
        catch(error){
            return next(error);
        }
    },
    async getById(req, res, next){
        // 1. validate ID
        // 2. response

        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });

        const {error} = getByIdSchema.validate(req.params);

        if(error){
            return next(error);
        }

        let blog;
        const {id} = req.params;
        try {
            blog = await Blog.findOne({_id:id}).populate('author');
        } catch (error) {
            return next(error);
        }

        const blogDto = new BlogDetailsDTO(blog);
        
        return res.status(200).json({blog: blogDto}); 
    },
    async update(req, res, next){
        const updateBlogSchema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            blogId: Joi.string().regex(mongodbIdPattern).required(),
            photo: Joi.string()         
        });
        
        const {error} = updateBlogSchema.validate(req.body);

        if(error){
            return next(error);
        }

        const {title, content, author, blogId, photo} = req.body;
        
        // delete previous photo

        let blog;
        try {
            blog = await Blog.findOne({_id: blogId});            
        } catch (error) {
            return next(error);
        }

        if(photo){ // If you want to change photo too
            let previousPhoto = blog.photoPath;
            previousPhoto = previousPhoto.split('/').at(-1);
            // delete photo
            fs.unlinkSync(`storage/${previousPhoto}`); 

            // save new photo

            const buffer = Buffer.from(photo.replace(/^data: image\/(png|jpg|jpeg); base64,/ , ''), 'base64');

            //allot a random name
            const imagePath = `${Date.now()}-${author}.png`;
            
            //save locally
            try {
                fs.writeFileSync(`storage/${imagePath}`, buffer);
            } catch (error) {
                return next(error);
            }

            await Blog.updateOne({_id: blogId},
                {title, content, photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`});
        }           
        else{ // if you not change photo
                await Blog.updateOne({_id: blogId},{title, content});
        }
        
        return res.status(200).json({message: 'blog updated!'});
    },
    
    async delete(req, res, next){
        //1. Validate id
        

        const deleteBlogSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required,
        });

        const {error} = deleteBlogSchema.validate(req.params);

        const {id} = req.params;

        //2. Delete blog
        try {
            await Blog.deleteOne({_id: id});
        //3. Delete Comments on this blog
            //await Comment.delete({blog: id});
        } catch (error) {
            return next(error);
        }

        return res.status(200).json({msg: 'Blog Deleted!'});
    }
};

module.exports = blogController;
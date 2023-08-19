import {useState, useEffect} from 'react';
import Loader from '../../components/Loader/Loader';
import { getAllBlogs } from '../../api/internal';
import styles from '../Blogs/Blogs.module.css';
import { useNavigate } from 'react-router-dom';

function Blog(){
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    useEffect(() => {
        (async function getAllBlogsApiCall(){
            const response = await getAllBlogs();

            if(response.status === 200){
                setBlogs(response.data.blogs);
            }
        })();

        setBlogs([]);
    }, []);

    if(blogs.length === 0){
        return <Loader text = 'blogs'/>
    }
    
    return(
        <div className={styles.blogWrapper}>
            {(blogs).map((blog)=>(
                <div id = {blog._id} className={styles.blog} onClick={() => navigate(`/blog/${blog._id}`)}>
                    <h1>{blog.title}</h1>
                    <img src = {blog.photo} alt="blogphoto"/>
                    <p>{blog.content}</p>
                </div>
            ))}
        </div>
    )
}

export default Blog;
import {useState, useEffect} from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import {getBlogById, deleteBlog, postComment, getCommentsById} from '../../api/internal';
import styles from './BlogDetails.module.css';
import Loader from '../../components/Loader/Loader';
import CommentList from '../../components/CommentList/CommentList';

function BlogDetail(){
    const [blog, setBlog] = useState([]);
    const [comments, setComments] = useState([]);
    const [ownsBlog, setOwnsBlog] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [reload, setReload] = useState(false);      

    const navigate = useNavigate();

    const params = useParams();
    const blogId = params.id;

    const username =useSelector((state)=>state.user.username);
    const userId = useSelector((state)=>state.user._id);

    useEffect(() => {
        async function getBlogDetails(){
            const commentResponse = await getCommentsById(blogId);
            if(commentResponse.status===200){
                setComments(commentResponse.data.data);
            }

            const blogResponse = await getBlogById(blogId);
            if(blogResponse.status === 200){
                // set ownership
                setOwnsBlog(username === blogResponse.data.blog.authorUsername)
                setBlog(blogResponse.data.blog);
            }
        }
        getBlogDetails();
        
    },[reload])

    const postCommentHandler = async () => {
        const data = {
            author: userId,
            blog: blogId,
            content: newComment
        }


        const response = await postComment(data);

        if(response.status === 201){
            setNewComment("");
            setReload(!reload);
        }
    }

        const deleteBlogHandler = async () => {
            const response = await deleteBlog(blogId);

            if(response.status === 200){
                navigate('/blogs');
            }
    }

    if(blog?.length === 0){
        return <Loader text="Blog Details"/>
    }

    return(
        <div className={styles.detailWrapper}>
            <div className={styles.left}>
                <h1 className={styles.title}>{blog.title}</h1>
                <div className={styles.meta}>
                    <p>@{blog.authorUsername + " on " + new Date(blog.createdAt).toDateString()}</p>
                </div>
                <div className={styles.photo}>
                    <img src = {blog.photo} width={250} height={250} alt="img"/>
                </div>
                <p className={styles.content}>{blog.content}</p>
                {
                    ownsBlog && (
                        <div className={styles.control}>
                            <button
              className={styles.editButton}
              onClick={() => {
                navigate(`/blog-update/${blogId}`);
              }}
            >
              Edit
            </button>
                            <button className={styles.deleteButton} onClick={deleteBlogHandler}>
                                    Delete
                            </button>
                        </div>
                    )     
                }
            </div>
            <div className={styles.right}>
                <div className={styles.commentsWrapper}>
                    <CommentList comments={comments}/>
                    <div className={styles.postComment}>
                        <input className={styles.input}
                            placeholder='Comment goes here...'
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button className={styles.postCommentBtn} onClick={postCommentHandler}>Post</button>
                    </div>
                </div>
            </div>
            
        </div>
    );
}

export default BlogDetail;
import styles from "./CommentList.module.css";
import Comment from "../Comment/Comment";

function CommentList({comments}) {
  return (
    <div className={styles.CommentListWrapper}>
      <div className={styles.commentList}>
        {comments.length === 0 ? (
          <div className={styles.noComments}>No Comments posted!</div>
        ) : (
          comments.map((comment) => (
            <Comment key={comment._id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}

export default CommentList;

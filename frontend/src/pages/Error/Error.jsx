import styles from "./Error.module.css";
import { Link } from "react-router-dom";

function Error(){
    return (
        <div className={styles.errorWrapper}>
            <h1>Error 404 - Page not found!</h1>
            <div className={styles.errorbody}>Go Back to 
            <Link to = "/" className={styles.backlink}> Home </Link> 
            Page</div>
        </div>
    );
}

export default Error;
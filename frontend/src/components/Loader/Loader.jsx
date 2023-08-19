import { InfinitySpin } from "react-loader-spinner";
import styles from '../Loader/Loader.module.css'

function Loader({text}){
    return(
        <div className={styles.loaderWrapper}>
            <h2>Loading {text}</h2>
            <InfinitySpin
                color={"#9ba3c2"}
            />
        </div>
    )
}

export default Loader;
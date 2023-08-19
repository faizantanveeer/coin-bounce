import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import {useSelector} from "react-redux";
import { signout } from "../../api/internal";
import { resetUser } from "../../store/userSlice";
import { useDispatch } from "react-redux";

function Navbar() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(state => state.user.auth);

    const handleSignout = async () => {
        await signout();

        dispatch(resetUser());
    }

    return (
        <>
            <nav className={styles.navbar}>
                <NavLink to='/' className={`${styles.logo} ${styles.inactiveStyles}`}>CoinBounce</NavLink>
                <NavLink to='/' className={({ isActive }) => isActive ? styles.activeStyle : styles.inactiveStyle} >Home</NavLink>
                <NavLink to='crypto'
                    className={({ isActive }) => isActive ? styles.activeStyle : styles.inactiveStyle}
                >Crypto-currencies</NavLink>
                <NavLink to='blogs'
                    className={({ isActive }) => isActive ? styles.activeStyle : styles.inactiveStyle}
                >Blogs</NavLink>
                <NavLink to='submit'
                    className={({ isActive }) => isActive ? styles.activeStyle : styles.inactiveStyle}
                >Submit</NavLink>
                
                { isAuthenticated ? <NavLink to='/signout'
                    className={({ isActive }) => isActive ? styles.activeStyle : styles.inactiveStyle}
                    ><button className={styles.signOutBtn} onClick={handleSignout}>Sign Out</button></NavLink>
                    :<div>
                        <NavLink to='login'
                        className={({ isActive }) => isActive ? styles.activeStyle : styles.inactiveStyle}
                        ><button className={styles.logInBtn}>Log In</button></NavLink>
                        <NavLink to='signup'
                        className={({ isActive }) => isActive ? styles.activeStyle : styles.inactiveStyle}
                        ><button className={styles.signUpBtn}>Sign Up</button></NavLink>
                    </div>}
            </nav>
            <div className={styles.separator}></div>
        </>
    );
}

export default Navbar;
import {useState, useEffect} from 'react';
import styles from '../Home/Home.module.css';
import { getNews } from '../../api/external';
import Loader from '../../components/Loader/Loader';

function Home(){
    const [articles, setArticles] = useState([]);
    useEffect(() => {
        (async function newApiCall(){
            const response = await getNews();
            setArticles(response);
        })();

        //Cleanup Function

        setArticles([]); //default state
    }, []) //dependency list, UseEffect starts when our home page renders

    const handleCardClick = (url) =>{
        window.open(url, '_blank');
    }

    if (articles.length === 0){
        return <Loader text="Home Page"/>
    }

    return (
        <>
            <div className={styles.header}>Latest Articles</div>
            <div className={styles.grid}>
                {(articles).map((article) => (
                    <div 
                    className={`${styles.card} ${styles.pulse}`} 
                    key={article.url}
                    onClick={() => handleCardClick(article.url)}>
                        <div className={styles.img}><img src={article.urlToImage} alt=''/></div>                        
                        <div className={styles.txt}><p>{article.title}</p></div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default Home;
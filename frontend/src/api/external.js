import axios from "axios";


const NEWS_API_ENDPOINT = `https://newsapi.org/v2/everything?q=bitcoin&sortBy=publishedAt&languange=en&apiKey=f73270528df64098b96d31294a7eacbe`;

const CRYTO_API_ENDPOINT = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`
export const getNews = async () => {
  let response;

  try {
    response = await axios.get(NEWS_API_ENDPOINT);
    response = response.data.articles.slice(0, 15);
  } catch (error) {
    console.log(error);
  }

  return response;
};

export const getCrypto = async () => {
  let response;

  try {
    response = await axios.get(CRYTO_API_ENDPOINT);
    response = response.data;

  } catch (error) {
    console.log(error);
  }

  return response;
};

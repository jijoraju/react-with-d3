import axios from "axios";

const options = {
    method: 'GET',
    url: 'https://alpha-vantage.p.rapidapi.com/query',
    params: {
        function: 'TIME_SERIES_DAILY',
        symbol: 'MSFT',
        outputsize: 'compact',
        datatype: 'json'
    },
    headers: {
        'X-RapidAPI-Key': '',
        'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com'
    }
};

const fetchData = async () => {
    try {
        const response = await axios.request(options);
        return { data: response.data["Time Series (Daily)"], error: null };
    } catch (error) {
        console.error(error);
        return { data: null, error: "API limit reached. Please try again after 5 minutes." };
    }
};

export default fetchData;
import React, { useEffect, useState } from 'react';
import BarChart from "./components/BarChart";
import LineChart from "./components/LineChart";
import fetchData from "./data/alphaVantageService";
import './App.css';
import AreaChart from "./components/AreaChart";
import ScatterPlot from "./components/ScatterPlot";
import Histogram from "./components/Histogram";
import CandlestickChart from "./components/CandlestickChart";
import MovingAverageLineChart from "./components/MovingAverageLineChart";
import VWMAChart from "./components/VWMAChart";

const App = () => {
    const [data, setData] = useState([]);

    const transformData = (rawData) => {
        // This will sort the entries by date in descending order and then take the last 10 entries
        const sortedEntries = Object.entries(rawData).sort((a, b) => new Date(b[0]) - new Date(a[0])).slice(0, 10);
        return sortedEntries.map(([date, data]) => ({
            date: new Date(date),
            close: +data['4. close'],
            low: +data['3. low'],
            high: +data['2. high'],
            open: +data['1. open'],
            volume: +data['5. volume'],
        }));
    };

    useEffect(() => {
        fetchData().then(rawData => {
            const transformedData = transformData(rawData);
            console.log(JSON.stringify(transformedData));
            setData(transformedData);
        });
    }, []);

    return (
        <div>
            {/*<h1>MSFT Stock Closing Prices - Last 10 Days</h1>*/}
            <h1>MSFT Stock Closing Prices Bar Chart</h1>
            <BarChart data={data} />
            <h1>MSFT Stock Closing Prices Line Chart</h1>
            <LineChart data={data} />
            <h1>MSFT Stock Closing Prices Area Chart</h1>
            <AreaChart data={data} />
            <h1>MSFT Stock Closing Prices Scatter Plot</h1>
            <ScatterPlot data={data} />
            <h1>MSFT Stock Closing Prices Histogram</h1>
            <Histogram data={data} />
            <h1>MSFT Stock Closing Prices Candlestick Chart</h1>
            <CandlestickChart data={data} />
            <h1>MSFT Stock Closing Prices Moving Average Line Chart</h1>
            <MovingAverageLineChart data={data} />
            <h1>MSFT Stock Volume-Weighted Moving Average Chart</h1>
            <VWMAChart data={data} />
        </div>
    );
}

export default App;

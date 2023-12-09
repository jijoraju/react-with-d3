import React, {useEffect, useState} from 'react';
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
import Header from "./components/Header";
import Footer from "./components/Footer";

const App = () => {
    const [data, setData] = useState([]);
    const [selectedChart, setSelectedChart] = useState('BarChart');
    const [error, setError] = useState(null);


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
        fetchData().then(result => {
            if (result.error) {
                setError(result.error);
            } else {
                const transformedData = transformData(result.data);
                console.log(JSON.stringify(transformedData));
                setData(transformedData);
            }
        });
    }, []);

    const renderChart = () => {
        switch (selectedChart) {
            case 'BarChart':
                return <BarChart data={data}/>;
            case 'LineChart':
                return <LineChart data={data}/>;
            case 'AreaChart':
                return <AreaChart data={data}/>;
            case 'ScatterPlot':
                return <ScatterPlot data={data}/>;
            case 'Histogram':
                return <Histogram data={data}/>;
            case 'CandlestickChart':
                return <CandlestickChart data={data}/>;
            case 'MovingAverageLineChart':
                return <MovingAverageLineChart data={data}/>;
            case 'VWMAChart':
                return <VWMAChart data={data}/>;
            default:
                return null;
        }
    };

    return (
        <div className="app">
            <Header/>

            <div className="content">
                {error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <>
                        <div className="chart-selector">
                            <label htmlFor="chart-type">Select Chart Type: </label>
                            <select id="chart-type" onChange={e => setSelectedChart(e.target.value)} value={selectedChart}>
                                <option value="BarChart">Bar Chart</option>
                                <option value="LineChart">Line Chart</option>
                                <option value="AreaChart">Area Chart</option>
                                <option value="ScatterPlot">Scatter Plot</option>
                                <option value="Histogram">Histogram</option>
                                <option value="CandlestickChart">Candlestick Chart</option>
                                <option value="MovingAverageLineChart">Moving Average Line Chart</option>
                                <option value="VWMAChart">VWMA Chart</option>
                            </select>
                        </div>

                        <div className="chart-container">
                            {renderChart()}
                        </div>
                    </>
                )}
            </div>

            <Footer/>
        </div>
    );

}

export default App;

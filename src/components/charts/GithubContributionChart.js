import React, { useState, useEffect, useCallback } from 'react';
import { getContributions } from '../../lib/github';

const GithubContributionChart = ({ username }) => {
    const [contributionData, setContributionData] = useState({});
    const [loading, setLoading] = useState(true);

    const getColor = useCallback((count) => {
        if (count === 0) return 'bg-gray-100';
        if (count < 5) return 'bg-green-300';
        if (count < 10) return 'bg-green-400';
        if (count < 20) return 'bg-green-600';
        return 'bg-green-700';
    }, []);

    const generateCalendar = useCallback(() => {
        const today = new Date();
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        const calendar = [];

        for (let d = new Date(sixMonthsAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            const count = contributionData[dateString] || 0;
            calendar.push({ date: new Date(d), count });
        }

        return calendar;
    }, [contributionData]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await getContributions(username, (data) => {
                    setContributionData(data);
                    setLoading(false);
                });
            } catch (error) {
                console.error("Error fetching contribution data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [username]);

    const calendar = generateCalendar();

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Github Contributions for {username}</h2>
            {loading && <p>Loading contribution data...</p>}
            <div className="flex flex-wrap gap-1">
                {calendar.map((day, index) => (
                    <div
                        key={index}
                        className={`w-3 h-3 ${getColor(day.count)} rounded-sm cursor-pointer transition-all duration-200 ease-in-out hover:transform hover:scale-150`}
                        title={`${day.date.toDateString()}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`}
                    ></div>
                ))}
            </div>
            <div className="mt-2 text-sm text-gray-500 flex items-center">
                <span className="mr-2">Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                </div>
                <span className="ml-2">More</span>
            </div>
        </div>
    );
};

export default GithubContributionChart;

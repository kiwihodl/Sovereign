import React, { useMemo } from 'react';

const GithubContributionChartDisabled = () => {
    const getRandomColor = () => {
        const random = Math.random();
        if (random < 0.4) return 'bg-gray-100';
        if (random < 0.6) return 'bg-green-300';
        if (random < 0.75) return 'bg-green-400';
        if (random < 0.9) return 'bg-green-600';
        return 'bg-green-700';
    };

    const calendar = useMemo(() => {
        const today = new Date();
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        const calendar = [];

        for (let d = new Date(sixMonthsAgo); d <= today; d.setDate(d.getDate() + 1)) {
            calendar.push({ date: new Date(d), color: getRandomColor() });
        }

        return calendar;
    }, []);

    return (
        <div className="relative mx-auto py-2 px-4 max-w-[900px] bg-gray-800 rounded-lg">
            <div className="opacity-30">
                <div className="flex flex-wrap gap-1">
                    {calendar.map((day, index) => (
                        <div
                            key={index}
                            className={`w-3 h-3 ${day.color} rounded-sm`}
                        ></div>
                    ))}
                </div>
                <div className="mt-2 text-sm text-gray-400 flex items-center">
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
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <p className="text-white text-xl font-semibold">Connect to GitHub (Coming Soon)</p>
            </div>
        </div>
    );
};

export default GithubContributionChartDisabled;

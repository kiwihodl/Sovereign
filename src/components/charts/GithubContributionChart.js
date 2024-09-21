import React, { useState, useEffect, useCallback } from 'react';
import { useFetchGithubCommits } from '@/hooks/githubQueries/useFetchGithubCommits';
import { Tooltip } from 'primereact/tooltip';
const GithubContributionChart = ({ username }) => {
    const [contributionData, setContributionData] = useState({});
    const [totalCommits, setTotalCommits] = useState(0);

    const { data: commits, isLoading, isFetching } = useFetchGithubCommits(username);

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
        if (commits) {
            let commitCount = 0;
            
            const newContributionData = {};
            commits.forEach(commit => {
                const date = commit.commit.author.date.split('T')[0];
                newContributionData[date] = (newContributionData[date] || 0) + 1;
                commitCount++;
            });

            setContributionData(newContributionData);
            setTotalCommits(commitCount);

            console.log(`Total commits fetched: ${commitCount}`);
        }
    }, [commits]);

    const calendar = generateCalendar();

    return (
        <div className="mx-auto py-2 px-4 max-w-[900px] bg-gray-900 rounded-lg">
            {(isLoading || isFetching) && <p>Loading contribution data... ({totalCommits} commits fetched)</p>}
            {!isLoading && !isFetching && 
            <div className="flex justify-between items-center pr-1">
                <p className="mb-2">Total commits: {totalCommits}</p>
                <i className="pi pi-question-circle cursor-pointer" data-pr-tooltip="Total number of commits made to GitHub repositories over the last 6 months. (may not be 100% accurate)" />
                <Tooltip target=".pi-question-circle" position="top"/>
            </div>
            }
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

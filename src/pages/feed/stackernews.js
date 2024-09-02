import React from 'react';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchStackerNews = async () => {
	const response = await axios.get('/api/stackernews');
	return response.data.data.items.items; // Note the change here
};

const StackerNewsFeed = () => {
	const { data: items, isLoading, error } = useQuery({queryKey: ['stackerNews'], queryFn: fetchStackerNews});

	if (isLoading) {
		return (
			<div className="h-[100vh] min-bottom-bar:w-[87vw] max-sidebar:w-[100vw]">
				<ProgressSpinner className='w-full mt-24 mx-auto' />
				<p>Loading...</p>
			</div>
		);
	}

	if (error) {
		console.error('Error fetching Stacker News:', error);
		return <div className="text-red-500 text-center p-4">Error loading data. Please try again later.</div>;
	}

	return (
		<div className="bg-gray-900 h-full w-full min-bottom-bar:w-[87vw]">
			<div className="mx-4 mt-4">
				{items && items.length > 0 ? (
					items.map(item => (
						<Card
							key={item.id}
							className="w-full bg-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4"
						>
							<h3 className="m-0 text-lg text-gray-200">{item.title}</h3>
							<p className="text-sm text-gray-400">Posted by: {item.user.name}</p>
							<p className="text-sm text-gray-400">
								Comments: {item.commentCount} | Sats: {item.sats}
							</p>
							<p className="text-sm text-gray-400">
								Created at: {new Date(item.createdAt).toLocaleString()}
							</p>
							{item.url && (
								<a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
									View on Stacker News
								</a>
							)}
						</Card>
					))
				) : (
					<div className="text-gray-400 text-center p-4">No items available.</div>
				)}
			</div>
		</div>
	);
};

export default StackerNewsFeed;
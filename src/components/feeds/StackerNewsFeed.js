import React, { useEffect } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const StackerNewsIconComponent = () => (
	<svg width="16" height="16" className='mr-2' viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fill="#facc15" fillRule="evenodd" d="m41.7 91.4 41.644 59.22-78.966 69.228L129.25 155.94l-44.083-58.14 54.353-65.441Z"/>
		<path fill="#facc15" fillRule="evenodd" d="m208.355 136.74-54.358-64.36-38.4 128.449 48.675-74.094 64.36 65.175L251.54 42.497Z"/>
	</svg>
);

const fetchStackerNews = async () => {
	const response = await axios.get('/api/stackernews');
	return response.data.data.items.items; // Note the change here
};

const StackerNewsFeed = () => {
	const { data: items, isLoading, error } = useQuery({queryKey: ['stackerNews'], queryFn: fetchStackerNews});

    useEffect(() => {
        console.log(items);
    }, [items]);

	if (isLoading) {
		return (
			<div className="h-[100vh] min-bottom-bar:w-[87vw] max-sidebar:w-[100vw]">
				<ProgressSpinner className='w-full mt-24 mx-auto' />
			</div>
		);
	}

	if (error) {
		console.error('Error fetching Stacker News:', error);
		return <div className="text-red-500 text-center p-4">Error loading data. Please try again later.</div>;
	}

	const header = (item) => (
		<div className="flex flex-row w-full items-center justify-between p-4 bg-gray-800 rounded-t-lg">
			<div className="flex flex-row items-center">
				<Avatar icon="pi pi-user" shape="circle" size="large" className="border-2 border-blue-400" />
				<p className="pl-4 font-bold text-xl text-white">{item.user.name}</p>
			</div>
			<div className="flex flex-col items-start justify-between">
				<div className="flex flex-row w-full justify-between items-center my-1 max-sidebar:flex-col max-sidebar:items-start">
					<Tag value="~devs" severity="contrast" className="w-fit text-[#f8f8ff] mr-2 max-sidebar:mr-0" />
					<Tag icon={<StackerNewsIconComponent />} value="stackernews" className="w-fit bg-gray-600 text-[#f8f8ff] max-sidebar:mt-1" />
				</div>
			</div>
		</div>
	);

	const footer = (item) => (
		<div className="w-full flex justify-between items-center">
			<span className="bg-gray-800 rounded-lg p-2 text-sm text-gray-300">
				{new Date(item.createdAt).toLocaleString()}
			</span>
			<Button
				label="View on Stacker News"
				icon="pi pi-external-link"
                severity="warning"
				outlined
				size="small"
				className='my-2'
				onClick={() => window.open(`https://stacker.news/items/${item.id}`, '_blank')}
			/>
		</div>
	);

	return (
		<div className="bg-gray-900 h-full w-full min-bottom-bar:w-[87vw]">
			<div className="mx-4 mt-4">
					{items && items.length > 0 ? (
						items.map(item => (
							<Card
								key={item.id}
								header={() => header(item)}
								footer={() => footer(item)}
								className="w-full bg-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4"
							>
								<h3 className="m-0 text-lg text-gray-200">{item.title}</h3>
								<p className="text-sm text-gray-400">
									Comments: {item.comments.length} | Sats: {item.sats}
								</p>
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
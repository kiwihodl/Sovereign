import React, { useState, useEffect } from 'react';
import { ProgressBar } from 'primereact/progressbar';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useSession } from 'next-auth/react';

const allTasks = [
    { status: 'Create Account', completed: true, tier: 'Pleb', courseId: null },
    {
        status: 'PlebDevs Starter',
        completed: false,
        tier: 'New Dev',
        courseId: null,
        subTasks: [
            { status: 'Connect GitHub', completed: false },
            { status: 'Create First GitHub Repo', completed: false },
            { status: 'Push Commit', completed: false }
        ]
    },
    { 
        status: 'PlebDevs Course 1', 
        completed: false, 
        tier: 'Junior Dev', 
        courseId: 'd20e2e9b-5123-4a91-b27f-d75ea1d5811e',
        subTasks: [
            { status: 'Complete the course', completed: false },
            { status: 'Submit Link to completed project', completed: false },
        ]
    },
    { 
        status: 'PlebDevs Course 2', 
        completed: false, 
        tier: 'Plebdev', 
        courseId: 'aa3b1641-ad2b-4ef4-9f0f-38951ae307b7',
        subTasks: [
            {status: 'Complete the course', completed: false},
            { status: 'Submit Link to completed project', completed: false },
        ]
    },
];

const UserProgress = () => {
    const [progress, setProgress] = useState(0);
    const [currentTier, setCurrentTier] = useState('Pleb');
    const [expanded, setExpanded] = useState(null);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [tasks, setTasks] = useState([]);

    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user) {
            const user = session.user;
            const ids = user?.userCourses?.map(course => course?.completed ? course.courseId : null).filter(id => id !== null);
            if (ids && ids.length > 0) {
            setCompletedCourses(ids);
            generateTasks(ids);
            } else {
                generateTasks([]);
            }
        }
    }, [session]);

    const generateTasks = (completedCourseIds) => {
        const updatedTasks = allTasks.map(task => ({
            ...task,
            completed: task.courseId === null || completedCourseIds.includes(task.courseId),
            subTasks: task.subTasks ? task.subTasks.map(subTask => ({
                ...subTask,
                completed: completedCourseIds.includes(task.courseId)
            })) : undefined
        }));

        setTasks(updatedTasks);
    };

    const getProgress = async () => {
        return 10;
    };

    const getCurrentTier = async () => {
        return 'Pleb';
    };
    useEffect(() => {
        const fetchProgress = async () => {
            const progress = await getProgress();
            const currentTier = await getCurrentTier();
            setProgress(progress);
            setCurrentTier(currentTier);
        };

        fetchProgress();
    }, []);

    return (
        <div className="bg-gray-800 rounded-3xl p-6 w-[500px] max-mob:w-full max-tab:w-full mx-auto my-8">
            <h1 className="text-3xl font-bold text-white mb-2">Dev Journey (Coming Soon)</h1>
            <p className="text-gray-400 mb-4">Track your progress from Pleb to Plebdev</p>

            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Progress</span>
                <span className="text-gray-300">{progress}%</span>
            </div>
            <ProgressBar value={progress} className="h-2 mb-6" pt={{
                label: {
                    className: 'hidden'
                }
            }} />

            <div className="mb-6">
                <span className="text-white text-lg font-semibold">Current Tier: </span>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full">{currentTier}</span>
            </div>

            <ul className="space-y-4 mb-6">
                {tasks.map((task, index) => (
                    <li key={index}>
                        {task.subTasks ? (
                            <Accordion className="border-none" onTabOpen={(e) => setExpanded(true)} onTabClose={(e) => setExpanded(false)}>
                                <AccordionTab
                                    pt={{
                                        root: { className: 'border-none p-0' },
                                        header: { className: 'border-none p-0' },
                                        headerAction: { className: 'border-none p-0' },
                                        content: { className: 'border-none rounded-lg mt-2 py-1' },
                                        accordiontab: { className: 'border-none p-0' },
                                        headerIcon: { className: 'hidden' },
                                    }}
                                    header={
                                        <div className="bg-gray-800 flex items-center justify-between w-full font-normal">
                                            <div className="flex items-center">
                                                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                                                    <i className="pi pi-info-circle text-white text-lg"></i>
                                                </div>
                                                <span className="text-lg text-gray-400">{task.status}</span>
                                                <i className={`pi pi-chevron-down text-gray-400 ml-2 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                                            </div>
                                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full w-20 text-center">
                                                {task.tier}
                                            </span>
                                        </div>
                                    }
                                    >
                                    <ul className="space-y-2 mt-2 ml-9 max-mob:mt-0 max-tab:mt-0">
                                        <span className="text-gray-400 text-xs">(Coming Soon)</span>
                                        {task.subTasks.map((subTask, subIndex) => (
                                            <li key={subIndex} className="flex items-center">
                                                {subTask.completed ? (
                                                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                                        <i className="pi pi-check text-white text-lg"></i>
                                                    </div>
                                                ) : (
                                                    <div className="w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                                                        <span className="text-white text-sm">{subIndex + 1}</span>
                                                    </div>
                                                )}
                                                <span className={`text-base ${subTask.completed ? 'text-white' : 'text-gray-400'}`}>
                                                    {subTask.status}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionTab>
                            </Accordion>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    {task.completed ? (
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                            <i className="pi pi-check text-white text-lg"></i>
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                                            <i className="pi pi-info-circle text-white text-lg"></i>
                                        </div>
                                    )}
                                    <span className={`text-lg ${task.completed ? 'text-white' : 'text-gray-400'}`}>{task.status}</span>
                                </div>
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full w-20 text-center">
                                    {task.tier}
                                </span>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold">
                View Badges (Coming Soon)
            </button>
        </div>
    );
};

export default UserProgress;

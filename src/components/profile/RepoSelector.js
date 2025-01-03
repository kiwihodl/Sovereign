import React, { useMemo } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useFetchGithubRepos } from '@/hooks/githubQueries/useFetchGithubRepos';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useToast } from '@/hooks/useToast';

const RepoSelector = ({ courseId, onSubmit }) => {
    const { data: session } = useSession();
    const accessToken = session?.account?.access_token;
    const { data: repos, isLoading } = useFetchGithubRepos(accessToken);
    const { showToast } = useToast();

    // Find the existing submission for this course
    const existingSubmission = useMemo(() => {
        return session?.user?.userCourses?.find(
            course => course.courseId === courseId
        )?.submittedRepoLink;
    }, [session, courseId]);

    const repoOptions = repos?.map(repo => ({
        label: repo.name,
        value: repo.html_url
    })) || [];

    const handleRepoSelect = async (repoLink) => {
        try {
            await axios.post(`/api/users/${session.user.id}/courses/${courseId}/submit-repo`, {
                repoLink
            });
            onSubmit(repoLink);
            showToast('success', 'Success', 'Repository submitted successfully');
        } catch (error) {
            console.error('Error submitting repo:', error);
            showToast('error', 'Error', 'Failed to submit repository');
        }
    };

    if (!accessToken) {
        return (
            <div className="pl-[28px] mt-2 text-gray-400">
                GitHub connection required
            </div>
        );
    }

    return (
        <div className="pl-[28px] mt-2">
            <Dropdown
                value={existingSubmission}
                options={repoOptions}
                onChange={(e) => handleRepoSelect(e.value)}
                placeholder={isLoading ? "Loading repositories..." : "Select a repository"}
                className="w-full max-w-[300px]"
                loading={isLoading}
            />
            {existingSubmission && (
                <div className="text-sm text-gray-400 mt-1">
                    ✓ Repository submitted
                </div>
            )}
        </div>
    );
};

export default RepoSelector;
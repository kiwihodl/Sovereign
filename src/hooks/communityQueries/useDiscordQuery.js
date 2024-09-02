import { useQuery } from "@tanstack/react-query";

const fetchDiscordMessages = async () => {
    const response = await fetch('/api/discord-messages');
    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }
    return response.json();
};

export function useDiscordQuery({page}) {
    const { data, error, isLoading } = useQuery({
        queryKey: ['discordMessages', page],
        queryFn: fetchDiscordMessages,
        staleTime: 60000, // 1 minute
        refetchInterval: 60000, // Refetch every minute
    });

    return { data, error, isLoading };

}
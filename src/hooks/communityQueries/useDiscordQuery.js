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
        staleTime: 300000, // 5 minutes
        refetchInterval: 300000 // 5 minutes
    });

    return { data, error, isLoading };

}
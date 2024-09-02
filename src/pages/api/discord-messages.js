import { Client, GatewayIntentBits } from 'discord.js';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

let client = null;

async function initializeClient() {
    if (!client) {
        client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
        await client.login(BOT_TOKEN);
    }
    return client;
}

export default async function handler(req, res) {
    try {
        const client = await initializeClient();

        const channels = ['🤝general', '🌀random', '❓help', '🛠project-ideas', '🙌show-it-off', '🤡memes', '🧠learning'];
        const messagesPromises = channels.map(async (channelName) => {
            const channel = client.channels.cache.find(ch => ch.name === channelName);
            if (channel) {
                const channelMessages = await channel.messages.fetch({ limit: 5 });
                return channelMessages.map(msg => ({
                    id: msg.id,
                    content: msg.content,
                    author: msg.author.username,
                    avatar: msg.author.avatarURL(),
                    channel: msg.channel.name,
                    channelId: msg.channel.id,
                    timestamp: msg.createdAt
                }));
            }
            return [];
        });

        const messagesArray = await Promise.all(messagesPromises);
        const messages = messagesArray.flat();

        const filteredMessages = messages.filter(msg => msg.content.length > 0);
        filteredMessages.sort((a, b) => b.timestamp - a.timestamp);

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        res.status(200).json(filteredMessages.slice(0, 50));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching messages' });
    }
}

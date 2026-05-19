import { Client, GatewayIntentBits } from "discord.js";

export default function getBot() {
    return new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
    });
}

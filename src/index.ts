import debug from "debug";
import { ActivityType, Client, Events, GatewayIntentBits } from "discord.js";

const log = debug("bot");

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

bot.on(Events.ClientReady, () => {
    log(`Logged in as ${bot.user?.tag} - ${bot.user?.id}`);
    bot.user?.setActivity("Umbra serves the shadow", { type: ActivityType.Custom });
});

// Implicitly use DISCORD_TOKEN
await bot.login();

import debug from "debug";
import { ActivityType, Client, Colors, EmbedBuilder, Events, GatewayIntentBits } from "discord.js";

const log = debug("bot");

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

bot.on(Events.ClientReady, () => {
    log(`Logged in as ${bot.user?.tag} - ${bot.user?.id}`);
    bot.user?.setActivity("Umbra serves the shadow", { type: ActivityType.Custom });
});

bot.on(Events.InteractionCreate, async (interaction) => {
    log(interaction);
    if (!interaction.isChatInputCommand()) {
        return;
    }
    await interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.DarkGold)
                .setTitle("Lumi")
                .setDescription("Umbra serves the shadow")
                .setFooter({ text: "Fire Emblem" }),
        ],
    });
});

// Implicitly use DISCORD_TOKEN
await bot.login();

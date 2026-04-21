import debug from "debug";
import {
    APIUser,
    ApplicationIntegrationType,
    InteractionContextType,
    REST,
    Routes,
    SlashCommandBuilder,
} from "discord.js";
import help from "./commands/help.js";

const log = debug("commands");

const commands = [
    help,
];

const api = new REST().setToken(process.env.DISCORD_TOKEN!);

async function registerSlashCommands(guild?: `${bigint}` | "user-install") {
    const botUser = (await api.get(Routes.user())) as APIUser;
    log(`${botUser.username}#${botUser.discriminator} (${botUser.id})`);
    const created = await api.put(
        guild === undefined || guild === "user-install"
            ? Routes.applicationCommands(botUser.id)
            : Routes.applicationGuildCommands(botUser.id, guild),
        { body: commands },
    );
    log(JSON.stringify(created, null, 2));
}

await registerSlashCommands(process.argv[2] as `${bigint}` | "user-install");

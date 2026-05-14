import debug from "debug";
import type { APIUser, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import { REST, Routes } from "discord.js";
import { helpCommandInfo } from "./commandInfo/help.js";
import { searchCommandInfo } from "./commandInfo/search.js";

const log = debug("commands");

const commands = [helpCommandInfo, searchCommandInfo];

const api = new REST().setToken(process.env.DISCORD_TOKEN!);

async function registerSlashCommands(guild?: `${bigint}` | "user-install") {
    const botUser = (await api.get(Routes.user())) as APIUser;
    log(`${botUser.username}#${botUser.discriminator} (${botUser.id})`);
    const info: RESTPostAPIChatInputApplicationCommandsJSONBody[] = commands.map((command) => command.info);
    const created = await api.put(
        guild === undefined || guild === "user-install"
            ? Routes.applicationCommands(botUser.id)
            : Routes.applicationGuildCommands(botUser.id, guild),
        { body: info },
    );
    log(JSON.stringify(created, null, 2));
}

await registerSlashCommands(process.argv[2] as `${bigint}` | "user-install");

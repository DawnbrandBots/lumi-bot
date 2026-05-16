import debug from "debug";
import type { APIUser, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import { REST, Routes } from "discord.js";
import commands from "../src/loaders/commandInfo.ts";

const log = debug("commands");

const api = new REST().setToken(process.env.DISCORD_TOKEN!);

async function registerSlashCommands(guild?: `${bigint}` | "user-install") {
    const botUser = (await api.get(Routes.user())) as APIUser;
    log(`${botUser.username}#${botUser.discriminator} (${botUser.id})`);
    const info: RESTPostAPIChatInputApplicationCommandsJSONBody[] = commands.map(
        (command) => command.registerCommandInfo,
    );
    const created = await api.put(
        guild === undefined || guild === "user-install"
            ? Routes.applicationCommands(botUser.id)
            : Routes.applicationGuildCommands(botUser.id, guild),
        { body: info },
    );
    log(JSON.stringify(created, null, 2));
}

await registerSlashCommands(process.argv[2] as `${bigint}` | "user-install");

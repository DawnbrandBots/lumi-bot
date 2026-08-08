import debug from "debug";
import type { Client } from "discord.js";
import { ActivityType } from "discord.js";
import { DISCORD_BOT_ACTIVITY } from "../../../bot/constants.ts";

const log = debug(handleClientReady.name);

export function handleClientReady(client: Client<true>) {
    log(`Logged in as ${client.user?.tag} - ${client.user?.id}`);
    client.user.setActivity(DISCORD_BOT_ACTIVITY, { type: ActivityType.Custom });
}

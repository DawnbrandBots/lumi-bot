import debug from "debug";
import type { Client, ClientEvents, Events } from "discord.js";
import { ActivityType } from "discord.js";
import { DISCORD_BOT_ACTIVITY } from "../constants.ts";

export type TClientReadyEvent = ClientEvents[Events.ClientReady][0];
export type THandleClientReady = (client: TClientReadyEvent) => Promise<void>;

const log = debug(handleClientReady.name);

export function handleClientReady(client: Client<true>) {
    log(`Logged in as ${client.user?.tag} - ${client.user?.id}`);
    client.user.setActivity(DISCORD_BOT_ACTIVITY, { type: ActivityType.Custom });
}

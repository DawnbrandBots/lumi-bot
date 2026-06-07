import debug from "debug";
import { ActivityType, type Client } from "discord.js";

const log = debug("bot");

export default function getClientReadyEventHandler() {
    return function handleClientReady(client: Client<true>) {
        log(`Logged in as ${client.user.tag} - ${client.user.id}`);
        client.user.setActivity("Umbra serves the shadow", { type: ActivityType.Custom });
    };
}

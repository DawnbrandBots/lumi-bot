import type { ClientEvents, Events } from "discord.js";

export type TClientReadyEvent = ClientEvents[Events.ClientReady][0];
export type THandleClientReady = (client: TClientReadyEvent) => Promise<void>;

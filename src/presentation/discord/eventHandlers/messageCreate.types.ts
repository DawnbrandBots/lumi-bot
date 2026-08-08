import type { ClientEvents, Events } from "discord.js";

export type TMessageCreateEventInteraction = ClientEvents[Events.MessageCreate][0];
export type THandleMessageCreate = (interaction: TMessageCreateEventInteraction) => Promise<void>;

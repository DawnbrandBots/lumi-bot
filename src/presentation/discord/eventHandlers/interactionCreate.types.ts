import type { ClientEvents, Events } from "discord.js";

export type TInteractionCreateEventInteraction = ClientEvents[Events.InteractionCreate][0];
export type THandleInteractionCreate = (interaction: TInteractionCreateEventInteraction) => Promise<void>;

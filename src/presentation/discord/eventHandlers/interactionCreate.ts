import debug from "debug";
import type { ClientEvents, Events } from "discord.js";
import type { THandleAutocompleteInteraction } from "./interactions/autocomplete.types.ts";
import type { THandleCommandInteraction } from "./interactions/command.types.ts";

export type TInteractionCreateEventInteraction = ClientEvents[Events.InteractionCreate][0];
export type THandleInteractionCreate = (interaction: TInteractionCreateEventInteraction) => Promise<void>;

const log = debug(handleInteractionCreate.name);

export async function handleInteractionCreate(arg: {
    interaction: TInteractionCreateEventInteraction;
    handleAutocompleteInteraction: THandleAutocompleteInteraction;
    handleCommandInteraction: THandleCommandInteraction;
}) {
    log(arg.interaction);

    if (arg.interaction.isChatInputCommand()) {
        await arg.handleCommandInteraction(arg.interaction);
        return;
    } else if (arg.interaction.isAutocomplete()) {
        await arg.handleAutocompleteInteraction(arg.interaction);
        return;
    }
}

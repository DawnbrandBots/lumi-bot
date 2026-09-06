import debug from "debug";
import type { ClientEvents, Events } from "discord.js";
import type { THandleAutocompleteInteraction } from "./interactions/autocomplete.ts";
import type { THandleCommandInteraction } from "./interactions/command.ts";
import type { THandleComponentInteraction } from "./interactions/component.ts";

export type TInteractionCreateEventInteraction = ClientEvents[Events.InteractionCreate][0];
export type THandleInteractionCreate = (interaction: TInteractionCreateEventInteraction) => Promise<void>;

const log = debug(handleInteractionCreate.name);

// TODO: this function isn't actually used!
export async function handleInteractionCreate(arg: {
    interaction: TInteractionCreateEventInteraction;
    handleAutocompleteInteraction: THandleAutocompleteInteraction;
    handleCommandInteraction: THandleCommandInteraction;
    handleComponentInteraction: THandleComponentInteraction;
}) {
    log(arg.interaction);

    if (arg.interaction.isChatInputCommand()) {
        await arg.handleCommandInteraction(arg.interaction);
        return;
    } else if (arg.interaction.isAutocomplete()) {
        await arg.handleAutocompleteInteraction(arg.interaction);
        return;
    } else if (arg.interaction.isMessageComponent()) {
        await arg.handleComponentInteraction(arg.interaction);
        return;
    }
}

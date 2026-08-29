import type { TApplicationUseCases } from "../../../application/useCases.types.ts";
import { getLfgAutocomplete } from "../../../presentation/discord/autocomplete/lfg.ts";
import { getLfgManageAutocomplete } from "../../../presentation/discord/autocomplete/lfgManage.ts";
import { getSearchAutocomplete } from "../../../presentation/discord/autocomplete/search.ts";
import type { TAllCommandRegistrationData } from "../../../presentation/discord/commandRegistrationData.ts";
import { COMMANDS } from "../../../presentation/discord/commands.ts";
import {
    getCommandRunHandler as getRawCommandRunHandlerFromCommands,
    type TBuiltCommandRunHandlerGetter,
} from "../../../presentation/discord/commands/handlers.ts";
import type { TCommandAutocompleteRegistry } from "../../../presentation/discord/commands/types.ts";
import { handleClientReady } from "../../../presentation/discord/eventHandlers/clientReady.ts";
import { handleInteractionCreate } from "../../../presentation/discord/eventHandlers/interactionCreate.ts";
import type { THandleInteractionCreate } from "../../../presentation/discord/eventHandlers/interactionCreate.types.ts";
import { handleAutocompleteInteraction } from "../../../presentation/discord/eventHandlers/interactions/autocomplete.ts";
import type { THandleAutocompleteInteraction } from "../../../presentation/discord/eventHandlers/interactions/autocomplete.types.ts";
import { handleCommandInteraction } from "../../../presentation/discord/eventHandlers/interactions/command.ts";
import type { THandleCommandInteraction } from "../../../presentation/discord/eventHandlers/interactions/command.types.ts";
import { handleMessageCreate } from "../../../presentation/discord/eventHandlers/messageCreate.ts";
import type { THandleMessageCreate } from "../../../presentation/discord/eventHandlers/messageCreate.types.ts";
import { build } from "../../utils/proxify.ts";

export type TDiscordEventHandlers = {
    readonly clientReady: typeof handleClientReady;
    readonly interactionCreate: THandleInteractionCreate;
    readonly messageCreate: THandleMessageCreate;
};

export function composeDiscordEventHandlers(arg: { readonly useCases: TApplicationUseCases }): TDiscordEventHandlers {
    const messageCreate: THandleMessageCreate = (interaction) =>
        handleMessageCreate({ interaction, resolveSearchInput: arg.useCases.search.resolveSearchInput });
    // TODO: "raw" command run handler? Confirm what it is later.
    const getRawCommandRunHandler = getRawCommandRunHandlerFromCommands(COMMANDS);
    const getCommandRunHandler: TBuiltCommandRunHandlerGetter = (interaction) => {
        const command = getRawCommandRunHandler(interaction);
        return command ? build({ useCases: arg.useCases }, { command }).command : undefined;
    };
    const autocompleteHandlers = {
        admin: {},
        help: {},
        links: {},
        lfg: {
            autocomplete: getLfgAutocomplete({ getLfgStatus: arg.useCases.lfg.getLfgStatus }),
        },
        "lfg-manage": {
            autocomplete: getLfgManageAutocomplete({ getLfgStatus: arg.useCases.lfg.getLfgStatus }),
        },
        search: {
            autocomplete: getSearchAutocomplete({ suggestSearchResults: arg.useCases.search.suggestSearchResults }),
        },
    } satisfies TCommandAutocompleteRegistry<TAllCommandRegistrationData>;
    const commandInteraction: THandleCommandInteraction = (interaction) =>
        handleCommandInteraction({ getCommandRunHandler, interaction });
    const autocompleteInteraction: THandleAutocompleteInteraction = (interaction) =>
        handleAutocompleteInteraction({ autocompleteHandlers, interaction });
    const interactionCreate: THandleInteractionCreate = (interaction) =>
        handleInteractionCreate({
            handleAutocompleteInteraction: autocompleteInteraction,
            handleCommandInteraction: commandInteraction,
            interaction,
        });

    return {
        clientReady: handleClientReady,
        interactionCreate,
        messageCreate,
    };
}

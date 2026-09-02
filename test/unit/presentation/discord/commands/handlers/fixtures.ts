import type { AutocompleteInteraction, CacheType, ChatInputCommandInteraction } from "discord.js";
import { vi } from "vitest";
import type {
    TCommandAutocompleteHandler,
    TCommandAutocompleteRegistry,
    TCommandRunHandler,
    TCommandRunRegistry,
} from "../../../../../../src/presentation/discord/commands/types.ts";
import type {
    nestedCommandCommandRegistrationData,
    plainCommandCommandRegistrationData,
    rootCommandCommandRegistrationData,
} from "../types.ts";

export const rootRun = vi.fn<TCommandRunHandler>();
export const listRun = vi.fn<TCommandRunHandler>();
export const findRun = vi.fn<TCommandRunHandler>();
export const moveRun = vi.fn<TCommandRunHandler>();
export const removeRun = vi.fn<TCommandRunHandler>();
export const plainRun = vi.fn<TCommandRunHandler>();
export const rootAutocomplete = vi.fn<TCommandAutocompleteHandler>();
export const findAutocomplete = vi.fn<TCommandAutocompleteHandler>();
export const moveAutocomplete = vi.fn<TCommandAutocompleteHandler>();

type TAllCommandCommandRegistrationData =
    | typeof rootCommandCommandRegistrationData
    | typeof nestedCommandCommandRegistrationData
    | typeof plainCommandCommandRegistrationData;

/** Fake command handlers tree tests attempt to retrieve handlers from. */
export const commandHandlers = {
    search: rootRun,
    rooms: {
        list: listRun,
        find: findRun,
        admin: {
            move: moveRun,
            remove: removeRun,
        },
    },
    plain: plainRun,
} satisfies TCommandRunRegistry<TAllCommandCommandRegistrationData>;

export const autocompleteHandlers = {
    search: {
        query: rootAutocomplete,
    },
    rooms: {
        find: {
            query: findAutocomplete,
        },
        admin: {
            move: {
                destination: moveAutocomplete,
            },
        },
    },
    // TODO: can we simply NOT require specifying the property at all?
    plain: {},
} satisfies TCommandAutocompleteRegistry<TAllCommandCommandRegistrationData>;

export function getMockChatInputInteraction({
    commandName,
    subcommand = null,
    subcommandGroup = null,
}: {
    commandName: string;
    subcommand?: string | null;
    subcommandGroup?: string | null;
}) {
    return {
        commandName,
        options: {
            getSubcommand: () => subcommand,
            getSubcommandGroup: () => subcommandGroup,
        },
    } as unknown as ChatInputCommandInteraction<CacheType>;
}

export function getMockAutocompleteInteraction({
    commandName,
    focusedOption,
    subcommand = null,
    subcommandGroup = null,
}: {
    commandName: string;
    focusedOption: string;
    subcommand?: string | null;
    subcommandGroup?: string | null;
}) {
    return {
        commandName,
        options: {
            getFocused: () => ({ name: focusedOption, value: "" }),
            getSubcommand: () => subcommand,
            getSubcommandGroup: () => subcommandGroup,
        },
    } as unknown as AutocompleteInteraction<CacheType>;
}

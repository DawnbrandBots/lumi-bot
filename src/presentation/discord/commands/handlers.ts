import type { AutocompleteInteraction, CacheType, ChatInputCommandInteraction } from "discord.js";
import isKeyOfExactObject from "../../../utils/isKeyOfExactObject.ts";
import type { TBuiltCommandRunHandler, TCommandAutocompleteHandler, TCommandRunHandler } from "./types.ts";

type THandler = (...args: never[]) => unknown;
type THandlerTree<Handler extends THandler> = Handler | IHandlerMap<Handler>;

interface IHandlerMap<Handler extends THandler> {
    readonly [name: string]: THandlerTree<Handler>;
}

type TCommandInteraction = ChatInputCommandInteraction<CacheType> | AutocompleteInteraction<CacheType>;

function getSubcommandRoute(interaction: TCommandInteraction): string[] {
    const subcommandGroup = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand(false);

    return [subcommandGroup, subcommand].filter((part) => part !== null);
}
// TODO: funky business to review
function isHandlerMap<Handler extends THandler>(
    value: THandlerTree<Handler> | undefined,
): value is IHandlerMap<Handler> {
    return typeof value === "object" && value !== null;
}

function getHandlerAtRoute<Handler extends THandler>(
    tree: THandlerTree<Handler>,
    route: readonly string[],
): Handler | undefined {
    let current: THandlerTree<Handler> | undefined = tree;

    for (const part of route) {
        if (!isHandlerMap(current)) {
            return undefined;
        }
        current = current[part];
    }

    return typeof current === "function" ? current : undefined;
}
// TODO: funky business to review
export type TCommandRunHandlerGetter = (
    interaction: ChatInputCommandInteraction<CacheType>,
) => TCommandRunHandler | undefined;

export type TBuiltCommandRunHandlerGetter = (
    interaction: ChatInputCommandInteraction<CacheType>,
) => TBuiltCommandRunHandler | undefined;

// TODO: funky business to review
/**
 * Creates a getter for the raw run handler matching an interaction's command and subcommand route.
 */
export function getCommandRunHandler(
    commands: Record<string, THandlerTree<TCommandRunHandler>>,
): TCommandRunHandlerGetter {
    return (interaction) => {
        if (!isKeyOfExactObject(commands, interaction.commandName)) {
            return undefined;
        }

        const command = commands[interaction.commandName];
        return command ? getHandlerAtRoute<TCommandRunHandler>(command, getSubcommandRoute(interaction)) : undefined;
    };
}

// TODO: funky business to review
/**
 * Retrieves the autocomplete handler matching an interaction's route and focused option.
 */
export function getCommandAutocompleteHandler(
    commands: Record<string, { readonly autocomplete?: THandlerTree<TCommandAutocompleteHandler> }>,
    interaction: AutocompleteInteraction<CacheType>,
): TCommandAutocompleteHandler | undefined {
    if (!isKeyOfExactObject(commands, interaction.commandName)) {
        return undefined;
    }

    const command = commands[interaction.commandName];
    const autocomplete = command?.autocomplete;
    if (!autocomplete) {
        return undefined;
    }

    const focusedOption = interaction.options.getFocused(true);
    return getHandlerAtRoute<TCommandAutocompleteHandler>(autocomplete, [
        ...getSubcommandRoute(interaction),
        focusedOption.name,
    ]);
}

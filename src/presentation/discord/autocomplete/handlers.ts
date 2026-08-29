import type { AutocompleteInteraction, CacheType } from "discord.js";
import isKeyOfExactObject from "../../../utils/isKeyOfExactObject.ts";

type THandler = (...args: never[]) => unknown;
type THandlerTree<Handler extends THandler> = Handler | IHandlerMap<Handler>;

interface IHandlerMap<Handler extends THandler> {
    readonly [name: string]: THandlerTree<Handler>;
}

function getSubcommandRoute(interaction: AutocompleteInteraction<CacheType>): string[] {
    const subcommandGroup = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand(false);

    return [subcommandGroup, subcommand].filter((part) => part !== null);
}

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

export type TAutocompleteHandlerGetter<Handler extends THandler> = (
    interaction: AutocompleteInteraction<CacheType>,
) => Handler | undefined;

export function getAutocompleteHandler<Handler extends THandler>(
    autocompleteHandlers: Record<string, THandlerTree<Handler>>,
): TAutocompleteHandlerGetter<Handler> {
    return (interaction) => {
        if (!isKeyOfExactObject(autocompleteHandlers, interaction.commandName)) {
            return undefined;
        }

        const command = autocompleteHandlers[interaction.commandName];
        if (!command) {
            return undefined;
        }

        const focusedOption = interaction.options.getFocused(true);
        return getHandlerAtRoute(command, [...getSubcommandRoute(interaction), focusedOption.name]);
    };
}

import type { AutocompleteInteraction, CacheType, ChatInputCommandInteraction } from "discord.js";
import type { ICommand, TCommandAutocompleteHandler, TCommandRunHandler } from "./types.ts";

// TODO: still confused about THandler's typing, and how routes are handled

type THandler = (...args: never[]) => unknown;
type THandlerTree<Handler extends THandler> = Handler | IHandlerMap<Handler>;

interface IHandlerMap<Handler extends THandler> {
    readonly [name: string]: THandlerTree<Handler>;
}

type TCommandHandlersAtRuntime = {
    readonly run: THandlerTree<TCommandRunHandler>;
    readonly autocomplete?: THandlerTree<TCommandAutocompleteHandler>;
};

type TCommandInteraction = ChatInputCommandInteraction<CacheType> | AutocompleteInteraction<CacheType>;

function getSubcommandRoute(interaction: TCommandInteraction): string[] {
    const subcommandGroup = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand(false);

    return [subcommandGroup, subcommand].filter((part) => part !== null);
}

function getHandlerAtRoute<Handler extends THandler>(
    tree: THandlerTree<Handler>,
    route: readonly string[],
): Handler | undefined {
    let current: THandlerTree<Handler> | undefined = tree;

    for (const part of route) {
        if (typeof current !== "object") {
            return undefined;
        }
        current = current[part];
    }

    return typeof current === "function" ? current : undefined;
}

/**
 * Retrieves the run handler matching an interaction's subcommand group and subcommand.
 */
export function getCommandRunHandler(
    command: TCommandHandlersAtRuntime,
    interaction: ChatInputCommandInteraction<CacheType>,
): TCommandRunHandler | undefined {
    return getHandlerAtRoute(command.run, getSubcommandRoute(interaction));
}

/**
 * Retrieves the autocomplete handler matching an interaction's route and focused option.
 */
export function getCommandAutocompleteHandler(
    command: TCommandHandlersAtRuntime,
    interaction: AutocompleteInteraction<CacheType>,
): TCommandAutocompleteHandler | undefined {
    if (!command.autocomplete) {
        return undefined;
    }

    const focusedOption = interaction.options.getFocused(true);
    return getHandlerAtRoute(command.autocomplete, [...getSubcommandRoute(interaction), focusedOption.name]);
}

export class Command implements ICommand {
    public readonly info: ICommand["info"];
    public readonly run: ICommand["run"];
    public readonly autocomplete: ICommand["autocomplete"];

    public constructor(arg: ICommand) {
        this.info = arg.info;
        this.run = arg.run;
        this.autocomplete = arg.autocomplete;
    }
}

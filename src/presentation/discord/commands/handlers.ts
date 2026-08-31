import isKeyOfExactObject from "../../../utils/isKeyOfExactObject.ts";
import type { TCommandInteraction } from "../eventHandlers/interactions/command.types.ts";
import type { TBuiltCommandRunHandler, TCommandRunHandler } from "./types.ts";

type THandler = (...args: never[]) => unknown;
type THandlerTree<Handler extends THandler> = Handler | IHandlerMap<Handler>;

interface IHandlerMap<Handler extends THandler> {
    readonly [name: string]: THandlerTree<Handler>;
}

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
export type TCommandRunHandlerGetter = (interaction: TCommandInteraction) => TCommandRunHandler | undefined;

export type TBuiltCommandRunHandlerGetter = (interaction: TCommandInteraction) => TBuiltCommandRunHandler | undefined;

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

import type { TCommandRunHandler, TCommandRunHandlerGetter } from "../../presentation/discord/commands/types.ts";
import getHandlerAtRoute, { type THandlerTree } from "../utils/getHandlerAtRoute.ts";
import getSubcommandRoute from "./getSubcommandRoute.ts";

/** Creates a getter for the raw run handler matching an interaction's command and subcommand route. */
export default function getCommandRunHandler(
    commands: Record<string, THandlerTree<TCommandRunHandler>>,
): TCommandRunHandlerGetter {
    return (interaction) => getHandlerAtRoute(commands, interaction.commandName, getSubcommandRoute(interaction));
}
